import * as redisStorage from '../../src/utils/redisStorage';
import redisClient from '../../src/database/redis/redisConfig.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('redisStorage utility functions', () => {
    describe('storeAuctionInRedis', () => {
        it('should store a new auction in redis', () => {
            const mockAuction = {
                nftContractId: '12345',
                someOtherField: 'value'
            };
            redisStorage.storeAuctionInRedis(mockAuction);
            expect(redisClient.set).toHaveBeenCalledWith(
                `auction:${mockAuction.nftContractId}`,
                JSON.stringify(mockAuction)
            );
        });
    });
    describe('cacheStoreAuction', () => {
        it('should store auction in cache and set expiration time', async () => {
            const auctionId = '123';
            const mockAuction = { id: auctionId, name: 'testAuction' };
            const expirationInSeconds = 3600;

            await redisStorage.cacheStoreAuction(auctionId, mockAuction, expirationInSeconds);

            expect(redisClient.set).toHaveBeenCalledWith(`cache:auction:${auctionId}`, JSON.stringify(mockAuction));
            expect(redisClient.expire).toHaveBeenCalledWith(`cache:auction:${auctionId}`, expirationInSeconds);
        });
    });
    it('should throw error when auction not found', async () => {
        const nftContractId = '12345';

        redisClient.get.mockResolvedValueOnce(null);

        await expect(redisStorage.markAuctionAsSoldInRedis(nftContractId)).rejects.toThrow(`No auction found for the provided ID ${nftContractId}.`);
    });
    describe('getAuctionDetailsFromRedis', () => {
        it('should fetch auction details from Redis', async () => {
            const nftContractId = '98765';
            const mockAuctionDetails = JSON.stringify({ id: nftContractId, name: 'testAuction' });

            redisClient.get.mockResolvedValueOnce(mockAuctionDetails);

            const result = await redisStorage.getAuctionDetailsFromRedis(nftContractId);

            expect(result).toEqual(JSON.parse(mockAuctionDetails));
        });

        it('should throw error when there is an issue fetching auction details', async () => {
            const nftContractId = '98765';

            redisClient.get.mockRejectedValueOnce(new Error('Redis fetch error'));

            await expect(redisStorage.getAuctionDetailsFromRedis(nftContractId)).rejects.toThrow('Error getting auction from cache.: Redis fetch error');
        });
    });

    describe('storeAuctionInCache', () => {
        it('should store auction details in cache', async () => {
            const nftContractId = 'abcde';
            const mockAuction = { id: nftContractId, name: 'testAuction' };

            await redisStorage.storeAuctionInCache(nftContractId, mockAuction);

            expect(redisClient.set).toHaveBeenCalledWith(`auction:${nftContractId}`, JSON.stringify(mockAuction));
        });
    });

    describe('storeListingInRedis', () => {
        it('should store listing details in Redis', async () => {
            const mockListing = { nftContractId: 'xyz123', name: 'testListing' };

            await redisStorage.storeListingInRedis(mockListing);

            expect(redisClient.set).toHaveBeenCalledWith(`listing:${mockListing.nftContractId}`, JSON.stringify(mockListing));
        });
    });

    describe('fetchListingFromCacheOrDatabase', () => {
        it('should fetch listing from cache if available', async () => {
            const listingId = '12345abc';
            const mockListing = { id: listingId, name: 'testListing' };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockListing));

            const result = await redisStorage.fetchListingFromCacheOrDatabase(listingId);

            expect(result).toEqual(mockListing);
        });
    });

    describe('retrieveListingFromRedisDatabase', () => {
        it('should retrieve listing from Redis database', async () => {
            const listingId = '67890def';
            const mockListing = { id: listingId, name: 'testListing' };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockListing));

            const result = await redisStorage.retrieveListingFromRedisDatabase(listingId);

            expect(result).toEqual(mockListing);
        });

        it('should throw error when listing is not found in Redis', async () => {
            const listingId = '67890def';

            redisClient.get.mockResolvedValueOnce(null);

            await expect(redisStorage.retrieveListingFromRedisDatabase(listingId)).rejects.toThrow(`Listing not found: ${listingId}`);
        });
    });
});
