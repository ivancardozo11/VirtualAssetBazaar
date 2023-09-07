import redisClient from '../database/redis/redisConfig.js';

export const getNFTDetailsFromDatabase = async (nftContractId) => {
    try {
        const redisKey = `listing:${nftContractId}`;
        const nftDetails = await redisClient.get(redisKey);

        if (!nftDetails) {
            return null;
        }

        return JSON.parse(nftDetails);
    } catch (error) {
        throw new Error(`Failed to get NFT details: ${error.message}`);
    }
};
