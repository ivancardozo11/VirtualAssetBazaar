import getBuyerBalance from '../../src/utils/getBuyerBalance';
import web3Buyer from '../../src/utils/web3ConfigBuyer';

jest.mock('../../src/utils/web3ConfigBuyer.js', () => ({
    __esModule: true,
    default: {
        eth: {
            getBalance: jest.fn()
        },
        utils: {
            fromWei: jest.fn()
        }
    }
}));

describe('getBuyerBalance.js tests', () => {
    const mockWalletAddress = '0x1234abcd';

    beforeEach(() => {
        web3Buyer.eth.getBalance.mockReset();
        web3Buyer.utils.fromWei.mockReset();
    });

    it('should retrieve the buyer balance correctly', async () => {
        web3Buyer.eth.getBalance.mockResolvedValueOnce('2000000000000000000');
        web3Buyer.utils.fromWei.mockReturnValueOnce('2');

        const balance = await getBuyerBalance(mockWalletAddress);
        expect(balance).toBe(2);
        expect(web3Buyer.eth.getBalance).toHaveBeenCalledWith(mockWalletAddress);
        expect(web3Buyer.utils.fromWei).toHaveBeenCalledWith('2000000000000000000', 'ether');
    });

    it('should throw an error if fetching balance fails', async () => {
        web3Buyer.eth.getBalance.mockRejectedValueOnce(new Error('Failed to fetch balance'));

        await expect(getBuyerBalance(mockWalletAddress)).rejects.toThrow('Failed to fetch balance');
    });
});
