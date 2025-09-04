<script lang="ts">
	import type { PageServerData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { page } from '$app/state';
	import { removeTotal } from '$lib/stores/cartStore';
	import { toast } from 'svelte-sonner';


	let { data }: { data: PageServerData } = $props();


	let products = $state<any[]>(data.products);
	let meta = $state<any>(data.meta);
	let category = $state<string>('');
	let pageload = $state(1);
	let serverUrl = $state<string>('');
	let randomCategories = $state<string[]>([]);
	let selectedCategory = $state<string | null>(page.url.searchParams.get('category') || '');
	let loadingRef = $state<HTMLElement>();


	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server Url');
		}
	}


	const loadingProducts = async () => {
		await getServerUrl();

		const country = page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		const nextPage = pageload + 1;
		let endpoint = '';

		// Si no hay categoría seleccionada, carga todos los productos
		if (category === '') {
			endpoint = `${serverUrl}/products?page=${nextPage}&limit=${limit}&country=${country}&category=`;
		} else {
			// Si hay categoría seleccionada, se usa el endpoint correspondiente
			endpoint = `https://jenno-backend.vercel.app/products/category/${category}?page=${nextPage}&limit=${limit}&country=${country}`;
		}

		try {
			const response = await fetch(endpoint);
			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}
			const newData = await response.json();

			products = [...products, ...newData.data];
			meta = newData.meta;
			pageload = nextPage;

			return newData;
		} catch (error) {
			console.error('Error en loadingProducts:', error);
		}
	};


	async function loadInitialProducts() {
		await getServerUrl();
		// Obtenemos el país desde la URL o usamos 'Colombia' por defecto
		const country = page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;

		// La categoría en este caso es '' (Todos)
		const categoryParam = '';
		const endpoint = `${serverUrl}/products?page=1&limit=${limit}&country=${country}&category=${category}`;

		try {
			const response = await fetch(endpoint);
			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}
			const { data: responseData, meta: responseMeta } = await response.json();

			// Actualizamos los stores con los nuevos datos
			products = responseData;
			meta = responseMeta;
			category = categoryParam;
			pageload = 1;
		} catch (error) {
			console.error('Error al cargar productos:', error);
		}
	}


	// Cargar las Categorias aleatorias
	async function getRandomCategories() {
		try {
			await getServerUrl();

			const response = await fetch(`${serverUrl}/products/categories/random?limit=${10}`);
			if (response.ok) {
				const responseData = await response.json();
				randomCategories = responseData;
			} else {
				console.error('Error al cargar aleatoriamente las categorias');
			}
		} catch (error) {
			console.error('Error al solicitar las categorias aleatorias');
		}
	}


	// Funcion para manejar el click en una categoria
	async function handleCategoryClick(categoryParam: string) {
		selectedCategory = categoryParam;
		category = categoryParam;

		if (categoryParam === '') {
			await loadInitialProducts();
		} else {
			try {
				const response = await fetch(
					`https://jenno-backend.vercel.app/products/category/${categoryParam}?page=1&limit=20&country=Colombia`
				);

				if (!response.ok) {
					console.error('Error al obtener productos:', response.statusText);
				} else {
					const { data: responseData, meta: responseMeta } = await response.json();
					// Se asume que la respuesta trae la lista de productos en la propiedad "products"
					products = responseData;
					meta = responseMeta;
					pageload = 1;
				}
			} catch (error) {
				console.error('Error en la petición:', error);
			}
		}
	}


	// Observer para el scroll infinito
	$effect(() => {
		if (loadingRef) {
			const loadingObserver = new IntersectionObserver(async (entries) => {
				const element = entries[0];
				if (element.isIntersecting) {
					await loadingProducts();
				}
			});
			loadingObserver.observe(loadingRef);

      // Limpiar el observer al desmontar el componente
      return () => {
        loadingObserver.disconnect()
      }
		}
	});


	$effect(() => {
		getRandomCategories();
	});


	$effect(() => {
		const urlParams = page.url.searchParams;
		if (urlParams.get('mpreturn') === '1') {
			// Limpia la URL y fuerza recarga
			window.history.replaceState({}, '', '/');
			window.location.reload();
		}
	});


  // Effect para manejar parámetros URL - ordersCreated
	$effect(() => {
		const params = page.url.searchParams;
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
</script>


<svelte:head>
	<title>Jenno</title>
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
		onclick={() => handleCategoryClick('')}
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
			onclick={() => handleCategoryClick(item)}>{item}</button
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

<!-- Div para el observer del scroll infinito (se muestra si hay siguiente página) -->
{#if meta?.hasNextPage}
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
