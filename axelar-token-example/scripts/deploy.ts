import { ethers, upgrades } from "hardhat";
import { getAddresses } from "./utils/addresses";
import { EVMChainIds } from "./utils/chains";


const test = process.env.IS_TEST === 'true'
const isFantom = process.env.IS_FANTOM === 'true'
const isBsc = process.env.IS_BSC === 'true'
const isBase = process.env.IS_BASE === 'true'

const { tokenAddresses, owner, BASE_FAUCET_TESTNET } = getAddresses()

export const deployOrUpdateTokenSample = async (token: string) => {

    const args = [owner]
    
    const Contract = await ethers.getContractFactory("TokenSample");
  
    let status = "deployed"
    


    const existing = token && await ethers.getContractAt("TokenSample", token) || null
    let contractAddress = token
 
  
    if (!existing) {
      const contract = await upgrades.deployProxy(Contract, args, {
        initializer: 'initialize',
        kind: 'uups'
      });
    
      contractAddress = await contract.getAddress()

    } else {
      upgrades.upgradeProxy(existing, Contract)
      status = "upgraded"
      contractAddress = token
    }
    
    console.log(
      `Contract [ TokenSample ] [${status}] to: ${contractAddress}`
    );
  }


  export const deployOrUpdateTestnetFaucet = async () => {

    const maxValidity = 60 * 10 // 10 minutes
    const token = tokenAddresses[EVMChainIds.BASE_TESTNET]

    const args = [owner, token, maxValidity]
    
    const Contract = await ethers.getContractFactory("FaucetERC20");
    
    const faucet = BASE_FAUCET_TESTNET

    let status = "deployed"
    
    const existing = faucet && await ethers.getContractAt("FaucetERC20", faucet) || null
    let contractAddress = faucet
 
  
    if (!existing) {
      const contract = await upgrades.deployProxy(Contract, args, {
        initializer: 'initialize',
        kind: 'uups'
      });
    
      contractAddress = await contract.getAddress()

    } else {
      upgrades.upgradeProxy(existing, Contract)
      status = "upgraded"
      contractAddress = faucet
    }
    
    console.log(
      `Contract [ FaucetERC20 ] [${status}] to: ${contractAddress}`
    );
  }

async function main() {
  console.log("Deploying contracts..., test: ", test, " isFantom: ", isFantom)

  if (isFantom) {
    await deployOrUpdateTokenSample(tokenAddresses[EVMChainIds.FANTOM_TESTNET])
  } else if (isBsc) {
    await deployOrUpdateTokenSample(tokenAddresses[EVMChainIds.BSC_TESTNET])
  } else if (isBase) {
    await deployOrUpdateTokenSample(tokenAddresses[EVMChainIds.BASE_TESTNET])
  } else {
    console.log("Invalid network")
  }

  deployOrUpdateTestnetFaucet()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
