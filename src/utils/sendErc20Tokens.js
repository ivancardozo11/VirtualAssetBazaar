import web3 from '../utils/web3Config.js';
import mockErc20ABI from '../utils/mockErc20ABI.js';
import dotenv from 'dotenv';

dotenv.config();

const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.METAMASK_PRIVATE_KEY}`);
// web3.eth.accounts.wallet.add(account);

const SELLER_ADDRESS = process.env.MY_ADDRESS;
const MOCK_ERC20_ADDRESS = process.env.MOCKERC20_ADDRESS;
const GAS_LIMIT = 2000000;

const sendErc20Tokens = async (TOTAL_TOKENS_FOR_SALE, BUYER_WALLET_ADDRESS) => {
    const erc20Contract = new web3.eth.Contract(mockErc20ABI, SELLER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(SELLER_ADDRESS, 'pending');
    const data = erc20Contract.methods.transfer(MOCK_ERC20_ADDRESS, TOTAL_TOKENS_FOR_SALE).encodeABI();

    const transferConfig = {
        nonce,
        to: BUYER_WALLET_ADDRESS,
        gas: GAS_LIMIT,
        gasPrice: await web3.eth.getGasPrice(),
        data
    };

    const signedTx = await web3.eth.accounts.signTransaction(transferConfig, account.privateKey);
    console.log(`The transaction between ${BUYER_WALLET_ADDRESS} Buying tokens to ${SELLER_ADDRESS} is signed now, check Tx Hash: ${signedTx.transactionHash} for more details`);
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

export default sendErc20Tokens;
