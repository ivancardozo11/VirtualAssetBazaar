const buildNewListing = (listingData) => {
    return {
        id: Date.now(),
        ...listingData
    };
};
export default buildNewListing;
