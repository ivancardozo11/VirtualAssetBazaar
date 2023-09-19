import web3Buyer from '../utils/web3ConfigBuyer.js';
const getBuyerBalance = async (BUYER_WALLET_ADDRESS) => {
    const buyerBalanceWei = await web3Buyer.eth.getBalance(BUYER_WALLET_ADDRESS);
    return parseFloat(web3Buyer.utils.fromWei(buyerBalanceWei, 'ether'));
};

export default getBuyerBalance;
