import { Router } from 'express';
import * as listingsController from '../../controllers/listingsController.js';
import * as auctionController from '../../controllers/auctionController.js';

const router = Router();
const ctrl = listingsController;
const auctCtrl = auctionController;

router.route('/listings')
    .post(ctrl.createListingController)
    .get(ctrl.getAllListingsController);

router.route('/listings/:id')
    .get(ctrl.getListingController)
    .put(ctrl.updateListingController)
    .delete(ctrl.deleteListingController);

// Auctions
router.post('/auctions', auctCtrl.createAuctionController);
router.get('/auctions/:auctionId', auctCtrl.getAuctionDetailsController);
router.post('/auctions/:auctionId/bids', auctCtrl.placeBidController);

export default router;
