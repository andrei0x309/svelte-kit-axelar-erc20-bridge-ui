/* eslint-disable @typescript-eslint/no-explicit-any */
export type TWeb3Libs = ReturnType<typeof web3Libs>

export const metadata = {
  name: 'ERC20 Axelar Bridge',
  description: 'ERC20 Axelar Community Bridge',
  url: 'https://erc20-bridge.pages.dev/',
  icons: ['data:image/png;base64,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']
}

const PROJECT_ID = "429ee43bc6c9131be0de66427d64a9e6";

let createConfig: Awaited<ReturnType<typeof web3Libs>['wgamiCore']>['createConfig']
// let coinBaseConnector: Awaited<ReturnType<typeof web3Libs>['CoinbaseWalletConnector']>['CoinbaseWalletConnector']
type TwgConfig = {
    wagmiConfig: ReturnType<typeof createConfig>
    web3Modal: Awaited<ReturnType<typeof web3Libs>['web3ModalWagmi']>
    wgamiC: Awaited<ReturnType<typeof web3Libs>['wgamiCore']>
    chains: Awaited<ReturnType<typeof web3Libs>['wgamiChains']>
} | null

let wgConfig: TwgConfig = null

export const getConfig = async (localWeb3Libs: ReturnType<typeof web3Libs>, neededChains?: any[]) => {

    if (wgConfig && !neededChains) {
        return wgConfig
    }

    const { web3ModalWagmi, wgamiCore, wgamiChains } = localWeb3Libs
    const [web3Modal, wgamiC, chainsLib] = await Promise.all([web3ModalWagmi, wgamiCore, wgamiChains])
    const { defaultWagmiConfig } = web3Modal

    const allChainsArr = Object.values(chainsLib) as any

    const chains = (neededChains || allChainsArr) as any
    const enableCoinbase = true


    const wagmiConfig = defaultWagmiConfig({
        projectId: PROJECT_ID,
        chains,
        enableCoinbase,
        enableInjected: true,
        enableWalletConnect: true,
        enableEIP6963: true,
        enableEmail: false,
        metadata
    })

    wgConfig = {
        wagmiConfig,
        web3Modal,
        wgamiC,
        chains: allChainsArr,
    }

    return wgConfig

}

export const web3Libs = () => {
    return {
        web3ModalWagmi: import('@web3modal/wagmi'),
        wgamiCore: import("@wagmi/core"),
        wgamiChains: import("@wagmi/core/chains"),
    }
}
 
export const tryToGetAddressWithoutPrompt = async ({
    localWeb3Libs
}: {
        localWeb3Libs: ReturnType<typeof web3Libs>
    }) => {

    const wgConfig = await getConfig(localWeb3Libs)

    const { getAccount, reconnect } = wgConfig.wgamiC
    const { wagmiConfig } = wgConfig

    await reconnect(wagmiConfig)
    return (await getAccount(wagmiConfig)).address || null
}

export const tryToGetChainIdWithoutPrompt = async ({
    localWeb3Libs
}: {
        localWeb3Libs: ReturnType<typeof web3Libs>
    }) => {

    const wgConfig = await getConfig(localWeb3Libs)

    const { getChainId, reconnect } = wgConfig.wgamiC
    const { wagmiConfig } = wgConfig

    await reconnect(wagmiConfig)
    return (await getChainId(wagmiConfig)) || null
}

