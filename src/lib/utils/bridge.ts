import { EVMChainIds } from './chains'
import { config } from './config'
import {
    AxelarQueryAPI,
    Environment,
    EvmChain,
    GasToken,
  } from "@axelar-network/axelarjs-sdk"
  
  const tokenAddresses = {} as Record<number, string>

  tokenAddresses[EVMChainIds.FANTOM_TESTNET] = '0x4C4F0334D7ACE843D920258ce26cFd02afD15b94'
  tokenAddresses[EVMChainIds.BSC_TESTNET] = '0x4C4F0334D7ACE843D920258ce26cFd02afD15b94'
  tokenAddresses[EVMChainIds.BASE_TESTNET] = '0x04AE18EE0961990f4e013dC918eed163F7fbBE07'
  
  tokenAddresses[EVMChainIds.ETHEREUM_MAINNET] = '0x69bBC3F8787d573F1BBDd0a5f40C7bA0Aee9BCC9'
  tokenAddresses[EVMChainIds.POLYGON_MAINNET] = '0x086373fad3447F7F86252fb59d56107e9E0FaaFa'
  tokenAddresses[EVMChainIds.BASE_MAINNET] = ''
  
  const tokenManagerAddresses = {} as Record<string, string>
  
  tokenManagerAddresses['development'] = '0xF9d3D15c33Fe77B94eE4F9bC217191E7D57e7b87'
  tokenManagerAddresses['production'] = ''
  
  const tokenManagerSalts = {} as Record<string, string>
  
  tokenManagerSalts['development'] = '0xd47e19710f67ab242ddd31c57049ea859d9c535601016be0f4b722dbd8c2257f'
  tokenManagerSalts['production'] = ''
  
  
  const tokenIds = {} as Record<string, string>
  
  tokenIds['development'] = '0xe11612130815cb08186e03a7a1a62812684322b1150036f8eee10eaa8f8a6366'
  tokenIds['production'] = ''
  
  const owner = "0x01Ca6f13E48fC5E231351bA38e7E51A1a7835d8D";
  
  const BASE_FAUCET_TESTNET = '0xBD596d016081454D1868A86441443342a4f3D888'
  
  export  const getAddresses = () => {
      return {
          tokenAddresses,
          tokenManagerAddresses,
          tokenManagerSalts,
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
    [EVMChainIds.BSC_TESTNET]: EvmChain.BINANCE,
    [EVMChainIds.BASE_TESTNET]: 'base-sepolia',
    [EVMChainIds.ETHEREUM_MAINNET]: EvmChain.ETHEREUM,
    [EVMChainIds.POLYGON_MAINNET]: EvmChain.POLYGON,
    [EVMChainIds.BASE_MAINNET]: EvmChain.BASE,
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
