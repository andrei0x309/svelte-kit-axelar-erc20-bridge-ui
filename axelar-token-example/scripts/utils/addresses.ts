import { EVMChainIds } from './chains'

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