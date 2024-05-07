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
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
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
		interchainTokenServiceContractAddress
	} from '$lib/utils/bridge';
	import { tokenAbi } from '$lib/abis/partialCustomERC20';
	import { interchainTokenServiceContractABI } from '$lib/abis/partialInterChainTokenService';
	import { formatEther, parseEther } from 'viem';
	import type { historyItem } from '$lib/utils/bridge';
	import { faucetERC20ABI } from '$lib/abis/partialFaucetERC20';
	import {interchainTokenServiceContractABI as fullInterchainTokenServiceContractABI } from '$lib/abis/interChianTokenService';

	const allChains = { ...mainnetChains, ...testnetChains };
	const availableChains = config.isProd ? mainnetChains : testnetChains;
	const minAmount = 25;
	const isProd = config.isProd;
	const isFaucetEnabled = config.isFaucetEnabled;

	let pageTitle = '';
	let isPageNotFound = false;
	let sourceChain = config.defaultSourceChain;
	let destChain = config.defaultDestChain;
	let isConnected = false;
	let isBaseTestnet = sourceChain === EVMChainIds.BASE_TESTNET;
	const Web3Libs = web3Libs();
	let alert: Alert | null = null;
	let faucetAlert: Alert | null = null;
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

				balance = Number(formatEther(chainBalance ? chainBalance : 0n));
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

				faucetBalance = Number(formatEther(faucetChainBalance ? faucetChainBalance : 0n));
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

	const connectBase = async () => {
		if (faucetLoading) return;
		faucetLoading = true;
		let wgamiLib = await prepareForTransaction({
			localWeb3Libs: Web3Libs,
			stackAlertWarning: faucetAlert?.showWarningMessage
		});
		if (!wgamiLib) {
			faucetAlert?.showErrorMessage('Unable to connect wallet');
			loading = false;
			return;
		}
		wgamiLib = await checkNetwork({
			wgamiLib,
			stackAlertWarning: alert?.showWarningMessage,
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

	const execBridge = async () => {
		if (!isConnected) {
			alert?.showErrorMessage('Please connect wallet');
			return;
		}
		if (transferAmount < minAmount) {
			alert?.showErrorMessage(`Minimum amount is ${minAmount} ${config.token}`);
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
		const value = await gasEstimator(sourceChain, destChain, alert?.showErrorMessage ?? (() => {}))
		const addresses = getAddresses();
		const TOKEN_ID = addresses.tokenIds[sourceChain];
		const alexarChainId = axelarChainIdents[destChain];
		const address = (await wgamiLib.wgamiCore.getAccount(wgamiLib.wgConfig.wagmiConfig)).address;

		let tx: Awaited<ReturnType<typeof wgamiLib.wgamiCore.writeContract>> | null = null;

		try {
			tx = await wgamiLib.wgamiCore.writeContract(wgamiLib.wgConfig.wagmiConfig, {
				abi: fullInterchainTokenServiceContractABI,
				address: interchainTokenServiceContractAddress as `0x${string}`,
				functionName: 'interchainTransfer',
				args: [TOKEN_ID, alexarChainId, address, parseEther(transferAmount.toString()), '0x', value]
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

		balance -= transferAmount;
		transferAmount = 0;
		history = getHistory();
		alert?.showTxMessage(tx);
		loading = false;
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
	<title>Bridge {config.token} - {pageTitle}</title>
	<meta name="description" content={`Bridge token ${config.token} to multiple blockchains`} />
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
						<div class={`w-1/2 text-right ${isLoadingBalance ? 'blink' : ''}`}>
							{formatNumber(balance)} <span class="text-[1rem]">{config.token}</span>
						</div>
					</div>
					<Label class="space-y-2">
						<span>Source Chain</span>
						<ButtonGroup class="w-full">
							<NumberInput
								placeholder={`${'amount'} ${config.token}`}
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
								placeholder={`${'amount'} ${config.token}`}
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
							>Bridge {config.token}</Button
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
				<p>Info not availabe yet.</p>
			{:else if history.length === 0}
				<Alert
					isDismissable={false}
					isVisibile={true}
					message="No history found"
					currentType="info"
				/>
			{:else}
				<Table hoverable={true}>
					<TableHead>
						<TableHeadCell>Date</TableHeadCell>
						<TableHeadCell>Source Chian</TableHeadCell>
						<TableHeadCell>Destination Chain</TableHeadCell>
						<TableHeadCell>Amount</TableHeadCell>
						<TableHeadCell>View Tx</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each history as item}
							<TableBodyRow>
								<TableBodyCell>{item.date}</TableBodyCell>
								<TableBodyCell
									><svelte:component
										this={ChainIcons[Number(item.sourceChain)]}
										class="w-6 ml-2 inline"
									/>
									{allChains[Number(item.sourceChain)]}</TableBodyCell
								>
								<TableBodyCell
									><svelte:component
										this={ChainIcons[Number(item.destChain)]}
										class="w-6 ml-2 inline"
									/>
									{allChains[Number(item.destChain)]}</TableBodyCell
								>
								<TableBodyCell>{formatNumber(Number(item.amount))}</TableBodyCell>
								<TableBodyCell>
									<a
										href={`https://${isProd ? '' : 'testnet.'}axelarscan.io/gmp/${item.tx}`}
										rel="extrenal"
										target="blank"
										class="font-medium text-primary-600 hover:underline dark:text-primary-500"
										>View</a
									>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
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
							{formatNumber(faucetBalance)} <span class="text-[1rem]">{config.token}</span>
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
							>Get TestNet {config.token}</Button
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
		</TabItem>
	{/if}
</Tabs>

<style lang="scss">
</style>
