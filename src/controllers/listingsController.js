import {
    createListing,
    getListing,
    getAllListings,
    updateListing,
    deleteListing
} from '../services/listingsService.js';

export const createListingController = async (req, res) => {
    try {
        const listingData = req.body;
        const newListing = await createListing(listingData);
        res.status(201).json(newListing);
    } catch (error) {
        console.error(`Error creating listing: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const getListingController = async (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const listing = await getListing(listingId);

        if (listing) {
            res.status(200).json(listing);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        console.error(`Error retrieving listing: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const getAllListingsController = async (req, res) => {
    try {
        const listings = await getAllListings();
        res.status(200).json(listings);
    } catch (error) {
        console.error(`Error retrieving all listings: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const updateListingController = async (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const updatedData = req.body;

        const updatedListing = await updateListing(listingId, updatedData);

        if (updatedListing) {
            res.status(200).json(updatedListing);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        console.error(`Error updating listing: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const deleteListingController = async (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const deletedListing = await deleteListing(listingId); // Añadiendo el await aquí

        if (deletedListing) {
            res.status(200).json(deletedListing);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        console.error(`Error deleting listing: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
