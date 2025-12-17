<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	// Props
	let { user }: { user: string } = $props();

	// Estado
	let serverUrl = $state<string>('');
	let products = $state<any[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Obtener URL del servidor
	async function getServerUrl(): Promise<string> {
		try {
			const response = await fetch('/api/server'); // ← Corregido: fetch(...) no fetch`...`

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data.server_url;
		} catch (err) {
			console.error('Error al obtener la url del servidor:', err);
			return '';
		}
	}

	// Cargar productos del usuario
	async function loadProducts(userId: string) {
		if (!userId) {
			console.warn('No userId provided');
			return;
		}

		isLoading = true;
		error = null;

		try {
			// PRIMERO: Obtener serverUrl
			const url = await getServerUrl();

			// SEGUNDO: Verificar que tenemos la URL
			if (!url) {
				throw new Error('No se pudo obtener el serverUrl');
			}

			// TERCERO: Hacer el fetch de productos
			const response = await fetch(`${url}/products/user/random/${userId}`); // ← Corregido

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			products = data;

			console.log('Productos cargados:', products);
		} catch (err: any) {
			console.error('Error al cargar productos:', err);
			error = err.message || 'Error desconocido';
			products = [];
		} finally {
			isLoading = false;
		}
	}

	// Efecto reactivo: cargar productos cuando cambia el user
	$effect(() => {
		if (user) {
			loadProducts(user);
		}
	});
</script>

{#if isLoading}
	<div class="flex justify-center items-center m-10">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
	</div>
{:else if error}
	<div class="m-10 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
		<p class="text-red-700 dark:text-red-300">Error al cargar productos: {error}</p>
	</div>
{:else if products.length > 0}
	<div class="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 m-10 gap-5 grid-flow-row">
		{#each products as productData (productData._id || productData.id)}
			<Card data={productData} />
		{/each}
	</div>
{:else}
	<div class="flex justify-center items-center m-10">
		<p class="text-gray-600 dark:text-gray-400">No hay productos disponibles</p>
	</div>
{/if}
