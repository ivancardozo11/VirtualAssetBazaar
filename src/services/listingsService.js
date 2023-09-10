/* eslint-disable no-unused-vars */
import { validateListingData, ValidationError } from '../utils/validateListingData.js';
import redisClient from '../database/redis/redisConfig.js';
import * as cache from '../database/cache/cacheUtils.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as auctionValidation from '../utils/auctionValidation.js';
import { validateEthereumWalletAddress } from '../utils/adressValidation.js';
import { getNFTDetailsFromDatabase } from '../utils/getNFTDetailsFromDatabase.js';
import { checkAuctionBids } from '../utils/checkAuctionBids.js';

const listings = [];

export const createListing = async (listingData) => {
    try {
        validateInputData(listingData);

        const {
            nftContractAddress,
            owner,
            nftContractId,
            title,
            description,
            price,
            isAuction,
            startingPrice,
            auctionEndTime,
            priceType,
            sellerSignature,
            isERC721,
            totalTokensForSale,
            sold,
            termsAccepted
        } = listingData;

        const nftDetails = await getNFTDetailsFromDatabase(nftContractId);
        if (nftDetails) throw new Error('NFT contract ID is already in use');

        if (isAuction) await checkAuctionBids(nftContractId, startingPrice, owner);

        const newListing = buildNewListing(listingData);

        listings.push(newListing);
        storeListingInRedis(newListing);
        cache.cacheStoreListing(newListing.nftContractId, newListing, process.env.CACHE_EXPIRATION_TIME);

        return newListing;
    } catch (error) {
        handleErrors(error, 'Failed to create listing');
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
        return await fetchListingFromCacheOrDatabase(listingId);
    } catch (error) {
        throw new Error(`Error al recuperar el listado: ${error.message}`);
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
        return deleteListingById(listingId);
    } catch (error) {
        throw new Error(`Failed to delete listing: ${error.message}`);
    }
};

// Funciones auxiliares

const validateInputData = (listingData) => {
    const { error } = validateListingData(listingData);
    if (error) throw new Error(`Invalid listing data: ${error.message}`);

    validateTokenCount(listingData.totalTokensForSale);
    validateNFTContractId(listingData.nftContractId);
    validateSoldStatus(listingData.sold);

    numericValidation.validateStartingPriceGreaterThanPrice(listingData.startingPrice, listingData.price);
    validateEthereumWalletAddress(listingData.nftContractAddress);
    validateEthereumWalletAddress(listingData.owner);
    numericValidation.validatePositiveValue(listingData.price);
    dateValidation.validateFutureDate(listingData.auctionEndTime);
    auctionValidation.validatePriceTypeForAuction(listingData.isAuction, listingData.priceType);
};

const validateTokenCount = (totalTokensForSale) => {
    if (totalTokensForSale > 1000) throw new Error('Total tokens for sale cannot exceed 1000');
};

const validateNFTContractId = (nftContractId) => {
    if (nftContractId > 100000) throw new Error('Token ids cant have more than 100000 in number size');
};

const validateSoldStatus = (sold) => {
    if (sold !== false) throw new Error('sold field cant be sold before its listed');
};

const buildNewListing = (listingData) => {
    return {
        id: Date.now(),
        ...listingData
    };
};

const storeListingInRedis = (newListing) => {
    redisClient.set(`listing:${newListing.nftContractId}`, JSON.stringify(newListing));
};

const fetchListingFromCacheOrDatabase = async (listingId) => {
    const redisListing = await cache.cacheGetListing(listingId);
    if (redisListing) return redisListing;

    const foundListing = listings.find((listing) => listing.id === listingId);
    if (foundListing) {
        await cache.cacheStoreListing(listingId, foundListing, process.env.CACHE_EXPIRATION_TIME);
        return foundListing;
    }

    return retrieveListingFromRedisDatabase(listingId);
};

const retrieveListingFromRedisDatabase = async (listingId) => {
    const redisDatabaseListing = await redisClient.get(`listing:${listingId}`);
    if (redisDatabaseListing) {
        const parsedListing = JSON.parse(redisDatabaseListing);
        await cache.cacheStoreListing(listingId, parsedListing, process.env.CACHE_EXPIRATION_TIME);
        return parsedListing;
    }

    throw new Error(`Listing not found: ${listingId}`);
};

const deleteListingById = (listingId) => {
    const foundIndex = listings.findIndex((listing) => listing.id === listingId);
    if (foundIndex === -1) throw new Error(`Listing not found for ID: ${listingId}`);

    return listings.splice(foundIndex, 1)[0];
};

const handleErrors = (error, defaultMessage) => {
    if (error instanceof ValidationError) console.error(error.message);
    throw new Error(`${defaultMessage}: ${error.message}`);
};
