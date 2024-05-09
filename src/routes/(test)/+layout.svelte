<script lang="ts">
	import { config } from '$lib/utils/config';
    import { testLogEndpoint } from '$lib/utils/test';
    import { onMount } from 'svelte';
    
    onMount(() => {
        if(config.isProd) {
            console.log('Testing Endpoint not available in Production');
            return;
        }
        testLogEndpoint();
    });
    
</script>
    
{#if config.isProd}
    <h1>Testing Endpoint not available in Production</h1>
{:else}
    <h1>Check Console for your test</h1>
{/if}

<slot/>