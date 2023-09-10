import web3 from '../utils/web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
import { validateEthereumWalletAddress } from '../utils/adressValidation.js';
import redisClient from '../database/redis/redisConfig.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';
import mockErc721ABI from '../utils/mockErc721ABI.js';

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const MOCK_ERC20_ADDRESS = process.env.MOCKERC20_ADDRESS;
const GAS_LIMIT = 2000000;

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
web3.eth.accounts.wallet.add(account);

export const purchaseToken = async (NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    try {
        validateEthereumWalletAddress(BUYER_WALLET_ADDRESS);
        const nft = await getNFTDetails(NFT_CONTRACT_ID);
        validatePurchaseEligibility(nft);
        const buyerBalance = await getBuyerBalance(BUYER_WALLET_ADDRESS);

        if (buyerBalance < nft.price) {
            throw new Error('Insufficient funds to purchase the token');
        }
        const tokenType = await getTokenType(nft.nftContractAddress, NFT_CONTRACT_ID);
        if (tokenType === 'ERC721') {
            await handleErc721Purchase(nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS, buyerBalance);
        } else if (tokenType === 'ERC20') {
            await handleErc20Purchase(nft, BUYER_WALLET_ADDRESS);
        } else {
            throw new Error('Unsupported token type.');
        }

        await markNFTAsSold(NFT_CONTRACT_ID);
        return { success: true, message: 'Token purchased successfully' };
    } catch (error) {
        return { success: false, error: `Failed to purchase token: ${error.message}` };
    }
};
const getNFTDetails = async (NFT_CONTRACT_ID) => {
    const nftDetailsKey = `listing:${NFT_CONTRACT_ID}`;
    const nftDetails = await redisClient.get(nftDetailsKey);
    if (!nftDetails) {
        throw new Error(`NFT with contract ID ${NFT_CONTRACT_ID} not found`);
    }
    return JSON.parse(nftDetails);
};

const validatePurchaseEligibility = (nft) => {
    if (nft.priceType !== 'fixed') {
        throw new Error('This token is not available for direct purchase');
    }
    if (nft.isAuction) {
        throw new Error('This token is not currently in auction');
    }
};

const getBuyerBalance = async (BUYER_WALLET_ADDRESS) => {
    const buyerBalanceWei = await web3.eth.getBalance(BUYER_WALLET_ADDRESS);
    return parseFloat(web3.utils.fromWei(buyerBalanceWei, 'ether'));
};

