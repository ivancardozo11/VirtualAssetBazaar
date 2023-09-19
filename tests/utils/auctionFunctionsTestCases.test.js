import * as auctionValidation from '../../src/utils/auctionValidation.js';
import * as auctionErrorHandling from '../../src/utils/auctionErrorHandling.js';

jest.mock('../../src/utils/auctionValidation.js', () => ({
    getAuctionDetailsById: jest.fn(),
    checkAuctionBids: jest.fn(),
    updateAuctionWithBid: jest.fn()
}));

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('Auction Functions', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('checkAuctionBids', () => {
        it('throws an error if no auction found', async () => {
            auctionValidation.getAuctionDetailsById.mockResolvedValueOnce(null);
            auctionValidation.checkAuctionBids.mockRejectedValueOnce(new auctionErrorHandling.AuctionError('No auction found with ID: 1'));

            await expect(auctionValidation.checkAuctionBids('1', 5, 'address1')).rejects.toThrow(new auctionErrorHandling.AuctionError('No auction found with ID: 1'));
        });

        it('throws an error if same bid value from other bidder exists', async () => {
            const auctionDetails = {
                bids: [
                    { bidAmount: 5, bidderAddress: 'address2' }
                ]
            };
            auctionValidation.getAuctionDetailsById.mockResolvedValueOnce(auctionDetails);
            auctionValidation.checkAuctionBids.mockRejectedValueOnce(new auctionErrorHandling.BidValueError('A bid of 5 ETH was already made by another bidder.'));

            await expect(auctionValidation.checkAuctionBids('1', 5, 'address1')).rejects.toThrow(new auctionErrorHandling.BidValueError('A bid of 5 ETH was already made by another bidder.'));
        });

        it('throws an error if bid is not higher than previous bid from the same bidder', async () => {
            const auctionDetails = {
                bids: [
                    { bidAmount: 4, bidderAddress: 'address1' }
                ]
            };
            auctionValidation.getAuctionDetailsById.mockResolvedValueOnce(auctionDetails);
            auctionValidation.checkAuctionBids.mockRejectedValueOnce(new auctionErrorHandling.BidValueError('Your new bid of 4 ETH must be higher than your previous bid of 4 ETH.'));

            await expect(auctionValidation.checkAuctionBids('1', 4, 'address1')).rejects.toThrow(new auctionErrorHandling.BidValueError('Your new bid of 4 ETH must be higher than your previous bid of 4 ETH.'));
        });

        it('throws an error if trying to bid consecutively', async () => {
            const auctionDetails = {
                bids: [
                    { bidAmount: 4, bidderAddress: 'address1' }
                ]
            };
            auctionValidation.getAuctionDetailsById.mockResolvedValueOnce(auctionDetails);
            auctionValidation.checkAuctionBids.mockRejectedValueOnce(new auctionErrorHandling.ConsecutiveBidError('You cannot bid consecutively. Wait for someone else to bid or for the auction to end.'));

            await expect(auctionValidation.checkAuctionBids('1', 5, 'address1')).rejects.toThrow(new auctionErrorHandling.ConsecutiveBidError('You cannot bid consecutively. Wait for someone else to bid or for the auction to end.'));
        });
    });

    describe('updateAuctionWithBid', () => {
        it('updates auction with new bid', () => {
            const auctionDetails = {
                otherData: 'sampleData',
                bids: []
            };
            const bidData = {
                bidAmount: 5,
                buyerSignature: 'signature',
                bidderAddress: 'address1',
                buyerFunds: 5000,
                termsAccepted: true
            };

            const mockUpdatedAuction = {
                otherData: 'sampleData',
                highestBid: 5,
                bids: [bidData]
            };

            auctionValidation.updateAuctionWithBid.mockReturnValue(mockUpdatedAuction);

            const updatedAuction = auctionValidation.updateAuctionWithBid(auctionDetails, bidData);

            expect(updatedAuction).toEqual(mockUpdatedAuction);
        });
    });
});
