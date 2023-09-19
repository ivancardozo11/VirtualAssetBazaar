import { getEssentialDetails, getNFTDetails } from '../../src/utils/getDetails';
import redisClient from '../../src/database/redis/redisConfig';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));

describe('getDetails.js tests', () => {
    describe('getEssentialDetails', () => {
        it('should return essential details when all fields are present', () => {
            const highestBid = {
                nftContractAddress: '0x123',
                mockERC20Address: '0xabc',
                nftContractId: 1
            };
            const auctionDetails = {};

            const result = getEssentialDetails(highestBid, auctionDetails);
            expect(result).toEqual({
                collectionAddress: '0x123',
                erc20Address: '0xabc',
                tokenId: 1
            });
        });

        it('should throw an error if essential details are missing', () => {
            const highestBid = {};
            const auctionDetails = {};

            expect(() => getEssentialDetails(highestBid, auctionDetails)).toThrow('Missing required fields.');
        });
    });

    describe('getNFTDetails', () => {
        it('should retrieve NFT details from Redis', async () => {
            const mockData = { key: 'value' };
            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockData));

            const result = await getNFTDetails('1');
            expect(result).toEqual(mockData);
        });

        it('should return null if no NFT details are found', async () => {
            redisClient.get.mockResolvedValueOnce(null);

            const result = await getNFTDetails('1');
            expect(result).toBeNull();
        });

        it('should throw an error on Redis retrieval failure', async () => {
            redisClient.get.mockRejectedValueOnce(new Error('Redis error'));

            await expect(getNFTDetails('1')).rejects.toThrow('Failed to get NFT details: Redis error');
        });
    });
});
