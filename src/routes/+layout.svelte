<script lang="ts">

import "$lib/sass/app.scss";
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, ImagePlaceholder, Skeleton, TextPlaceholder } from 'flowbite-svelte';
import { Footer, FooterCopyright, FooterLinkGroup, FooterLink, FooterBrand, FooterIcon, DarkMode } from 'flowbite-svelte';
import { FacebookSolid, GithubSolid, DiscordSolid, TwitterSolid } from 'flowbite-svelte-icons';
import { config } from "$lib/utils/config";
import TransferIcon from '$lib/components/icons/TransferIcon.svelte';
import Logo from '$lib/images/icons/erc20-bridge-logo.png';


</script>
  <div class="relative">
	<Navbar class="px-2 sm:px-4 py-2.5 w-full border-b dark:bg-zinc-950">
	  <NavBrand href="/">
		<img src={Logo} alt="Logo" class="w-10 h-10 pt-2 pr-2" />
		<div class="self-center whitespace-nowrap text-xl font-semibold dark:text-white flex flex-col mt-5">
			<span>ERC20 Bridge</span>
			<span class="text-[0.6rem] opacity-60 -mt-2">An axelar network community bridge</span>
		</div>
	  </NavBrand>
	  <NavHamburger />
	  <NavUl>
		<NavLi href="/" active={true}>Home</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/history">TX History</NavLi>
		<NavLi><DarkMode class="p-0" /></NavLi>
	  </NavUl>
	</Navbar>
	 
  </div>
  <div class="container mx-auto min-h-[70vh]">
  	<slot/>
	</div>
	  <Footer footerType="socialmedia" class="dark:bg-zinc-950">
		<div class="md:flex md:justify-between">
		  <div class="mb-6 md:mb-0 flex items-center justify-center">
			<TransferIcon class="ml-10 w-10 h-10 mt-4 mr-2 p-1" />
			<div class="self-center whitespace-nowrap text-[1rem] font-semibold dark:text-white flex flex-col mt-5">
				<span>ERC20 Bridge</span>
				<span class="text-[0.5rem] opacity-60 -mt-1">An axelar network community bridge</span>
			</div>
		  </div>
		  <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
			<div>
			  <h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2>
			  <FooterLinkGroup>
				<FooterLink liClass="mb-4"><a href="https://docs-erc20-bridge.flashsoft.eu">Docs</a></FooterLink>
				<FooterLink liClass="mb-4"><a href="https://github.com/andrei0x309/svelte-kit-axelar-erc20-bridge-ui">GitHub</a></FooterLink>
			  </FooterLinkGroup>
			</div>
			<div>
			  <h2 class="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">Find me on:</h2>
			  <FooterLinkGroup>
				<FooterLink liClass="mb-4"><a href="https://warpcast.com/andrei0x309">Warpcast</a></FooterLink>
				<FooterLink liClass="mb-4"><a href="https://hey.xyz/u/andrei0x309">Lens</a></FooterLink>
			  </FooterLinkGroup>
			</div>
			<div>
			  <h2 class="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">Blogs:</h2>
			  <FooterLinkGroup>
				<FooterLink liClass="mb-4" href="/"><a href="https://blog.flashsoft.eu/">Blog</a></FooterLink>
				<FooterLink liClass="mb-4" href="/"><a href="https://mirror.xyz/andrei0x309.eth">Mirror</a></FooterLink>
			  </FooterLinkGroup>
			</div>
		  </div>
		</div>
		<hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
		<div class="sm:flex sm:items-center sm:justify-between">
		  <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">Open-Source Repo: <a href="https://github.com/andrei0x309/svelte-kit-axelar-erc20-bridge-ui" rel="external" target="_blank"> svelte-kit-axelar-erc20-bridge-ui</a></span>
		  <div class="flex mt-4 space-x-6 rtl:space-x-reverse sm:justify-center sm:mt-0">
			<FooterIcon href="WIP">
			  <DiscordSolid class="w-5 h-5 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href="WIP">
			  <TwitterSolid class="w-5 h-5 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href="WIP">
			  <GithubSolid class="w-5 h-5 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
		  </div>
		</div>
	  </Footer>
	