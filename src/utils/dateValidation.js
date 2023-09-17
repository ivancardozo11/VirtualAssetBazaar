// Ensure the date is in the future.
import getListingExpirationDateFromDatabase from './getListingExpirationDateFromDatabase.js';
export const validateFutureDate = (date) => {
    const currentDate = new Date();
    if (date <= currentDate) {
        throw new Error('Auction end time must be in the future');
    }
};

// Ensure the date is not null or undefined.
export const validateDateNotNull = (date) => {
    if (!date) {
        throw new Error('Auction end time must be provided');
    }
};

export const validateAuctionEndDateBeforeListingExpiration = async (nftContractId) => {
    const listingExpirationDate = await getListingExpirationDateFromDatabase(nftContractId);
    const currentDate = new Date();

    const auctionEndDate = new Date(listingExpirationDate.getTime() - (24 * 60 * 60 * 1000));

    if (auctionEndDate <= currentDate) {
        throw new Error('Auction end time must be in the future');
    }

    if (auctionEndDate > listingExpirationDate) {
        throw new Error('Auction end time cannot be after the listing expiration date');
    }

    return auctionEndDate;
};
