import redisClient from '../database/redis/redisConfig.js';
import * as details from './getDetails.js';

const markNFTAsSold = async (NFT_CONTRACT_ID) => {
    const originalKey = `listing:${NFT_CONTRACT_ID}`;
    const nft = await details.getNFTDetails(NFT_CONTRACT_ID);
    if (!nft) { throw new Error(`NFT with ID ${NFT_CONTRACT_ID} not found`); }
    nft.sold = true;
    const newKey = `listing:sold:${NFT_CONTRACT_ID}`;
    await redisClient.set(newKey, JSON.stringify(nft));
    await redisClient.del(originalKey);
};

export default markNFTAsSold;
