/* eslint-disable no-unused-vars */
import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const infuraRpcUrl = `https://sepolia.infura.io/v3/${infuraProjectId}`;
const buyerAddress = process.env.BUYER_ADDRESS;

const web3Buyer = new Web3(new Web3.providers.HttpProvider(infuraRpcUrl));

web3Buyer.eth.accounts.wallet.add(`0x${buyerPrivateKey}`);

async function connectAndCheckBalance () {
    try {
        const chainId = await web3Buyer.eth.getChainId();

        const balance = await web3Buyer.eth.getBalance(buyerAddress);
    } catch (error) {
        console.error('Error:', error);
    }
}

connectAndCheckBalance();

export default web3Buyer;
