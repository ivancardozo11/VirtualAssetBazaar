import redisClient from '../database/redis/redisConfig.js';

export const getEssentialDetails = (highestBid, auctionDetails) => {
    const collectionAddress = highestBid.nftContractAddress || auctionDetails.nftContractAddress;
    const erc20Address = highestBid.mockERC20Address || auctionDetails.mockERC20Address;
    const tokenId = highestBid.nftContractId || auctionDetails.nftContractId;

    if (!collectionAddress || !erc20Address || !tokenId) {
        throw new Error('Missing required fields.');
    }

    return { collectionAddress, erc20Address, tokenId };
};

export const getNFTDetails = async (NFT_CONTRACT_ID) => {
    try {
        const redisKey = `listing:${NFT_CONTRACT_ID}`;

        const nftDetails = await redisClient.get(redisKey);

        if (!nftDetails) {
            return null;
        }

        return JSON.parse(nftDetails);
    } catch (error) {
        throw new Error(`Failed to get NFT details: ${error.message}`);
    }
};
