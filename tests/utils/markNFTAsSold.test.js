import * as details from '../../src/utils/getDetails.js';
import redisClient from '../../src/database/redis/redisConfig.js';
import markNFTAsSold from '../../src/utils/markNFTAsSold.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        del: jest.fn().mockResolvedValue(true)
    }
}));

jest.mock('../../src/utils/getDetails.js');

describe('markNFTAsSold', () => {
    const mockNFT = { name: 'TestNFT', sold: false };
    const NFT_CONTRACT_ID = '12345';

    beforeEach(() => {
        details.getNFTDetails.mockResolvedValue(mockNFT);
    });

    it('should mark NFT as sold', async () => {
        await markNFTAsSold(NFT_CONTRACT_ID);
        const newKey = `listing:sold:${NFT_CONTRACT_ID}`;
        expect(redisClient.set).toHaveBeenCalledWith(newKey, JSON.stringify({ ...mockNFT, sold: true }));
    });
    it('should delete the original NFT listing', async () => {
        await markNFTAsSold(NFT_CONTRACT_ID);
        const originalKey = `listing:${NFT_CONTRACT_ID}`;
        expect(redisClient.del).toHaveBeenCalledWith(originalKey);
    });

    it('should throw an error if NFT not found', async () => {
        details.getNFTDetails.mockResolvedValue(null);
        await expect(markNFTAsSold(NFT_CONTRACT_ID)).rejects.toThrow(`NFT with ID ${NFT_CONTRACT_ID} not found`);
    });
});
