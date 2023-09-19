import buildNewListing from '../../src/utils/buildNewListing.js';

describe('buildNewListing utils', () => {
    it('should return a listing object with a current timestamp as id', () => {
        const listingData = {
            name: 'Artwork A',
            price: 1000,
            description: 'A beautiful artwork'
        };

        const newListing = buildNewListing(listingData);

        expect(typeof newListing.id).toBe('number');

        for (const key in listingData) {
            expect(newListing[key]).toBe(listingData[key]);
        }
    });

    it('should generate unique ids for subsequent listings', async () => {
        const listingData1 = { name: 'Artwork A' };
        const listingData2 = { name: 'Artwork B' };

        const newListing1 = buildNewListing(listingData1);

        await new Promise(resolve => setTimeout(resolve, 2));

        const newListing2 = buildNewListing(listingData2);

        expect(newListing1.id).not.toBe(newListing2.id);
    });
});
