import Joi from 'joi';

const listings = [];

export const createListing = (listingData) => {
    try {
        const { error } = validateListingData(listingData);

        if (error) {
            throw new Error(`Invalid listing data: ${error.message}`);
        }

        const newListing = {
            id: Date.now(),
            title: listingData.title,
            description: listingData.description,
            price: listingData.price,
            isAuction: listingData.isAuction
        };

        listings.push(newListing);

        return newListing;
    } catch (error) {
        throw new Error(`Failed to create listing: ${error.message}`);
    }
};

export const getListing = (listingId) => {
    try {
        const foundListing = listings.find((listing) => listing.id === listingId);

        if (!foundListing) {
            throw new Error(`Listing not found for ID: ${listingId}`);
        }

        return foundListing;
    } catch (error) {
        throw new Error(`Failed to retrieve listing: ${error.message}`);
    }
};

export const validateListingData = (listingData) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        isAuction: Joi.boolean().required()
    });

    return schema.validate(listingData);
};
