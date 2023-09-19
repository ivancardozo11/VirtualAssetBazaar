import {
    validateFutureDate,
    validateDateNotNull,
    validateAuctionEndDateBeforeListingExpiration
} from '../../src/utils/dateValidation.js';

import getListingExpirationDateFromDatabase from '../../src/utils/getListingExpirationDateFromDatabase.js';

jest.mock('../../src/utils/getListingExpirationDateFromDatabase.js');

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('Date validation utils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateFutureDate', () => {
        it('should throw an error if the date is not in the future', () => {
            const pastDate = new Date(Date.now() - (24 * 60 * 60 * 1000));
            expect(() => validateFutureDate(pastDate)).toThrow('Auction end time must be in the future');
        });

        it('should not throw an error if the date is in the future', () => {
            const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000));
            expect(() => validateFutureDate(futureDate)).not.toThrow();
        });
    });

    describe('validateDateNotNull', () => {
        it('should throw an error if the date is null or undefined', () => {
            expect(() => validateDateNotNull(null)).toThrow('Auction end time must be provided');
            expect(() => validateDateNotNull(undefined)).toThrow('Auction end time must be provided');
        });

        it('should not throw an error if the date is provided', () => {
            const someDate = new Date();
            expect(() => validateDateNotNull(someDate)).not.toThrow();
        });
    });

    describe('validateAuctionEndDateBeforeListingExpiration', () => {
        it('should throw an error if the auction end date is not in the future', async () => {
            const pastDate = new Date(Date.now() - (48 * 60 * 60 * 1000));
            getListingExpirationDateFromDatabase.mockResolvedValueOnce(pastDate);

            await expect(validateAuctionEndDateBeforeListingExpiration('testId')).rejects.toThrow('Auction end time must be in the future');
        });

        it('should return the auction end date if valid', async () => {
            const listingExpirationDate = new Date(Date.now() + (48 * 60 * 60 * 1000));
            getListingExpirationDateFromDatabase.mockResolvedValueOnce(listingExpirationDate);

            const expectedAuctionEndDate = new Date(listingExpirationDate.getTime() - (24 * 60 * 60 * 1000));
            const result = await validateAuctionEndDateBeforeListingExpiration('testId');

            expect(result).toEqual(expectedAuctionEndDate);
        });
    });
});
