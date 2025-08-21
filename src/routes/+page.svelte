<script lang="ts">
	import type { PageServerData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { removeTotal } from '$lib/stores/cartStore';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

	export let data: PageServerData;

	let productsStore = writable<any>([]);
	let metaStore = writable<any>();
	let categoryStore = writable<string>('');

	productsStore.set(data.products);
	metaStore.set(data.meta);

	// let products: any[] = data.products;
	let pageload = 1;

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server Url');
		}
	}

	////////

	const loadingProducts = async () => {
		await getServerUrl();

		const country = $page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		const nextPage = pageload + 1;
		let endpoint = '';

		// Si no hay categoría seleccionada, carga todos los productos
		if ($categoryStore === '') {
			endpoint = `${serverUrl}/products?page=${nextPage}&limit=${limit}&country=${country}&category=`;
		} else {
			// Si hay categoría seleccionada, se usa el endpoint correspondiente
			endpoint = `https://jenno-backend.vercel.app/products/category/${$categoryStore}?page=${nextPage}&limit=${limit}&country=${country}`;
		}

		try {
			const response = await fetch(endpoint);
			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}
			const newData = await response.json();

			productsStore.update((products) => [...products, ...newData.data]);
			metaStore.set(newData.meta);
			pageload = nextPage;

			return newData;
		} catch (error) {
			console.error('Error en loadingProducts:', error);
		}
	};

	async function loadInitialProducts() {
		await getServerUrl();
		// Obtenemos el país desde la URL o usamos 'Colombia' por defecto
		const country = $page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		// La categoría en este caso es '' (Todos)
		const category = '';
		const endpoint = `${serverUrl}/products?page=1&limit=${limit}&country=${country}&category=${category}`;

		try {
			const response = await fetch(endpoint);
			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}
			const { data, meta } = await response.json();
			// Actualizamos los stores con los nuevos datos
			productsStore.set(data);
			metaStore.set(meta);
			categoryStore.set(category);
			pageload = 1;
		} catch (error) {
			console.error('Error al cargar productos:', error);
		}
	}

	// Observer para el scroll infinito
	let loadingRef: HTMLElement | undefined;
	$: if (loadingRef) {
		const loadingObserver = new IntersectionObserver(async (entries) => {
			const element = entries[0];
			if (element.isIntersecting) {
				await loadingProducts();
			}
		});
		loadingObserver.observe(loadingRef);
	}

	/////////
	let randomCategories: string[] = [];
	let selectedCategory: string | null = $page.url.searchParams.get('category') || ''

	// Cargar las Categorias aleatorias
	async function getRandomCategories() {
		try {
			await getServerUrl();

			const response = await fetch(`${serverUrl}/products/categories/random?limit=${10}`);
			if (response.ok) {
				const data = await response.json();
				randomCategories = data;
			} else {
				console.error('Error al cargar aleatoriamente las categorias');
			}
		} catch (error) {
			console.error('Error al solicitar las categorias aleatorias');
		}
	}

	// Funcion para manejar el click en una categoria
	async function handleCategoryClick(category: string) {
		selectedCategory = category;
		categoryStore.set(category);

		if (category === '') {
			await loadInitialProducts();
		} else {
			try {
				const response = await fetch(
					`https://jenno-backend.vercel.app/products/category/${category}?page=1&limit=20&country=Colombia`
				);
				if (!response.ok) {
					console.error('Error al obtener productos:', response.statusText);
				} else {
					const { data, meta } = await response.json();
					// Se asume que la respuesta trae la lista de productos en la propiedad "products"
					productsStore.set(data);
					metaStore.set(meta);
					pageload = 1;
				}
			} catch (error) {
				console.error('Error en la petición:', error);
			}
		}
	}

	onMount(() => {
		getRandomCategories();
	});

	onMount(() => {
		const urlParams = $page.url.searchParams;
		if (urlParams.get('mpreturn') === '1') {
			// Limpia la URL y fuerza recarga
			window.history.replaceState({}, '', '/');
			window.location.reload();
		}
	});

	onMount(() => {
		const params = $page.url.searchParams;
		const ordersCreated = params.get('ordersCreated');

		if (ordersCreated === '1') {
			removeTotal();
			toast.success('¡Ordenes creadas exitosamente!');
		} else if (ordersCreated === '0') {
			toast.error('Error al crear las ordenes');
		} else {
			return;
		}

		window.history.replaceState({}, '', '/');

		setTimeout(() => {
			location.reload();
		}, 100);
	});

	// $: if ($page.url.searchParams.get('ordersCreated') === '1') {
	// 	removeTotal();

	// 	toast.success('¡Ordenes creadas exitosamente!');

	// 	window.history.replaceState({}, '', '/');
	// 	location.reload();
	// }
</script>

<svelte:head>
	<title>Jenno</title>
	<!-- <meta name="description" content="ShopIn es la mejor red social de comercio electrónico donde puedes comprar y vender productos de manera fácil y segura."> -->
</svelte:head>

<!-- Barra de categorias -->
<div
	class="fixed top-12 flex items-center bg-[#f7f7f7] dark:bg-[#121212] gap-3 w-full h-12 px-0 my-1 z-20"
>
	<!-- Boton de Todos -->
	<button
		class={`text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10 transition-colors
      ${
				selectedCategory === ''
					? 'bg-[#202020] text-gray-200 dark:bg-gray-200 dark:text-black'
					: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-[#202020] dark:hover:bg-[#2a2a2a] dark:text-gray-200'
			}`}
		on:click={() => handleCategoryClick('')}
	>
		Todos
	</button>

	<!-- Categorias Aleatorias -->
	{#each randomCategories as item}
		<button
			class={`text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10 transition-colors
        ${
					selectedCategory === item
						? 'bg-[#202020] text-gray-200 dark:bg-gray-200 dark:text-black'
						: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-[#202020] dark:hover:bg-[#2a2a2a] dark:text-gray-200'
				}`}
			on:click={() => handleCategoryClick(item)}>{item}</button
		>
	{/each}
</div>

<div
	class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3 grid-flow-row sm:mx-0"
>
	{#each $productsStore as productData}
		<Card data={productData} />
	{/each}
</div>

<br />

<!-- Div para el observer del scroll infinito (se muestra si hay siguiente página) -->
{#if $metaStore?.hasNextPage}
	<div class="flex justify-center items-center py-4" bind:this={loadingRef}>
		<svg
			class="animate-spin h-8 w-8 text-gray-500 dark:text-gray-300"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			></path>
		</svg>
		<span class="ml-2 text-gray-500 dark:text-gray-300 text-sm">Cargando productos...</span>
	</div>
{/if}




<style lang="postcss">
  @reference "tailwindcss"

  :global(html) {

  }
</style>
