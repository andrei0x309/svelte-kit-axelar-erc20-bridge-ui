import { EVMChainIds } from './chains'

const IS_PROD = false;

export const config = {
    token: 'YUP',
    isProd: IS_PROD,
    defaultSourceChain: IS_PROD ? EVMChainIds.POLYGON_MAINNET : EVMChainIds.BASE_TESTNET,
    defaultDestChain: IS_PROD ? EVMChainIds.BASE_MAINNET : EVMChainIds.FANTOM_TESTNET,
    isFaucetEnabled: true && !IS_PROD,
}