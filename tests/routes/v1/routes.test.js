import request from 'supertest';
import express from 'express';
import router from '../../../src/routes/v1/routes.js';

jest.mock('../../../src/database/redis/redisConfig.js', () => ({
    __esModule: true,
    default: {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
        expire: jest.fn().mockResolvedValue(true)
    }
}));
jest.mock('../../../src/utils/termsAccepted.js', () => ({
    checkTermsAccepted: jest.fn((req, res, next) => next())
}));

jest.mock('../../../src/controllers/listingsController.js', () => ({
    createListingController: jest.fn((req, res) => res.sendStatus(200)),
    getListingController: jest.fn((req, res) => res.sendStatus(200)),
    getAllListingsController: jest.fn((req, res) => res.sendStatus(200)),
    updateListingController: jest.fn((req, res) => res.sendStatus(200)),
    deleteListingController: jest.fn((req, res) => res.sendStatus(200))
}));

jest.mock('../../../src/controllers/auctionController.js', () => ({
    createAuctionController: jest.fn((req, res) => res.sendStatus(200)),
    getAllAuctionsController: jest.fn((req, res) => res.sendStatus(200)),
    placeBidController: jest.fn((req, res) => res.sendStatus(200)),
    endAuctionController: jest.fn((req, res) => res.sendStatus(200))
}));

const app = express();
app.use(express.json());
app.use('/v1', router);

describe('Routes', () => {
    it('should handle POST /listings', async () => {
        const response = await request(app).post('/v1/listings').send({});
        expect(response.status).toBe(200);
    });

    it('should handle GET /listings', async () => {
        const response = await request(app).get('/v1/listings');
        expect(response.status).toBe(200);
    });

    it('should handle GET /listings/:id', async () => {
        const response = await request(app).get('/v1/listings/1');
        expect(response.status).toBe(200);
    });

    it('should handle PUT /listings/:id', async () => {
        const response = await request(app).put('/v1/listings/1').send({});
        expect(response.status).toBe(200);
    });

    it('should handle DELETE /listings/:id', async () => {
        const response = await request(app).delete('/v1/listings/1');
        expect(response.status).toBe(200);
    });

    it('should handle POST /auctions', async () => {
        const response = await request(app).post('/v1/auctions').send({});
        expect(response.status).toBe(200);
    });

    it('should handle GET /auctions', async () => {
        const response = await request(app).get('/v1/auctions');
        expect(response.status).toBe(200);
    });

    it('should handle POST /auctions/:auctionId/bids', async () => {
        const response = await request(app).post('/v1/auctions/1/bids').send({});
        expect(response.status).toBe(200);
    });

    it('should handle POST /auctions/end-auction/:id', async () => {
        const response = await request(app).post('/v1/auctions/end-auction/1').send({});
        expect(response.status).toBe(200);
    });
});
