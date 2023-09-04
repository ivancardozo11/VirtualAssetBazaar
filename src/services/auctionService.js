import * as auctionValidation from '../utils/auctionValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as validateFields from '../utils/validateListingData.js';
import * as addressValidation from '../utils/adressValidation.js';
import redisClient from '../database/redis/redisConfig.js';
import { validateBid } from '../utils/bidValidation.js';
import web3 from '../utils/web3Config.js';
import SettlerABI from '../utils/SettlerABI.js';

const settlerContractAddress = process.env.SETTLER_CONTRACT_ADDRESS;
const settlerContractInstance = new web3.eth.Contract(SettlerABI, settlerContractAddress);
const TestEthereumAddress = process.env.MY_ADDRESS;

export const createAuction = async (auctionData) => {
    try {
        const {
            nftContractAddress,
            erc20CurrencyAddress,
            nftContractId,
            erc20CurrencyAmount,
            startingPrice,
            auctionEndTime,
            priceType,
            isAuction,
            BidAmount,
            sellerWalletAddress,
            buyerWalletAddress,
            buyerSignature,
            sellerSignature,
            termsAccepted
        } = auctionData;

        if (
            !nftContractAddress ||
            !erc20CurrencyAddress ||
            !nftContractId ||
            !erc20CurrencyAmount ||
            !startingPrice ||
            !auctionEndTime ||
            !priceType ||
            !isAuction ||
            BidAmount === undefined ||
            !sellerWalletAddress ||
            !buyerWalletAddress ||
            !buyerSignature ||
            !sellerSignature ||
            termsAccepted === undefined
        ) {
            throw new Error('Missing required fields for auction data');
        }

        if (typeof termsAccepted !== 'boolean') {
            throw new Error('Invalid value for termsAccepted');
        }

        addressValidation.validateEthereumWalletAddress(sellerWalletAddress);
        addressValidation.validateEthereumWalletAddress(buyerWalletAddress);
        addressValidation.validateNFTContractAddress(nftContractAddress);
        addressValidation.validateEthereumWalletAddress(erc20CurrencyAddress);

        validateFields.validateAuctionFields(auctionData);

        const auctionExists = await getAuctionDetailsById(nftContractAddress);

        if (auctionExists) {
            throw new Error(`Auction for NFT contract ${nftContractAddress} already exists`);
        }

        numericValidation.validatePositiveValue(startingPrice);
        numericValidation.validatePositiveValue(erc20CurrencyAmount);
        dateValidation.validateFutureDate(auctionEndTime);
        auctionValidation.validatePriceTypeForAuction(isAuction, priceType);

        const auctionDetails = await getAuctionDetailsById(nftContractAddress);
        validateBid(auctionDetails, nftContractAddress, BidAmount);

        const newAuction = {
            id: Date.now(),
            nftContractAddress,
            erc20CurrencyAddress,
            nftContractId,
            erc20CurrencyAmount,
            startingPrice,
            auctionEndTime,
            priceType,
            isAuction,
            BidAmount,
            sellerWalletAddress,
            buyerWalletAddress,
            buyerSignature,
            sellerSignature
        };
        const redisKey = `auction:${newAuction.nftContractAddress}`;
        await redisClient.set(redisKey, JSON.stringify(newAuction));

        return newAuction;
    } catch (error) {
        throw new Error(`Failed to create auction: ${error.message}`);
    }
};

export const getAuctionDetailsById = async (nftContractAddress) => {
    try {
        const auctionDetails = await redisClient.get(`auction:${nftContractAddress}`);

        if (!auctionDetails) {
            return null;
        }

        return JSON.parse(auctionDetails);
    } catch (error) {
        throw new Error(`Failed to get auction details: ${error.message}`);
    }
};

export const placeBid = async (nftContractAddress, bidAmount, buyerSignature) => {
    try {
        const auctionDetails = await getAuctionDetailsById(nftContractAddress);

        if (!auctionDetails) {
            throw new Error(`Auction for NFT contract ${nftContractAddress} not found`);
        }

        numericValidation.validatePositiveValue(bidAmount);
        auctionValidation.validateBidAmount(bidAmount, auctionDetails.BidAmount);
        auctionValidation.validateBidSignature(buyerSignature, auctionDetails.buyerWalletAddress);

        auctionDetails.highestBid = bidAmount;
        auctionDetails.buyerSignature = buyerSignature;

        await redisClient.set(`auction:${nftContractAddress}`, JSON.stringify(auctionDetails));

        return {
            success: true,
            message: 'Bid placed successfully',
            highestBid: bidAmount
        };
    } catch (error) {
        throw new Error(`Failed to place bid: ${error.message}`);
    }
};

export const endAuction = async (nftContractAddress, sellerSignature) => {
    try {
        const auctionDetails = await getAuctionDetailsById(nftContractAddress);

        if (!auctionDetails) {
            throw new Error(`Auction for NFT contract ${nftContractAddress} not found`);
        }

        auctionValidation.validateBidSignature(sellerSignature, auctionDetails.sellerWalletAddress);

        const sellerWalletAddress = process.env.MY_ADDRESS;

        const newSellerSignature = await web3.eth.sign('Seller is agreeing to end the auction', sellerWalletAddress);

        await settlerContractInstance.methods.finishAuction(
            {
                collectionAddress: nftContractAddress,
                erc20Address: auctionDetails.erc20CurrencyAddress,
                tokenId: auctionDetails.nftContractId,
                bid: auctionDetails.highestBid
            },
            auctionDetails.buyerSignature,
            newSellerSignature
        ).send({ from: TestEthereumAddress, gas: 'auto' });

        await redisClient.del(`auction:${nftContractAddress}`);

        return {
            success: true,
            message: 'Auction successfully ended'
        };
    } catch (error) {
        throw new Error(`Failed to end auction: ${error.message}`);
    }
};
