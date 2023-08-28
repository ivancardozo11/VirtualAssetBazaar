import { createListing, getListing } from '../services/listingsService.js';

export const createListingController = (req, res) => {
    try {
        const listingData = req.body;
        const newListing = createListing(listingData);
        res.status(201).json(newListing);
    } catch (error) {
        console.error(`Error creating listing: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getListingController = (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const listing = getListing(listingId);

        if (listing) {
            res.status(200).json(listing);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        console.error(`Error retrieving listing: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};
