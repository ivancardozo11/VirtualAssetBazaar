// Ensure the date is in the future.
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
