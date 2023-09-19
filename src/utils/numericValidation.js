// Ensure the value is a positive value and greater than zero.
export const validatePositiveValue = (value) => {
    if (!value || value <= 0) {
        throw new Error('Price must be a positive value');
    }
};

export const validateStartingPriceGreaterThanPrice = (startingPrice, price) => {
    if (startingPrice < price) {
        throw new Error('Starting price must be equal to or greater than the price');
    }
};
