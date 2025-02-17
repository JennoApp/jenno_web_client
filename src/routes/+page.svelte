<script lang="ts">
	import type { PageServerData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';


	export let data: PageServerData;

	let products: any[] = data.products;
	let pageload = 1;

   // Obtener url del servidor
  let serverUrl: string
  async function getServerUrl() {
    try {
      const response = await fetch(`/api/server`)
      const data = await response.json()

      serverUrl = data.server_url
    } catch (error) {
      console.error('Error al solicitar Server Url')
    }
  }

	////////
	let loadingRef: HTMLElement | undefined;

	const loadingProducts = async () => {
    await getServerUrl()

		const response = await fetch(`${serverUrl}/products?page=${pageload + 1}`);
		const newData = await response.json();

		// Agregar los nuevos productos a la variable products
		products = [...products, newData.data];

		// incrementar el numero de pagina para la siguiente carga
		pageload++;

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

	let randomCategories: string[] = [];
	let selectedCategory: string | null = $page.url.searchParams.get('category');

	// Cargar las Categorias aleatorias
	async function getRandomCategories() {
		try {
      await getServerUrl()

			const response = await fetch(`${serverUrl}/products/categories/random?limit=${10}`);
			if (response.ok) {
				const data = await response.json();
				console.log(data);
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

		const url = new URL(window.location.href);

		// actualizar la categoria
		if (category === '') {
			url.searchParams.delete('category');
		} else {
			url.searchParams.set('category', category);
		}

		// Navegar a la nueva Url
		await goto(url.toString(), {
			keepFocus: true,
			invalidateAll: true
		});
	}

	onMount(() => {
		getRandomCategories();
	});

  // onMount(() => {
  //   const urlParams = $page.url.searchParams;
  //   if (urlParams.get('mpreturn') === '1') {
  //     // Limpia la URL y fuerza recarga
  //     window.history.replaceState({}, '', '/');
  //     window.location.reload();
  //   }
  // });

  $: if ($page.url.searchParams.get('mpreturn') === '1') {
    alert('redirecting to home since mercado pago')
  }
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
		class="bg-gray-200 hover:bg-gray-300 dark:bg-[#202020] dark:text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
		class:selected={!selectedCategory}
		on:click={() => handleCategoryClick('')}
	>
		Todos
	</button>

  <!-- Categorias Aleatorias -->
	{#each randomCategories as item}
		<button
			class="bg-gray-200 hover:bg-gray-300 dark:bg-[#202020] dark:text-gray-200 text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10"
			class:selected={selectedCategory === item}
			on:click={() => handleCategoryClick(item)}>{item}</button
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
