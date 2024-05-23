import { EVMChainIds } from './chains'
import { config } from './config'
import {
    AxelarQueryAPI,
    Environment,
    GasToken,
  } from "@axelar-network/axelarjs-sdk"

import AXELAR_TOKENS from '../alexar-data/tokens.json'
  
  const tokenAddresses = {} as Record<number, string>

  tokenAddresses[EVMChainIds.FANTOM_TESTNET] = '0x4C4F0334D7ACE843D920258ce26cFd02afD15b94'
  tokenAddresses[EVMChainIds.BSC_TESTNET] = '0x4C4F0334D7ACE843D920258ce26cFd02afD15b94'
  tokenAddresses[EVMChainIds.BASE_TESTNET] = '0x04AE18EE0961990f4e013dC918eed163F7fbBE07'
  
  tokenAddresses[EVMChainIds.ETHEREUM_MAINNET] = '0x69bBC3F8787d573F1BBDd0a5f40C7bA0Aee9BCC9'
  tokenAddresses[EVMChainIds.POLYGON_MAINNET] = '0x086373fad3447F7F86252fb59d56107e9E0FaaFa'
  tokenAddresses[EVMChainIds.BASE_MAINNET] = '0x01CCF4941298a0b5AC4714c0E1799a2dF8387048'
  
  const tokenManagerAddresses = {} as Record<string, string>
  
  tokenManagerAddresses['development'] = '0xF9d3D15c33Fe77B94eE4F9bC217191E7D57e7b87'
  tokenManagerAddresses['production'] = '0x479F48155da401A5AfE9B7C8aB0a1Aa3775A30Cb'
  
  const tokenIds = {} as Record<string, string>
  
  tokenIds['development'] = '0xe11612130815cb08186e03a7a1a62812684322b1150036f8eee10eaa8f8a6366'
  tokenIds['production'] = '0x2c0750c34da5c9c247905e00ab868ebd7cfca098836eea019f0d0703426eac1b'
  
  const owner = "0x01Ca6f13E48fC5E231351bA38e7E51A1a7835d8D";
  
  const BASE_FAUCET_TESTNET = '0xBD596d016081454D1868A86441443342a4f3D888'

  export const chainIdToAxelarChainIdent = {
    "arbitrum": 42161,
    "Avalanche": 43114,
    "base": 8453,
    "binance": 56,
    "blast": 238,
    "carbon": 9790,
    "celo": 42220,
    "centrifuge": 2031,
    "Ethereum": 1,
    "evmos": 9001,
    "Fantom": 250,
    "filecoin": 314,
    "fraxtal": 252,
    "haqq": 11235,
    "immutable": 13371,
    "kava": 2222,
    "linea": 59144,
    "mantle": 5000,
    "Moonbeam": 1284,
    "optimism": 10,
    "Polygon": 137,
    "polygon-zkevm": 1101,
    "rebus": 1011,
    "xpla": 37
  }

  const getAlexarIdentToChainId = () => {
    const alexarIdentToChainId = {} as Record<number, string>
      for (const key in chainIdToAxelarChainIdent) {
           alexarIdentToChainId[chainIdToAxelarChainIdent[key as keyof typeof chainIdToAxelarChainIdent]] = key
      }
      return alexarIdentToChainId
 }

export const alexarIdentToChainId = getAlexarIdentToChainId()

export const getAxelarIdentForChainId = (chainId: number) => {
    return alexarIdentToChainId[chainId]
}

  export  const getAddresses = () => {
      return {
          tokenAddresses,
          tokenManagerAddresses,
          tokenIds,
          BASE_FAUCET_TESTNET,
          owner
      }
  }

export const interchainTokenServiceContractAddress = "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C"
  
const api = new AxelarQueryAPI({ environment: config.isProd ? Environment.MAINNET : Environment.TESTNET });

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
    [EVMChainIds.BSC_TESTNET]: 'binance',
    [EVMChainIds.BASE_TESTNET]: 'base-sepolia',
    [EVMChainIds.ETHEREUM_MAINNET]: "Ethereum",
    [EVMChainIds.POLYGON_MAINNET]: "Polygon",
    [EVMChainIds.BASE_MAINNET]: "base",
}

