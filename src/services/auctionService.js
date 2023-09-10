/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import * as auctionValidation from '../utils/auctionValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as validateFields from '../utils/validateListingData.js';
import * as cache from '../database/cache/cacheUtils.js';
import * as addressValidation from '../utils/addressValidation.js';
import { getExistingAuctionsForNFT } from '../utils/existingAuction.js';
import { getNFTDetailsFromDatabase } from '../utils/getNFTDetailsFromDatabase.js';
import redisClient from '../database/redis/redisConfig.js';
import web3 from '../utils/web3Config.js';
import SettlerABI from '../utils/SettlerABI.js';

const settlerContractAddress = process.env.SETTLER_CONTRACT_ADDRESS;
const settlerContractInstance = new web3.eth.Contract(SettlerABI, settlerContractAddress);
const TestEthereumAddress = process.env.MY_ADDRESS;

const validateAddresses = (addresses) => addresses.forEach(addr => addressValidation.validateEthereumWalletAddress(addr));

const validateAuctionData = (auctionData) => {
    const { sellerWalletAddress, buyerWalletAddress, nftContractAddress, erc20CurrencyAddress, startingPrice, erc20CurrencyAmount, isAuction, priceType } = auctionData;

    validateAddresses([sellerWalletAddress, buyerWalletAddress, nftContractAddress, erc20CurrencyAddress]);
    validateFields.validateAuctionFields(auctionData);

    numericValidation.validatePositiveValue(startingPrice);
    numericValidation.validatePositiveValue(erc20CurrencyAmount);
    dateValidation.validateFutureDate(new Date(auctionData.auctionEndTime));
    auctionValidation.validatePriceTypeForAuction(isAuction, priceType);
};

const isValidNftDetails = (nftDetails, erc20CurrencyAmount, isAuction) => {
    if (!nftDetails) return false;
    if (erc20CurrencyAmount < nftDetails.startingPrice) return false;
    if (!nftDetails.isAuction && isAuction) return false;
    return true;
};

const validateExistingAuctions = async (nftContractId, buyerWalletAddress) => {
    const existingAuctions = await getExistingAuctionsForNFT(nftContractId);
    if (existingAuctions.some(auction => auction.buyerWalletAddress === buyerWalletAddress)) throw new Error('Already participated in this auction.');
};

const validateAuctionDetails = (auctionDetails, nftContractAddress) => {
    if (!auctionDetails) {
        throw new Error(`Auction for NFT contract ${nftContractAddress} not found`);
    }
};

const validateBid = (bidAmount, buyerSignature, auctionDetails) => {
    numericValidation.validatePositiveValue(bidAmount);
    auctionValidation.validateBidAmount(bidAmount, auctionDetails.bidAmount);
    auctionValidation.validateBidSignature(buyerSignature, auctionDetails.buyerWalletAddress);
};

const updateAuctionWithBid = (auctionDetails, bidAmount, buyerSignature) => {
    return {
        ...auctionDetails,
        highestBid: bidAmount,
        buyerSignature
    };
};

const validateAuctionDetailsExistence = (auctionDetails, nftContractAddress) => {
    if (!auctionDetails) {
        throw new Error(`Auction for NFT contract ${nftContractAddress} not found`);
    }
};

const validateSellerSignature = (sellerSignature, sellerWalletAddress) => {
    auctionValidation.validateBidSignature(sellerSignature, sellerWalletAddress);
};

const generateNewSellerSignature = async () => {
    return await web3.eth.sign('Seller is agreeing to end the auction', TestEthereumAddress);
};

const finalizeAuctionOnBlockchain = async (auctionDetails, newSellerSignature) => {
    await settlerContractInstance.methods.finishAuction(
        {
            collectionAddress: auctionDetails.nftContractAddress,
            erc20Address: auctionDetails.erc20CurrencyAddress,
            tokenId: auctionDetails.nftContractId,
            bid: auctionDetails.highestBid
        },
        auctionDetails.buyerSignature,
        newSellerSignature
    ).send({ from: TestEthereumAddress, gas: 'auto' });
};

const storeAuctionInCache = async (auctionId, auction) => {
    const redisKey = `auction:${auctionId}`;
    await redisClient.set(redisKey, JSON.stringify(auction));
    cache.cacheStoreAuction(auctionId, auction, process.env.CACHE_EXPIRATION_TIME);
};

const removeAuctionFromCache = async (nftContractAddress) => {
    await redisClient.del(`auction:${nftContractAddress}`);
};

const createSuccessBidResponse = (bidAmount) => {
    return {
        success: true,
        message: 'Bid placed successfully',
        highestBid: bidAmount
    };
};

const createSuccessEndAuctionResponse = () => {
    return {
        success: true,
        message: 'Auction successfully ended'
    };
};

export const createAuction = async (auctionData) => {
    try {
        validateAuctionData(auctionData);

        const nftDetails = await getNFTDetailsFromDatabase(auctionData.nftContractAddress);
        if (!isValidNftDetails(nftDetails, auctionData.erc20CurrencyAmount, auctionData.isAuction)) {
            throw new Error('NFT details validation failed.');
        }

        await validateExistingAuctions(auctionData.nftContractId, auctionData.buyerWalletAddress);
        await storeAuctionInCache(auctionData.nftContractAddress, auctionData);

        return createSuccessBidResponse(auctionData.erc20CurrencyAmount);
    } catch (error) {
        throw error;
    }
};

export const placeBid = async (nftContractAddress, bidAmount, buyerSignature) => {
    try {
        const auctionDetails = await cache.getAuctionDetailsFromCache(nftContractAddress);

        validateAuctionDetails(auctionDetails, nftContractAddress);
        validateBid(bidAmount, buyerSignature, auctionDetails);

        const updatedAuctionDetails = updateAuctionWithBid(auctionDetails, bidAmount, buyerSignature);

        await storeAuctionInCache(nftContractAddress, updatedAuctionDetails);

        return createSuccessBidResponse(bidAmount);
    } catch (error) {
        console.error('Error al colocar la oferta:', error);
        throw new Error('No se pudo colocar la oferta en la subasta.');
    }
};

export const endAuction = async (nftContractAddress, sellerSignature) => {
    try {
        const auctionDetails = await cache.getAuctionDetailsFromCache(nftContractAddress);
        validateAuctionDetailsExistence(auctionDetails, nftContractAddress);

        validateSellerSignature(sellerSignature, auctionDetails.sellerWalletAddress);
        const newSellerSignature = await generateNewSellerSignature();
        await finalizeAuctionOnBlockchain(auctionDetails, newSellerSignature);

        await removeAuctionFromCache(nftContractAddress);

        return createSuccessEndAuctionResponse();
    } catch (error) {
        throw error;
    }
};
