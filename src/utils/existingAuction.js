import redisClient from '../database/redis/redisConfig.js';

export const getExistingAuctionsForNFT = async (nftContractId) => {
    try {
        const keys = await redisClient.keys('auction:*');
        const auctionDetailsPromises = keys.map(async (key) => {
            const auctionDetails = await redisClient.get(key);
            return JSON.parse(auctionDetails);
        });

        const auctionDetailsList = await Promise.all(auctionDetailsPromises);
        const existingAuctions = auctionDetailsList.filter(auction => auction.nftContractId === nftContractId);

        return existingAuctions;
    } catch (error) {
        throw new Error(`Failed to get existing auctions for NFT: ${error.message}`);
    }
};
