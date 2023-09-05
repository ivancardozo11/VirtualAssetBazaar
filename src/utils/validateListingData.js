import Joi from 'joi';

// Validate listing fields data types
export const validateListingData = (listingData) => {
    const schema = Joi.object({
        nftContractAddress: Joi.string().required(),
        erc20CurrencyAddress: Joi.string().required(),
        nftContractId: Joi.number().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required(),
        startingPrice: Joi.number().optional(),
        auctionEndTime: Joi.date().iso().optional(),
        priceType: Joi.string().valid('fixed', 'auction').optional(),
        sellerSignature: Joi.string().required(),
        termsAccepted: Joi.boolean().required()
    });

    return schema.validate(listingData);
};
// Validate auction fields  data types
export const validateAuctionFields = (auctionData) => {
    const schema = Joi.object({
        startingPrice: Joi.number().required(),
        auctionEndTime: Joi.date().iso().required(),
        priceType: Joi.string().valid('auction').required(),
        isAuction: Joi.boolean().valid(true).required(),
        BidAmount: Joi.number().required(),
        nftContractAddress: Joi.string().required(),
        erc20CurrencyAddress: Joi.string().required(),
        nftContractId: Joi.string().required(),
        Erc20CurrencyAmount: Joi.number().required(),
        sellerWalletAddress: Joi.string().required(),
        buyerWalletAddress: Joi.string().required(),
        buyerSignature: Joi.string().required(),
        sellerSignature: Joi.string().required()
    });

    return schema.validate(auctionData);
};

// Validate NFT fields data types
export const validateNFTFields = (nftData) => {
    const schema = Joi.object({
        nftContractAddress: Joi.string().required(),
        erc20CurrencyMessage: Joi.string().required(),
        nftContractId: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required(),
        startingPrice: Joi.number().optional(),
        auctionEndTime: Joi.date().iso().optional(),
        priceType: Joi.string().valid('fixed', 'auction').optional(),
        erc20CurrencyAmount: Joi.number().required(),
        sellerWalletAddress: Joi.string().required(),
        buyerWalletAddress: Joi.string().required()
    });

    return schema.validate(nftData);
};
