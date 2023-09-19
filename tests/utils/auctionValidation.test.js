import {
    validatePriceTypeForAuction,
    validateAuctionFieldsForFixedPrice,
    validateAuctionIdLength,
    areNoBidsPresent,
    retrieveHighestBidFromAuction,
    sortBidsAndGetHighest

} from '../../src/utils/auctionValidation.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('validatePriceTypeForAuction', () => {
    it('should not throw an error for a valid auction priceType', () => {
        expect(() => validatePriceTypeForAuction(true, 'auction')).not.toThrow();
    });

    it('should not throw an error for a valid fixed priceType', () => {
        expect(() => validatePriceTypeForAuction(false, 'fixed')).not.toThrow();
    });

    it('should throw an error for an invalid auction priceType', () => {
        expect(() => validatePriceTypeForAuction(true, 'fixed')).toThrow('Invalid priceType for auction listing');
    });

    it('should throw an error for an invalid fixed priceType', () => {
        expect(() => validatePriceTypeForAuction(false, 'auction')).toThrow('Invalid priceType for non-auction listing');
    });
});

describe('validateAuctionFieldsForFixedPrice', () => {
    it('should throw an error if auction fields are present for a fixed price listing', () => {
        expect(() => validateAuctionFieldsForFixedPrice(false, '2023-10-10', 100)).toThrow('Auction fields should not be present for fixed price listings');
    });
});

describe('validateAuctionIdLength', () => {
    it('should not throw an error for a valid auction ID', () => {
        expect(() => validateAuctionIdLength('1234567890123')).not.toThrow();
    });

    it('should throw an error for an invalid auction ID', () => {
        expect(() => validateAuctionIdLength('12345678901')).toThrow('Auction ID must have at least 13 characters');
    });
});

describe('Auction Bids', () => {
    describe('areNoBidsPresent', () => {
        it('should return true if there are no bids present', () => {
            const auctionDetails = {};
            expect(areNoBidsPresent(auctionDetails)).toBe(true);
        });

        it('should return true if bids array is empty', () => {
            const auctionDetails = { bids: [] };
            expect(areNoBidsPresent(auctionDetails)).toBe(true);
        });

        it('should return false if bids are present', () => {
            const auctionDetails = { bids: [{ bidAmount: 10 }] };
            expect(areNoBidsPresent(auctionDetails)).toBe(false);
        });
    });

    describe('sortBidsAndGetHighest', () => {
        it('should retrieve the highest bid', () => {
            const bids = [
                { bidAmount: 10 },
                { bidAmount: 15 },
                { bidAmount: 5 }
            ];
            expect(sortBidsAndGetHighest(bids).bidAmount).toBe(15);
        });

        it('should return undefined for an empty bid array', () => {
            const bids = [];
            expect(sortBidsAndGetHighest(bids)).toBeUndefined();
        });
    });

    describe('retrieveHighestBidFromAuction', () => {
        it('should retrieve the highest bid for the auction', () => {
            const auctionDetails = {
                bids: [
                    { bidAmount: 10 },
                    { bidAmount: 15 },
                    { bidAmount: 5 }
                ]
            };
            expect(retrieveHighestBidFromAuction(auctionDetails).bidAmount).toBe(15);
        });

        it('should return null if there are no bids for the auction', () => {
            const auctionDetails = {};
            expect(retrieveHighestBidFromAuction(auctionDetails)).toBeNull();
        });
    });
});
