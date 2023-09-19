import { validateEthereumWalletAddress } from '../utils/addressValidation.js';
import * as details from '../utils/getDetails.js';
import validatePurchaseEligibility from '../utils/validatePurchaseEligibility.js';
import getBuyerBalance from '../utils/getBuyerBalance.js';
import getTokenType from '../utils/getTokenType.js';
import handleErc721Purchase from '../utils/handleErc721Purchase.js';
import handleErc20Purchase from '../utils/handleErc20Purchase.js';
import markNFTAsSold from '../utils/markNFTAsSold.js';

export const purchaseToken = async (NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    try {
        validateEthereumWalletAddress(BUYER_WALLET_ADDRESS);
        const nft = await details.getNFTDetails(NFT_CONTRACT_ID);
        validatePurchaseEligibility(nft);
        const buyerBalance = await getBuyerBalance(BUYER_WALLET_ADDRESS);

        if (buyerBalance < nft.price) {
            throw new Error('Insufficient funds to purchase the token');
        }

        const tokenType = await getTokenType(nft.nftContractAddress, NFT_CONTRACT_ID);
        if (tokenType === 'ERC721') {
            await handleErc721Purchase(nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS, buyerBalance);
        } else if (tokenType === 'ERC20') {
            await handleErc20Purchase(nft, BUYER_WALLET_ADDRESS);
        } else {
            throw new Error('Unsupported token type.');
        }

        await markNFTAsSold(NFT_CONTRACT_ID);
        return { success: true, message: 'Token purchased successfully' };
    } catch (error) {
        console.log(error);
        return { success: false, error: `Failed to purchase token: ${error.message}` };
    }
};
