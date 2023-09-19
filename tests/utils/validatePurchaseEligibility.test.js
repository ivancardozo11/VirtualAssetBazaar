import validatePurchaseEligibility from '../../src/utils/validatePurchaseEligibility';

describe('validatePurchaseEligibility utility', () => {
    it('should throw an error if the token is not available for direct purchase', () => {
        const nft = {
            priceType: 'auction',
            isAuction: false
        };

        expect(() => validatePurchaseEligibility(nft)).toThrow('This token is not available for direct purchase');
    });

    it('should throw an error if the token is currently in auction', () => {
        const nft = {
            priceType: 'fixed',
            isAuction: true
        };

        expect(() => validatePurchaseEligibility(nft)).toThrow('This token is not currently in auction');
    });

    it('should not throw any error if the token is available for direct purchase and not in auction', () => {
        const nft = {
            priceType: 'fixed',
            isAuction: false
        };

        expect(() => validatePurchaseEligibility(nft)).not.toThrow();
    });
});
