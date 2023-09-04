import { MetaMaskProvider } from '@metamask/sdk';

const dAppMetadata = {
    name: 'Virtual Asset Bazaar'
};

const provider = new MetaMaskProvider({ dAppMetadata });

async function connectToMetaMask() {
    try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log('Connected to MetaMask. Account:', accounts[0]);
            // Ahora puedes usar 'provider' para interactuar con MetaMask
            // Por ejemplo:
            // const balance = await provider.request({
            //     method: 'eth_getBalance',
            //     params: [accounts[0]]
            // });
            // console.log('Balance:', balance);
        } else {
            console.log('MetaMask is not connected.');
        }
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
    }
}

connectToMetaMask();
