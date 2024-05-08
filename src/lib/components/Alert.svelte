<script lang="ts">
    import { Alert } from 'flowbite-svelte';
    import { InfoCircleSolid } from 'flowbite-svelte-icons';
    import { fly } from 'svelte/transition';
    import { config } from '$lib/utils/config';

    let classVar: string = '';

    let compKey = 0;
    
    const type = {
        error: 'red',
        warning: 'yellow',
        success: 'green',
        info: 'blue',
    } as const;

    let isTxAlert = false;
    let txLink = '';
    const isProd = config.isProd;

    export let isVisibile = true;
    export { classVar as class }; 
    export let message = '';
    export let isDismissable = true;
    export let currentType: keyof typeof type = 'success';
    let isBlinking = false;


    const showMessages = (msg: string, txAlert = false, blink = false) => {
        message = msg;
        isVisibile = true;
        isTxAlert = txAlert;
        isBlinking = blink;
        isDismissable = !blink
        compKey += 1;
    }

    export const showErrorMessage = (msg: string, blink = false) => {
        currentType = 'error';
        showMessages(msg, false, blink)
    }

    export const showWarningMessage = (msg: string, blink = false) => {
        currentType = 'warning';
        showMessages(msg, false, blink)
    }

    export const showSuccessMessage = (msg: string, blink = false) => {
        currentType = 'success';
        showMessages(msg, false, blink)
    }

    export const showInfoMessage = (msg: string, blink = false) => {
        currentType = 'info';
        showMessages(msg, false, blink)
    }

    export const showTxMessage = (link: string) => {
        currentType = 'success';
        txLink = link;
        showMessages('', true, false)
    }

  </script>
  
  {#key compKey}
  {#if isVisibile}
  <Alert color={type[currentType]} dismissable={isDismissable} transition={fly} params={{ x: 200 }} class={`${classVar} ${isBlinking ? 'blink': ''}`}>
    <InfoCircleSolid slot="icon" class="w-5 h-5" />
    {#if isTxAlert}
    Your transaction was sent successful. You watch it on 
    <a rel="external" target="_blank" href={`https://${ isProd ? '': 'testnet.'}axelarscan.io/gmp/${txLink}`}>
        <u>Axelar Scan</u></a>!
    {:else}
    {message}
    {/if}
  </Alert>
  {/if}
  {/key}

 