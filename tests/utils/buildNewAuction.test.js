import buildNewAuction from '../../src/utils/buildNewAuction.js';

describe('buildNewAuction utility function', () => {
    // Datos de prueba
    const auctionData = {
        buyerWalletAddress: '0x12345',
        bidAmount: 100,
        buyerSignature: 'signatureA',
        buyerFunds: 150,
        termsAccepted: true,
        nftContractAddress: '0xNFTAddress',
        mockERC20Address: '0xERC20Address',
        nftContractId: '1',
        priceType: 'fixed',
        isAuction: true,
        sellerWalletAddress: '0x54321',
        sellerSignature: 'signatureB'
    };

    it('should build a new auction with the correct initial data', () => {
        const newAuction = buildNewAuction(auctionData);

        // Verifica los datos del contrato y del vendedor
        expect(newAuction.nftContractAddress).toBe(auctionData.nftContractAddress);
        expect(newAuction.mockERC20Address).toBe(auctionData.mockERC20Address);
        expect(newAuction.nftContractId).toBe(auctionData.nftContractId);
        expect(newAuction.priceType).toBe(auctionData.priceType);
        expect(newAuction.isAuction).toBe(auctionData.isAuction);
        expect(newAuction.sellerWalletAddress).toBe(auctionData.sellerWalletAddress);
        expect(newAuction.sellerSignature).toBe(auctionData.sellerSignature);
    });

    it('should create an initial bid correctly', () => {
        const newAuction = buildNewAuction(auctionData);
        const initialBid = newAuction.bids[0];

        // Verifica la oferta inicial
        expect(initialBid.bidderAddress).toBe(auctionData.buyerWalletAddress);
        expect(initialBid.bidAmount).toBe(auctionData.bidAmount);
        expect(initialBid.buyerSignature).toBe(auctionData.buyerSignature);
        expect(initialBid.buyerFunds).toBe(auctionData.buyerFunds);
        expect(initialBid.termsAccepted).toBe(auctionData.termsAccepted);
    });
});
