
<script lang="ts">
	import {
		Heading,
		P,
		A 
	} from 'flowbite-svelte';

    export let token;


</script>

<Heading  tag="h2" customSize="text-2xl font-extrabold mb-4">svelte-kit-axelar-bridge-erc20</Heading>
<P class="mb-8">This a <A href="https://github.com/andrei0x309/svelte-kit-axelar-erc20-bridge-ui">open-source</A> community maintained UI for the Axelar Network bridge for ERC20 tokens.</P>
<P class="mb-4">Current configured token symbol: <b>{token}</b></P>
<P class="mb-4">Project is a Svelte Kit UI app to bridge ERC20 to multiple chains using Axelar Network for custom non-canonical tokens.</P>
<P class="mb-4">Supports testnet and mainnet envoirment, by editing the config file, supports any custom non-canonical, non-warped ERC20 token, also has faucet functionality when is configured to use a faucet contract in development mode.</P>
<P class="mb-4">For faucet contract, token sample contract and Axelar Network scripts to deploy token managers you can check this repository</P>
<P class="mb-4">This instance is deployed at: erc20-bridge.pages.dev</P>

<Heading  tag="h2" customSize="text-2xl font-extrabold my-4">Tech stack</Heading>

<ul>
    <li>Svelte Kit</li>
    <li>Tailwind CSS</li>
    <li>Flowbite Svelte</li>
    <li>Axelar SDK</li>
    <li>Wagmi SDK</li>
    <li>Web3Modal with all wallets enabeled incuding Coinbase Wallet</li>
    <li>Viem</li>
    <li>Vite</li>
</ul>