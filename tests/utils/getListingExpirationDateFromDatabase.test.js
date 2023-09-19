import redisClient from '../../src/database/redis/redisConfig.js';
import getListingExpirationDateFromDatabase from '../../src/utils/getListingExpirationDateFromDatabase.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('getListingExpirationDateFromDatabase', () => {
    const nftContractId = 'dummyNftId';

    it('should return expiration date if listing is found in database', async () => {
        const mockExpirationDate = '2023-09-19T00:00:00Z';
        const mockNftDetails = {
            auctionEndTime: mockExpirationDate
        };

        redisClient.get.mockResolvedValue(JSON.stringify(mockNftDetails));

        const result = await getListingExpirationDateFromDatabase(nftContractId);
        expect(result).toEqual(new Date(mockExpirationDate));
    });

    it('should throw an error if no listing found for the provided nftContractId', async () => {
        redisClient.get.mockResolvedValue(null);

        await expect(getListingExpirationDateFromDatabase(nftContractId))
            .rejects
            .toThrowError(`No listing found for the provided ${nftContractId}`);
    });

    it('should propagate any other errors encountered', async () => {
        const errorMessage = 'Redis connection error';
        redisClient.get.mockRejectedValue(new Error(errorMessage));

        await expect(getListingExpirationDateFromDatabase(nftContractId))
            .rejects
            .toThrowError(`Failed to get NFT expiration date: ${errorMessage}`);
    });
});
