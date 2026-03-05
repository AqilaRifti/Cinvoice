require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        creditcoinTestnet: {
            url: process.env.CREDITCOIN_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network",
            chainId: 102031,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: "auto",
        },
        hardhat: {
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        admin1: {
            default: 1,
        },
        admin2: {
            default: 2,
        },
        admin3: {
            default: 3,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 40000,
    },
};
