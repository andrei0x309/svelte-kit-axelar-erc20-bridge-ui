import { HardhatUserConfig, } from "hardhat/config";
import { vars } from "hardhat/config"
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'

const PK = vars.get("PK") 

const POLYGON_RPC = vars.get("POLYGON_RPC")

 
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000,
        details: {
          yul: true,
          constantOptimizer: true,
        }
      }
    }
  },
  networks: {
    polygon: {
      url: POLYGON_RPC,
      accounts: [PK]
    },
    hardhat: {
      accounts: [
        {privateKey: PK, balance: "1000000000000000000000000"}
      ]
    },
    fantomTest: {
      url: "https://rpc.testnet.fantom.network",
      accounts: [PK] 
    },
    bnbTest: {
      url: "https://bsc-testnet-rpc.publicnode.com",
      accounts: [PK]
    },
    baseTest: {
      url: "https://sepolia.base.org",
      accounts: [PK]
    }
 }
};

export default config;

