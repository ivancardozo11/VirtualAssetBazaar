import { Router } from 'express';
import * as listingsController from '../../controllers/listingsController.js';

const router = Router();
const ctrl = listingsController;

router.route('/listings')
    .post(ctrl.createListingController)
    .get(ctrl.getAllListingsController);

router.route('/listings/:id')
    .get(ctrl.getListingController)
    .put(ctrl.updateListingController)
    .delete(ctrl.deleteListingController);

export default router;
