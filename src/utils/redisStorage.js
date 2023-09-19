import redisClient from '../database/redis/redisConfig.js';
import * as listingService from '../services/listingsService.js';
import * as cache from '../database/cache/cacheUtils.js';

export const storeAuctionInRedis = (newAuction) => {
    redisClient.set(`auction:${newAuction.nftContractId}`, JSON.stringify(newAuction));
};

export const cacheStoreAuction = async (auctionId, auction, expirationInSeconds) => {
    await redisClient.set(`cache:auction:${auctionId}`, JSON.stringify(auction));
    await redisClient.expire(`cache:auction:${auctionId}`, expirationInSeconds);
};

export const getAuctionDetailsFromRedis = async (nftContractId) => {
    try {
        const auction = await redisClient.get(`auction:${nftContractId}`);
        return JSON.parse(auction);
    } catch (error) {
        throw new Error(`Error getting auction from cache.: ${error.message}`);
    }
};

export const storeAuctionInCache = async (nftContractId, auction) => {
    const redisKey = `auction:${nftContractId}`;
    await redisClient.set(redisKey, JSON.stringify(auction));
    cacheStoreAuction(nftContractId, auction, process.env.CACHE_EXPIRATION_TIME);
};

export const markAuctionAsSoldInRedis = async (nftContractId) => {
    const auctionDetails = await redisClient.get(`auction:${nftContractId}`);
    if (!auctionDetails) {
        throw new Error(`No auction found for the provided ID ${nftContractId}.`);
    }
    await redisClient.set(`auction:sold:${nftContractId}`, auctionDetails);
    await redisClient.del(`auction:${nftContractId}`);
};

export const deleteListingById = (listingId) => {
    const foundIndex = listingService.listings.findIndex((listing) => listing.id === listingId);
    if (foundIndex === -1) throw new Error(`Listing not found for ID: ${listingId}`);

    return listingService.listings.splice(foundIndex, 1)[0];
};

export const storeListingInRedis = (newListing) => {
    redisClient.set(`listing:${newListing.nftContractId}`, JSON.stringify(newListing));
};

export const fetchListingFromCacheOrDatabase = async (listingId) => {
    const redisListing = await cache.cacheGetListing(listingId);
    if (redisListing) return redisListing;

    const foundListing = listingService.listings.find((listing) => listing.id === listingId);
    if (foundListing) {
        await cache.cacheStoreListing(listingId, foundListing, process.env.CACHE_EXPIRATION_TIME);
        return foundListing;
    }

    return retrieveListingFromRedisDatabase(listingId);
};

export const retrieveListingFromRedisDatabase = async (listingId) => {
    const redisDatabaseListing = await redisClient.get(`listing:${listingId}`);
    if (redisDatabaseListing) {
        const parsedListing = JSON.parse(redisDatabaseListing);
        await cache.cacheStoreListing(listingId, parsedListing, process.env.CACHE_EXPIRATION_TIME);
        return parsedListing;
    }

    throw new Error(`Listing not found: ${listingId}`);
};
