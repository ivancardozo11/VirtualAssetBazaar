import web3 from '../utils/web3Config.js';
import mockErc721ABI from '../utils/mockErc721ABI.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';

const getTokenType = async (CONTRACT_ADDRESSS, NFT_CONTRACT_ID) => {
    try {
        const contract721 = new web3.eth.Contract(mockErc721ABI, CONTRACT_ADDRESSS);
        await contract721.methods.ownerOf(NFT_CONTRACT_ID).call();
        return 'ERC721';
    } catch {
        try {
            const contract20 = new web3.eth.Contract(mockErc20ABI, CONTRACT_ADDRESSS);
            await contract20.methods.totalSupply().call();
            return 'ERC20';
        } catch {
            console.error('The contract does not seem to follow ERC721 or ERC20 standards.');
            return 'UNKNOWN';
        }
    }
};

export default getTokenType;
