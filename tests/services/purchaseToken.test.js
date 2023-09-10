import { expect } from 'chai';
import sinon from 'sinon';
import web3Seller from '../../src/utils/web3Config.js';
import web3Buyer from '../../src/utils/web3ConfigBuyer.js';
import { purchaseToken } from '../../src/services/nftService.js';
import redisClient from '../../src/database/redis/redisConfig.js';
import dotenv from 'dotenv';

dotenv.config();

/* eslint-env mocha */
describe('purchaseToken', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should fail if buyer has insufficient balance', async () => {
        const mockBuyerBalanceWei = web3Buyer.utils.toWei('0.0005', 'ether');
        sinon.stub(web3Seller.eth, 'getBalance').returns(mockBuyerBalanceWei);

        const result = await purchaseToken('123', '0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C');

        expect(result.success).to.equal(false);
        expect(result.error).to.equal('Failed to purchase token: Insufficient funds to purchase the token');
    });

    it('should fail for an invalid buyer address', async () => {
        const result = await purchaseToken('invalidAddress', 'mockTokenId');
        expect(result.success).to.equal(false);
        expect(result.error).to.equal('Failed to purchase token: Invalid Ethereum wallet address');
    });
    it('should fail if NFT is not found', async () => {
        const mockTokenId = 'token' + Math.floor(Math.random() * 10000); // Genera un ID tipo "token1234"

        sinon.stub(redisClient, 'get').returns(null); // Asumo que usas un prototipo de redisClient, actualiza según tu implementación

        const result = await purchaseToken(mockTokenId, '0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C');
        expect(result.success).to.equal(false);
        expect(result.error).to.equal(`Failed to purchase token: NFT with contract ID ${mockTokenId} not found`);
    });

    it('should fail for an unsupported token type', async () => {
        const mockNFT = {
            type: 'UNSUPPORTED_TYPE'
        };

        const mockTokenId = 'token' + Math.floor(Math.random() * 10000);

        sinon.stub(redisClient, 'get').returns(JSON.stringify(mockNFT));

        const result = await purchaseToken(mockTokenId, '0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C');
        expect(result.error).to.equal('Failed to purchase token: This token is not available for direct purchase');
        expect(result.success).to.equal(false);
    });

    /* Instructions to test ERC20 Tokens purchase:
    1.run the database from redis on local. Make sure you have the redis instance properly configurated.

            2.
            Create the propper JSON inside the redis database:
            http://localhost:3000/api/v1/listings POST:

            {
            "nftContractAddress": "0xbd65c58D6F46d5c682Bf2f36306D461e3561C747",
            "owner": "0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C",
            "nftContractId": "123",
            "title": "Buying tokens from erc20 mock contracts.",
            "description": "This is an fixed token purchase.",
            "price": 0.001,
            "isAuction": false,
            "startingPrice": 2,
            "auctionEndTime": "2023-10-05T02:08",
            "priceType": "fixed",
            "sellerSignature": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
            "isERC721": false,
            "totalTokensForSale": 1,
            "sold": false,
            "termsAccepted": true
        }

    3. Run the comand:
        npm test

        Note:
        Make sure you are using an ERC20 address for from the buyer, this one is an ERC20 test wallet integrated with this app
        to automate sing process between the buyer and the seller:
        0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f --> Buyer address
        Make sure the id is the 123, or the id you create for ERC transactions.
    */
    // it('should successfully purchase ERC20 tokens', async () => {
    //     const NFT_CONTRACT_ID = '123';
    //     const BUYER_WALLET_ADDRESS = '0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f';

    //     const result = await purchaseToken(NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS);

    //     expect(result.success).to.equal(true);
    //     expect(result.message).to.equal('Token purchased successfully');
    // }).timeout(100000);

    /*      Instructions to test ERC721 Tokens purchase:

            1.run the database from redis on local. Make sure you have the redis instance properly configurated.
                    //Maker sure the addres nftContractAddress is an ERC721 address(code will verify that.)

            2.
            Create the propper JSON inside the redis database:
            http://localhost:3000/api/v1/listings POST:

            {
            "nftContractAddress": "0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff",
            "owner": "0x7734cDF55579C03AdbE9848cC917A1463f41Ea5C",
            "nftContractId": "123",
            "title": "Fixed NFT Listing",
            "description": "This is an fixed price NFT listing.",
            "price": 0.001,
            "isAuction": false,
            "startingPrice": 2,
            "auctionEndTime": "2023-10-05T02:08",
            "priceType": "fixed",
            "sellerSignature": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
            "isERC721": false,
            "totalTokensForSale": 1,
            "sold": false,
            "termsAccepted": true
        }

    3. Run the comand:
        npm test

        Note:
        * Make sure nftContractAddress on the JSON is an ERC721 address(0X...3ff is an ERC721 dont worry).
    */
    // it('should succeed for ERC721 token purchase', async () => {
    //     const NFT_CONTRACT_ID = '194';
    //     const BUYER_WALLET_ADDRESS = '0x0E6F0B5565bc52F8F5ADD3D4bbe46E452a3aCA6f';

    //     const result = await purchaseToken(NFT_CONTRACT_ID, BUYER_WALLET_ADDRESS);

    //     expect(result.success).to.equal(true);
    //     expect(result.message).to.equal('Token purchased successfully');
    // }).timeout(100000);
});
