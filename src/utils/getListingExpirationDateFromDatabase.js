import redisClient from '../database/redis/redisConfig.js';

const getListingExpirationDateFromDatabase = async (nftContractId) => {
    try {
        const redisKey = `listing:${nftContractId}`;
        const nftDetails = await redisClient.get(redisKey);

        if (!nftDetails) {
            throw new Error(`No listing found for the provided ${nftContractId}`);
        }

        const parsedDetails = JSON.parse(nftDetails);
        return new Date(parsedDetails.auctionEndTime);
    } catch (error) {
        throw new Error(`Failed to get NFT expiration date: ${error.message}`);
    }
};

export default getListingExpirationDateFromDatabase;
