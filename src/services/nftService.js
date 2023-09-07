import web3 from '../utils/web3Config.js';
import { validateEthereumWalletAddress } from '../utils/adressValidation.js';
import redisClient from '../database/redis/redisConfig.js';
import settlerABI from '../utils/SettlerABI.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';
import dotenv from 'dotenv';

dotenv.config();

const settlerContractAddress = process.env.SETTLER_CONTRACT_ADDRESS;
const myMetamaskAddress = process.env.MY_ADDRESS;

const settlerContract = new web3.eth.Contract(settlerABI, settlerContractAddress);

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
web3.eth.accounts.wallet.add(account);
const sellerWalletAddress = process.env.MOCKERC20_ADDRESS;

export const purchaseToken = async (nftContractId, buyerWalletAddress) => {
    try {
        validateEthereumWalletAddress(buyerWalletAddress);

        const nftDetailsKey = `listing:${nftContractId}`;
        const nftDetails = await redisClient.get(nftDetailsKey);

        if (!nftDetails) {
            throw new Error(`NFT with contract ID ${nftContractId} not found`);
        }

        const nft = JSON.parse(nftDetails);

        if (nft.priceType !== 'fixed') {
            throw new Error('This token is not available for direct purchase');
        }

        if (nft.isAuction) {
            throw new Error('This token is not currently in auction');
        }
        const buyerBalanceWei = await web3.eth.getBalance(buyerWalletAddress);
        const buyerBalanceEther = web3.utils.fromWei(buyerBalanceWei, 'ether');
        const buyerBalance = parseFloat(buyerBalanceEther);

        const tokenPriceInWei = nft.price;
        const tokenPriceInEther = web3.utils.fromWei(tokenPriceInWei.toString(), 'ether');
        const tokenPrice = parseFloat(tokenPriceInEther);

        if (buyerBalance < tokenPrice) {
            throw new Error('Insufficient funds to purchase the token');
        }

        const gasPrice = await web3.eth.getGasPrice();

        const erc20Contract = new web3.eth.Contract(mockErc20ABI, myMetamaskAddress);

        const nonce = await web3.eth.getTransactionCount(myMetamaskAddress, 'pending');

        const txData = erc20Contract.methods.transfer(sellerWalletAddress, '330000').encodeABI();

        const transferTransaction = {
            nonce,
            to: sellerWalletAddress,
            gas: 2000000,
            gasPrice,
            data: txData
        };

        const signedTx = await web3.eth.accounts.signTransaction(transferTransaction, account.privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction hash for ERC20 transfer: ${receipt.transactionHash}`);

        const txHash = await settlerContract.methods.finishAuction(
            {
                collectionAddress: nft.collectionAddress,
                erc20Address: myMetamaskAddress,
                tokenId: nftContractId,
                bid: nft.price
            },
            nft.sellerSignature,
            nft.ownerApprovedSig
        ).send({ from: myMetamaskAddress, gas: 2000000 });

        return {
            success: true,
            message: 'Token purchased successfully',
            transactionHash: txHash.transactionHash
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            success: false,
            error: `Failed to purchase token: ${error.message}`
        };
    }
};
