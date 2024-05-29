# svelte-kit-axelar-bridge-erc20

<img src="/src/lib/images/icons/erc20-bridge-logo.png" width="100" height="100" alt="alt text">

Svelte Kit UI app to bridge ERC20 to multiple chains using Axelar Network for custom non-canonical tokens.

This is a community maintained project.

Supports testnet and mainnet envoirment, by editing the config file, supports any custom non-canonical, non-warped ERC20 token,
also has faucet functionality when is configured to use a faucet contract in development mode.

It supports multiple tokens mode, in this mode will be deployed, that will allow public use, and will use a list of tokens from the Axelar Network.
It also supports single token mode, in case you want to use a single token, and you can configure that in the config file.

Has sample for faucet contract, and non-canonical ERC20 token, and also has a sample package for Axelar scripts to deploy token managers and bridge tokens using the Axelar Network, and UI for the faucet.

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

## Screenshot

![image](/repo_res/screen_thumb.webp)

Full size screenshots: [here](/repo_res/screen_full.webp)

## Video

[https://youtu.be/80ZMnkxlqDs](https://youtu.be/80ZMnkxlqDs)

### License

[MIT](LICENSE)
