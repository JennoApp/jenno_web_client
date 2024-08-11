<script lang="ts">
	import type { PageServerData } from './$types';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import * as Table from '$lib/components/ui/table';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { readable } from 'svelte/store';
	import { format } from 'timeago.js';
	import * as m from '$paraglide/messages';
	import { addPagination, addTableFilter } from 'svelte-headless-table/plugins';
	import Status from '$lib/components/Status.svelte';
	import Options from '$lib/components/Options.svelte';

	export let data: PageServerData;

  $: console.log({meta: data.meta})
	
	let currentPage = 1;
	let limitPerPage = 10;
	let NextPage: boolean;
	let PreviousPage: boolean;
	let itemsCount: number;
	let pageCount: number;


	const table = createTable(readable(data.products), {
		page: addPagination(),
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
			accessor: (row) => row.product.price
		}),
		table.column({
			header: `${m.shopping_tableheader_total()}`,
			accessor: (row) => row.product.price * row.product.amount
		}),
		table.column({
			header: `${m.shopping_tableheader_sku()}`,
			accessor: (row) => row.product.SKU
		}),
		table.column({
			header: `${m.shopping_tableheader_category()}`,
			accessor: (row) => row.product.category
		}),
    table.column({
			header: 'Opciones',
			accessor: (row) => row.product.selectedOptions[0],
      cell: ({value}) => {
        return createRender(Options, {options: value})
      }
		}),
		table.column({
			header: `${m.shopping_tableheader_status()}`,
			accessor: (row) => row.status,
      cell: ({value}) => {
        return createRender(Status, { status: value }) || `<span>${value}</span>`
      }
		}),
		table.column({
			header: `${m.shopping_tableheader_date()}`,
			accessor: (row) => format(row.updatedAt)
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
</script>

{#if data?.products.length !== 0}
	{#if data.sucess === false}
		<h1>Error al hacer la solicitud</h1>
	{:else}
		<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
			<h2 class="text-xl font-semibold text-gray-200">Compras</h2>
		</div>
		<div class="flex items-center mx-10 mt-5">
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
					disabled={!data.meta.hasPreviousPage}
					on:click={() => {}}
				>
					Previous
				</Button>
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!data.meta.hasNextPage}
					on:click={() => {}}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
			<iconify-icon
				icon="fa6-solid:cart-shopping"
				height="5rem"
				width="5rem"
				class="text-[#707070] mb-4"
			/>
			<p class="text-lg text-[#707070] mb-2">{m.shopping_noshopping_title()}</p>
			<p class="text-lg text-[#707070]">{m.shopping_noshopping_p()}</p>
		</div>
{/if}
