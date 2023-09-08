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
        const { error } = validateListingData(listingData);

        if (error) {
            throw new Error(`Invalid listing data: ${error.message}`);
        }
        const {
            nftContractAddress,
            erc20CurrencyAddress,
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
            termsAccepted,
            totalTokensForSale
        } = listingData;

        if (totalTokensForSale > 1000) {
            throw new Error('Total tokens for sale cannot exceed 1000');
        }

        const nftDetails = await getNFTDetailsFromDatabase(nftContractId);

        if (nftDetails) {
            throw new Error('NFT contract ID is already in use');
        }
        if (isAuction) {
            await checkAuctionBids(nftContractId, startingPrice, erc20CurrencyAddress);
        }

        numericValidation.validateStartingPriceGreaterThanPrice(startingPrice, price);
        validateEthereumWalletAddress(nftContractAddress);
        validateEthereumWalletAddress(erc20CurrencyAddress);
        numericValidation.validatePositiveValue(price);
        dateValidation.validateFutureDate(auctionEndTime);
        auctionValidation.validatePriceTypeForAuction(isAuction, priceType);

        const newListing = {
            id: Date.now(),
            nftContractAddress,
            erc20CurrencyAddress,
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
            termsAccepted
        };

        listings.push(newListing);
        redisClient.set(`listing:${newListing.nftContractId}`, JSON.stringify(newListing));

        cache.cacheStoreListing(newListing.id, newListing, process.env.CACHE_EXPIRATION_TIME);

        return newListing;
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error(error.message);
        }
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
        const redisListing = await cache.cacheGetListing(listingId);
        if (redisListing) {
            return redisListing;
        }

        const foundListing = listings.find((listing) => listing.id === listingId);
        if (foundListing) {
            await cache.cacheStoreListing(listingId, foundListing, process.env.CACHE_EXPIRATION_TIME);
            return foundListing;
        }

        const redisDatabaseListing = await redisClient.get(`listing:${listingId}`);
        if (redisDatabaseListing) {
            const parsedListing = JSON.parse(redisDatabaseListing);
            await cache.cacheStoreListing(listingId, parsedListing, process.env.CACHE_EXPIRATION_TIME);
            return parsedListing;
        }

        throw new Error(`Listing not found: ${listingId}`);
    } catch (error) {
        throw new Error(`Error al recuperar el listado: ${error.message}`);
    }
};

export const updateListing = async (listingId, updatedData) => {
    try {
        const redisListing = await redisClient.get(`listing:${listingId}`);

        if (!redisListing) {
            throw new Error(`Listing not found for ID: ${listingId}`);
        }

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
