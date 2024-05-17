<script lang="ts">
	import { config } from '$lib/utils/config';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { EVMChainIds, mainnetChains, testnetChains } from '$lib/utils/chains';
	import { ChainIcons } from '$lib/components/icons/chains';
	import {
		Card,
		Button,
		Label,
		NumberInput,
		Checkbox,
		ButtonGroup,
		Dropdown,
		DropdownItem,
		Tabs,
		TabItem,
	} from 'flowbite-svelte';

	import { routes } from '$lib/utils/routes';
	import { page } from '$app/stores';
	import TransferIcon from '$lib/components/icons/TransferIcon.svelte';
	import HistoryIcon from '$lib/components/icons/HistoryIcon.svelte';
	import FaucetIcon from '$lib/components/icons/FaucetIcon.svelte';
	import { onMount } from 'svelte';
	import {
		tryToGetAddressWithoutPrompt,
		web3Libs,
		prepareForTransaction,
		checkNetwork,
		tryToGetChainIdWithoutPrompt
	} from '$lib/utils/wallet';
	import { pushState, goto } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import PageNotFound from '$lib/components/PageNotFound.svelte';
	import {
		getHistory,
		addHistory,
		getAddresses,
		formatNumber,
		gasEstimator,
		axelarChainIdents,
		interchainTokenServiceContractAddress,
		logtoEndpoint,
		getAxelarToken
	} from '$lib/utils/bridge';
	import { tokenAbi } from '$lib/abis/partialCustomERC20';
	// import { interchainTokenServiceContractABI } from '$lib/abis/partialInterChainTokenService';
	import { formatUnits, parseUnits } from 'viem';
	import type { historyItem } from '$lib/utils/bridge';
	import { faucetERC20ABI } from '$lib/abis/partialFaucetERC20';
	import {interchainTokenServiceContractABI } from '$lib/abis/interChianTokenService';

	const allChains = { ...mainnetChains, ...testnetChains };
	const availableChains = config.isProd ? mainnetChains : testnetChains;
	const { 
		isProd, 
		isFaucetEnabled, 
		defaultDestChain, 
		defaultSourceChain, 
		isSupportLogEnabled,
		preferedMultiTokenId,
		token, 
		supportLogEndpoint, 
		decimals, 
		multiTokenMode,
		isMinAmountEnabled,
		minAmount
	} = config;

	let pageTitle = '';
	let isPageNotFound = false;
	let sourceChain = multiTokenMode ? getAxelarToken(preferedMultiTokenId)?.chains[0]?. defaultSourceChain
	let destChain = defaultDestChain;
	let isConnected = false;
	let isBaseTestnet = sourceChain === EVMChainIds.BASE_TESTNET;
	const Web3Libs = web3Libs();
	let alert: Alert | null = null;
	let isActive = '/';
	let loading = false;
	let faucetLoading = false;
	let isLoadingBalance = false;
	let address = '' as string | null;
	let wasAccountSubscribed = false;
	let history = [] as historyItem[];

	let balance = 0;
	let faucetBalance = 0;
	let faucetRefreshBalanceTimeout = 0;
	let transferAmount = 0;

	$: pageTitle = routes[$page.url.pathname as keyof typeof routes] || 'Page Not Found';
	$: isPageNotFound = pageTitle === 'Page Not Found';

	const checkIsConnected = async () => {
		address = await tryToGetAddressWithoutPrompt({
			localWeb3Libs: Web3Libs
		});

		const chainId = await tryToGetChainIdWithoutPrompt({
			localWeb3Libs: Web3Libs
		});
		isConnected = !!address && chainId === sourceChain;
		isBaseTestnet = !!address && chainId === EVMChainIds.BASE_TESTNET;
		return isConnected;
	};

	const setFocusOnInput = () => {
		document.getElementById('source-input')?.focus?.();
	};

	const switchSourceChain = async (chain: number) => {
		if (chain === sourceChain) return;
		if (loading) return;
		loading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs,
			stackAlertWarning: alert?.showWarningMessage
		});

		wgamiLib = await checkNetwork({
			switchTo: chain,
			wgamiLib
		});
		if (!wgamiLib) {
			alert?.showInfoMessage('User rejected switch network');
			setFocusOnInput();
			loading = false;
			return;
		}
		await getBalance(chain);
		sourceChain = chain;
		setFocusOnInput();
		loading = false;
	};

	const switchDestChain = async (chain: number) => {
		if (chain === destChain) return;
		if (loading) return;
		loading = true;
		destChain = chain;
		setFocusOnInput();
		loading = false;
	};

	const getBalance = async (chain = sourceChain) => {
		if (isLoadingBalance) return;
		isLoadingBalance = true;
		const addresses = getAddresses();
		const tokenAddress = addresses.tokenAddresses[chain];
		const tokenAddressFaucet = addresses.tokenAddresses[EVMChainIds.BASE_TESTNET];
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs		
		});
		if (!wgamiLib) {
			isLoadingBalance = false;
			return;
		}
		const a = await wgamiLib?.wgamiCore?.reconnect(wgamiLib.wgConfig.wagmiConfig);
		if (!wasAccountSubscribed && a?.[0]?.connector) {
			(
				(await a[0].connector.getProvider()) as { on: (li: string, af: (ac: string[]) => {}) => {} }
			).on('accountsChanged', async (accounts: string[]) => {
				if (!faucetLoading && !loading) {
					getBalance();
				}
			});
			(
				(await a[0].connector.getProvider()) as {
					on: (li: string, af: (chain: string) => {}) => {};
				}
			).on('chainChanged', async (chainId: string) => {
				if (!faucetLoading && !loading) {
					getBalance();
					sourceChain = Number(chainId);
				}
			});
			wasAccountSubscribed = true;
		}

		const address = (await wgamiLib.wgamiCore.getAccount(wgamiLib.wgConfig.wagmiConfig)).address;

		if (isConnected) {
			try {
				const chainBalance = (await wgamiLib.wgamiCore.readContract(wgamiLib.wgConfig.wagmiConfig, {
					abi: tokenAbi,
					address: tokenAddress as `0x${string}`,
					functionName: 'balanceOf',
					args: [address]
				})) as null | bigint;

				balance = Number(formatUnits(chainBalance ? chainBalance : 0n, decimals));
				console.log('balance', balance);
			} catch (error) {
				// ignore
			}
		}

		if (isBaseTestnet) {
			try {
				const faucetChainBalance = (await wgamiLib.wgamiCore.readContract(
					wgamiLib.wgConfig.wagmiConfig,
					{
						abi: tokenAbi,
						address: tokenAddressFaucet as `0x${string}`,
						functionName: 'balanceOf',
						args: [address]
					}
				)) as null | bigint;

				faucetBalance = Number(formatUnits(faucetChainBalance ? faucetChainBalance : 0n, decimals));
			} catch {
				// ignore
			}
		}

		isLoadingBalance = false;
		return true;
	};

	onMount(async () => {
		history = getHistory();
		await checkIsConnected();
		if (isConnected) {
			getBalance(sourceChain);
		} else if (isBaseTestnet) {
			getBalance(EVMChainIds.BASE_TESTNET);
		}
	});

	const connectWallet = async () => {
		loading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs
		});
		if (!wgamiLib) {
			loading = false;
			return;
		}
		wgamiLib = await checkNetwork({
			wgamiLib,
			stackAlertWarning: alert?.showWarningMessage,
			switchTo: sourceChain
		});
		if (!wgamiLib) {
			alert?.showInfoMessage('User rejected switch network');
			loading = false;
			return;
		}
		isConnected = await checkIsConnected();
		if (!isConnected) {
			alert?.showErrorMessage('Unable to connect wallet');
		}
		loading = false;

		if (isConnected) {
			await getBalance();
		}
	};

	const execBridge = async () => {
		if (!isConnected) {
			alert?.showErrorMessage('Please connect wallet');
			return;
		}
		if (isMinAmountEnabled && (transferAmount < minAmount)) {
			alert?.showErrorMessage(`Minimum amount is ${minAmount} ${token}`);
			return;
		}
		if (transferAmount > balance) {
			alert?.showErrorMessage(`Transfer amount exceeds available balance`);
			return;
		}
		if (sourceChain === destChain) {
			alert?.showErrorMessage('Source and destination chain cannot be the same');
			return;
		}
		if (loading) return;
		loading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs,
			stackAlertWarning: alert?.showWarningMessage
		});
		if (!wgamiLib) {
			loading = false;
			return;
		}
		wgamiLib = await checkNetwork({
			wgamiLib,
			stackAlertWarning: alert?.showWarningMessage,
			switchTo: sourceChain
		});
		if (!wgamiLib) {
			loading = false;
			return;
		}
		const value = await gasEstimator(sourceChain, destChain, alert?.showErrorMessage ?? (() => {}));
		const addresses = getAddresses();
		const TOKEN_ID = addresses.tokenIds[isProd ? 'production': 'development'];
		const alexarChainId = axelarChainIdents[destChain];
		const address = (await wgamiLib.wgamiCore.getAccount(wgamiLib.wgConfig.wagmiConfig)).address;

		let tx: Awaited<ReturnType<typeof wgamiLib.wgamiCore.writeContract>> | null = null;

		try {

			alert?.showInfoMessage('Waiting for approve transaction to be confirmed', true);

			const approveTx = await wgamiLib.wgamiCore.writeContract(wgamiLib.wgConfig.wagmiConfig, {
				abi: tokenAbi,
				address: addresses.tokenAddresses[sourceChain] as `0x${string}`,
				functionName: 'approve',
				args: [interchainTokenServiceContractAddress as `0x${string}`, parseUnits(transferAmount.toString(), decimals)]
			});

			const reciept = await wgamiLib.wgamiCore.waitForTransactionReceipt(wgamiLib.wgConfig.wagmiConfig, {
				confirmations: 2,
				hash: approveTx,
				chainId: sourceChain
			})

			if (!reciept) {
				alert?.showErrorMessage('Approve transaction failed');
				loading = false;
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));

			tx = await wgamiLib.wgamiCore.writeContract(wgamiLib.wgConfig.wagmiConfig, {
				abi: interchainTokenServiceContractABI,
				address: interchainTokenServiceContractAddress as `0x${string}`,
				functionName: 'interchainTransfer',
				args: [TOKEN_ID, alexarChainId, address, parseUnits(transferAmount.toString(), decimals), '0x', BigInt(value as string)],
				value: BigInt(value as string)
			});
		} catch (txError) {
			console.error(txError);
			const strErr = String(txError);
			if(strErr.includes('User rejected')) {
				alert?.showErrorMessage('User rejected transaction');
				loading = false;
				return;
			}
		}

		if (!tx) {
			alert?.showErrorMessage('Transaction failed');
			loading = false;
			return;
		}

		addHistory({
			sourceChain,
			destChain,
			amount: transferAmount.toFixed(4),
			tx,
			date: new Date().toISOString()
		});

		if (isSupportLogEnabled && supportLogEndpoint !== '') {
			logtoEndpoint({
				sourceChain,
				destChain,
				amount: transferAmount,
				tx,
				address: address || "",
				sourceChainIdent: axelarChainIdents[sourceChain],
				destChainIdent: axelarChainIdents[destChain]
			});
		}

		balance -= transferAmount;
		transferAmount = 0;
		history = getHistory();
		alert?.showTxMessage(tx);
		loading = false;
	};

	const shallowNavigate = (url: string) => {
		if ($page.url.pathname !== url) {
			goto(url);
		}
		if (url === isActive) return;
		isActive = url;
		pushState(url, { replace: true });
	};
