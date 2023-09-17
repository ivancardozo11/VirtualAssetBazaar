const validateBuyerFunds = (buyerBalance, auctionData, listedToken) => {
    if (auctionData.bidAmount > buyerBalance) {
        throw new Error(`Your bid amount is ${auctionData.bidAmount}ETH and your wallet balance is ${buyerBalance}ETH. Please enter a valid bid amount available in your wallet.`);
    }
    if (buyerBalance !== auctionData.buyerFunds) {
        throw new Error(`Incorrect funds input. Your wallet balance is ${buyerBalance} please enter that amount as buyerBalance.`);
    }
    if (buyerBalance < listedToken.bidAmount) {
        throw new Error(`Insufficient funds to purchase. Token price is ${listedToken.bidAmount}ETH and your wallet balance is ${buyerBalance}ETH`);
    }
};

export default validateBuyerFunds;
