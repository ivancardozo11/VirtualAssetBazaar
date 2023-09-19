import web3 from '../../src/utils/web3Config.js';
import getTokenType from '../../src/utils/getTokenType.js';

// Mocking required modules
jest.mock('../../src/utils/web3Config.js');
jest.mock('../../src/utils/mockErc721ABI.js', () => ({}));
jest.mock('../../src/utils/mockErc20ABI.js', () => ({}));

describe('getTokenType', () => {
    const CONTRACT_ADDRESS = 'dummyContractAddress';
    const NFT_CONTRACT_ID = 'dummyNftId';

    it('should return ERC721 if contract follows the ERC721 standard', async () => {
        web3.eth.Contract.mockImplementation(() => {
            return {
                methods: {
                    ownerOf: () => ({ call: jest.fn().mockResolvedValue('someOwner') })
                }
            };
        });

        const result = await getTokenType(CONTRACT_ADDRESS, NFT_CONTRACT_ID);
        expect(result).toBe('ERC721');
    });

    it('should return ERC20 if contract follows the ERC20 standard', async () => {
        web3.eth.Contract.mockImplementationOnce(() => {
            return {
                methods: {
                    ownerOf: () => ({ call: jest.fn().mockRejectedValue(new Error('Not ERC721')) })
                }
            };
        }).mockImplementationOnce(() => {
            return {
                methods: {
                    totalSupply: () => ({ call: jest.fn().mockResolvedValue('1000000') })
                }
            };
        });

        const result = await getTokenType(CONTRACT_ADDRESS, NFT_CONTRACT_ID);
        expect(result).toBe('ERC20');
    });

    it('should return UNKNOWN if contract does not follow either standards', async () => {
        web3.eth.Contract.mockImplementation(() => {
            return {
                methods: {
                    ownerOf: () => ({ call: jest.fn().mockRejectedValue(new Error('Not ERC721')) }),
                    totalSupply: () => ({ call: jest.fn().mockRejectedValue(new Error('Not ERC20')) })
                }
            };
        });

        const result = await getTokenType(CONTRACT_ADDRESS, NFT_CONTRACT_ID);
        expect(result).toBe('UNKNOWN');
    });
});
