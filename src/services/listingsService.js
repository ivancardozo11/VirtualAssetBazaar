/* eslint-disable no-unused-vars */
import * as cache from '../database/cache/cacheUtils.js';
import * as details from '../utils/getDetails.js';
import * as redisStorage from '../utils/redisStorage.js';
import * as validateData from '../utils/validateListingData.js';
import * as errorHandling from '../utils/auctionErrorHandling.js';
import buildNewListing from '../utils/buildNewListing.js';
import redisClient from '../database/redis/redisConfig.js';

export const listings = [];

export const createListing = async (listingData) => {
    try {
        validateData.validateInputData(listingData);

        const {
            nftContractAddress,
            owner,
            nftContractId,
            title,
            description,
            price,
            isAuction,
            bidAmount,
            auctionEndTime,
            priceType,
            sellerSignature,
            isERC721,
            totalTokensForSale,
            sold,
            termsAccepted
        } = listingData;

        const nftDetails = await details.getNFTDetails(nftContractId);
        if (nftDetails) throw new Error('NFT contract ID is already in use');

        const newListing = buildNewListing(listingData);

        listings.push(newListing);
        redisStorage.storeListingInRedis(newListing);
        cache.cacheStoreListing(newListing.nftContractId, newListing, process.env.CACHE_EXPIRATION_TIME);

        return newListing;
    } catch (error) {
        errorHandling.handleErrors(error, 'Failed to create listing');
    }
};

export const getAllListings = async () => {
    const keys = await redisClient.keys('listing:*');
    const retrievedListings = [];

    for (const key of keys) {
        const listing = await redisClient.get(key);
        if (listing) retrievedListings.push(JSON.parse(listing));
    }

    return retrievedListings;
};

export const getListing = async (listingId) => {
    try {
        return await redisStorage.fetchListingFromCacheOrDatabase(listingId);
    } catch (error) {
        throw new Error(`Error getting listing: ${error.message}`);
    }
};

export const updateListing = async (listingId, updatedData) => {
    try {
        const redisListing = await redisClient.get(`listing:${listingId}`);
        if (!redisListing) throw new Error(`Listing not found for ID: ${listingId}`);

        const updatedListing = {
            ...JSON.parse(redisListing),
            ...updatedData
        };

        await redisClient.set(`listing:${listingId}`, JSON.stringify(updatedListing));
        return updatedListing;
    } catch (error) {
        throw new Error(`Error updating listing: ${error.message}`);
    }
};

export const deleteListing = (listingId) => {
    try {
        return redisStorage.deleteListingById(listingId);
    } catch (error) {
        throw new Error(`Failed to delete listing: ${error.message}`);
    }
};
