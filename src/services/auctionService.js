import * as auctionValidation from '../utils/auctionValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as validateFields from '../utils/validateListingData.js';
import redisClient from '../database/redis/redisConfig.js';
import { validateBid } from '../utils/bidValidation.js';

export const createAuction = async (auctionData) => {
    try {
        const { startingPrice, auctionEndTime, priceType, isAuction, BidAmount } = auctionData;

        if (!startingPrice || !auctionEndTime || !priceType || !isAuction || BidAmount === undefined) {
            throw new Error('Missing required fields for auction data');
        }

        validateFields.validateAuctionFields(auctionData);

        const auctionExists = await getAuctionDetailsById(auctionData.id);

        if (auctionExists) {
            throw new Error(`Auction with ID ${auctionData.id} already exists`);
        }

        numericValidation.validatePositiveValue(startingPrice);
        dateValidation.validateFutureDate(auctionEndTime);
        auctionValidation.validatePriceTypeForAuction(isAuction, priceType);

        const newAuction = {
            id: Date.now(),
            startingPrice,
            auctionEndTime,
            priceType,
            isAuction,
            BidAmount
        };
        const redisKey = `auction:${newAuction.id}`;
        await redisClient.set(redisKey, JSON.stringify(newAuction));

        return newAuction;
    } catch (error) {
        throw new Error(`Failed to create auction: ${error.message}`);
    }
};

export const getAuctionDetailsById = async (auctionId) => {
    try {
        auctionValidation.validateAuctionIdLength(auctionId);
        numericValidation.validateIsInteger(auctionId);
        numericValidation.validatePositiveValue(auctionId);

        const auctionDetails = await redisClient.get(`auction:${auctionId}`);

        if (!auctionDetails) {
            throw new Error(`Auction with ID ${auctionId} not found`);
        }

        return JSON.parse(auctionDetails);
    } catch (error) {
        throw new Error(`Failed to get auction details: ${error.message}`);
    }
};

export const placeBid = async (auctionId, bidAmount) => {
    try {
        numericValidation.validateIsInteger(auctionId);
        numericValidation.validateIsInteger(bidAmount);
        numericValidation.validatePositiveValue(auctionId);
        numericValidation.validatePositiveValue(bidAmount);

        const auctionDetails = await redisClient.get(`auction:${auctionId}`);
        if (!auctionDetails) {
            throw new Error(`Auction with ID ${auctionId} not found`);
        }

        const parsedAuctionDetails = JSON.parse(auctionDetails);

        validateBid(parsedAuctionDetails, auctionId, bidAmount);

        parsedAuctionDetails.highestBid = bidAmount;

        await redisClient.set(`auction:${auctionId}`, JSON.stringify(parsedAuctionDetails));

        return {
            success: true,
            message: 'Bid placed successfully',
            highestBid: bidAmount
        };
    } catch (error) {
        throw new Error(`Failed to place bid: ${error.message}`);
    }
};

export const endAuction = async (auctionId) => {
    try {
        numericValidation.validateIsInteger(auctionId);

        const auctionDetails = await getAuctionDetailsById(auctionId);

        if (auctionDetails.auctionEndTime > new Date()) {
            throw new Error(`Auction with ID ${auctionId} has not ended yet`);
        }
        await redisClient.del(`auction:${auctionId}`);

        return {
            success: true,
            message: 'Auction successfully ended'
        };
    } catch (error) {
        throw new Error(`Failed to end auction: ${error.message}`);
    }
};