export const prepareForTransaction = async ({
    stackAlertWarning,
    localWeb3Libs,
    neededChains
}: {
    stackAlertWarning?: (msg: string) => void,
        localWeb3Libs: ReturnType<typeof web3Libs>,
        neededChains?: any[]
    }, clean = false) => {

    const wgConfig = await getConfig(localWeb3Libs, neededChains)

    if (clean) {
        try {
            const { disconnect, reconnect } = wgConfig.wgamiC
            const { wagmiConfig } = wgConfig
            await reconnect(wagmiConfig)
            await disconnect(wagmiConfig)
        } catch {
            // do nothing
        }
    }

    const { createWeb3Modal, } = wgConfig.web3Modal
    const { wagmiConfig } = wgConfig
    const wgamiCoreLib = wgConfig.wgamiC

    await wgamiCoreLib.reconnect(wagmiConfig)
    let conn = await wgamiCoreLib.getAccount(wagmiConfig)

    if (conn.isConnected) {
        return {
            wgamiCore: wgamiCoreLib,
            wgConfig
        }
    }

    const web3Modal = createWeb3Modal({
        wagmiConfig,
        projectId: PROJECT_ID, 
        themeMode: 'dark',
    })

    if (web3Modal) {
        if (!conn?.isConnected) {
            await web3Modal.open()
            const modalStateProm = new Promise((resolve) => {
                const unsub = web3Modal.subscribeEvents((event: { data: { event: string }, timestamp: number }) => {
                    const eventType = event.data.event
                    if (eventType === 'CONNECT_SUCCESS' || eventType === 'MODAL_CLOSE' || eventType === 'CONNECT_ERROR') {
                        resolve(event)
                        unsub()
                        if (eventType === 'CONNECT_ERROR') {
                            web3Modal.close()
                        }
                    }
                })
            })
            await modalStateProm
            conn = await wgamiCoreLib.getAccount(wagmiConfig)
            if (!conn.isConnected) {
                stackAlertWarning && stackAlertWarning('User closed connect modal.')
                return false
            }
        }
        await wgamiCoreLib.reconnect(wagmiConfig)
        return {
            wgamiCore: wgamiCoreLib,
            wgConfig,
            web3Modal
        }
    } else {
        stackAlertWarning && stackAlertWarning('Web3 Instance is null.')
        return false
    }
}

export const checkNetwork = async ({ wgamiLib, stackAlertWarning, switchTo }:
    {
        wgamiLib: Awaited<ReturnType<typeof prepareForTransaction>>
        stackAlertWarning?: (msg: string) => void,
        switchTo?: number
    }) => {
    try {
    if (!wgamiLib) {
        return false
    }
    if (!switchTo) {
        switchTo = 137
    }

    let chainId = await wgamiLib.wgamiCore.getChainId(wgamiLib.wgConfig.wagmiConfig)
    let newWgami = null
    if (chainId !== switchTo) {
        if (!wgamiLib.wgConfig.wagmiConfig.chains.find((c: any) => c.chainId === switchTo)) {
            const newChain = Object.values(wgamiLib.wgConfig.chains).find((c: any) => c.id === switchTo)
            if (!newChain) {
                stackAlertWarning && stackAlertWarning('TX uses an unknown chain')
                return false
            }
            const neededChains = [...wgamiLib.wgConfig.wagmiConfig.chains, newChain]
            newWgami = await prepareForTransaction({ stackAlertWarning, localWeb3Libs: web3Libs(), neededChains }) as typeof wgamiLib
            if (!newWgami) {
                stackAlertWarning && stackAlertWarning('Failed to intialize new chain')
                return false
            }
            wgamiLib = newWgami
        }
        await wgamiLib.wgamiCore.switchChain(wgamiLib.wgConfig.wagmiConfig, { chainId: switchTo })
        chainId = await wgamiLib.wgamiCore.getChainId(wgamiLib.wgConfig.wagmiConfig)
        if (chainId !== switchTo) {
            let network = 'Polygon'
            switch (switchTo) {
                case 1:
                    network = 'Ethereum'
                    break
                case 56:
                    network = 'Binance Smart Chain'
                    break
                case 10:
                    network = 'Optimism'
                    break
                case 7777777:
                    network = 'Zora'
                    break
                case 8453:
                    network = 'Base'
                    break
                case 42161:
                    network = 'Arbitrum'
                    break
                case 100:
                    network = 'xDai'
                    break
                case 84532:
                    network = 'Base (testnet)'
                    break
                default:
                    network = 'ID: ' + switchTo
                    break
            }

            stackAlertWarning && stackAlertWarning('You need to be on ' + network + ' network')
            return false
        }
    }
    return (newWgami ? newWgami : wgamiLib) as typeof wgamiLib
    } catch  {
    return false
    }
}
