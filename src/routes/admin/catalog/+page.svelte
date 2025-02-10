<script lang="ts">
	import type { PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import DataTableActions from './data-table-actions.svelte';
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import StatusVisibility from '$lib/components/StatusVisibility.svelte';
	import { page } from '$app/stores';

	export let data: PageServerData;

	let productsStore = writable(data.products || []);
	let metaStore = writable(data.meta || {});

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener la url del servidor: ', error);
		}
	}

	async function loadProducts(page: number, limit: number = 10) {
		try {
			await getServerUrl();

			const response = await fetch(
				`${serverUrl}/products/admin/user/${$page.data.user._id}?page=${page}&limit=${limit}&country=Colombia`
			);
			const result = await response.json();

			// devuelve { data: [], meta: {} }
			productsStore.set(result.data);
			metaStore.set(result.meta);
		} catch (error) {
			console.error('Error al cargar los productos del usuario: ', error);
		}
	}

	function changePage(newPage: number) {
		if (newPage < 1) return;
		loadProducts(newPage, 10);
	}

	$: console.log({ productsData: $productsStore });
</script>

<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold dark:text-gray-200">{m.admin_catalog_title()}</h2>

	<Button
		class="bg-purple-600 dark:bg-[#202020] dark:text-gray-200 hover:bg-purple-700 dark:hover:bg-[#252525]"
		on:click={() => goto('/admin/catalog/addproduct')}>{m.admin_catalog_button()}</Button
	>
</div>

{#if Array.isArray($productsStore) && $productsStore.length > 0}
	<div class="overflow-x-auto w-full p-4">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-b bg-gray-100 dark:bg-[#202020]">
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Imágenes</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Nombre</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Categoría</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Precio</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Cantidad</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Visibilidad</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Acciones</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-[#252525]">
				{#each $productsStore as product}
					<tr class="hover:bg-gray-50 dark:hover:bg-[#2c2c2c]">
						<!-- Imágenes (mostrar la primera o un recuento) -->
						<td class="py-2 px-4 dark:text-gray-200">
							{#if Array.isArray(product.imgs) && product.imgs.length > 0}
								<!-- Ejemplo: Mostrar solo la primera imagen -->
								<img src={product.imgs[0]} alt="Producto" class="w-16 h-16 object-cover rounded" />
								<!-- O mostrar la cantidad: -->
								<!-- <p>{product.imgs.length} imágenes</p> -->
							{:else}
								<span class="text-gray-500 dark:text-gray-400">Sin imágenes</span>
							{/if}
						</td>

						<!-- Nombre del producto -->
						<td class="py-2 px-4 dark:text-gray-200">{product.productname}</td>

						<!-- Categoría -->
						<td class="py-2 px-4 dark:text-gray-200">{product.category}</td>

						<!-- Precio (con formato) -->
						<td class="py-2 px-4 dark:text-gray-200">
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(product.price || 0)}
						</td>

						<!-- Cantidad -->
						<td class="py-2 px-4 dark:text-gray-200">{product.quantity}</td>

						<!-- Visibilidad -->
						<td class="py-2 px-4 dark:text-gray-200">
							<StatusVisibility status={product.visibility} />
						</td>

						<!-- Acciones -->
						<td class="py-2 px-4 dark:text-gray-200">
							<DataTableActions id={product._id} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex justify-between mt-2 m-5">
		<div class="">
			<h3 class="text-sm dark:text-[#707070]">
        Items: {$metaStore.itemCount} | Página: {$metaStore.page} de {$metaStore.pageCount}
			</h3>
		</div>

		<div class="flex items-center justify-end space-x-4">
			<Button
				class="border-gray-400 dark:border-[#252525] dark:hover:bg-[#252525]"
				variant="outline"
				size="sm"
				disabled={!$metaStore.hasPreviousPage}
				on:click={() => changePage(Number($metaStore.page) - 1)}
			>
				Anterior
			</Button>
			<Button
				class="border-gray-400 dark:border-[#252525] dark:hover:bg-[#252525]"
				variant="outline"
				size="sm"
				disabled={!$metaStore.hasNextPage}
				on:click={() => changePage(Number($metaStore.page) + 1)}
			>
				Siguiente
			</Button>
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center mt-40 w-full">
		<iconify-icon icon="solar:box-bold" height="5rem" width="5rem" class="text-[#707070] mb-4" />
		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_catalog_nocatalog_title()}</h1>
		<p class="text-lg text-[#707070]">
			{m.admin_catalog_nocatalog_p()}
		</p>
	</div>
{/if}
