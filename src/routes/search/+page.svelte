<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { page } from '$app/state'
	import StoreCard from '$lib/components/StoreCard.svelte';

	let productsSearch = $state<any[]>([]);
	let storesSearch = $state<any[]>([]);

	// Obtener url del servidor
	let serverUrl = $state<string>('');
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	const fetchSearchProducts = async (query: string) => {
		if (!query) return;
		await getServerUrl();

		const response = await fetch(
			`${serverUrl}/products/search?query=${query}&page=${1}&limit=${20}`
		);

		const { data } = await response.json();
		productsSearch = data;
	};

	const fetchSearchStores = async (query: string) => {
		if (!query) return;
		await getServerUrl();

		const res = await fetch(`${serverUrl}/users/search/business?query=${query}&page=1&limit=20`);

		const { data } = await res.json();
		storesSearch = data;
	};

	$effect(() => {
		const search = page.url.searchParams.get('search');
		const stores = page.url.searchParams.get('stores');

		if (search) {
			storesSearch = [];
			fetchSearchProducts(search);
		}

		if (stores) {
			productsSearch = [];
			fetchSearchStores(stores);
		}
	})

	$inspect({ productsSearch, storesSearch });
</script>

{#if productsSearch.length === 0 && storesSearch.length === 0}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)]">
		<iconify-icon icon="mdi:card-search" height="5rem" width="5rem" class="text-[#707070] mb-4"></iconify-icon>
		<p class="text-lg text-[#707070]">
			No hay resultados para tu búsqueda
		</p>
	</div>
{/if}


{#if productsSearch.length > 0}
	<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3">
		{#each productsSearch as product}
			<Card data={product} />
		{/each}
	</div>
{/if}

{#if storesSearch.length > 0}
	<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3">
		{#each storesSearch as store}
			<StoreCard data={store} />
		{/each}
	</div>
{/if}
