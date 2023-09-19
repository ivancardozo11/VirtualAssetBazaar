import web3 from '../utils/web3Config.js';
import * as signature from './signatureValidation.js';

const mintTokensIfNeeded = async (erc20Contract, bidAmountInWei, highestBid, nonce) => {
    const bidderBalance = await erc20Contract.methods.balanceOf(highestBid.bidderAddress).call();

    if (Number(bidderBalance) >= Number(bidAmountInWei)) return;

    const mintAmount = web3.utils.toWei('10', 'ether'); // Minting tokens for 10 ETH
    const mintTx = erc20Contract.methods.mint(highestBid.bidderAddress, mintAmount);

    await signature.sendSignedTransaction(erc20Contract, mintTx, highestBid.bidderAddress, nonce);

    const updatedBidderBalance = await erc20Contract.methods.balanceOf(highestBid.bidderAddress).call();

    if (Number(updatedBidderBalance) < Number(bidAmountInWei)) {
        throw new Error(`Insufficient token balance even after minting. Required: ${bidAmountInWei}, Current: ${updatedBidderBalance}`);
    }
};

export default mintTokensIfNeeded;
