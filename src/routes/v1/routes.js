import { Router } from 'express';
import * as listingsController from '../../controllers/listingsController.js';
import * as auctionController from '../../controllers/auctionController.js';
import * as nftController from '../../controllers/nftController.js';
import { checkTermsAccepted } from '../../utils/termsAccepted.js';

const router = Router();
const ctrl = listingsController;
const auctCtrl = auctionController;
const nftCtrl = nftController;

router.route('/listings')
    .post(checkTermsAccepted, ctrl.createListingController)
    .get(ctrl.getAllListingsController);

router.route('/listings/:id')
    .get(ctrl.getListingController)
    .put(ctrl.updateListingController)
    .delete(ctrl.deleteListingController);
router.route('/auctions')
    .get(auctCtrl.getAllAuctionsController)
    .post(checkTermsAccepted,
        auctCtrl.createAuctionController);
router.post('/auctions/:auctionId/bids', auctCtrl.placeBidController);
router.post('/auctions/end-auction/:id', auctCtrl.endAuctionController);

router.post('/nfts/:nftId/purchase', nftCtrl.purchaseTokenController);

export default router;
