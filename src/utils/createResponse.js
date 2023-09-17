export const createSuccessBidResponse = (bidAmount) => {
    return {
        success: true,
        message: `Bid for auction placed successfully for the amount of ${bidAmount}`,
        highestBid: bidAmount
    };
};
export const createSuccessEndAuctionResponse = () => {
    return {
        success: true,
        message: 'Auction successfully ended'
    };
};
