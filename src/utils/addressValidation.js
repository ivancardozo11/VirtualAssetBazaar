import Joi from 'joi';

// Function to validate an Ethereum wallet address
export const validateEthereumWalletAddress = (address) => {
    // Define the validation schema for Ethereum wallet address
    const schema = Joi.string()
        .regex(/^0x[a-fA-F0-9]{40}$/) // Ethereum wallet address format
        .length(42) // Ethereum wallet address length (including "0x")
        .required();

    // Validate the address using the schema
    const { error } = schema.validate(address);

    if (error) {
        throw new Error('Invalid Ethereum wallet address');
    }
};

export const validateAddresses = (addresses) => addresses.forEach(addr => validateEthereumWalletAddress(addr));
