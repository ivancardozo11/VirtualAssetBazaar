import {
    createListingController,
    getListingController,
    getAllListingsController,
    updateListingController,
    deleteListingController
} from '../../src/controllers/listingsController.js';

import {
    createListing,
    getListing,
    getAllListings,
    updateListing,
    deleteListing
} from '../../src/services/listingsService.js';

jest.mock('../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));
jest.mock('../../src/services/listingsService.js');

describe('Listings Controllers', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Mocking console.error

        mockReq = {
            params: { id: '1' },
            body: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.error.mockRestore(); // Restoring original console.error
        jest.clearAllMocks();
    });
     it('should create a listing successfully', async () => {
        const mockData = { title: 'Test Listing' };
        createListing.mockResolvedValue(mockData);

        mockReq.body = mockData;

        await createListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    it('should retrieve a listing successfully', async () => {
        const mockData = { title: 'Test Listing' };
        getListing.mockResolvedValue(mockData);

        await getListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    // ... Similar tests for "not found" and error cases for getListingController

    it('should retrieve all listings successfully', async () => {
        const mockData = [{ title: 'Listing1' }, { title: 'Listing2' }];
        getAllListings.mockResolvedValue(mockData);

        await getAllListingsController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });
    it('should update a listing successfully', async () => {
        const mockData = { id: 1, title: 'Updated Listing' };
        updateListing.mockResolvedValue(mockData);

        mockReq.body = { title: 'Updated Listing' };

        await updateListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 404 when updating a non-existent listing', async () => {
        updateListing.mockResolvedValue(null);

        await updateListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Listing not found' });
    });

    it('should return 500 status for any error during listing update', async () => {
        const mockError = new Error('Update error');
        updateListing.mockRejectedValue(mockError);

        await updateListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });

    it('should delete a listing successfully', async () => {
        const mockData = { id: 1, title: 'Deleted Listing' };
        deleteListing.mockResolvedValue(mockData);

        await deleteListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 404 when deleting a non-existent listing', async () => {
        deleteListing.mockResolvedValue(null);

        await deleteListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Listing not found' });
    });


    it('should return 500 status for any error during listing deletion', async () => {
        const mockError = new Error('Deletion error');
        deleteListing.mockRejectedValue(mockError);

        await deleteListingController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);

        expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
});
