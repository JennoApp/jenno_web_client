<script lang="ts">

  import "../app.css"  
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
	import { setLanguageTag } from '$paraglide/runtime';
	import { goto, invalidateAll } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
  import { page } from '$app/stores'

	// onMount(() => {
  //   socket.on("connect", () => {
  //     console.log("Successful connect to socket")
  //   })
  // })

  let locationAccessKey: string
  async function getLocationAccessKey() {
    try {
      const response = await fetch(`/api/location`)
      const data = await response.json()

      locationAccessKey = data.accessKey 
    } catch (error) {
      console.error('Error al solicitar el location access key')
    }
  }

  // $: getLocationAccessKey()

	$: {
		setupTheme();
	}

	export let data;

	$: setLanguageTag(data.locale);

	// current language
	// $: console.log(data.serverLang);

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


	const getLocationData = async (ip: string, access_key: string) => {
		try {
			const response = await fetch(
				`https://api.positionstack.com/v1/reverse?access_key=${access_key}&query=${ip}&country_module=1&limit=1`
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

	onMount(async () => {
		if (!storedLocationData || storedIp !== data.clientAddress) {
			addIpAddress(data.clientAddress as string);

      await getLocationAccessKey()
      if (locationAccessKey) {
        await getLocationData(data.clientAddress as string, locationAccessKey);
      }	
		} else {
			console.log('Using stored location data', storedLocationData);
		}

    invalidateAll()
	});

	// onMount(() => {
	// 	if ($location_data) {
	// 		if ($location_data.data[0].country_module.flag === 'co') {
	// 			setLanguageTag('es');
	// 			goto('/es');
	// 		}
	// 	}
	// });
</script>

<svelte:head>
	<title>Jenno</title>
  <meta name="description" content="ShopIn es la mejor red social de comercio electrónico donde puedes comprar y vender productos de manera fácil y segura.">

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

  <!-- Open graph -->
   <meta property="og:title" content="ShopIn">
   <meta property="og:description" content="ShopIn es la mejor red social de comercio electrónico donde puedes comprar y vender productos de manera fácil y segura.">
   <meta property="og:type" content="website">
   <meta property="og:site_name" content="ShopIn">
   <meta property="og:url" content={$page.url.href}>
</svelte:head>


<Toaster richColors theme="dark" duration={3000} />
<Navigation>
	<slot />
</Navigation>

