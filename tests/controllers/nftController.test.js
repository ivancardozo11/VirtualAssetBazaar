import { purchaseToken } from '../../src/services/nftService.js';
import { purchaseTokenController } from '../../src/controllers/nftController.js';

jest.mock('../../src/services/nftService.js');
jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));

describe('purchaseTokenController', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: { nftId: '12345' },
            body: { buyerWalletAddress: '0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f' }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 status for successful token purchase', async () => {
        purchaseToken.mockResolvedValue({ success: true });

        await purchaseTokenController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token purchased successfully' });
    });

    it('should return 400 status for unsuccessful token purchase', async () => {
        const mockError = 'Some purchase error';
        purchaseToken.mockResolvedValue({ success: false, error: mockError });

        await purchaseTokenController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: mockError });
    });

    it('should return 500 status for any thrown error', async () => {
        const mockError = new Error('Internal server error');
        purchaseToken.mockRejectedValue(mockError);

        await purchaseTokenController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
});
