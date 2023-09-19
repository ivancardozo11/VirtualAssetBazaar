/* eslint-disable import/no-duplicates */
import web3 from '../utils/web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
import buildErc721TransferTx from '../utils/buildErc721TransferTx.js';

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const GAS_LIMIT = 2000000;

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

export default handleErc721Purchase;
