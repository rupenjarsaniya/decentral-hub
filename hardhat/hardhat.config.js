require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      gasPrice: 470000000000,
      chainId: 43112,
    },
    ganache: {
      url: "HTTP://127.0.0.1:7545",
    },
  },
  defaultNetwork: "ganache",
  etherscan: {
    apiKey: {
      coinbase: process.env.ETHERSCAN_API_KEY,
    },
  },
  solidity: {
    settings: {
      viaIR: true,
    },
    compilers: [
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
};
