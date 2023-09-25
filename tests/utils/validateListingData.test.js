import * as validateListingData from '../../src/utils/validateListingData.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        del: jest.fn().mockResolvedValue(true)
    }
}));

describe('Validation utility functions', () => {
    const listingData = {
        nftContractAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff',
        owner: '0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f',
        nftContractId: 1,
        title: 'Art piece',
        description: 'Beautiful artwork',
        price: 500,
        isAuction: true,
        bidAmount: 600,
        auctionEndTime: new Date(Date.now() + 86400000).toISOString(),
        priceType: 'auction',
        sellerSignature: 'signature',
        totalTokensForSale: 10,
        termsAccepted: true,
        sold: false
    };

    it('should validate listing data correctly with Joi', () => {
        const validationResult = validateListingData.validateListingData(listingData);
        expect(validationResult.error).toBeUndefined();
    });

    it('should validate token count correctly', () => {
        expect(() => validateListingData.validateTokenCount(1010)).toThrow('Total tokens for sale cannot exceed 1000');
        expect(() => validateListingData.validateTokenCount(100)).not.toThrow();
    });

    it('should validate NFT contract ID correctly', () => {
        expect(() => validateListingData.validateNFTContractId(100001)).toThrow('Token ids cant have more than 100000 in number size');
        expect(() => validateListingData.validateNFTContractId(1000)).not.toThrow();
    });

    it('should validate sold status correctly', () => {
        expect(() => validateListingData.validateSoldStatus(true)).toThrow('sold field cant be sold before its listed');
        expect(() => validateListingData.validateSoldStatus(false)).not.toThrow();
    });
    const auctionDataSample = {
        nftContractAddress: '0xNFTAddress',
        mockERC20Address: '0xMockERC20Address',
        nftContractId: '1',
        buyerFunds: 500,
        bidAmount: 100,
        priceType: 'auction',
        bids: [],
        isAuction: true,
        sellerWalletAddress: '0xSellerAddress',
        buyerWalletAddress: '0xBuyerAddress',
        buyerSignature: 'signatureBuyer',
        sellerSignature: 'signatureSeller',
        termsAccepted: true
    };

    it('should validate auction data correctly with Joi', () => {
        const validationResult = validateListingData.validateAuctionFields(auctionDataSample);
        expect(validationResult.error).toBeUndefined();
    });
    it('should validate input data correctly', () => {
        expect(() => validateListingData.validateInputData(listingData)).not.toThrow();
    });
});
