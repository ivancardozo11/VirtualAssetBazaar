import Joi from 'joi';

// Validate listing fields data types
export const validateListingData = (listingData) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required(),
        startingPrice: Joi.number().optional(),
        auctionEndTime: Joi.date().iso().optional(),
        priceType: Joi.string().valid('fixed', 'auction').optional()
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
        BidAmount: Joi.number().required()
    });

    return schema.validate(auctionData);
};
