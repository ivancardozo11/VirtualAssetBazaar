import { validateEthereumWalletAddress, validateAddresses } from '../../src/utils/addressValidation.js';

describe('addressValidation', () => {
    describe('validateEthereumWalletAddress', () => {
        it('should validate a correct Ethereum wallet address', () => {
            const validAddress = '0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C';
            expect(() => validateEthereumWalletAddress(validAddress)).not.toThrow();
        });

        it('should throw an error for an invalid Ethereum wallet address', () => {
            const invalidAddress = '0x7734cDF55579C03AdbE98';
            expect(() => validateEthereumWalletAddress(invalidAddress)).toThrow('Invalid Ethereum wallet address');
        });
    });

    describe('validateAddresses', () => {
        it('should validate an array of correct Ethereum wallet addresses', () => {
            const validAddresses = ['0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C', '0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f'];
            expect(() => validateAddresses(validAddresses)).not.toThrow();
        });

        it('should throw an error if any of the addresses in the array are invalid', () => {
            const mixedAddresses = ['0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C', '0x7734cDF55579C03AdbE98'];
            expect(() => validateAddresses(mixedAddresses)).toThrow('Invalid Ethereum wallet address');
        });
    });
});
