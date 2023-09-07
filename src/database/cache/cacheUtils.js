import redisClient from '../redis/redisConfig.js';

export const cacheGetListing = async (listingId) => {
    const cachedListing = await redisClient.get(`cache:listing:${listingId}`);
    return JSON.parse(cachedListing);
};

export const cacheStoreListing = async (listingId, listing, expirationInSeconds) => {
    await redisClient.set(`cache:listing:${listingId}`, JSON.stringify(listing));
    await redisClient.expire(`cache:listing:${listingId}`, expirationInSeconds);
};

export const cacheStoreAuction = async (auctionId, auction, expirationInSeconds) => {
    await redisClient.set(`cache:auction:${auctionId}`, JSON.stringify(auction));
    await redisClient.expire(`cache:auction:${auctionId}`, expirationInSeconds);
};
