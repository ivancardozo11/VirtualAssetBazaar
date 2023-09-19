/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import web3 from '../utils/web3Config.js';
import web3Buyer from '../utils/web3ConfigBuyer.js';
import redisClient from '../database/redis/redisConfig.js';
import * as bid from './bid.js';
import * as details from './getDetails.js';
import * as signature from '../utils/signatureValidation.js';
import * as validateAddresses from './addressValidation.js';
import * as validateFields from '../utils/validateListingData.js';
import * as numericValidation from '../utils/numericValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as auctionErrorHandling from './auctionErrorHandling.js';
import mintTokensIfNeeded from './mint.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';
import SettlerABI from '../utils/SettlerABI.js';

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const settlerContractAddress = process.env.SETTLER_CONTRACT_ADDRESS;
const settlerContractInstance = new web3.eth.Contract(SettlerABI, settlerContractAddress);

const BuyerAccount = web3Buyer.eth.accounts.privateKeyToAccount(`0x${process.env.BUYER_PRIVATE_KEY}`);
// web3Buyer.eth.accounts.wallet.add(BuyerAccount);
const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
// web3.eth.accounts.wallet.add(account);// Function to validate if the priceType is appropriate for the given isAuction value
export const validatePriceTypeForAuction = (isAuction, priceType) => {
    // If the listing is not an auction, the priceType must be 'fixed'
    if (isAuction === false && priceType !== 'fixed') {
        throw new Error('Invalid priceType for non-auction listing');
    }

    // If the listing is an auction, the priceType must be 'auction'
    if (isAuction === true && priceType !== 'auction') {
        throw new Error('Invalid priceType for auction listing');
    }
};

// Ensure that auction-specific fields are not present for fixed price listings
export const validateAuctionFieldsForFixedPrice = (isAuction, auctionEndTime, startingPrice) => {
    if (isAuction === false && (auctionEndTime || startingPrice)) {
        throw new Error('Auction fields should not be present for fixed price listings');
    }
};
// validate that Auction objects contains ids with a size not smaller than 13 numbers
export const validateAuctionIdLength = (auctionId) => {
    if (auctionId.length < 13) {
        throw new Error('Auction ID must have at least 13 characters');
    }
};

export const validateAuctionData = (auctionData) => {
    const { sellerWalletAddress, buyerWalletAddress, nftContractAddress, mockERC20Address, bidAmount, bids, buyerFunds, isAuction, priceType } = auctionData;

    validateAddresses.validateAddresses([sellerWalletAddress, buyerWalletAddress, nftContractAddress, mockERC20Address]);
    validateFields.validateAuctionFields(auctionData);
    numericValidation.validatePositiveValue(bidAmount);
    numericValidation.validatePositiveValue(buyerFunds);
    dateValidation.validateAuctionEndDateBeforeListingExpiration(auctionData.nftContractId);
    validatePriceTypeForAuction(isAuction, priceType);
};

export const checkExistingAuction = async (nftContractId) => {
    const existingAuction = await getAuctionDetailsById(nftContractId);
    if (existingAuction) {
        throw new Error(`You can only create one auction per listing. There is already an auction for this one. Listing ID ${nftContractId}`);
    }
};

export const validateAuctionDetails = (auctionDetails, bidderAddress, bidAmount, nftContractId, buyerSignature, buyerFunds) => {
    if (!auctionDetails) {
        throw new Error('Auction details cannot be empty.');
    }

    if (!bidderAddress || typeof bidderAddress !== 'string' || bidderAddress.trim() === '') {
        throw new Error('Bidder address is invalid or empty.');
    }

    if (!bidAmount || typeof bidAmount !== 'number' || bidAmount <= 0) {
        throw new Error('Bid amount is invalid or empty.');
    }

    if (!nftContractId || typeof nftContractId !== 'string' || nftContractId.trim() === '') {
        throw new Error('NFT contract ID is invalid or empty.');
    }

    if (!buyerSignature || typeof buyerSignature !== 'string') {
        throw new Error('Buyer signature is invalid or empty.');
    }

    if (!buyerFunds || typeof buyerFunds !== 'number' || buyerFunds <= 0) {
        throw new Error('Buyer funds are invalid or empty.');
    }

    if (auctionDetails.sellerWalletAddress === bidderAddress) {
        throw new Error('The auction creator cannot bid on their own NFT.');
    }

    // You can continue with other existing validations for auctionDetails if there are any.
};

