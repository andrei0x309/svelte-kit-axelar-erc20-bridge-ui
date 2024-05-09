import { config } from '$lib/utils/config';
import { logtoEndpoint } from '$lib/utils/bridge';

export const testLogEndpoint = async () => {
    if(config.isSupportLogEnabled) {
        console.log('Support log enabled:', config.supportLogEndpoint);
        logtoEndpoint({
            sourceChain:1,
            destChain: 137,
            amount: 200,
            tx: '0x1be9dde46e9b9139e6bd6b6c67f87f8128c15ef7a05783a17cf8d945f4ee5f25',
            address: '0x50cca5ed8b4455fbe316785269fc82500b67fd48',
            sourceChainIdent: 'Ethereum',
            destChainIdent: 'Polygon'
        });

    } else {
        console.log('Support log disabled');
        return;
    }
}