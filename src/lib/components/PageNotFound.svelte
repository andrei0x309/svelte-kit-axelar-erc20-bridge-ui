<script lang="ts">
import { Card } from 'flowbite-svelte';
import { routes } from '$lib/utils/routes';

let classVar: string = '';
export { classVar as class };

const routesKeys = Object.keys(routes) as Array<keyof typeof routes>;

</script>


<Card class={classVar}>
    <h1 class="text-2xl font-bold">Page Not Found - 404</h1>
    <p class="text-gray-500">The page you are looking for does not exist.</p>

    <h3 class="text-lg font-semibold mt-6">Available Pages</h3>
    <ul class="list-disc list-inside">
        {#each routesKeys as route}
            <li><a href={route}>{routes[route]}</a></li>
        {/each}
    </ul>

</Card>