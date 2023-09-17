const validatePurchaseEligibility = (nft) => {
    if (nft.priceType !== 'fixed') {
        throw new Error('This token is not available for direct purchase');
    }
    if (nft.isAuction) {
        throw new Error('This token is not currently in auction');
    }
};

export default validatePurchaseEligibility;
