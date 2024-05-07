# svelte-kit-axelar-bridge-erc20

<img src="/src/lib/images/icons/erc20-bridge-logo.png" width="100" height="100" alt="alt text">

Svelte Kit UI app to bridge ERC20 to multiple chains using Axelar Network for custom non-canonical tokens.

Supports testnet and mainnet envoirment, by editing the config file, supports any custom non-canonical, non-warped ERC20 token,
also has faucet functionality when is configured to use a faucet contract in development mode.

It will support more advanced features like two modes, single mode for a single token, in case someone wants to deploy a bridge for a single token.
And all tokens mode, in this mode will be deployed, that will allow public use.
The token list will be automatically updated by a worker, that will fetch the tokens from the Axelar Network.

This project will be realeased publicly on this timeline: [BUILD_ROADMAP.MD](/BUILD_ROADMAP.MD)

## Tech stack

- Svelte Kit
- Tailwind CSS
- Flowbite Svelte
- Axelar SDK
- Wagmi SDK
- Web3Modal with all wallets enabeled incuding Coinbase Wallet
- Viem
- Vite

## Screenshots (WIP)

<!-- ![image](/repo_res/screen_thumb.webp)

Full size screenshots: [here](/repo_res/screen_full.webp) -->

### License

[MIT](LICENSE)
