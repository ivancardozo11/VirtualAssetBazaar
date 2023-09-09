import web3 from '../utils/web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
import { validateEthereumWalletAddress } from '../utils/adressValidation.js';
import redisClient from '../database/redis/redisConfig.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const MOCK_ERC20_ADDRESS = process.env.MOCKERC20_ADDRESS;
const GAS_LIMIT = 2000000;

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
web3.eth.accounts.wallet.add(account);

const retrieveNFTDetails = async (NFT_CONTRACT_ID) => {
    const nftDetailsKey = `listing:${NFT_CONTRACT_ID}`;
    const nftDetails = await redisClient.get(nftDetailsKey);

    if (!nftDetails) {
        throw new Error(`NFT with contract ID ${NFT_CONTRACT_ID} not found`);
    }

    return JSON.parse(nftDetails);
};

const validateNFTForPurchase = (NFT) => {
    if (NFT.priceType !== 'fixed') {
        throw new Error('This token is not available for direct purchase');
    }

    if (NFT.isAuction) {
        throw new Error('This token is not currently in auction');
    }
};

const getBuyerBalance = async (BUYER_WALLET_ADDRESS) => {
    const buyerBalanceWei = await web3.eth.getBalance(BUYER_WALLET_ADDRESS);
    return parseFloat(web3.utils.fromWei(buyerBalanceWei, 'ether'));
};

const sendErc20Transfer = async (TOTAL_TOKENS_FOR_SALE, BUYER_WALLET_ADDRESS) => {
    const erc20Contract = new web3.eth.Contract(mockErc20ABI, SELLER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const txData = erc20Contract.methods.transfer(MOCK_ERC20_ADDRESS, TOTAL_TOKENS_FOR_SALE).encodeABI();

    const transferTransaction = {
        nonce,
        to: BUYER_WALLET_ADDRESS,
        gas: GAS_LIMIT,
        gasPrice: await web3.eth.getGasPrice(),
        data: txData
    };

    const signedTx = await web3.eth.accounts.signTransaction(transferTransaction, account.privateKey);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

export const checkIsERC721 = async (NFT_CONTRACT_ADDRESS) => {
    try {
        const contract = new web3.eth.Contract(mockErc721ABI, NFT_CONTRACT_ADDRESS);
        const supportsERC721 = await contract.methods.supportsInterface('0x80ac58cd').call();

        return supportsERC721;
    } catch (error) {
        console.error('Error checking ERC721:', error);
        return false;
    }
};

export const checkTokenOwnership = async (NFT_CONTRACT_ADDRESS, TOKEN_ID, SELLER_ADDRESS) => {
    try {
        const erc721Contract = new web3.eth.Contract(mockErc721ABI, NFT_CONTRACT_ADDRESS);
        const owner = await erc721Contract.methods.ownerOf(TOKEN_ID).call();

        if (owner.toLowerCase() !== SELLER_ADDRESS.toLowerCase()) {
            throw new Error('Seller is not the owner of the token ERC721 or NFT doesnt exist.');
        }

        return true;
    } catch (error) {
        console.error('Error al verificar la propiedad del token ERC721:', error);
        return false;
    }
};

export const purchaseToken = async (NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    try {
        validateEthereumWalletAddress(BUYER_WALLET_ADDRESS);
        const nft = await retrieveNFTDetails(NFT_CONTRACT_ID);
        validateNFTForPurchase(nft);

        const buyerBalance = await getBuyerBalance(BUYER_WALLET_ADDRESS);

        if (buyerBalance < nft.price) {
            throw new Error('Insufficient funds to purchase the token');
        }

        const TOTAL_TOKENS_FOR_SALE = nft.totalTokensForSale;

        const isERC721 = await checkIsERC721(nft.nftContractAddress);

        if (isERC721) {
            const checkOwner = checkTokenOwnership(nft.nftContractAddress, NFT_CONTRACT_ID, SELLER_ADDRESS);

            if (!checkOwner) {
                throw new Error('Token purchase failed: Seller is not the owner of the token');
            }

            if (SELLER_ADDRESS === BUYER_WALLET_ADDRESS) {
                throw new Error('The buyer and the seller can\'t be the same.');
            }

            const erc721Contract = new web3.eth.Contract(mockErc721ABI, nft.nftContractAddress);

            const transferTx = erc721Contract.methods.transferFrom(SELLER_ADDRESS, BUYER_WALLET_ADDRESS, NFT_CONTRACT_ID).encodeABI();
            const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');

            const txDetails = {
                nonce,
                to: nft.nftContractAddress,
                gas: GAS_LIMIT,
                gasPrice: await web3.eth.getGasPrice(),
                data: transferTx
            };
            const signedTx = await web3.eth.accounts.signTransaction(txDetails, account.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            console.log(`NFT with ID ${NFT_CONTRACT_ID} has been successfully transferred from ${SELLER_ADDRESS} to ${BUYER_WALLET_ADDRESS}. Transaction Hash: ${receipt.transactionHash}`);

            const desiredEthAmount = nft.price;

            if (buyerBalance < desiredEthAmount) {
                throw new Error('Insufficient funds to purchase the token');
            }

            const ethAmountToSend = web3Buyer.utils.toWei(desiredEthAmount.toString(), 'ether');
            const paymentTransaction = {
                from: BUYER_WALLET_ADDRESS,
                to: SELLER_ADDRESS,
                value: ethAmountToSend,
                gas: GAS_LIMIT
            };

            const paymentReceipt = await web3Buyer.eth.sendTransaction(paymentTransaction);

            console.log(`The Buyer with address:${BUYER_WALLET_ADDRESS} has successfully transferred the amount of ${desiredEthAmount}ETH or ${ethAmountToSend} Wei. Transaction Hash: ${paymentReceipt.transactionHash}`);
        } else {
            const receipt = await sendErc20Transfer(TOTAL_TOKENS_FOR_SALE, BUYER_WALLET_ADDRESS);
            console.log(`Transaction hash for ERC20 transfer: ${receipt.transactionHash}`);
            console.log(`App transfered ${TOTAL_TOKENS_FOR_SALE} tokens from ${SELLER_ADDRESS} to ${BUYER_WALLET_ADDRESS}`);
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
                from: BUYER_WALLET_ADDRESS,
                to: SELLER_ADDRESS,
                value: ethAmountToSend,
                gas: GAS_LIMIT
            };

            const ethTransferReceipt = await web3Buyer.eth.sendTransaction(transferTransaction);

            console.log(`The Buyer with address:${BUYER_WALLET_ADDRESS} has transfered succesfully the amount of ${desiredEthAmount}ETH or ${ethAmountToSend} Wei`);
            console.log(`Transaction hash for ETH sended to the seller: ${ethTransferReceipt.transactionHash} `);
            console.log('Remember to check the hash in the block explorer if transaction was success');
            console.log('We are only recording the hash for development purposes');
        }
        const currentNFT = JSON.parse(await redisClient.get(`listing:${NFT_CONTRACT_ID}`));

        if (!currentNFT.sold) {
            currentNFT.sold = true;

            await redisClient.set(`llisting:sold:${NFT_CONTRACT_ID}`, JSON.stringify(currentNFT));
        }

        await redisClient.del(`listing:${NFT_CONTRACT_ID}`);
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
