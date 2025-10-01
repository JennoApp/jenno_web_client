<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	let products = data?.products;

	// $: console.log({ products: data?.products });
	// $: console.log({ meta: data?.meta });
	// $: console.log({ sucess: data?.sucess });
</script>

{#if products?.length > 1 && data.sucess === true}
	<div
		class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3 grid-flow-row sm:mx-0"
	>
		{#each products as productData}
			<Card data={productData} />
		{/each}
	</div>
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon
			icon="eos-icons:product-subscriptions"
			height="5rem"
			width="5rem"
			class="text-[#707070] mb-4"
		></iconify-icon>
		<p class="text-lg text-[#707070] mb-2">No sigues ninguna tienda aún</p>
		<p class="text-lg text-[#707070]">
			Inicia sesión o explora las tiendas para encontrar productos interesantes.
		</p>
	</div>
{/if}