export const getAuctionDetailsById = async (nftContractId) => {
    const auctionData = await redisClient.get(`auction:${nftContractId}`);
    return JSON.parse(auctionData);
};

export const checkAuctionBids = async (nftContractId, bidAmount, buyerWalletAddress) => {
    const existingAuction = await getAuctionDetailsById(nftContractId);

    if (!existingAuction) {
        throw new auctionErrorHandling.AuctionError(`No auction found with ID: ${nftContractId}`);
    }

    if (existingAuction.bids.length > 0) {
        const sameValueBidsFromOtherBidders = existingAuction.bids.filter(bid => bid.bidAmount === bidAmount && bid.bidderAddress !== buyerWalletAddress);

        if (sameValueBidsFromOtherBidders.length > 0) {
            throw new auctionErrorHandling.BidValueError(`A bid of ${bidAmount} ETH was already made by another bidder.`);
        }

        const previousBidsFromBuyer = existingAuction.bids.filter(bid => bid.bidderAddress === buyerWalletAddress);

        if (previousBidsFromBuyer.length > 0) {
            const highestPreviousBid = Math.max(...previousBidsFromBuyer.map(bid => bid.bidAmount));

            if (bidAmount <= highestPreviousBid) {
                throw new auctionErrorHandling.BidValueError(`Your new bid of ${bidAmount} ETH must be higher than your previous bid of ${highestPreviousBid} ETH.`);
            }
        }

        const lastBid = existingAuction.bids[existingAuction.bids.length - 1];

        if (lastBid.bidderAddress === buyerWalletAddress) {
            throw new auctionErrorHandling.ConsecutiveBidError('You cannot bid consecutively. Wait for someone else to bid or for the auction to end.');
        }
    }
};

export const updateAuctionWithBid = (auctionDetails, bidData) => {
    const { bidAmount, buyerSignature, bidderAddress, buyerFunds, termsAccepted } = bidData;

    const newBid = {
        bidderAddress,
        bidAmount,
        buyerSignature,
        buyerFunds,
        termsAccepted
    };

    if (!auctionDetails.bids) {
        auctionDetails.bids = [];
    }

    return {
        ...auctionDetails,
        highestBid: bidAmount,
        bids: [...auctionDetails.bids, newBid]
    };
};

export const retrieveHighestBidFromAuction = (auctionDetails) => {
    if (areNoBidsPresent(auctionDetails)) {
        return null;
    }
    const highestBid = sortBidsAndGetHighest(auctionDetails.bids);
    return highestBid;
};

export const areNoBidsPresent = (auctionDetails) => {
    return !auctionDetails.bids || auctionDetails.bids.length === 0;
};

export const sortBidsAndGetHighest = (bids) => {
    return bids.sort((a, b) => b.bidAmount - a.bidAmount)[0];
};

export const finalizeAuctionOnBlockchain = async (highestBid, auctionDetails) => {
    try {
        const { collectionAddress, erc20Address, tokenId } = details.getEssentialDetails(highestBid, auctionDetails);
        const bidAmountInWei = web3.utils.toWei(highestBid.bidAmount.toString(), 'ether');
        const nonce = await web3Buyer.eth.getTransactionCount(highestBid.bidderAddress, 'pending');

        const erc20Contract = new web3.eth.Contract(mockErc20ABI, erc20Address);

        await mintTokensIfNeeded(erc20Contract, bidAmountInWei, highestBid, nonce);
        await bid.approveBidAmount(erc20Contract, highestBid, bidAmountInWei, settlerContractInstance.options.address, nonce);

        const buyerSignature = await signature.generateBuyerSignature(highestBid.bidderAddress);
        const sellerSignature = await signature.generateNewSellerSignature(SELLER_ADDRESS);

        const methodCall = settlerContractInstance.methods.finishAuction(
            { collectionAddress, erc20Address, tokenId, bid: bidAmountInWei },
            buyerSignature.signature,
            sellerSignature.signature
        );

        const receipt = await signature.sendSignedTransaction(settlerContractInstance, methodCall, highestBid.bidderAddress, nonce);

        // console.log(`Auction finalized with transaction hash: ${receipt.transactionHash}`);
    } catch (error) {
        console.error(`Auction finalization failed: ${error}`);
        throw error;
    }
};
