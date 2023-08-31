// Ensure the value is a positive value and greater than zero.
export const validatePositiveValue = (value) => {
    if (!value || value <= 0) {
        throw new Error('Price must be a positive value');
    }
};

// Ensure the auction price is greater than or equal to the starting price.
export const validateAuctionPriceGreaterThanOrEqual = (auctionPrice, startingPrice) => {
    if (auctionPrice < startingPrice) {
        throw new Error('Price must be equal to or greater than the starting price');
    }
};

// Ensure the starting price of the auction is not null or negative.
export const validateStartingPriceNotNullAndPositive = (startingPrice) => {
    if (!startingPrice || startingPrice <= 0) {
        throw new Error('Starting price must be provided and greater than zero for auctions');
    }
};

// Validate that the value is an integer.
export const validateIsInteger = (value) => {
    if (!Number.isInteger(Number(value))) {
        throw new Error('Value must be an integer');
    }
};
