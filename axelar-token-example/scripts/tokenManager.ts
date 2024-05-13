/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AxelarQueryAPI,
    Environment,
    EvmChain,
    GasToken,
  } from "@axelar-network/axelarjs-sdk"

import crypto from "crypto";
  
import {interchainTokenServiceContractABI} from "../abis/interchainTokenServiceABI" 
import  { tokenAbi } from "../abis/tokenAbi"
import { getAddresses } from "./utils/addresses";
import { EVMChainIds } from "./utils/chains";
import { ethers } from "hardhat";

export const MINT_BURN = 4;
export const MINT_BURN_FROM = 1;
  
  const interchainTokenServiceContractAddress =
    "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
  
  const test = process.env.IS_TEST === 'true'

  
  const { 
    owner,
    tokenAddresses,
    tokenIds,
    tokenManagerAddresses,
    tokenManagerSalts
   } = getAddresses()


  const fantomToken = tokenAddresses[EVMChainIds.FANTOM_TESTNET]
  const bnbToken = tokenAddresses[EVMChainIds.BSC_TESTNET]
  const baseToken = tokenAddresses[EVMChainIds.BASE_TESTNET]

  if (!fantomToken || !bnbToken || !baseToken) {
    throw new Error("Token addresses not found")
  }

  const api = new AxelarQueryAPI({ environment: !test ? Environment.MAINNET : Environment.TESTNET });

  export const gasTokens = {
      [EVMChainIds.FANTOM_TESTNET]: GasToken.FTM,
      [EVMChainIds.BSC_TESTNET]: GasToken.BINANCE,
      [EVMChainIds.BASE_TESTNET]: GasToken.BASE,
      [EVMChainIds.ETHEREUM_MAINNET]: GasToken.ETH,
      [EVMChainIds.POLYGON_MAINNET]: GasToken.MATIC,
      [EVMChainIds.BASE_MAINNET]: GasToken.BASE,
  }
  
  export const axelarChainIdents = {
      [EVMChainIds.FANTOM_TESTNET]: "Fantom",
      [EVMChainIds.BSC_TESTNET]: EvmChain.BINANCE,
      [EVMChainIds.BASE_TESTNET]: 'base-sepolia',
      [EVMChainIds.ETHEREUM_MAINNET]: EvmChain.ETHEREUM,
      [EVMChainIds.POLYGON_MAINNET]: EvmChain.POLYGON,
      [EVMChainIds.BASE_MAINNET]: EvmChain.BASE,
  }
  
  export async function gasEstimator(sourceChain: number, destChain: number) {    
     const sourceChainIdent = axelarChainIdents[sourceChain];
     const destChainIdent = axelarChainIdents[destChain];
  
    const gas = await api.estimateGasFee(
      sourceChainIdent,
      destChainIdent,
      790000
    );
  
    return gas;
  }
  

  async function getSigner() {
    const [signer] = await ethers.getSigners();
    return signer;
  }

  async function getContractInstance(contractAddress: string, contractABI: any, signer: any) {
    return new ethers.Contract(contractAddress, contractABI, signer);
  }

export async function deployTokenManager(sourceChain: number, salt: string = '') {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );

  if(!salt) {
    salt = '0x' + crypto.randomBytes(32).toString('hex');
  }

  const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder();

  const params = defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, tokenAddresses[sourceChain]]
  );

  // Deploy the token manager
  const deployTxData = await interchainTokenServiceContract.deployTokenManager(
    salt,
    "",
    MINT_BURN_FROM,
    params,
    ethers.parseEther("0.01")
  );

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    salt
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  console.log(
    `
	Salt: ${salt},
	Transaction Hash: ${deployTxData.hash},
	Token ID: ${tokenId},
	Expected token manager address: ${expectedTokenManagerAddress},
	`
  );
}

export async function deployRemoteTokenManager(chainId: number, destChainId: number) {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );

  const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder();

  const params = defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, tokenAddresses[destChainId]]
  );

  const gasAmount = await gasEstimator(chainId, destChainId);

  const gasPrice = await ethers.provider.getFeeData();
  const gasPriceValue = (gasPrice.gasPrice ??  0n) + ((gasPrice.gasPrice ?? 0n) / 30n)

  
  let deployTxData: any;
  console.log("Deploying token manager, chainId: ", chainId, "destChainId: ", destChainId, "destChainIdent: ", axelarChainIdents[destChainId], "gasAmount: ", gasAmount, "gasPriceValue: ", gasPriceValue)

  try {
  // Deploy the token manager
  deployTxData = await interchainTokenServiceContract.deployTokenManager(
    tokenManagerSalts[chainId], // change salt
    axelarChainIdents[destChainId],
    MINT_BURN,
    params,
    gasPriceValue,
    {
      value: gasAmount,
    }
  );

} catch (error: any) {
  // console.log("Error deploying token manager: ", error)
  console.log(interchainTokenServiceContract.interface.parseError(error.data))
  return;
}

  console.log("Deploying token manager...");

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    tokenManagerSalts[chainId]
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  console.log(
    `
	Transaction Hash: ${deployTxData.hash},
	Token ID: ${tokenId},
	Expected token manager address: ${expectedTokenManagerAddress},
	`
  );
}

async function transferMintAccessToTokenManager(token: string, production = false) {
  // Get a signer to sign the transaction
  const signer = await getSigner();
  console.info("Add Role: token: ", token, "production: ", production, "tokenManagerAddress: ", tokenManagerAddresses[production ? 'production' : 'development'])

  const tokenContract = await getContractInstance(
    token,
    tokenAbi,
    signer
  );

  // Get the minter role
  const getMinterRole = await tokenContract.MINTER_ROLE();

  const grantRoleTxn = await tokenContract.grantRole(
    getMinterRole,
    tokenManagerAddresses[production ? 'production' : 'development']
  );

  console.log("grantRoleTxn: ", grantRoleTxn.hash);
}


export async function transferTokens(chainId: number, destChainId: number) {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );
  const gasAmount = await gasEstimator(chainId, destChainId);
  let transfer: any;
  try {
  transfer = await interchainTokenServiceContract.interchainTransfer(
    tokenIds[EVMChainIds.FANTOM_TESTNET],
    axelarChainIdents[destChainId],
    owner,
    ethers.parseEther("100"), 
    "0x",
    gasAmount,
    {
      // Transaction options should be passed here as an object
      value: '0x',
    }
  );
  } catch (error: any) {
    console.log(interchainTokenServiceContract.interface.parseError(error.data))
  }

  console.log("Transfer Transaction Hash:", transfer.hash);
}

transferMintAccessToTokenManager(baseToken).then(() => {
  console.log("Done");
});

