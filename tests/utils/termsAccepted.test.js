import { checkTermsAccepted } from '../../src/utils/termsAccepted';

describe('checkTermsAccepted middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {}
        };
        mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('should return an error if termsAccepted is not provided in request body', () => {
        checkTermsAccepted(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'You must accept the terms and conditions due to international regulations' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if termsAccepted is true in request body', () => {
        mockRequest.body.termsAccepted = true;

        checkTermsAccepted(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
});
