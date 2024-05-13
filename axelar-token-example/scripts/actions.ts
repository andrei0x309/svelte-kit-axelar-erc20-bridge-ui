import { ethers } from "hardhat";
import { EVMChainIds } from "./utils/chains";
import { getAddresses } from "./utils/addresses";

const { tokenAddresses, owner, BASE_FAUCET_TESTNET } = getAddresses()

const MINT_AMOUNT = 5000;
const FAUCET_AMOUNT = 5000 * 1e3;

export const mintSample = async (address: string = owner, isFaucet = false) => {
      
     const Contract = await ethers.getContractFactory("TokenSample");
      
     
     // check if contract is already deployed
     const existing = tokenAddresses[EVMChainIds.BASE_TESTNET] && await ethers.getContractAt("TokenSample", tokenAddresses[EVMChainIds.BASE_TESTNET]) || null
     const contractAddress = tokenAddresses[EVMChainIds.BASE_TESTNET]
      
     if (!existing) {
        console.log("Contract TokenSample not deployed")
        return
     } 
      
        const contract = await Contract.attach(contractAddress)

        let mintAmount = MINT_AMOUNT

        if (isFaucet) {
            mintAmount = FAUCET_AMOUNT
            address = BASE_FAUCET_TESTNET
        }

        const mintArgs =  [address, ethers.parseEther(mintAmount.toString())]
        console.log("Minting...")

        const tx = await contract.mint(...mintArgs)

        console.log("Minted!, tx: ", tx.hash)
    
}

async function main() {
    await mintSample(owner, true)
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  