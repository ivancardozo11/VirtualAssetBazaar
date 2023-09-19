const isValidNftDetails = (listedToken, buyerBalance, isAuction) => {
    if (!listedToken) throw new Error('No listing found for the provided nftContractId');

    if (buyerBalance < listedToken.bidAmount) { throw new Error('The provided buyerFunds is less than the bidAmount the owner is asking'); }

    if (!listedToken.isAuction && isAuction) { throw new Error('The NFT is not marked for auction but is being treated as one'); }

    return true;
};

export default isValidNftDetails;
