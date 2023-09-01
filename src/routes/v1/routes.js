import { Router } from 'express';
import * as listingsController from '../../controllers/listingsController.js';
import * as auctionController from '../../controllers/auctionController.js';
import * as nftController from '../../controllers/nftController.js';

const router = Router();
const ctrl = listingsController;
const auctCtrl = auctionController;
const nftCtrl = nftController;

router.route('/listings')
    .post(ctrl.createListingController)
    .get(ctrl.getAllListingsController);

router.route('/listings/:id')
    .get(ctrl.getListingController)
    .put(ctrl.updateListingController)
    .delete(ctrl.deleteListingController);

router.post('/auctions', auctCtrl.createAuctionController);
router.get('/auctions/:auctionId', auctCtrl.getAuctionDetailsController);
router.post('/auctions/:auctionId/bids', auctCtrl.placeBidController);

router.post('/nfts', nftCtrl.createNFTController);
router.get('/nfts', nftCtrl.getAllNFTsController);
router.get('/nfts/:nftId', nftCtrl.getNFTDetailsController);
router.put('/nfts/:nftId', nftCtrl.updateNFTController);
router.delete('/nfts/:nftId', nftCtrl.deleteNFTController);

export default router;
