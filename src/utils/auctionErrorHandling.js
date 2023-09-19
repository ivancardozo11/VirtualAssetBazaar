export class AuctionError extends Error {
    constructor (message) {
        super(message);
        this.name = 'AuctionError';
    }
}

export class BidValueError extends AuctionError {
    constructor (message) {
        super(message);
        this.name = 'BidValueError';
    }
}

export class ConsecutiveBidError extends AuctionError {
    constructor (message) {
        super(message);
        this.name = 'ConsecutiveBidError';
    }
}

// Custom error class
export class ValidationError extends Error {
    constructor (message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Centralized error handling function
export const handleJoiValidation = (result) => {
    if (result.error) {
        const errorMessages = result.error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(`Validation failed: ${errorMessages}`);
    }
    return true;
};

export const handleErrors = (error, defaultMessage) => {
    if (error instanceof ValidationError) console.error(error.message);
    throw new Error(`${defaultMessage}: ${error.message}`);
};
