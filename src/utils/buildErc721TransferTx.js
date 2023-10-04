import web3 from '../utils/web3Config.js';
import mockErc721ABI from '../utils/mockErc721ABI.js';

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
const SELLER_ADDRESS = process.env.MY_ADDRESS;

const buildErc721TransferTx = async (nft, NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS) => {
    const erc721Contract = new web3.eth.Contract(mockErc721ABI, nft.nftContractAddress);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const txData = erc721Contract.methods.transferFrom(SELLER_ADDRESS, BUYER_WALLET_ADDRESS, NFT_CONTRACT_ID).encodeABI();

    const estimatedGas = await erc721Contract.methods
        .transferFrom(SELLER_ADDRESS, BUYER_WALLET_ADDRESS, NFT_CONTRACT_ID)
        .estimateGas({ from: SELLER_ADDRESS });

    const gasPrice = await web3.eth.getGasPrice();

    const transferConfig = {
        nonce,
        to: nft.nftContractAddress,
        gas: estimatedGas,
        gasPrice,
        data: txData
    };

    return await web3.eth.accounts.signTransaction(transferConfig, account.privateKey);
};

export default buildErc721TransferTx;
