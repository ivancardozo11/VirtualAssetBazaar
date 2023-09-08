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

const retrieveNFTDetails = async (nftContractId) => {
    const nftDetailsKey = `listing:${nftContractId}`;
    const nftDetails = await redisClient.get(nftDetailsKey);

    if (!nftDetails) {
        throw new Error(`NFT with contract ID ${nftContractId} not found`);
    }

    return JSON.parse(nftDetails);
};

const validateNFTForPurchase = (nft) => {
    if (nft.priceType !== 'fixed') {
        throw new Error('This token is not available for direct purchase');
    }

    if (nft.isAuction) {
        throw new Error('This token is not currently in auction');
    }
};

const getBuyerBalance = async (buyerWalletAddress) => {
    const buyerBalanceWei = await web3.eth.getBalance(buyerWalletAddress);
    return parseFloat(web3.utils.fromWei(buyerBalanceWei, 'ether'));
};

const sendErc20Transfer = async (totalTokensForSale, buyerWalletAddress) => {
    const erc20Contract = new web3.eth.Contract(mockErc20ABI, SELLER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const txData = erc20Contract.methods.transfer(MOCK_ERC20_ADDRESS, totalTokensForSale).encodeABI();

    const transferTransaction = {
        nonce,
        to: buyerWalletAddress,
        gas: GAS_LIMIT,
        gasPrice: await web3.eth.getGasPrice(),
        data: txData
    };

    const signedTx = await web3.eth.accounts.signTransaction(transferTransaction, account.privateKey);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

export const purchaseToken = async (nftContractId, buyerWalletAddress) => {
    try {
        validateEthereumWalletAddress(buyerWalletAddress);
        const nft = await retrieveNFTDetails(nftContractId);
        validateNFTForPurchase(nft);

        const buyerBalance = await getBuyerBalance(buyerWalletAddress);

        const totalTokensForSale = nft.totalTokensForSale;

        const receipt = await sendErc20Transfer(totalTokensForSale, buyerWalletAddress);
        console.log(`Transaction hash for ERC20 transfer: ${receipt.transactionHash}`);
        console.log(`App transfered ${totalTokensForSale} tokens from ${SELLER_ADDRESS} to ${buyerWalletAddress}`);
        console.log('This backend is in development mode, we dont check if funds successfuly arrive, just check if funds have been send.');

        if (!receipt.transactionHash) {
            throw new Error('Token purchase transaction failed');
        }

        const desiredEthAmount = nft.price;
        if (buyerBalance < desiredEthAmount) {
            throw new Error('Insufficient funds to purchase the token');
        }

        const ethAmountToSend = web3Buyer.utils.toWei(desiredEthAmount.toString(), 'ether');
        const transferTransaction = {
            from: buyerWalletAddress,
            to: SELLER_ADDRESS,
            value: ethAmountToSend,
            gas: GAS_LIMIT
        };

        const ethTransferReceipt = await web3Buyer.eth.sendTransaction(transferTransaction);

        console.log(`The Buyer with address:${buyerWalletAddress} has transfered succesfully the amount of ${desiredEthAmount}ETH or ${ethAmountToSend} Wei`);
        console.log(`Transaction hash for ETH sended to the seller: ${ethTransferReceipt.transactionHash} `);
        console.log('Remember to check the hash in the block explorer if transaction was success');
        console.log('We are only recording the hash for development purposes');

        await redisClient.del(`listing:${nftContractId}`);
        return {
            success: true,
            message: 'Token purchased successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to purchase token: ${error.message}`
        };
    }
};
