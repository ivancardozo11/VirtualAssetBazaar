import {
    AuctionError,
    BidValueError,
    ConsecutiveBidError,
    ValidationError,
    handleJoiValidation,
    handleErrors
} from '../../src/utils/auctionErrorHandling.js';

describe('auctionErrorHandling', () => {
    describe('Error Classes', () => {
        it('should create an AuctionError', () => {
            const error = new AuctionError('Test AuctionError');
            expect(error.message).toBe('Test AuctionError');
            expect(error.name).toBe('AuctionError');
        });

        it('should create a BidValueError', () => {
            const error = new BidValueError('Test BidValueError');
            expect(error.message).toBe('Test BidValueError');
            expect(error.name).toBe('BidValueError');
        });

        it('should create a ConsecutiveBidError', () => {
            const error = new ConsecutiveBidError('Test ConsecutiveBidError');
            expect(error.message).toBe('Test ConsecutiveBidError');
            expect(error.name).toBe('ConsecutiveBidError');
        });

        it('should create a ValidationError', () => {
            const error = new ValidationError('Test ValidationError');
            expect(error.message).toBe('Test ValidationError');
            expect(error.name).toBe('ValidationError');
        });
    });

    describe('handleJoiValidation', () => {
        it('should throw a ValidationError if there are validation errors', () => {
            const mockResult = {
                error: {
                    details: [{ message: 'Test error 1' }, { message: 'Test error 2' }]
                }
            };
            expect(() => handleJoiValidation(mockResult)).toThrow('Validation failed: Test error 1, Test error 2');
        });

        it('should return true if there are no validation errors', () => {
            const mockResult = {};
            expect(handleJoiValidation(mockResult)).toBe(true);
        });
    });

    describe('handleErrors', () => {
        it('should log the message if error is instance of ValidationError', () => {
            console.error = jest.fn();
            const mockError = new ValidationError('Test ValidationError');
            expect(() => handleErrors(mockError, 'Default message')).toThrow('Default message: Test ValidationError');
            expect(console.error).toHaveBeenCalledWith('Test ValidationError');
        });

        it('should throw the default message if error is not instance of ValidationError', () => {
            const mockError = new Error('Test error');
            expect(() => handleErrors(mockError, 'Default message')).toThrow('Default message: Test error');
        });
    });
});
