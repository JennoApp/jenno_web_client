<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { i18n } from '$lib/i18n';
	import socket from '$lib/socket/index';
	import { setupTheme } from '$lib/theme';
	import { addIpAddress, addLocationData, location_data } from '$lib/stores/ipaddressStore';
	import { onMount } from 'svelte';

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

	$: {
		addIpAddress(data.clientAddress as string);
		// addLocationData(data.locationData as Object);
	}

	$: console.log({ locationData: $location_data });
	// $: console.log(data.locationData)

	const getLocationData = async () => {
		try {
			const response = await fetch(
				`http://api.positionstack.com/v1/reverse?access_key=e5d24e10dc3df5aff3692fa9db8665cf&query=181.61.209.148&country_module=1&limit=1`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch location data: ${response.status}`);
			}
			const data = await response.json();
      addLocationData(data)

			return data;
		} catch (error) {
			console.log('Error to get location data');
		}
	};

	onMount(() => {
    getLocationData()
    // addLocationData(locationData)
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
