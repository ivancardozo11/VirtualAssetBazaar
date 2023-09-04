import { validateNFTFields } from '../utils/validateListingData.js';
import { validateEthereumWalletAddress, validateNFTContractAddress } from '../utils/adressValidation.js';
import { removeNFTFromList } from '../utils/removeNfts.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as auctionValidation from '../utils/auctionValidation.js';
import * as cache from '../database/cache/cacheUtils.js';
import redisClient from '../database/redis/redisConfig.js';

const nfts = [];

export const createNFT = (nftData) => {
    try {
        const { error } = validateNFTFields(nftData);

        if (error) {
            throw new Error(`Invalid NFT data: ${error.message}`);
        }
        validateEthereumWalletAddress(nftData.sellerWalletAddress);
        validateEthereumWalletAddress(nftData.buyerWalletAddress);
        validateNFTContractAddress(nftData.nftContractAddress);
        numericValidation.validateIsInteger(nftData.id);
        auctionValidation.validateAuctionFieldsForFixedPrice(nftData.isAuction, nftData.auctionEndTime, nftData.startingPrice);

        const newNFT = {
            id: Date.now(),
            nftContractAddress: nftData.nftContractAddress,
            erc20CurrencyMessage: nftData.erc20CurrencyMessage,
            nftContractId: nftData.nftContractId,
            title: nftData.title,
            description: nftData.description,
            price: nftData.price,
            isAuction: nftData.isAuction,
            startingPrice: nftData.startingPrice,
            auctionEndTime: nftData.auctionEndTime,
            priceType: nftData.priceType,
            erc20CurrencyAmount: nftData.erc20CurrencyAmount
        };

        if (newNFT.priceType === 'auction') {
            numericValidation.validateStartingPriceNotNullAndPositive(newNFT.startingPrice);
        } else if (newNFT.priceType === 'fixed') {
            numericValidation.validatePositiveValue(newNFT.price);
        } else {
            throw new Error('Invalid price type');
        }

        nfts.push(newNFT);

        redisClient.set(`nft:${newNFT.id}`, JSON.stringify(newNFT));

        cache.cacheStoreNFT(newNFT.id, newNFT, process.env.CACHE_EXPIRATION_TIME);

        return newNFT;
    } catch (error) {
        throw new Error(`Failed to create NFT: ${error.message}`);
    }
};

export const getNFTById = async (nftId) => {
    try {
        numericValidation.validateIsInteger(nftId);

        const nftDetails = await redisClient.get(`nft:${nftId}`);
        if (!nftDetails) {
            throw new Error(`NFT with ID ${nftId} not found`);
        }

        return JSON.parse(nftDetails);
    } catch (error) {
        throw new Error(`Failed to get NFT details: ${error.message}`);
    }
};

export const getAllNFTs = async () => {
    try {
        const allNFTs = [];

        const redisKeys = await redisClient.keys('nft:*');
        for (const redisKey of redisKeys) {
            const nftDetails = await redisClient.get(redisKey);
            if (nftDetails) {
                allNFTs.push(JSON.parse(nftDetails));
            }
        }

        return allNFTs;
    } catch (error) {
        throw new Error(`Failed to get all NFTs: ${error.message}`);
    }
};

export const updateNFT = async (nftId, updatedData) => {
    try {
        numericValidation.validateIsInteger(nftId);

        const nftIndex = nfts.findIndex(nft => nft.id === nftId);
        if (nftIndex === -1) {
            throw new Error(`NFT with ID ${nftId} not found`);
        }

        const existingNFT = nfts[nftIndex];
        if (updatedData.title) {
            existingNFT.title = updatedData.title;
        }
        if (updatedData.description) {
            existingNFT.description = updatedData.description;
        }

        nfts[nftIndex] = existingNFT;

        await redisClient.set(`nft:${nftId}`, JSON.stringify(existingNFT));

        return existingNFT;
    } catch (error) {
        throw new Error(`Failed to update NFT: ${error.message}`);
    }
};

export const purchaseToken = async (nftId, buyerWalletAddress) => {
    try {
        const nft = await getNFTById(nftId);

        if (!nft) {
            throw new Error(`NFT with ID ${nftId} not found`);
        }

        if (nft.priceType !== 'fixed') {
            throw new Error('This token is not available for direct purchase');
        }

        if (nft.isAuction) {
            throw new Error('This token is currently in auction');
        }

        const buyerBalance = 1000;
        const tokenPrice = nft.price;

        if (buyerBalance < tokenPrice) {
            throw new Error('Insufficient funds to purchase the token');
        }

        const sellerWalletAddress = nft.sellerWalletAddress;
        console.log(`Funds transferred from ${buyerWalletAddress} to ${sellerWalletAddress}`);

        console.log(`Token with ID ${nftId} has been purchased by ${buyerWalletAddress}`);

        return {
            success: true,
            message: 'Token purchased successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to purchase token: ${error.message}`
        };
    }
};

export const deleteNFT = async (nftId) => {
    try {
        const nftKey = `nft:${nftId}`;
        const nftDetails = await redisClient.get(nftKey);

        if (!nftDetails) {
            throw new Error(`NFT with ID ${nftId} not found`);
        }

        await redisClient.del(nftKey);

        removeNFTFromList(nfts, nftId);

        return {
            success: true,
            message: 'NFT deleted successfully'
        };
    } catch (error) {
        throw new Error(`Failed to delete NFT: ${error.message}`);
    }
};
