import {
    createAuctionController,
    getAllAuctionsController,
    placeBidController,
    endAuctionController
} from '../../src/controllers/auctionController';

import {
    createAuction,
    getAllAuctions,
    placeBid,
    endAuction
} from '../../src/services/auctionService';

jest.mock('../../src/services/auctionService');
jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('Auction Controllers', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        mockReq = {
            body: {},
            params: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error.mockRestore();
    });

    it('should create an auction successfully', async () => {
        const mockAuctionData = { id: '123', name: 'Sample Auction' };
        createAuction.mockResolvedValue(mockAuctionData);

        await createAuctionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockAuctionData);
    });

    it('should get all auctions successfully', async () => {
        const mockAuctions = [{ id: '123' }, { id: '456' }];
        getAllAuctions.mockResolvedValue(mockAuctions);

        await getAllAuctionsController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockAuctions);
    });

    it('should place bid successfully', async () => {
        const mockResponse = { success: true };
        placeBid.mockResolvedValue(mockResponse);

        await placeBidController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bid placed successfully' });
    });

    it('should handle failed bid placement', async () => {
        const mockResponse = { success: false, statusCode: 400, error: 'Invalid bid amount' };
        placeBid.mockResolvedValue(mockResponse);

        await placeBidController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid bid amount' });
    });

    it('should end auction successfully', async () => {
        const mockResponse = { success: true };
        endAuction.mockResolvedValue(mockResponse);

        await endAuctionController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Auction successfully ended' });
    });

    it('should handle failed auction ending', async () => {
        const mockResponse = { success: false, statusCode: 400, error: 'Auction not found' };
        endAuction.mockResolvedValue(mockResponse);

        await endAuctionController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Auction not found' });
    });
});
