import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const buyerPrivateKey = process.env.BUYER_PRIVATE_KEY; // Clave privada del comprador desde el archivo .env
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const infuraRpcUrl = `https://sepolia.infura.io/v3/${infuraProjectId}`;
const buyerAddress = process.env.BUYER_ADDRESS; // Dirección del comprador desde el archivo .env

const web3Buyer = new Web3(new Web3.providers.HttpProvider(infuraRpcUrl));

web3Buyer.eth.accounts.wallet.add(`0x${buyerPrivateKey}`); // Importar la clave privada del comprador

async function connectAndCheckBalance () {
    try {
        const chainId = await web3Buyer.eth.getChainId();
        console.log('Connected to Sepolia test network (Chain ID:', chainId + ')');

        const balance = await web3Buyer.eth.getBalance(buyerAddress);
        console.log('Account balance in the buyer wallet number 0x0E6F...A6f::', web3Buyer.utils.fromWei(balance, 'ether'), 'SepoliaETH');
    } catch (error) {
        console.error('Error:', error);
    }
}

connectAndCheckBalance();

export default web3Buyer;
