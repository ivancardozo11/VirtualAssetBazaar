import {
    createNFT,
    getNFTById,
    updateNFT,
    deleteNFT,
    getAllNFTs,
    purchaseToken
} from '../services/nftService.js';

export const createNFTController = async (req, res) => {
    try {
        const nftData = req.body;
        const newNFT = await createNFT(nftData);
        res.status(201).json(newNFT);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getNFTByIdController = async (req, res) => {
    try {
        const nftId = req.params.nftId;
        const nft = await getNFTById(nftId);
        if (nft) {
            res.status(200).json(nft);
        } else {
            res.status(404).json({ message: 'NFT not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllNFTsController = async (req, res) => {
    try {
        const nfts = await getAllNFTs();
        res.status(200).json(nfts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNFTController = async (req, res) => {
    try {
        const nftId = req.params.nftId;
        const updatedData = req.body;
        const updatedNFT = await updateNFT(nftId, updatedData);
        if (updatedNFT) {
            res.status(200).json(updatedNFT);
        } else {
            res.status(404).json({ message: 'NFT not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
export const deleteNFTController = async (req, res) => {
    try {
        const nftId = req.params.nftId;
        const deletedNFT = await deleteNFT(nftId);
        if (deletedNFT) {
            res.status(200).json(deletedNFT);
        } else {
            res.status(404).json({ message: 'NFT not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
