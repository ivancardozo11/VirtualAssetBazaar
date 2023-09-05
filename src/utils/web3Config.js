import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const infuraRpcUrl = `https://sepolia.infura.io/v3/${infuraProjectId}`;
const MyAddress = process.env.MY_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(infuraRpcUrl));

async function connectAndCheckBalance () {
    try {
        const chainId = await web3.eth.getChainId();
        console.log('Connected to Sepolia test network (Chain ID:', chainId + ')');

        const balance = await web3.eth.getBalance(MyAddress);
        console.log('Account balance:', web3.utils.fromWei(balance, 'ether'), 'SepoliaETH');

        const blockExplorerUrl = 'https://sepolia.etherscan.io';
        console.log('Block explorer:', blockExplorerUrl);
    } catch (error) {
        console.error('Error:', error);
    }
}

connectAndCheckBalance();

export default web3;
