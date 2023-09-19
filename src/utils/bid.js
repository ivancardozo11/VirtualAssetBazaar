import * as signature from '../utils/signatureValidation.js';
export const approveBidAmount = async (erc20Contract, highestBid, bidAmountInWei, settlerAddress, nonce) => {
    const allowance = await erc20Contract.methods.allowance(highestBid.bidderAddress, settlerAddress).call();

    if (Number(allowance) >= Number(bidAmountInWei)) return;

    const resetApproveTx = erc20Contract.methods.approve(settlerAddress, '0');
    await signature.sendSignedTransaction(erc20Contract, resetApproveTx, highestBid.bidderAddress, nonce);

    const approveTx = erc20Contract.methods.approve(settlerAddress, bidAmountInWei);
    await signature.sendSignedTransaction(erc20Contract, approveTx, highestBid.bidderAddress, nonce);
};
