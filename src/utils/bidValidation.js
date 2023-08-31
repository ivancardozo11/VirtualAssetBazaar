// Validate bid based on auction details, auction ID, and bid amount
export const validateBid = (auctionDetails, auctionId, bidAmount) => {
    // Check if the auction has already ended
    if (auctionDetails.auctionEndTime <= new Date()) {
        throw new Error(`Auction with ID ${auctionId} has already ended`);
    }

    // Ensure bid amount is higher than the current highest bid
    if (bidAmount <= auctionDetails.highestBid) {
        throw new Error('Bid must be higher than the current highest bid');
    }

    // Define the maximum allowed bid amount
    const maxBid = 100000; // Maximum bid amount

    // Check if bid amount exceeds the maximum allowed bid
    if (bidAmount > maxBid) {
        throw new Error(`Bid amount exceeds the maximum allowed bid of ${maxBid}`);
    }
};
