/* eslint-disable no-unused-vars */
import web3 from '../utils/web3Config.js';
import sendErc20Tokens from '../utils/sendErc20Tokens.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
web3.eth.accounts.wallet.add(account);

const SELLER_ADDRESS = process.env.MY_ADDRESS;

const handleErc20Purchase = async (nft, BUYER_WALLET_ADDRESS) => {
    const receipt = await sendErc20Tokens(nft.totalTokensForSale, BUYER_WALLET_ADDRESS);

    if (!receipt.transactionHash) {
        throw new Error('Token purchase transaction failed');
    }

    const paymentAmountWei = web3Buyer.utils.toWei(nft.price.toString(), 'ether');

    const estimatedGas = await web3Buyer.eth.estimateGas({
        to: SELLER_ADDRESS,
        from: BUYER_WALLET_ADDRESS,
        value: paymentAmountWei
    });

    const gasPrice = await web3Buyer.eth.getGasPrice();

    const paymentConfig = {
        from: BUYER_WALLET_ADDRESS,
        to: SELLER_ADDRESS,
        value: paymentAmountWei,
        gas: estimatedGas,
        gasPrice
    };

    const paymentReceipt = await web3Buyer.eth.sendTransaction(paymentConfig);
};

export default handleErc20Purchase;
