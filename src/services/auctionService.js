import * as auctionValidation from '../utils/auctionValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as validateFields from '../utils/validateListingData.js';
import * as cache from '../database/cache/cacheUtils.js';
import * as addressValidation from '../utils/adressValidation.js';
import { getExistingAuctionsForNFT } from '../utils/existingAuction.js';
import { getNFTDetailsFromDatabase } from '../utils/getNFTDetailsFromDatabase.js';
import redisClient from '../database/redis/redisConfig.js';
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
            priceType,
            isAuction,
            sellerWalletAddress,
            buyerWalletAddress,
            buyerSignature,
            sellerSignature,
            termsAccepted
        } = auctionData;

        addressValidation.validateEthereumWalletAddress(sellerWalletAddress);
        addressValidation.validateEthereumWalletAddress(buyerWalletAddress);
        addressValidation.validateEthereumWalletAddress(nftContractAddress);
        addressValidation.validateEthereumWalletAddress(erc20CurrencyAddress);
        validateFields.validateAuctionFields(auctionData);

        const nftDetails = await getNFTDetailsFromDatabase(nftContractId);

        if (nftDetails && erc20CurrencyAmount < nftDetails.startingPrice) {
            throw new Error('funds from your ERC20 wallet must be greater than the starting price of the listed auction');
        }

        if (!nftDetails) {
            throw new Error('The NFT for that contract ID is not avaliable or doenst exist');
        }

        if (!nftDetails.isAuction && isAuction) {
            throw new Error('Cannot start an auction for a fixed price listing');
        }

        const auctionEndTime = new Date(nftDetails.auctionEndTime);

        const currentTime = new Date();

        if (currentTime > auctionEndTime) {
            throw new Error('This auction has expired');
        }

        if (nftContractAddress !== nftDetails.nftContractAddress ||
            erc20CurrencyAddress !== nftDetails.erc20CurrencyAddress ||
            sellerWalletAddress !== nftDetails.erc20CurrencyAddress ||
            sellerSignature !== nftDetails.sellerSignature) {
            throw new Error('NFT contract, ERC20 currency, seller wallet address, or seller signature does not match the listing');
        }

        if (nftContractAddress === erc20CurrencyAddress) {
            throw new Error('NFT contract address and ERC20 currency address cannot be the same');
        }

        if (erc20CurrencyAmount < startingPrice) {
            throw new Error('Not enough ERC20 currency to place a bid at the starting price');
        }

        numericValidation.validatePositiveValue(startingPrice);
        numericValidation.validatePositiveValue(erc20CurrencyAmount);
        dateValidation.validateFutureDate(auctionEndTime);
        auctionValidation.validatePriceTypeForAuction(isAuction, priceType);

        // Obtén todas las subastas existentes para el mismo NFT
        const existingAuctions = await getExistingAuctionsForNFT(nftContractId);

        if (existingAuctions.some(auction =>
            auction.buyerWalletAddress === buyerWalletAddress ||
            auction.buyerSignature === buyerSignature
        )) {
            throw new Error('You have already participated in this auction');
        }

        if (buyerWalletAddress === sellerWalletAddress) {
            throw new Error('Buyer and seller wallet addresses must be different');
        }

        if (sellerWalletAddress !== erc20CurrencyAddress) {
            throw new Error('Seller wallet address must be the same as ERC20 currency address');
        }

        const maxAuctionAmount = existingAuctions.reduce((maxAmount, auction) => Math.max(maxAmount, auction.startingPrice), 0);

        if (startingPrice <= maxAuctionAmount) {
            throw new Error('The starting price must be higher than the highest bid in previous auctions');
        }

        const newAuction = {
            id: Date.now(),
            nftContractAddress,
            erc20CurrencyAddress,
            nftContractId,
            erc20CurrencyAmount,
            startingPrice,
            priceType,
            isAuction,
            sellerWalletAddress,
            buyerWalletAddress,
            buyerSignature,
            sellerSignature,
            termsAccepted
        };
        const redisKey = `auction:${newAuction.id}`;
        await redisClient.set(redisKey, JSON.stringify(newAuction));

        cache.cacheStoreAuction(newAuction.id, newAuction, process.env.CACHE_EXPIRATION_TIME);

        return newAuction;
    } catch (error) {
        throw new Error(`Failed to create auction: ${error.message}`);
    }
};

export const getAllAuctions = async () => {
    try {
        const keys = await redisClient.keys('auction:*');
        const auctionDetailsPromises = keys.map(async (key) => {
            const auctionDetails = await redisClient.get(key);
            return JSON.parse(auctionDetails);
        });

        const auctionDetailsList = await Promise.all(auctionDetailsPromises);
        return auctionDetailsList;
    } catch (error) {
        throw new Error(`Failed to get all auctions: ${error.message}`);
    }
};

export const getAuctionDetailsById = async (auctionId) => {
    try {
        const auctionDetails = await redisClient.get(`auction:${auctionId}`);

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
