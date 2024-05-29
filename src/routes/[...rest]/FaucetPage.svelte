<script lang="ts">
	import {
		Card,
		Button,
		Label,
		NumberInput,
		ButtonGroup,
	} from 'flowbite-svelte';
	import {
		getAddresses,
		formatNumber,
	} from '$lib/utils/bridge';
    import Alert from '$lib/components/Alert.svelte';
	import { faucetERC20ABI } from '$lib/abis/partialFaucetERC20';
	import {
		prepareForTransaction,
		checkNetwork,
	} from '$lib/utils/wallet';
	import { EVMChainIds } from '$lib/utils/chains';
	import { ChainIcons } from '$lib/components/icons/chains';

	export let token;
	export let isBaseTestnet
	export let Web3Libs
	export let checkIsConnected
	export let sourceChain
	export let getBalance
	export let address
	export let availableChains = {} as Record<number, string>;
	export let isLoadingBalance = false;
	export let transferAmount = 0;
	


    let faucetAlert: Alert | null = null;
	export let faucetBalance = 0;
	let faucetRefreshBalanceTimeout = 0;
	export let faucetLoading = false;

    const connectBase = async () => {
		if (faucetLoading) return;
		faucetLoading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs,
			stackAlertWarning: faucetAlert?.showWarningMessage
		});
		if (!wgamiLib) {
			faucetAlert?.showErrorMessage('Unable to connect wallet');
			faucetLoading = false;
			return;
		}
		wgamiLib = await checkNetwork({
			wgamiLib,
			stackAlertWarning: faucetAlert?.showWarningMessage,
			switchTo: EVMChainIds.BASE_TESTNET
		});
		if (!wgamiLib) {
			faucetAlert?.showErrorMessage('User rejected switch network');
			faucetLoading = false;
			return;
		}
		await checkIsConnected();

		if (isBaseTestnet) {
			sourceChain = EVMChainIds.BASE_TESTNET;
		} else {
			faucetAlert?.showErrorMessage('Unable to connect wallet');
		}
		faucetLoading = false;

		if (isBaseTestnet) {
			await getBalance(EVMChainIds.BASE_TESTNET);
		}
	};

    const execFaucet = async () => {
		if (!isBaseTestnet) {
			faucetAlert?.showErrorMessage('Please connect wallet');
			return;
		}
		if (faucetLoading) return;
		faucetLoading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs,
			stackAlertWarning: faucetAlert?.showWarningMessage
		});
		if (!wgamiLib) {
			faucetLoading = false;
			return;
		}
		wgamiLib = await checkNetwork({
			wgamiLib,
			stackAlertWarning: faucetAlert?.showWarningMessage,
			switchTo: EVMChainIds.BASE_TESTNET
		});
		if (!wgamiLib) {
			faucetLoading = false;
			faucetAlert?.showErrorMessage('User rejected switch network');
			return;
		}
		sourceChain = EVMChainIds.BASE_TESTNET;

		const addresses = getAddresses();
		let tx: Awaited<ReturnType<typeof wgamiLib.wgamiCore.writeContract>> | null = null;
		try {
			console.log('faucet', addresses.BASE_FAUCET_TESTNET, sourceChain);

			tx = await wgamiLib.wgamiCore.writeContract(wgamiLib.wgConfig.wagmiConfig, {
				abi: faucetERC20ABI,
				address: addresses.BASE_FAUCET_TESTNET as `0x${string}`,
				functionName: 'faucet'
			});
		} catch (txError) {
			console.error(txError);
			if (String(txError).includes('Claim executed to recently')) {
				const strErr = String(txError);
				const errPart = strErr.split('reason:')[1] || '';
				const err = errPart.split('another claim')[0] + 'another claim';
				faucetAlert?.showErrorMessage(err);
				faucetLoading = false;
				return;
			}
		}

		if (!tx) {
			faucetAlert?.showErrorMessage('Transaction failed');
			faucetLoading = false;
			return;
		}

		transferAmount = 0;
		faucetRefreshBalanceTimeout = 6;
		const interval = setInterval(async () => {
			faucetAlert?.showSuccessMessage(
				'You got test tokens, refreshing balance in ' + faucetRefreshBalanceTimeout + ' seconds'
			);
			faucetRefreshBalanceTimeout--;
			if (faucetRefreshBalanceTimeout === 0) {
				clearInterval(interval);
				faucetAlert?.showSuccessMessage('Refreshing balance...');
				await getBalance(EVMChainIds.BASE_TESTNET);
				setTimeout(() => {
					faucetAlert?.showSuccessMessage('Balance refreshed');
				}, 100);
			}
		}, 1000);

		faucetLoading = false;
	};

</script>


<Alert
				bind:this={faucetAlert}
				isVisibile={false}
				class="mb-4 max-w-96 mx-auto dark:bg-zinc-950"
			/>

			<Alert
				class="mx-auto dark:bg-zinc-950 mb-1 max-w-96"
				isDismissable={false}
				isVisibile={true}
				message="Use this to get test tokens only enabled when in development envoirment!"
				currentType="info"
			/>

			<Alert
				class="mx-auto dark:bg-zinc-950 mb-2 max-w-96"
				isDismissable={false}
				isVisibile={true}
				message="Faucet contract allows only 1 TX per 10 minutes!!!"
				currentType="warning"
			/>

			<Card class={`mx-auto dark:bg-zinc-950 ${faucetLoading ? 'blink' : ''}`}>
				<form class="flex flex-col space-y-6" action="/">
					<div class="flex justify-between text-xl font-medium text-gray-900 dark:text-white">
						<div class="w-1/2 flex flex-col">
							<span>Available</span>
							{#if address}
								<span class="text-[0.65rem] opacity-75 -mt-2"
									>Account: {address.slice(0, 6) + '...' + address.slice(-3)}</span
								>
							{/if}
						</div>
						<div class={`w-1/2 text-right ${isLoadingBalance ? 'blink' : ''}`}>
							{formatNumber(faucetBalance)} <span class="text-[1rem]">{token}</span>
						</div>
					</div>
					<Label class="space-y-2">
						<span>Source Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput value={5000} disabled />
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white  hover:cursor-default focus:ring-gray-300 dark:bg-zinc-900  dark:focus:ring-gray-800"
							>
								{availableChains[EVMChainIds.BASE_TESTNET]}
								<svelte:component this={ChainIcons[EVMChainIds.BASE_TESTNET]} class="w-6 ml-2" />
							</Button>
						</ButtonGroup>
					</Label>
					<Label class="space-y-2">
						<span>Destination Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput value={5000} disabled />
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:cursor-default focus:ring-gray-300 dark:bg-zinc-900 dark:focus:ring-gray-800"
							>
								{availableChains[EVMChainIds.BASE_TESTNET]}
								<svelte:component this={ChainIcons[EVMChainIds.BASE_TESTNET]} class="w-6 ml-2" />
							</Button>
						</ButtonGroup>
					</Label>
					{#if !isBaseTestnet}
						<Button type="button" class="w-full" on:click={() => connectBase()}
							>Connect Wallet</Button
						>
					{:else}
						<Button type="button" class="w-full" on:click={() => execFaucet()}
							>Get TestNet {token}</Button
						>
					{/if}

					<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
						Want an Yup account? <a
							href="https://app.yup.io/"
							rel="extrenal"
							class="text-primary-700 hover:underline dark:text-primary-500"
						>
							Create account
						</a>
					</div>
				</form>
			</Card>