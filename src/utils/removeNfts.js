// Remove NFT from the local array
export const removeNFTFromList = (nftList, nftId) => {
    const index = nftList.findIndex(nft => nft.id === nftId);
    if (index !== -1) {
        nftList.splice(index, 1);
    }
};
