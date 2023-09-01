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

// Function to validate an NFT contract address
export const validateNFTContractAddress = (address) => {
    // Define the validation schema for NFT contract address
    const schema = Joi.string()
        .regex(/^0x[a-fA-F0-9]{40}$/) // NFT contract address format
        .length(42) // NFT contract address length (including "0x")
        .required();

    // Validate the address using the schema
    const { error } = schema.validate(address);

    if (error) {
        throw new Error('Invalid NFT contract address');
    }
};
