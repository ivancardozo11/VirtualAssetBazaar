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
    .post(ctrl.createListingController)
    .get(ctrl.getAllListingsController);

router.route('/listings/:id')
    .get(ctrl.getListingController)
    .put(ctrl.updateListingController)
    .delete(ctrl.deleteListingController);

router.post('/auctions', checkTermsAccepted,
    auctCtrl.createAuctionController);
router.get('/auctions/:auctionId', checkTermsAccepted,
    auctCtrl.getAuctionDetailsController);
router.post('/auctions/:auctionId/bids',
    checkTermsAccepted, auctCtrl.placeBidController);

router.route('/nfts')
    .post(nftCtrl.createNFTController)
    .get(nftCtrl.getAllNFTsController);

router.route('/nfts/:nftId')
    .get(nftCtrl.getNFTDetailsController)
    .put(nftCtrl.updateNFTController)
    .delete(nftCtrl.deleteNFTController);

export default router;
