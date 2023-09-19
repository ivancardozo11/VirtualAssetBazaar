import * as cacheUtils from '../../../src/database/cache/cacheUtils.js';
import redisClient from '../../../src/database/redis/redisConfig.js';

jest.mock('../../../src/database/redis/redisConfig.js', () => ({
    get: jest.fn(),
    set: jest.fn(),
    expire: jest.fn()
}));

describe('Cache Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get a listing from cache', async () => {
        const mockListing = { id: 1, name: 'Test Listing' };

        // Simulating a cache hit
        redisClient.get.mockResolvedValueOnce(JSON.stringify(mockListing));

        const result = await cacheUtils.cacheGetListing(1);
        expect(result).toEqual(mockListing);
        expect(redisClient.get).toHaveBeenCalledWith('cache:listing:1');
    });

    it('should return null for a cache miss', async () => {
        // Simulating a cache miss
        redisClient.get.mockResolvedValueOnce(null);

        const result = await cacheUtils.cacheGetListing(2);
        expect(result).toBeNull();
        expect(redisClient.get).toHaveBeenCalledWith('cache:listing:2');
    });

    it('should store a listing in cache with an expiration', async () => {
        const mockListing = { id: 3, name: 'Test Listing to Store' };
        const expirationInSeconds = 300;

        await cacheUtils.cacheStoreListing(3, mockListing, expirationInSeconds);

        expect(redisClient.set).toHaveBeenCalledWith('cache:listing:3', JSON.stringify(mockListing));
        expect(redisClient.expire).toHaveBeenCalledWith('cache:listing:3', expirationInSeconds);
    });
});
