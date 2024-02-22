<script lang="ts">
	import type { PageServerData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';

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
</script>

<svelte:head>
	<title>YouShop</title>
</svelte:head>

<div class="fixed top-12 flex items-center bg-[#121212] gap-3 w-full h-12 px-5 my-1 z-20">
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>All</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>Electrodomesticos</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>Electrónica</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>Salud y Belleza</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>Libros</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
	>
		Entretenimiento</button
	>
	<button
		class="bg-[#202020] text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		>Automotriz</button
	>
</div>

<div class="grid lg:grid-cols-4 sm:grid-cols-3 mx-5 mt-14 gap-5 grid-flow-row">
	{#each products as productData}
		<Card data={productData} />
	{/each}
</div>

<br />

{#if data.meta.hasNextPage}
	<div bind:this={loadingRef}>Loading...</div>
{/if}

