import type { Config } from 'tailwindcss';
import flowbite from 'flowbite/plugin';

const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	plugins: [flowbite],
	theme: {
	  extend: {
		colors: {
		  // flowbite-svelte
			//   primary: {
			// 	50: '#FFF5F2',
			// 	100: '#FFF1EE',
			// 	200: '#FFE4DE',
			// 	300: '#FFD5CC',
			// 	400: '#FFBCAD',
			// 	500: '#FE795D',
			// 	600: '#EF562F',
			// 	700: '#EB4F27',
			// 	800: '#CC4522',
			// 	900: '#A5371B'
			//   }
		  // Zinc
		  primary: {"50":"#fafafa","100":"#f4f4f5","200":"#e4e4e7","300":"#d4d4d8","400":"#a1a1aa","500":"#71717a","600":"#52525b","700":"#3f3f46","800":"#27272a","900":"#18181b"}
		}
	  }
	}
  } satisfies Config;

export default config;