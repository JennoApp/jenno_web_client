<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import socket from '$lib/socket/index';
	import { setupTheme } from '$lib/theme';
	import {
		addIpAddress,
		addLocationData,
		ip_address,
		location_data
	} from '$lib/stores/ipaddressStore';
	import { onMount } from 'svelte';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	/*onMount(() => {
    socket.on("connect", () => {
      console.log("Successful connect to socket")
    })
  })*/

	injectSpeedInsights();

	$: {
		setupTheme();
	}

	export let data;

	let storedIp: string | null = null;
	let storedLocationData: any | null = null;

	// Recuperar los datos del store
	$: {
		ip_address.subscribe((value) => {
			storedIp = value;
		});

		location_data.subscribe((value) => {
			storedLocationData = value;
		});
	}

	// const storedIp = $ip_address
	// let storedLocationData = $location_data

	// $: {
	// 	addIpAddress(data.clientAddress as string);
	// 	// addLocationData(data.locationData as Object);
	// }

	$: console.log({ locationData: $location_data });
	// $: console.log(data.locationData)

	const getLocationData = async (ip: string) => {
		try {
			const response = await fetch(
				`http://api.positionstack.com/v1/reverse?access_key=e5d24e10dc3df5aff3692fa9db8665cf&query=181.61.209.148&country_module=1&limit=1`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch location data: ${response.status}`);
			}
			const data = await response.json();
			addLocationData(data);

			return data;
		} catch (error) {
			console.log('Error to get location data');
		}
	};

	// $: if (!storedLocationData || storedIp !== data.clientAddress) {
	//     getLocationData(data.clientAddress as string)

	//   // if (!storedLocationData || storedIp !== data.clientAddress) {
	//     // getLocationData(data.clientAddress as string)
	//   // }
	//   // addLocationData(locationData)
	// }

	onMount(() => {
		if (!storedLocationData || storedIp !== data.clientAddress) {
			addIpAddress(data.clientAddress as string);
			getLocationData(data.clientAddress as string);
		} else {
			console.log('Using stored location data', storedLocationData);
		}
	});
</script>

<svelte:head>
	<script>
		// Immediately set the theme based on localStorage before the page renders
		(function () {
			const theme = localStorage.getItem('theme') || 'system';
			if (
				theme === 'dark' ||
				(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		})();
	</script>
</svelte:head>

<ParaglideJS {i18n}>
	<Toaster richColors theme="dark" duration={3000} />
	<Navigation>
		<slot />
	</Navigation>
</ParaglideJS>
