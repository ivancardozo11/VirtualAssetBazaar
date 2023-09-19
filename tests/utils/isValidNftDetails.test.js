import isValidNftDetails from '../../src/utils/isValidNftDetails.js';

describe('isValidNftDetails', () => {
    it('should throw an error if no listing is found for the provided nftContractId', () => {
        const listedToken = null;
        const buyerBalance = 100;
        const isAuction = true;

        expect(() => isValidNftDetails(listedToken, buyerBalance, isAuction)).toThrow('No listing found for the provided nftContractId');
    });

    it('should throw an error if the buyer balance is less than the bid amount', () => {
        const listedToken = { bidAmount: 150 };
        const buyerBalance = 100;
        const isAuction = true;

        expect(() => isValidNftDetails(listedToken, buyerBalance, isAuction)).toThrow('The provided buyerFunds is less than the bidAmount the owner is asking');
    });

    it('should throw an error if the NFT is not marked for auction but is being treated as one', () => {
        const listedToken = { isAuction: false };
        const buyerBalance = 100;
        const isAuction = true;

        expect(() => isValidNftDetails(listedToken, buyerBalance, isAuction)).toThrow('The NFT is not marked for auction but is being treated as one');
    });

    it('should return true if all checks pass', () => {
        const listedToken = { isAuction: true, bidAmount: 100 };
        const buyerBalance = 150;
        const isAuction = true;

        const result = isValidNftDetails(listedToken, buyerBalance, isAuction);

        expect(result).toBe(true);
    });
});
