import { createSuccessBidResponse, createSuccessEndAuctionResponse } from '../../src/utils/createResponse.js';

describe('createResponse utils', () => {
    describe('createSuccessBidResponse', () => {
        it('should return a success response object for a given bid amount', () => {
            const bidAmount = 1000;
            const response = createSuccessBidResponse(bidAmount);

            expect(response.success).toBe(true);
            expect(response.message).toBe(`Bid for auction placed successfully for the amount of ${bidAmount}`);
            expect(response.highestBid).toBe(bidAmount);
        });
    });

    describe('createSuccessEndAuctionResponse', () => {
        it('should return a success response object for ending an auction', () => {
            const response = createSuccessEndAuctionResponse();

            expect(response.success).toBe(true);
            expect(response.message).toBe('Auction successfully ended');
        });
    });
});
