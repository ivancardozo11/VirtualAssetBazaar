import Joi from 'joi';

export const validateEthereumWalletAddress = (address) => {
    const schema = Joi.string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .length(42)
        .required();

    const { error } = schema.validate(address);

    if (error) {
        throw new Error('Invalid Ethereum wallet address');
    }
};

export const validateAddresses = (addresses) => addresses.forEach(addr => validateEthereumWalletAddress(addr));
