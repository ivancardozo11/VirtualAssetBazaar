// import sinon from 'sinon';
// import { expect } from 'chai';
// import * as auctionService from '../../src/services/auctionService.js';
// import {
//     createAuctionController,
//     getAllAuctionsController,
//     getAuctionDetailsController,
//     placeBidController,
//     endAuctionController
// } from '../controllers/auctionController.js';

// describe('Auction Controller', () => {
//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('createAuctionController', () => {
//         it('should successfully create an auction', async () => {
//             const mockReq = {
//                 body: { /* datos de la subasta */ }
//             };
//             const mockRes = {
//                 status: sinon.stub().returnsThis(),
//                 json: sinon.spy()
//             };
//             sinon.stub(auctionService, 'createAuction').resolves({ /* respuesta exitosa */ });

//             await createAuctionController(mockReq, mockRes);

//             expect(mockRes.status.calledWith(201)).to.be.true;
//             expect(mockRes.json.calledOnce).to.be.true;
//         });

//         it('should handle creation error', async () => {
//             const mockReq = {
//                 body: { /* datos de la subasta */ }
//             };
//             const mockRes = {
//                 status: sinon.stub().returnsThis(),
//                 json: sinon.spy()
//             };
//             sinon.stub(auctionService, 'createAuction').rejects(new Error('Creation error'));

//             await createAuctionController(mockReq, mockRes);

//             expect(mockRes.status.calledWith(400)).to.be.true;
//             expect(mockRes.json.calledOnce).to.be.true;
//         });
//     });

//     // Aquí puedes agregar más tests para los demás controladores siguiendo el patrón anterior. Por ejemplo:

//     describe('getAllAuctionsController', () => {
//         // ...
//     });

//     describe('getAuctionDetailsController', () => {
//         // ...
//     });

//     // Y así sucesivamente...
// });
