import { validateListingData } from '../utils/validateListingData.js';
import redisClient from '../database/redis/redisConfig.js';
import {
    cacheGetListing,
    cacheStoreListing
} from '../database/cache/cacheUtils.js';

const listings = [];

export const createListing = (listingData) => {
    try {
        const { error } = validateListingData(listingData);

        if (error) {
            throw new Error(`Invalid listing data: ${error.message}`);
        }

        if (listings.some((listing) => listing.id === listingData.id)) {
            throw new Error(`Listing with ID ${listingData.id} already exists`);
        }

        const newListing = {
            id: Date.now(),
            title: listingData.title,
            description: listingData.description,
            price: listingData.price,
            isAuction: listingData.isAuction
        };

        listings.push(newListing);
        redisClient.set(`listing:${newListing.id}`, JSON.stringify(newListing));

        // Cache the newly created listing
        cacheStoreListing(newListing.id, newListing);

        return newListing;
    } catch (error) {
        throw new Error(`Failed to create listing: ${error.message}`);
    }
};

export const getAllListings = async () => {
    const keys = await redisClient.keys('listing:*');
    const listings = [];

    for (const key of keys) {
        const listing = await redisClient.get(key);
        if (listing) {
            listings.push(JSON.parse(listing));
        }
    }

    return listings;
};

export const getListing = async (listingId) => {
    try {
        const redisListing = await cacheGetListing(listingId);
        if (redisListing) {
            return redisListing;
        }

        const foundListing = listings.find((listing) => listing.id === listingId);
        if (foundListing) {
            // Cache the listing for future use
            await cacheStoreListing(listingId, foundListing);
            return foundListing;
        }

        const redisDatabaseListing = await redisClient.get(`listing:${listingId}`);
        if (redisDatabaseListing) {
            const parsedListing = JSON.parse(redisDatabaseListing);
            await cacheStoreListing(listingId, parsedListing);
            return parsedListing;
        }

        return null;
    } catch (error) {
        throw new Error(`Failed to retrieve listing: ${error.message}`);
    }
};

export const updateListing = (listingId, updatedData) => {
    const foundIndex = listings.findIndex((listing) => listing.id === listingId);

    if (foundIndex === -1) {
        throw new Error(`Listing not found for ID: ${listingId}`);
    }

    const updatedListing = {
        ...listings[foundIndex],
        ...updatedData
    };

    listings[foundIndex] = updatedListing;

    return updatedListing;
};

export const deleteListing = (listingId) => {
    try {
        const foundIndex = listings.findIndex((listing) => listing.id === listingId);

        if (foundIndex === -1) {
            throw new Error(`Listing not found for ID: ${listingId}`);
        }

        const deletedListing = listings.splice(foundIndex, 1)[0];

        return deletedListing;
    } catch (error) {
        throw new Error(`Failed to delete listing: ${error.message}`);
    }
};