export async function gasEstimator(sourceChain: number, destChain: number, warning: (mgs: string) => void) {    
   const sourceChainIdent = axelarChainIdents[sourceChain];
   const destChainIdent = axelarChainIdents[destChain];
        try {
        return await api.estimateGasFee(
            sourceChainIdent,
            destChainIdent,
            790000
        );
        } catch {
            warning('Failed to estimate gas fee using Axelar API(probably API down). Using hardcoded value.');
            return 700000n;
        }
}


 export type historyItem = {
    tx: string,
    date: string,
    sourceChain: number,
    destChain: number,
    amount: string,
}

export const getChainImage = (chainName: string) => {
    return `https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/chains/${chainName}.svg`
}

export const getAxelarTokensDisplayData = () => {
    const tokens = AXELAR_TOKENS.tokens
    const tokensDisplayData = {} as Record<string, {prettySymbol: string, svg: string, chainNum: number}>
    for (const tokenKey of Object.keys(tokens)) {
        const token = tokens[tokenKey as keyof typeof tokens]
        tokensDisplayData[tokenKey] = {
            svg:token.iconUrls.svg,
            prettySymbol: token.prettySymbol,
            chainNum: token.chains.length
        }
    }
}

export const getChainIdForAxelarChainIdent = (chainIdent: string) => {
    if (chainIdent in chainIdToAxelarChainIdent) {
        return chainIdToAxelarChainIdent[chainIdent as keyof typeof chainIdToAxelarChainIdent]
    }
    return 0
}


export const getAxelarToken = (tokenId: string) => {
    const tokens = AXELAR_TOKENS.tokens
    return tokens[tokenId as keyof typeof tokens]
}

export const formatNumber = (num: number, digits = 4) => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: digits
    }).format(num)
  }

export const getHistory = () => {
    const historyKey = config.isProd ? 'history' : 'history-testnet';
    const history = localStorage.getItem(historyKey) || '';
    let historyStore: historyItem[] = [];
    if (!history) {
        localStorage.setItem(JSON.stringify(historyStore), history);
    }
    try {
        historyStore = JSON.parse(history);
        if(typeof historyStore === 'string') {
            historyStore = JSON.parse(historyStore);
        }
        if (!Array.isArray(historyStore)) {
            return [] as historyItem[];
        }
        if(!historyStore.every((item: historyItem) => item.tx && item.date && item.sourceChain && item.destChain && item.amount)) {
            return [] as historyItem[];
        }
        if (historyStore.length > 70) {
            historyStore = historyStore.slice(0, 70);
            localStorage.setItem(historyKey, JSON.stringify(history));
            return historyStore
        }
        return historyStore
    }
    catch {
        return [] as historyItem[];
    }
}

export const addHistory = (item: historyItem) => {
    const history = getHistory();
    if (!item.tx || !item.date || !item.sourceChain || !item.destChain || !item.amount) {
        return history;
    }
    const historyKey = config.isProd ? 'history' : 'history-testnet';
    history.unshift(item);
    localStorage.setItem(historyKey, JSON.stringify(history));
    return history;
}

export const logtoEndpoint = async (
    {address, amount, sourceChain, destChain, tx, sourceChainIdent, destChainIdent}:
    {
    address: string,
    amount: number,
    sourceChain: number,
    destChain: number,
    tx: string,
    sourceChainIdent: string,
    destChainIdent: string,
}) => {

    const dbData = {
        address,
        amount,
        source_chain_id:sourceChain,
        dest_chain_id:destChain,
        tx,
        source_chain_name:sourceChainIdent,
        dest_chain_name:destChainIdent
    }

    try {
       await fetch(config.supportLogEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbData)
        });
    } catch {
        console.error('Support log failed');
    }
}