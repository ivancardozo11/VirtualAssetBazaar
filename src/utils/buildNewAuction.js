const buildNewAuction = (auctionData) => {
    const initialBid = {
        bidderAddress: auctionData.buyerWalletAddress,
        bidAmount: auctionData.bidAmount,
        buyerSignature: auctionData.buyerSignature,
        buyerFunds: auctionData.buyerFunds,
        termsAccepted: auctionData.termsAccepted
    };

    return {
        nftContractAddress: auctionData.nftContractAddress,
        mockERC20Address: auctionData.mockERC20Address,
        nftContractId: auctionData.nftContractId,
        bids: [initialBid],
        priceType: auctionData.priceType,
        isAuction: auctionData.isAuction,
        sellerWalletAddress: auctionData.sellerWalletAddress,
        sellerSignature: auctionData.sellerSignature
    };
};
export default buildNewAuction;
