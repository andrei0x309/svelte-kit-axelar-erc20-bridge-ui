<script lang="ts">
	import { config } from '$lib/utils/config';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { EVMChainIds, mainnetChains, testnetChains } from '$lib/utils/chains';
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
		getAxelarToken,
		getChainIdForAxelarChainIdent,
		getChainImage,
		getAxelarIdentForChainId,
		alexarIdentToChainId,
		getAvailableChainsForToken,
		getTokensWithExcluded,
	} from '$lib/utils/bridge';
	import { tokenAbi } from '$lib/abis/partialCustomERC20';
	// import { interchainTokenServiceContractABI } from '$lib/abis/partialInterChainTokenService';
	import { formatUnits, parseUnits } from 'viem';
	import type { historyItem } from '$lib/utils/bridge';
	import {interchainTokenServiceContractABI } from '$lib/abis/interChianTokenService';
	import AboutPage from './AboutPage.svelte';
	import HistoryPage from './LocalHistoryPage.svelte';
	import FaucetPage from './FaucetPage.svelte';
	import { get } from 'svelte/store';

	const allChains = config.isProd ? alexarIdentToChainId : testnetChains;

	const { 
		isProd, 
		isFaucetEnabled, 
		defaultDestChain, 
		defaultSourceChain, 
		isSupportLogEnabled,
		preferedMultiTokenId,
		supportLogEndpoint, 
		multiTokenMode,
		isMinAmountEnabled,
		minAmount
	} = config;

	let selectedToken = preferedMultiTokenId;
 
	let pageTitle = '';
	let isPageNotFound = false;
	let availableChains = config.isProd ? getAvailableChainsForToken(selectedToken) : testnetChains;
	let sourceChain = multiTokenMode ? getChainIdForAxelarChainIdent(getAxelarToken(selectedToken)?.chains[0]?.axelarChainId) : defaultSourceChain;
	let destChain =  multiTokenMode ? getChainIdForAxelarChainIdent(getAxelarToken(selectedToken)?.chains[1]?.axelarChainId) : defaultDestChain;
	let tokenSymbol = multiTokenMode ? getAxelarToken(selectedToken).prettySymbol : config.token;
	let decimals = multiTokenMode ? getAxelarToken(selectedToken).decimals : config.decimals;
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
		return true;
	};

	const switchSelectedToken = async (token: string) => {
		const switchTo = getChainIdForAxelarChainIdent(getAxelarToken(token)?.chains[0]?.axelarChainId)
		const needToSwitch = sourceChain !== switchTo;
		if(needToSwitch) {
			const switched = await switchSourceChain(switchTo)
			if (!switched) return;
		} 
		selectedToken = token;
		decimals = getAxelarToken(selectedToken).decimals;
		availableChains = getAvailableChainsForToken(selectedToken);
		destChain =  multiTokenMode ? getChainIdForAxelarChainIdent(getAxelarToken(selectedToken)?.chains[1]?.axelarChainId) : defaultDestChain;
		isConnected = await checkIsConnected();
		tokenSymbol = multiTokenMode ? getAxelarToken(selectedToken).prettySymbol : config.token;
		if(!needToSwitch) {
			await getBalance()
			setFocusOnInput();
		}
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
		const tokenAddress = getAxelarToken(selectedToken)?.chains.find((c) => c.axelarChainId.toLowerCase() === getAxelarIdentForChainId(chain).toLowerCase())?.tokenAddress;
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
			alert?.showErrorMessage(`Minimum amount is ${minAmount} ${tokenSymbol}`);
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
		
        const approvalNeeded = [ 'mintBurnFrom', 'lockUnlock']

		let needsApproval = false

		getAxelarToken(selectedToken).chains.forEach((chain) => {
			if (chain.axelarChainId === getAxelarIdentForChainId(sourceChain)) {
				if (approvalNeeded.includes(chain.tokenManagerType)) {
					needsApproval = true
				}
			}
		})

		try {
			if (needsApproval) {
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
			}

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
			date: new Date().toISOString(),
			tokenSvg: getAxelarToken(selectedToken).iconUrls.svg,
			tokenSymbol: getAxelarToken(selectedToken).prettySymbol,
			tokenDecimals: getAxelarToken(selectedToken).decimals
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
	<title>Bridge {tokenSymbol} - {pageTitle}</title>
	<meta name="description" content={`Bridge token ${tokenSymbol} to multiple blockchains`} />
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

					<Label class="space-y-2 flex flex-col items-center">
						<span>Select Token</span>
						<ButtonGroup class="w-full justify-center">
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:focus:ring-gray-800"
								disabled={!isConnected}
							>
								{getAxelarToken(selectedToken).prettySymbol}
								<img src={getAxelarToken(selectedToken).iconUrls.svg} alt={getAxelarToken(selectedToken).prettySymbol} class="w-6 ml-2 inline-block" />
								<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
							</Button>
							{#if isConnected}
								<Dropdown>
									{#each Object.entries(getTokensWithExcluded(selectedToken)) as [key, token]}
										<DropdownItem on:click={() => switchSelectedToken(key)}>
											{token.prettySymbol}
											<img src={token.iconUrls.svg} alt={token.prettySymbol} class="w-6 ml-2 inline-block" />
										</DropdownItem>
									{/each}
								</Dropdown>
							{/if}
						</ButtonGroup>
					</Label>

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
							<span>{formatNumber(balance)} <span class="text-[1rem]">{tokenSymbol}</span></span>
							{#if !isConnected}
								<span class="text-[0.65rem] opacity-75 -mt-2">Wallet not connected</span>
							{/if}
						</div>
					</div>
					<Label class="space-y-2">
						<span>Source Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput
								placeholder={`${'amount'} ${tokenSymbol}`}
								bind:value={transferAmount}
								id="source-input"
							/>
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:focus:ring-gray-800"
								disabled={!isConnected}
							>
								{availableChains[sourceChain]}
								<img src={getChainImage(getAxelarIdentForChainId(sourceChain))} alt={getAxelarIdentForChainId(sourceChain)} class="w-6 ml-2 inline-block" />
								<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
							</Button>
							{#if isConnected}
								<Dropdown>
									{#each Object.keys(availableChains).filter((c) => Number(c) !== destChain && Number(c) !== sourceChain) as chain}
										<DropdownItem on:click={() => switchSourceChain(Number(chain))}>
											{availableChains[Number(chain)]}
											<img src={getChainImage(getAxelarIdentForChainId(Number(chain)))} alt={getAxelarIdentForChainId(Number(chain))} class="w-6 ml-2 inline-block" />
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
								placeholder={`${'amount'} ${tokenSymbol}`}
								bind:value={transferAmount}
							/>
							<Button
								color="none"
								class="flex-shrink-0 text-[0.85rem] text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:focus:ring-gray-800"
								disabled={!isConnected}
							>
								{availableChains[destChain]}
								<img src={getChainImage(getAxelarIdentForChainId(destChain))} alt={getAxelarIdentForChainId(destChain)} class="w-6 ml-2 inline-block" />
								<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
							</Button>
							{#if isConnected}
								<Dropdown>
									{#each Object.keys(availableChains).filter((c) => Number(c) !== destChain && Number(c) !== sourceChain) as chain}
										<DropdownItem on:click={() => switchDestChain(Number(chain))}>
											{availableChains[Number(chain)]}
											<img src={getChainImage(getAxelarIdentForChainId(Number(chain)))} alt={getAxelarIdentForChainId(Number(chain))} class="w-6 ml-2 inline-block" />
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
							>Bridge {tokenSymbol}</Button
						>
					{/if}

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
				<AboutPage/>
		
			{:else if history.length === 0}
				<Alert
					isDismissable={false}
					isVisibile={true}
					message="No history found"
					currentType="info"
				/>
			{:else}
			<HistoryPage history={history} isProd={isProd} availableChains={availableChains} />
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
