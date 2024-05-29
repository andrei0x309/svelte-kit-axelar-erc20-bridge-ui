<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
	} from 'flowbite-svelte';
    import type { historyItem } from '$lib/utils/bridge';
    import {
		formatNumber,
        getChainImage,
		getAxelarIdentForChainId,
	} from '$lib/utils/bridge';

	export let history = [] as historyItem[];
    export let availableChains = {} as Record<number, string>
    export let isProd = true;


</script>


<Table hoverable={true}>
    <TableHead>
        <TableHeadCell>Date</TableHeadCell>
        <TableHeadCell>Source Chian</TableHeadCell>
        <TableHeadCell>Destination Chain</TableHeadCell>
        <TableHeadCell>Amount</TableHeadCell>
        <TableHeadCell>Token</TableHeadCell>
        <TableHeadCell>View Tx</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
        {#each history as item}
            <TableBodyRow>
                <TableBodyCell>{item.date}</TableBodyCell>
                <TableBodyCell
                
                    >
                    <img src={getChainImage(getAxelarIdentForChainId(item.sourceChain))} alt={getAxelarIdentForChainId(item.sourceChain)} class="w-6 ml-2" />
                    {availableChains[Number(item.sourceChain)]}</TableBodyCell
                >
                <TableBodyCell
                    >
                    <img src={getChainImage(getAxelarIdentForChainId(item.destChain))} alt={getAxelarIdentForChainId(item.destChain)} class="w-6 ml-2" />
                    {availableChains[Number(item.destChain)]}</TableBodyCell
                >
                <TableBodyCell>{formatNumber(Number(item.amount))}</TableBodyCell>
                <TableBodyCell>								{item.tokenSymbol}
                    <img src={item.tokenSvg} alt={item.tokenSymbol} class="w-6 ml-2 inline-block" /></TableBodyCell>
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