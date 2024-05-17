<script lang="ts">
	import {
		Card,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Heading,
		P,
		A 
	} from 'flowbite-svelte';
    import Alert from '$lib/components/Alert.svelte';

    export let page;
    export let token;


</script>


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