</script>

<svelte:head>
	<title>Bridge {token} - {pageTitle}</title>
	<meta name="description" content={`Bridge token ${token} to multiple blockchains`} />
</svelte:head>

<Tabs
	tabStyle="underline"
	defaultClass="flex flex-wrap space-x-2 rtl:space-x-reverse justify-center"
	contentClass="p-4 bg-gray-50 rounded-lg dark:bg-zinc-900 mt-4"
>
	<TabItem
		open={$page.url.pathname === '/' || isActive === '/' || isPageNotFound}
		on:click={() => shallowNavigate('/')}
	>
		<div slot="title" class="flex items-center gap-">
			<TransferIcon class="w-6 h-6 mr-2" />
			Bridge
		</div>

		{#if isPageNotFound}
			<PageNotFound class="mx-auto dark:bg-zinc-950" />
		{:else}
			<Alert bind:this={alert} isVisibile={false} class="mb-4 max-w-96 mx-auto dark:bg-zinc-950" />

			<Card class={`mx-auto dark:bg-zinc-950 ${loading ? 'blink' : ''}`}>
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
						<div class={`w-1/2 text-right flex flex-col ${isLoadingBalance ? 'blink' : ''} ${!isConnected ? 'opacity-50' : ''}`}>
							<span>{formatNumber(balance)} <span class="text-[1rem]">{token}</span></span>
							{#if !isConnected}
								<span class="text-[0.65rem] opacity-75 -mt-2">Wallet not connected</span>
							{/if}
						</div>
					</div>
					<Label class="space-y-2">
						<span>Source Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput
								placeholder={`${'amount'} ${token}`}
								bind:value={transferAmount}
								id="source-input"
							/>
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:focus:ring-gray-800"
								disabled={!isConnected}
							>
								{availableChains[sourceChain]}
								<svelte:component this={ChainIcons[sourceChain]} class="w-6 ml-2" />
								<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
							</Button>
							{#if isConnected}
								<Dropdown>
									{#each Object.keys(availableChains).filter((c) => Number(c) !== destChain && Number(c) !== sourceChain) as chain}
										<DropdownItem on:click={() => switchSourceChain(Number(chain))}>
											{allChains[Number(chain)]}
											<svelte:component this={ChainIcons[Number(chain)]} class="w-6 ml-2 inline" />
										</DropdownItem>
									{/each}
								</Dropdown>
							{/if}
						</ButtonGroup>
					</Label>
					<Label class="space-y-2">
						<span>Destination Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput
								disabled
								placeholder={`${'amount'} ${token}`}
								bind:value={transferAmount}
							/>
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:focus:ring-gray-800"
								disabled={!isConnected}
							>
								{availableChains[destChain]}
								<svelte:component this={ChainIcons[destChain]} class="w-6 ml-2" />
								<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
							</Button>
							{#if isConnected}
								<Dropdown>
									{#each Object.keys(availableChains).filter((c) => Number(c) !== destChain && Number(c) !== sourceChain) as chain}
										<DropdownItem on:click={() => switchDestChain(Number(chain))}>
											{allChains[Number(chain)]}
											<svelte:component this={ChainIcons[Number(chain)]} class="w-6 ml-2 inline" />
										</DropdownItem>
									{/each}
								</Dropdown>
							{/if}
						</ButtonGroup>
					</Label>
					<div class="flex items-start">
						<Checkbox checked>Store TX history</Checkbox>
					</div>
					{#if !isConnected}
						<Button type="button" class="w-full" on:click={() => connectWallet()}
							>Connect Wallet</Button
						>
					{:else}
						<Button type="button" class="w-full" on:click={() => execBridge()}
							>Bridge {token}</Button
						>
					{/if}

					<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
					WIP<a
							href="WIP"
							rel="extrenal"
							class="text-primary-700 hover:underline dark:text-primary-500"
						>
							WIP
						</a>
					</div>
				</form>
			</Card>
		{/if}
	</TabItem>
	<TabItem
		open={$page.url.pathname === '/history' ||
			isActive == '/history' ||
			$page.url.pathname === '/about'}
		on:click={() => shallowNavigate('/history')}
	>
		<div slot="title" class="flex items-center gap-2">
			<HistoryIcon class="w-6 h-6" />
			History
		</div>
		
		<Card class="mx-auto dark:bg-zinc-950 max-w-4xl">
			{#if $page.url.pathname === '/about'}
				
		
			{:else if history.length === 0}
				<Alert
					isDismissable={false}
					isVisibile={true}
					message="No history found"
					currentType="info"
				/>
			{:else}

			{/if}
		</Card>

	</TabItem>

	{#if isFaucetEnabled}
		<TabItem
			open={$page.url.pathname === '/faucet' || isActive === '/faucet'}
			on:click={() => shallowNavigate('/faucet')}
		>
			<div slot="title" class="flex items-center gap- -ml-3">
				<FaucetIcon class="w-6 h-6 mr-2" />
				Faucet
			</div>

			
		</TabItem>
	{/if}
</Tabs>

<style lang="scss">
</style>
