import Joi from 'joi';
import * as numericValidation from '../utils/numericValidation.js';
import * as validateWallet from '../utils/addressValidation.js';
import * as dateValidation from '../utils/dateValidation.js';
import * as auctionValidation from '../utils/auctionValidation.js';
import * as errorHandling from '../utils/auctionErrorHandling.js';

export const validateListingData = (listingData) => {
    const schema = Joi.object({
        nftContractAddress: Joi.string().required(),
        owner: Joi.string().required(),
        nftContractId: Joi.number().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required(),
        bidAmount: Joi.number().optional(),
        auctionEndTime: Joi.date().iso().optional(),
        priceType: Joi.string().valid('fixed', 'auction').optional(),
        sellerSignature: Joi.string().required(),
        isERC721: Joi.boolean().required(),
        totalTokensForSale: Joi.number().required(),
        termsAccepted: Joi.boolean().required(),
        sold: Joi.boolean().required()
    });

    const validationResult = schema.validate(listingData);
    return errorHandling.handleJoiValidation(validationResult);
};

export const validateAuctionFields = (auctionData) => {
    const schema = Joi.object({
        nftContractAddress: Joi.string().required(),
        mockERC20Address: Joi.string().required(),
        nftContractId: Joi.string().required(),
        buyerFunds: Joi.number().required(),
        bidAmount: Joi.number().required(),
        priceType: Joi.string().valid('auction').required(),
        bids: Joi.array().required(),
        isAuction: Joi.boolean().valid(true).required(),
        sellerWalletAddress: Joi.string().required(),
        buyerWalletAddress: Joi.string().required(),
        buyerSignature: Joi.string().required(),
        sellerSignature: Joi.string().required(),
        termsAccepted: Joi.boolean().valid(true).required()
    });

    const validationResult = schema.validate(auctionData);
    return errorHandling.handleJoiValidation(validationResult);
};

export const validateInputData = (listingData) => {
    const { error } = validateListingData(listingData);
    if (error) throw new Error(`Invalid listing data: ${error.message}`);

    validateTokenCount(listingData.totalTokensForSale);
    validateNFTContractId(listingData.nftContractId);
    validateSoldStatus(listingData.sold);

    numericValidation.validateStartingPriceGreaterThanPrice(listingData.bidAmount, listingData.price);
    validateWallet.validateEthereumWalletAddress(listingData.nftContractAddress);
    validateWallet.validateEthereumWalletAddress(listingData.owner);
    numericValidation.validatePositiveValue(listingData.price);
    dateValidation.validateFutureDate(listingData.auctionEndTime);
    auctionValidation.validatePriceTypeForAuction(listingData.isAuction, listingData.priceType);
};

export const validateTokenCount = (totalTokensForSale) => {
    if (totalTokensForSale > 1000) throw new Error('Total tokens for sale cannot exceed 1000');
};

export const validateNFTContractId = (nftContractId) => {
    if (nftContractId > 100000) throw new Error('Token ids cant have more than 100000 in number size');
};

export const validateSoldStatus = (sold) => {
    if (sold !== false) throw new Error('sold field cant be sold before its listed');
};
