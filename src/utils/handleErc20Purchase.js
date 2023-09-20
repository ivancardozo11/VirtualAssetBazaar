/* eslint-disable no-unused-vars */
import web3 from '../utils/web3Config.js';
import sendErc20Tokens from '../utils/sendErc20Tokens.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
web3.eth.accounts.wallet.add(account);

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const GAS_LIMIT = 2000000;

const handleErc20Purchase = async (nft, BUYER_WALLET_ADDRESS) => {
    const receipt = await sendErc20Tokens(nft.totalTokensForSale, BUYER_WALLET_ADDRESS);

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
};

export default handleErc20Purchase;
