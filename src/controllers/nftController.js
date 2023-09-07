import {
    purchaseToken
} from '../services/nftService.js';

export const purchaseTokenController = async (req, res) => {
    try {
        const nftId = req.params.nftId;
        const buyerWalletAddress = req.body.buyerWalletAddress;

        const purchaseResult = await purchaseToken(nftId, buyerWalletAddress);
        if (purchaseResult.success) {
            res.status(200).json({ message: 'Token purchased successfully' });
        } else {
            res.status(400).json({ error: purchaseResult.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
