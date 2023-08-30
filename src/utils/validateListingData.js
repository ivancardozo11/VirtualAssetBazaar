import Joi from 'joi';
export const validateListingData = (listingData) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required()
    });

    return schema.validate(listingData);
};
