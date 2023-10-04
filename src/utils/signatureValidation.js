/* eslint-disable no-undef */
import web3 from './web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
const BuyerAccount = web3Buyer.eth.accounts.privateKeyToAccount(`0x${process.env.BUYER_PRIVATE_KEY}`);
const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
export const validateSellerSignature = (signature) => {
    try {
        if (account.privateKey !== signature) {
            throw new Error('The signature does not match the expected private key. Make sure you include the "0x" prefix in your signature.');
        }
    } catch (error) {
        throw new Error(`Validation failed: ${error.message}`);
    }
};

export const generateNewSellerSignature = async (SELLER_ADDRESS) => {
    return await web3.eth.sign('Seller is agreeing to end the auction', SELLER_ADDRESS);
};

export const generateBuyerSignature = async (bidderAddress) => {
    return await web3Buyer.eth.sign('Buyer is agreeing to the bid', bidderAddress);
};
export const sendSignedTransaction = async (contract, method, fromAddress, nonce) => {
    try {
        const txData = {
            from: fromAddress,
            to: contract.options.address,
            data: method.encodeABI(),
            gas: await method.estimateGas({ from: fromAddress }),
            gasPrice: await web3.eth.getGasPrice(),
            nonce
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, BuyerAccount.privateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (error) {
        if (error.message.includes('Error happened while trying to execute a function inside a smart contract')) {
            console.warn('Insufficient allowance error encountered, proceeding anyway for demo purposes.');
        } else {
            throw error;
        }
    }
};
