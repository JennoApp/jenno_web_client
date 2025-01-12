<script lang="ts">
	import type { PageServerData } from './$types';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter } from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { readable } from 'svelte/store';
	import { format } from 'timeago.js';
	import * as m from '$paraglide/messages';
	import Status from '$lib/components/Status.svelte';
	import Options from '$lib/components/Options.svelte';
	import CustomerCell from '$lib/components/Customer_cell.svelte';
	import ShippingInFoDialog from '$lib/components/ShippingInFoDialog.svelte';
	import TableActions from './table-actions.svelte';
	import { formatPrice } from '$lib/utils/formatprice';
	import { goto, invalidateAll } from '$app/navigation';

	export let data: PageServerData;
	const currentPage = data.meta?.page;

	$: console.log(data.meta);

	function changePage(newPage: number) {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', newPage.toString());
		invalidateAll();
	}

	const table = createTable(readable(data.salesList), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			header: `${m.shopping_tableheader_image()}`,
			accessor: `product`,
			plugins: {
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return createRender(Image, { url: value.imgs[0] });
			}
		}),
		table.column({
			header: `${m.shopping_tableheader_name()}`,
			accessor: (row) => row.product.productname,
			cell: ({ value }) => {
				return value || 'No Name';
			}
		}),
		table.column({
			header: `${m.shopping_tableheader_quantity()}`,
			accessor: (row) => row.product.amount
		}),
		table.column({
			header: `${m.shopping_tableheader_price()}`,
			accessor: (row) => row.product.price,
			cell: ({ value }) => {
				return formatPrice(value, 'es-CO', 'COP');
			}
		}),
		table.column({
			header: `${m.shopping_tableheader_total()}`,
			accessor: (row) => row.product.price * row.product.amount,
			cell: ({ value }) => {
				return formatPrice(value, 'es-CO', 'COP');
			}
		}),
		table.column({
			header: `${m.shopping_tableheader_category()}`,
			accessor: (row) => row.product.category
		}),
		table.column({
			header: 'Opciones',
			accessor: (row) => row.product.selectedOptions || [],
			cell: ({ value }) => {
				if (value && value.length > 0) {
					return createRender(Options, { options: value[0] });
				} else {
					return 'No hay opciones';
				}
			}
		}),
		table.column({
			header: 'Informacion Envio',
			accessor: (row) => row,
			cell: ({ value }) => {
				return createRender(ShippingInFoDialog, { shippingInfo: value });
			}
		}),
		table.column({
			header: `${m.admin_sales_tableheader_customer()}`,
			accessor: (row) => row,
			cell: ({ value }) => {
				if (value) {
					return createRender(CustomerCell, { data: value });
				} else {
					return 'No';
				}
			}
		}),
		table.column({
			header: `${m.shopping_tableheader_status()}`,
			accessor: (row) => row.status,
			cell: ({ value }) => {
				return createRender(Status, { status: value }) || `<span>${value}</span>`;
			}
		}),
		table.column({
			header: ' ',
			accessor: (row) => format(row.updatedAt)
		}),
		table.column({
			header: '',
			accessor: ({ _id }) => _id,
			plugins: {
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return createRender(TableActions, { id: value });
			}
		})
	]);

	$: console.log({ table });

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { filterValue } = pluginStates.filter;
</script>



<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold text-gray-200">Ventas</h2>
	<Button
		class="bg-purple-600 dark:bg-[#252525] dark:hover:bg-[#353535] hover:bg-purple-500 dark:text-gray-200"
		on:click={() => {
			goto('/admin/sales/history');
		}}
	>
		<iconify-icon
			icon="material-symbols:history"
			height="1.1rem"
			width="1.1rem"
			class="text-gray-200 flex justify-center items-center"
		/>
		<span class="ml-3">Historial</span></Button
	>
</div>

{#if data?.salesList.length !== 0}
	{#if data.sucess === false}
		<h1>Error al hacer la solicitud</h1>
	{:else}
		<div class="flex items-center justify-between mx-10 mt-5">
			<Input
				class="max-w-sm placeholder:text-[#707070]"
				placeholder="Filter names..."
				type="text"
				bind:value={$filterValue}
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
		<div class="flex justify-between mx-10 mb-5">
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
					disabled={!data.meta.hasPreviousPage}
					on:click={() => changePage(currentPage - 1)}
				>
					Anterior
				</Button>
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!data.meta.hasNextPage}
					on:click={() => changePage(currentPage + 1)}
				>
					Siguiente
				</Button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center h-full w-full">
		<iconify-icon icon="mdi:cash" height="5rem" width="5rem" class="text-[#707070] mb-4" />

		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_sales_nosales_title()}</h1>
		<p class="text-lg text-[#707070]">{m.admin_sales_nosales_p()}</p>
	</div>
{/if}
