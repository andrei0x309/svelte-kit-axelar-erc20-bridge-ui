import { EVMChainIds } from './chains'

const IS_PROD = true;

export const config = {
    token: 'YUP',
    isProd: IS_PROD,
    defaultSourceChain: IS_PROD ? EVMChainIds.POLYGON_MAINNET : EVMChainIds.BASE_TESTNET,
    defaultDestChain: IS_PROD ? EVMChainIds.BASE_MAINNET : EVMChainIds.FANTOM_TESTNET,
    isFaucetEnabled: true && !IS_PROD,
    isSupportLogEnabled: true && !IS_PROD,
    supportLogEndpoint: '',
    decimals: 18,
    multiTokenMode: true,
    preferedMultiTokenId: '0x2c0750c34da5c9c247905e00ab868ebd7cfca098836eea019f0d0703426eac1b',
    isMinAmountEnabled: IS_PROD && true,
    minAmount: 1,
}
