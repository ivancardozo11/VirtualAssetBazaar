// Function to validate if the priceType is appropriate for the given isAuction value
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
