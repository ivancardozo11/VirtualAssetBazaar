import { validatePositiveValue, validateStartingPriceGreaterThanPrice } from '../../src/utils/numericValidation.js';

describe('numericValidation', () => {
    describe('validatePositiveValue', () => {
        it('should not throw an error for positive values', () => {
            const testValue = 5;
            expect(() => validatePositiveValue(testValue)).not.toThrow();
        });

        it('should throw an error for negative values', () => {
            const testValue = -5;
            expect(() => validatePositiveValue(testValue)).toThrow('Price must be a positive value');
        });

        it('should throw an error for zero', () => {
            const testValue = 0;
            expect(() => validatePositiveValue(testValue)).toThrow('Price must be a positive value');
        });

        it('should throw an error for null or undefined values', () => {
            expect(() => validatePositiveValue(null)).toThrow('Price must be a positive value');
            expect(() => validatePositiveValue(undefined)).toThrow('Price must be a positive value');
        });
    });

    describe('validateStartingPriceGreaterThanPrice', () => {
        it('should not throw an error if startingPrice is greater than price', () => {
            expect(() => validateStartingPriceGreaterThanPrice(10, 5)).not.toThrow();
        });

        it('should not throw an error if startingPrice is equal to price', () => {
            expect(() => validateStartingPriceGreaterThanPrice(5, 5)).not.toThrow();
        });

        it('should throw an error if startingPrice is less than price', () => {
            expect(() => validateStartingPriceGreaterThanPrice(4, 5)).toThrow('Starting price must be equal to or greater than the price');
        });
    });
});
