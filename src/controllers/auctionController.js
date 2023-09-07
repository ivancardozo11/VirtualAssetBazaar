import {
    createAuction,
    getAllAuctions,
    getAuctionDetailsById,
    placeBid,
    endAuction
} from '../services/auctionService.js';

export const createAuctionController = async (req, res) => {
    try {
        const auctionData = req.body;
        const newAuction = await createAuction(auctionData);
        res.status(201).json(newAuction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const getAllAuctionsController = async (req, res) => {
    try {
        const auctions = await getAllAuctions();
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getAuctionDetailsController = async (req, res) => {
    try {
        const auctionId = req.params.auctionId;
        const auctionDetails = await getAuctionDetailsById(auctionId);
        res.status(200).json(auctionDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const placeBidController = async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;

        const response = await placeBid(auctionId, bidAmount);

        if (response.success) {
            return res.json({ message: 'Bid placed successfully' });
        } else {
            return res.status(response.statusCode).json({ error: response.error });
        }
    } catch (error) {
        return res.status(500).json({ error: `Failed to place bid: ${error.message}` });
    }
};

export const endAuctionController = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const response = await endAuction(auctionId);

        if (response.success) {
            return res.json({ message: 'Auction successfully ended' });
        } else {
            return res.status(response.statusCode).json({ error: response.error });
        }
    } catch (error) {
        return res.status(500).json({ error: `Failed to end auction: ${error.message}` });
    }
};
