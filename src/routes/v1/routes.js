import { Router } from 'express';
import { createListingController, getListingController } from '../../controllers/listingsController.js';

const router = Router();

router.post('/listings', createListingController);
router.get('/listings/:id', getListingController);

export default router;
