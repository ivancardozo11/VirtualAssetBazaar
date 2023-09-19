import redisClient from '../database/redis/redisConfig.js';

const getAuctionDetailsById = async (nftContractId) => {
    try {
        const auctionData = await redisClient.get(`auction:${nftContractId}`);
        return JSON.parse(auctionData);
    } catch (error) {
        console.error('Error fetching auction details:', error);
        throw new Error('Failed to fetch auction details.');
    }
};

export default getAuctionDetailsById;
