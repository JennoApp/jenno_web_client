<script lang="ts">
	import type { PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter, addPagination } from 'svelte-headless-table/plugins';
	import { writable, readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import DataTableActions from './data-table-actions.svelte';
	import * as m from '$paraglide/messages';
	import { goto, invalidate } from '$app/navigation';
	import StatusVisibility from '$lib/components/StatusVisibility.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data: PageServerData;

	let productsStore = writable(data.products || []);
	let metaStore = writable(data.meta || {});
	// const currentPage = parseInt(data.meta?.page?.toString() || '1', 10);

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

	// onMount(async () => {
	// 	await loadProducts(1, 10);
	// });

	$: console.log({ productsData: $productsStore });

	// let table: any;
	// let columns: any = null;
	// let headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates;
	// let filterValue = '';

	// async function buildTable() {
	// 	table = createTable(productsStore, {
	// 		filter: addTableFilter({
	// 			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
	// 		}),
	// 		page: addPagination({})
	// 	});

	// 	columns = table.createColumns([
	// 		table.column({
	// 			header: `${m.admin_catalog_tableheader_image()}`,
	// 			accessor: `imgs`,
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			},
	// 			cell: ({ value }: { value: any }) => {
	// 				if (Array.isArray(value) && value.length > 0) {
	// 					return createRender(Image, { url: value[0] });
	// 				}
	// 				return '';
	// 			}
	// 		}),
	// 		table.column({
	// 			accessor: 'productname',
	// 			header: `${m.admin_catalog_tableheader_name()}`
	// 		}),
	// 		table.column({
	// 			accessor: 'category',
	// 			header: `${m.admin_catalog_tableheader_category()}`,
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			}
	// 		}),
	// 		table.column({
	// 			accessor: 'price',
	// 			header: `${m.admin_catalog_tableheader_price()}`,
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			},
	// 			cell: ({ value }) => {
	// 				const formatted = new Intl.NumberFormat('en-US', {
	// 					style: 'currency',
	// 					currency: 'USD'
	// 				}).format(value);
	// 				return formatted;
	// 			}
	// 		}),
	// 		table.column({
	// 			accessor: 'quantity',
	// 			header: `${m.admin_catalog_tableheader_quantity()}`,
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			}
	// 		}),
	// 		table.column({
	// 			accessor: 'visibility',
	// 			header: `Visibilidad`,
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			},
	// 			cell: ({ value }) => {
	// 				return createRender(StatusVisibility, { status: value });
	// 			}
	// 		}),
	// 		table.column({
	// 			accessor: ({ _id }) => _id,
	// 			header: '',
	// 			plugins: {
	// 				filter: {
	// 					exclude: true
	// 				}
	// 			},
	// 			cell: ({ value }) => {
	// 				return createRender(DataTableActions, { id: value });
	// 			}
	// 		})
	// 	]);

	// 	({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
	// 		table.createViewModel(columns));

	// 	filterValue = pluginStates.filter;
	// }

	// $: if (data.products) {
	// 	buildTable();
	// }

	// async function changePage(newPage: number) {
	// 	if (newPage < 1) return;
	// 	try {
	// 		let query = new URLSearchParams($page.url.searchParams.toString());
	// 		query.set('page', newPage.toString());
	// 		console.log({ newPage });

	// 		await goto(`${$page.url.pathname}?${query.toString()}`, { replaceState: false });

	// 		await loadProducts(newPage);
	// 		// await buildTable();
	// 	} catch (error) {
	// 		console.error('Error al cambiar de página', error);
	// 	}
	// }
</script>

<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold dark:text-gray-200">{m.admin_catalog_title()}</h2>

	<Button
		class="bg-purple-600 dark:bg-[#202020] dark:text-gray-200 hover:bg-purple-700 dark:hover:bg-[#252525]"
		on:click={() => goto('/admin/catalog/addproduct')}>{m.admin_catalog_button()}</Button
	>
</div>

<!-- {#if data.products.length !== 0}
	{#if data.sucess === false}
		<h1>Error al hacer la solicitud</h1>
	{:else}
		<div class="flex items-center mx-10 mt-5">
			<Input
				class="max-w-sm placeholder:text-[#707070]"
				placeholder="Filter names..."
				type="text"
				bind:value={filterValue}
			/>
		</div>
		<div class="rounded-md border mx-10 my-5">
			<Table.Root {...$tableAttrs}>
				<Table.Header>
					{#each $headerRows as headerRow}
						<Subscribe rowAttrs={headerRow.attrs()}>
							<Table.Row>
								{#each headerRow.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
										<Table.Head {...attrs}>
											<Render of={cell.render()} />
										</Table.Head>
									</Subscribe>
								{/each}
							</Table.Row>
						</Subscribe>
					{/each}
				</Table.Header>
				<Table.Body {...$tableBodyAttrs}>
					{#each $pageRows as row (row.id)}
						<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
							<Table.Row {...rowAttrs}>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs>
										<Table.Cell {...attrs}>
											<Render of={cell.render()} />
										</Table.Cell>
									</Subscribe>
								{/each}
							</Table.Row>
						</Subscribe>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		<div class="flex justify-between mx-10">
			<div class="">
				<h3 class="text-sm dark:text-[#707070]">
					items: {data.meta.itemCount} - pages: {data.meta.pageCount}
				</h3>
			</div>
			<div class="flex items-center justify-end space-x-4">
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!data.meta.hasPreviousPage || currentPage <= 1}
					on:click={() => changePage(Number(currentPage) - 1)}
				>
					Anterior
				</Button>
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!data.meta.hasNextPage}
					on:click={() => changePage(Number(currentPage) + 1)}
				>
					Siguiente
				</Button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center mt-40 w-full">
		<iconify-icon icon="solar:box-bold" height="5rem" width="5rem" class="text-[#707070] mb-4" />
		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_catalog_nocatalog_title()}</h1>
		<p class="text-lg text-[#707070]">
			{m.admin_catalog_nocatalog_p()}
		</p>
	</div>
{/if} -->

{#if Array.isArray($productsStore) && $productsStore.length > 0}
	<div class="overflow-x-auto w-full">
		<table class="min-w-full border-collapse text-left text-sm">
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

	<div class="flex items-center justify-end space-x-4">
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!$metaStore.hasPreviousPage}
			on:click={() => changePage(Number($metaStore.page) - 1)}
		>
			Anterior
		</Button>
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!$metaStore.hasNextPage}
			on:click={() => changePage(Number($metaStore.page) + 1)}
		>
			Siguiente
		</Button>
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
