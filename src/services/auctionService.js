/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import * as auctionValidation from '../utils/auctionValidation.js';
import * as addressValidation from '../utils/addressValidation.js';
import * as createResponse from '../utils/createResponse.js';
import * as redisStorage from '../utils/redisStorage.js';
import * as signature from '../utils/signatureValidation.js';
import * as details from '../utils/getDetails.js';
import redisClient from '../database/redis/redisConfig.js';
import getBuyerBalance from '../utils/getBuyerBalance.js';
import validateBuyerFunds from '../utils/validateBuyerFunds.js';
import isValidNftDetails from '../utils/isValidNftDetails.js';
import buildNewAuction from '../utils/buildNewAuction.js';

const auctions = [];

export const getAllAuctions = async () => {
    try {
        const auctionKeys = await redisClient.keys('auction:*');
        const auctions = [];

        for (const key of auctionKeys) {
            const auction = await redisClient.get(key);
            auctions.push(JSON.parse(auction));
        }

        const lastAuction = auctions.sort((a, b) => b.bids.length - a.bids.length)[0];

        return [lastAuction];
    } catch (error) {
        console.error('Error getting the last auction', error);
        throw new Error('Could not get the last auction');
    }
};

export const createAuction = async (auctionData) => {
    try {
        auctionValidation.validateAuctionData(auctionData);

        if (auctionData.sellerWalletAddress === auctionData.buyerWalletAddress) {
            throw new Error('The auction creator cannot be the initial bidder.');
        }

        await auctionValidation.checkExistingAuction(auctionData.nftContractId);

        const buyerBalance = await getBuyerBalance(auctionData.buyerWalletAddress);

        const listedToken = await details.getNFTDetails(auctionData.nftContractId);

        validateBuyerFunds(buyerBalance, auctionData, listedToken);

        if (!isValidNftDetails(listedToken, buyerBalance, auctionData.isAuction)) {
            throw new Error('NFT details validation failed.');
        }

        const newAuction = buildNewAuction(auctionData);

        auctions.push(newAuction);
        redisStorage.storeAuctionInRedis(newAuction);
        redisStorage.cacheStoreAuction(newAuction.nftContractId, newAuction, process.env.CACHE_EXPIRATION_TIME);

        return newAuction;
    } catch (error) {
        console.log(error);
        return { success: false, error: `Failed to purchase token: ${error.message}` };
    }
};

export const placeBid = async (auctionData) => {
    try {
        const auctionDetails = await redisStorage.getAuctionDetailsFromRedis(auctionData.nftContractId);

        if (!auctionDetails) {
            throw new Error(`Cant find the auction for ID ${auctionData.nftContractId}`);
        }

        auctionValidation.validateAuctionDetails(auctionDetails, auctionData.bidderAddress, auctionData.bidAmount, auctionData.nftContractId, auctionData.buyerSignature, auctionData.buyerFunds);
        addressValidation.validateEthereumWalletAddress(auctionData.bidderAddress);

        const buyerBalance = await getBuyerBalance(auctionData.bidderAddress);
        const listedToken = await details.getNFTDetails(auctionData.nftContractId);

        validateBuyerFunds(buyerBalance, auctionData, listedToken);
        await auctionValidation.checkAuctionBids(auctionDetails.nftContractId, auctionData.bidAmount, auctionData.bidderAddress);

        const updatedAuctionDetails = auctionValidation.updateAuctionWithBid(auctionDetails, auctionData);
        await redisStorage.storeAuctionInCache(auctionData.nftContractId, updatedAuctionDetails);

        return createResponse.createSuccessBidResponse(auctionData.bidAmount);
    } catch (error) {
        console.error('Error placing the bid:', error.name);
        throw new Error(`Validation failed: ${error.message}`);
    }
};

export const endAuction = async (nftContractId, sellerSignature) => {
    try {
        const auctionDetails = await redisStorage.getAuctionDetailsFromRedis(nftContractId);

        if (!auctionDetails) {
            throw new Error(`Cant find the auction for ID ${nftContractId}`);
        }

        const highestBid = auctionValidation.retrieveHighestBidFromAuction(auctionDetails);

        if (!highestBid) {
            throw new Error('No bids have been placed on this auction.');
        }

        signature.validateSellerSignature(sellerSignature);

        await auctionValidation.finalizeAuctionOnBlockchain(highestBid, auctionDetails);

        await redisStorage.markAuctionAsSoldInRedis(auctionDetails.nftContractId);

        return createResponse.createSuccessEndAuctionResponse();
    } catch (error) {
        throw new Error(`Validation failed: ${error.message}`);
    }
};