const sendErc20Tokens = async (TOTAL_TOKENS_FOR_SALE, BUYER_WALLET_ADDRESS) => {
    const erc20Contract = new web3.eth.Contract(mockErc20ABI, SELLER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const data = erc20Contract.methods.transfer(MOCK_ERC20_ADDRESS, TOTAL_TOKENS_FOR_SALE).encodeABI();

    const transferConfig = {
        nonce,
        to: BUYER_WALLET_ADDRESS,
        gas: GAS_LIMIT,
        gasPrice: await web3.eth.getGasPrice(),
        data
    };

    const signedTx = await web3.eth.accounts.signTransaction(transferConfig, account.privateKey);
    console.log(`The transaction between ${BUYER_WALLET_ADDRESS} Buying tokens to ${SELLER_ADDRESS} is signed now, check Tx Hash: ${signedTx.transactionHash} for more details`);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

export const isERC721Supported = async (CONTRACT_ADDRESSS) => {
    try {
        const contract = new web3.eth.Contract(mockErc721ABI, CONTRACT_ADDRESSS);
        const isSupported = await contract.methods.supportsInterface('0x80ac58cd').call();
        return isSupported;
    } catch (error) {
        console.error('Error checking ERC721:', error);
        return false;
    }
};

export const getTokenType = async (CONTRACT_ADDRESSS, NFT_CONTRACT_ID) => {
    try {
        const contract721 = new web3.eth.Contract(mockErc721ABI, CONTRACT_ADDRESSS);
        await contract721.methods.ownerOf(NFT_CONTRACT_ID).call();
        return 'ERC721';
    } catch {
        try {
            const contract20 = new web3.eth.Contract(mockErc20ABI, CONTRACT_ADDRESSS);
            await contract20.methods.totalSupply().call();
            return 'ERC20';
        } catch {
            console.error('The contract does not seem to follow ERC721 or ERC20 standards.');
            return 'UNKNOWN';
        }
    }
};

const handleErc721Purchase = async (nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    const transferTx = await buildErc721TransferTx(nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS);
    console.log(`Transaction signed with for buying token with ID number ${NFT_CONTRACT_ID}`);
    const receipt = await web3.eth.sendSignedTransaction(transferTx.rawTransaction);

    console.log(`NFT with ID ${NFT_CONTRACT_ID} transferred from ${SELLER_ADDRESS} to ${BUYER_WALLET_ADDRESS}. Tx Hash: ${receipt.transactionHash}`);

    const paymentAmountWei = web3Buyer.utils.toWei(nft.price.toString(), 'ether');
    const paymentConfig = {
        from: BUYER_WALLET_ADDRESS,
        to: SELLER_ADDRESS,
        value: paymentAmountWei,
        gas: GAS_LIMIT
    };

    const paymentReceipt = await web3Buyer.eth.sendTransaction(paymentConfig);

    console.log(`Buyer ${BUYER_WALLET_ADDRESS} transferred ${nft.price}ETH or ${paymentAmountWei} Wei. Tx Hash: ${paymentReceipt.transactionHash}`);
};

const handleErc20Purchase = async (nft, BUYER_WALLET_ADDRESS) => {
    const receipt = await sendErc20Tokens(nft.totalTokensForSale, BUYER_WALLET_ADDRESS);
    console.log(`ERC20 Tokens succesfully buyed by ${BUYER_WALLET_ADDRESS} to ${SELLER_ADDRESS} toTx Hash: ${receipt.transactionHash}`);

    console.log(`App transferred ${nft.totalTokensForSale} tokens from ${SELLER_ADDRESS} to ${BUYER_WALLET_ADDRESS}`);
    console.log('Backend is in dev mode; only checking if funds have been sent, not if they arrived.');

    if (!receipt.transactionHash) {
        throw new Error('Token purchase transaction failed');
    }

    const paymentAmountWei = web3Buyer.utils.toWei(nft.price.toString(), 'ether');
    const paymentConfig = {
        from: BUYER_WALLET_ADDRESS,
        to: SELLER_ADDRESS,
        value: paymentAmountWei,
        gas: GAS_LIMIT
    };

    const paymentReceipt = await web3Buyer.eth.sendTransaction(paymentConfig);

    console.log(`Buyer ${BUYER_WALLET_ADDRESS} send to ${SELLER_ADDRESS} the payment the amount of ${nft.price}ETH or ${paymentAmountWei} Wei. Tx Hash: ${paymentReceipt.transactionHash}`);
};

const buildErc721TransferTx = async (nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    const erc721Contract = new web3.eth.Contract(mockErc721ABI, nft.nftContractAddress);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const txData = erc721Contract.methods.transferFrom(SELLER_ADDRESS, BUYER_WALLET_ADDRESS, NFT_CONTRACT_ID).encodeABI();

    const transferConfig = {
        nonce,
        to: BUYER_WALLET_ADDRESS,
        gas: GAS_LIMIT,
        gasPrice: await web3.eth.getGasPrice(),
        data: txData
    };

    return await web3.eth.accounts.signTransaction(transferConfig, account.privateKey);
};

export const hasSufficientERC20Tokens = async (CONTRACT_ADDRESSS, TOTAL_TOKENS_FOR_SALE) => {
    try {
        const erc20Contract = new web3.eth.Contract(mockErc20ABI, CONTRACT_ADDRESSS);
        const balance = await erc20Contract.methods.balanceOf(SELLER_ADDRESS).call();

        return Number(balance) >= TOTAL_TOKENS_FOR_SALE;
    } catch (err) {
        console.error('Error verifying ERC20 balance:', err);
        return false;
    }
};

const markNFTAsSold = async (NFT_CONTRACT_ID) => {
    const originalKey = `listing:${NFT_CONTRACT_ID}`;
    const nft = await getNFTDetails(NFT_CONTRACT_ID);
    if (!nft) { throw new Error(`NFT with ID ${NFT_CONTRACT_ID} not found`); }
    nft.sold = true;
    const newKey = `listing:sold:${NFT_CONTRACT_ID}`;
    await redisClient.set(newKey, JSON.stringify(nft));
    await redisClient.del(originalKey);
};
