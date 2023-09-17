import redisClient from '../redis/redisConfig.js';

export const cacheGetListing = async (listingId) => {
    const cachedListing = await redisClient.get(`cache:listing:${listingId}`);
    return JSON.parse(cachedListing);
};

export const cacheStoreListing = async (listingId, listing, expirationInSeconds) => {
    await redisClient.set(`cache:listing:${listingId}`, JSON.stringify(listing));
    await redisClient.expire(`cache:listing:${listingId}`, expirationInSeconds);
};
