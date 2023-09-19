import getAuctionDetailsById from '../../src/utils/getAuctionDetails.js';
import redisClient from '../../src/database/redis/redisConfig.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    get: jest.fn()
}));

describe('getAuctionDetailsById', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch auction details for given nftContractId', async () => {
        const mockAuctionData = {
            nftContractId: 'testId',
            someOtherData: 'testData'
        };

        redisClient.get.mockResolvedValueOnce(JSON.stringify(mockAuctionData));

        const result = await getAuctionDetailsById('testId');
        expect(result).toEqual(mockAuctionData);
    });

    it('should handle errors properly', async () => {
        redisClient.get.mockRejectedValueOnce(new Error('Redis error'));

        await expect(getAuctionDetailsById('testId')).rejects.toThrow('Failed to fetch auction details.');
    });
});
