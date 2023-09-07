import redisClient from '../database/redis/redisConfig.js';

// Checks if an nftId is already being created
export const isNFTContractIdInUse = async (nftContractId) => {
    const value = await redisClient.get(`nftContract:${nftContractId}`);
    return Boolean(value);
};

// Marks the id inside the database to check if has been used before.
export const markNFTContractIdAsUsed = async (nftContractId) => {
    await redisClient.set(`nftContract:${nftContractId}`, 'in_use');
};
