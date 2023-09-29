import web3 from '../utils/web3Config.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';
import dotenv from 'dotenv';

dotenv.config();

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const MOCK_ERC20_ADDRESS = process.env.MOCKERC20_ADDRESS;

const sendErc20Tokens = async (TOTAL_TOKENS_FOR_SALE, BUYER_WALLET_ADDRESS) => {
    const erc20Contract = new web3.eth.Contract(mockErc20ABI, SELLER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const data = erc20Contract.methods.transfer(MOCK_ERC20_ADDRESS, TOTAL_TOKENS_FOR_SALE).encodeABI();

    const estimatedGas = await web3.eth.estimateGas({
        to: BUYER_WALLET_ADDRESS,
        data,
        from: SELLER_ADDRESS
    });

    const gasPrice = await web3.eth.getGasPrice();

    const transferConfig = {
        nonce,
        to: BUYER_WALLET_ADDRESS,
        gas: estimatedGas,
        gasPrice,
        data
    };

    const signedTx = await web3.eth.accounts.signTransaction(transferConfig, account.privateKey);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

export default sendErc20Tokens;
