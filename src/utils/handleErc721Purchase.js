/* eslint-disable no-unused-vars */
/* eslint-disable import/no-duplicates */
import web3 from '../utils/web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
import buildErc721TransferTx from '../utils/buildErc721TransferTx.js';

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const GAS_LIMIT = 2000000;

const handleErc721Purchase = async (nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    const transferTx = await buildErc721TransferTx(nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS);
    const receipt = await web3.eth.sendSignedTransaction(transferTx.rawTransaction);

    const paymentAmountWei = web3Buyer.utils.toWei(nft.price.toString(), 'ether');
    const paymentConfig = {
        from: BUYER_WALLET_ADDRESS,
        to: SELLER_ADDRESS,
        value: paymentAmountWei,
        gas: GAS_LIMIT
    };

    const paymentReceipt = await web3Buyer.eth.sendTransaction(paymentConfig);
};

export default handleErc721Purchase;
