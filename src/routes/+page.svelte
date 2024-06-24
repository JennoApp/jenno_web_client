<script lang="ts">
	import type { PageServerData, RequestEvent } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';
	import { location_data } from '$lib/stores/ipaddressStore';
	import { goto } from '$app/navigation';

	export let data: PageServerData;
  
	let products: any[] = data.products;
	let page = 1;

	$: console.log({ data });

	////////
	let loadingRef: HTMLElement | undefined;

	const loadingProducts = async () => {
		const response = await fetch(`http://localhost:3000/products?page=${page + 1}`);

		const newData = await response.json();

		// Agregar los nuevos productos a la variable products
		products = [...products, newData.data];

		// incrementar el numero de pagina para la siguiente carga
		page++;

		return newData;
	};

	onMount(() => {
		if (!loadingRef) {
			return;
		}

		const loadingObserver = new IntersectionObserver(async (entries) => {
			const element = entries[0];

			console.log(element.isIntersecting);

			if (element.isIntersecting) {
				if (data.meta.hasNextPage) {
					console.log('Loading new products');
					await loadingProducts();
				}
			}
		});

		loadingObserver.observe(loadingRef);
	});
	/////////

	const list = [
		'All',
		'Electrodomesticos',
		'Electronica',
		'Salud',
		'Libros',
		'Entretenimiento',
		'Automotriz'
	];

  // country setup
  let country = ''

  $: {
    if ($location_data && $location_data.data && $location_data.data[0].country) {
      country = $location_data.data[0].country
    }
  }

  onMount(() => {
    if (country) {
      goto(`/?country=${country}`, { replaceState: true })
    }
  })

</script>

<svelte:head>
	<title>ShopIn</title>
</svelte:head>

<div class="fixed top-12 flex items-center bg-[#f7f7f7] dark:bg-[#121212] gap-3 md:w-full h-12 px-0 my-1 z-20">
	{#each list as l}
		<button
			class="bg-gray-200 hover:bg-gray-300 dark:bg-[#202020] dark:text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
			>{l}</button
		>
	{/each}
</div>

<div
	class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3 grid-flow-row sm:mx-0"
>
	{#each products as productData}
		<Card data={productData} />
	{/each}
</div>

<br />

{#if data.meta.hasNextPage}
	<div bind:this={loadingRef}>Loading...</div>
{/if}
