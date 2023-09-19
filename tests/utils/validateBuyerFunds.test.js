import validateBuyerFunds from '../../src/utils/validateBuyerFunds';

describe('validateBuyerFunds utility', () => {
    it('should throw an error if bid amount is greater than buyer balance', () => {
        const buyerBalance = 1;
        const auctionData = {
            bidAmount: 2,
            buyerFunds: 1
        };
        const listedToken = {
            bidAmount: 1.5
        };

        expect(() => validateBuyerFunds(buyerBalance, auctionData, listedToken)).toThrow(
            `Your bid amount is ${auctionData.bidAmount}ETH and your wallet balance is ${buyerBalance}ETH. Please enter a valid bid amount available in your wallet.`
        );
    });

    it('should throw an error if buyer balance is not equal to auction data buyer funds', () => {
        const buyerBalance = 2;
        const auctionData = {
            bidAmount: 1,
            buyerFunds: 3
        };
        const listedToken = {
            bidAmount: 1
        };

        expect(() => validateBuyerFunds(buyerBalance, auctionData, listedToken)).toThrow(
            `Incorrect funds input. Your wallet balance is ${buyerBalance} please enter that amount as buyerBalance.`
        );
    });

    it('should throw an error if buyer balance is less than listed token bid amount', () => {
        const buyerBalance = 1;
        const auctionData = {
            bidAmount: 1,
            buyerFunds: 1
        };
        const listedToken = {
            bidAmount: 1.5
        };

        expect(() => validateBuyerFunds(buyerBalance, auctionData, listedToken)).toThrow(
            `Insufficient funds to purchase. Token price is ${listedToken.bidAmount}ETH and your wallet balance is ${buyerBalance}ETH`
        );
    });

    it('should not throw any error if all conditions are met', () => {
        const buyerBalance = 2;
        const auctionData = {
            bidAmount: 1,
            buyerFunds: 2
        };
        const listedToken = {
            bidAmount: 1.5
        };

        expect(() => validateBuyerFunds(buyerBalance, auctionData, listedToken)).not.toThrow();
    });
});
