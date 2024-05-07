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
  
  const tokenManagerAddresses = {} as Record<number, string>
  
  tokenManagerAddresses[EVMChainIds.FANTOM_TESTNET] = '0x227eC1e841501E53975Bf83411F535B29B9d07D8'
  tokenManagerAddresses[EVMChainIds.BSC_TESTNET] = '0x9F979CcAB1A7425AA45D81F5F6ce2c352dC8e91f'
  tokenManagerAddresses[EVMChainIds.BASE_TESTNET] = '0xd2cBC94CdBb72f1b4feA141d80Cff0B2136AeAE7'
  
  tokenManagerAddresses[EVMChainIds.ETHEREUM_MAINNET] = ''
  tokenManagerAddresses[EVMChainIds.POLYGON_MAINNET] = ''
  tokenManagerAddresses[EVMChainIds.BASE_MAINNET] = ''
  
  const tokenManagerSalts = {} as Record<number, string>
  
  tokenManagerSalts[EVMChainIds.FANTOM_TESTNET] = '0xe04619199c018565c704b231332aee10574a123dc1b2ab6bd8fdbfa1d8eccaa4'
  tokenManagerSalts[EVMChainIds.BSC_TESTNET] = '0x3201c3cd228580884cfb8eecb6d3142a9177c7e19abdcb25538362ba1af708b1'
  tokenManagerSalts[EVMChainIds.BASE_TESTNET] = '0x59bc95bcbab143fa03f3b0f22307bc5485e8ed2e31cb05dfaae9f55dcbae158e'
  
  tokenManagerSalts[EVMChainIds.ETHEREUM_MAINNET] = ''
  tokenManagerSalts[EVMChainIds.POLYGON_MAINNET] = ''
  tokenManagerSalts[EVMChainIds.BASE_MAINNET] = ''
  
  const tokenIds = {} as Record<number, string>
  
  tokenIds[EVMChainIds.FANTOM_TESTNET] = '0x52e8b0fcd3a12b4b18cac4c30aecd942b86dea3368ce9ffd944c62bb9439e5ca'
  tokenIds[EVMChainIds.BSC_TESTNET] = '0x486ac5a0a68ad8924f546b7df6470c7d2aed06839d71a6c7be6e20453c6056ad'
  tokenIds[EVMChainIds.BASE_TESTNET] = '0x6046a82575c2c73fac5f0f909e3436f13775ec5362330b96d577b355935f5e2d'
  
  tokenIds[EVMChainIds.ETHEREUM_MAINNET] = ''
  tokenIds[EVMChainIds.POLYGON_MAINNET] = ''
  tokenIds[EVMChainIds.BASE_MAINNET] = ''
    
  const BASE_FAUCET_TESTNET = '0xBD596d016081454D1868A86441443342a4f3D888'
  
  export  const getAddresses = () => {
      return {
          tokenAddresses,
          tokenManagerAddresses,
          tokenManagerSalts,
          tokenIds,
          BASE_FAUCET_TESTNET,
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
