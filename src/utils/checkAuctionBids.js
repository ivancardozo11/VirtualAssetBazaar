import { getAuctionDetailsById } from '../services/auctionService.js'; // Asegúrate de importar correctamente la función

export const checkAuctionBids = async (nftContractId, startingPrice, erc20CurrencyAddress) => {
    const existingAuction = await getAuctionDetailsById(nftContractId);
    if (existingAuction) {
        // Check for duplicate bids with the same value
        if (existingAuction.bids.some(bid => bid.bidAmount === startingPrice)) {
            throw new Error('Duplicate bid with the same value');
        }
        // Check if the seller has already placed a bid
        if (existingAuction.erc20CurrencyAddress === erc20CurrencyAddress) {
            throw new Error('Seller has already placed a bid');
        }
    }
};
