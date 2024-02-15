<script lang="ts">
	import type { PageServerData } from './$types';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import DataTableActions from './data-table-actions.svelte';

	export let data: PageServerData;

	const table = createTable(readable(data.products), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'productname',
			header: 'Name'
		}),
		table.column({
			accessor: 'imgs',
			header: 'Image',
			plugins: {
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return createRender(Image, { url: value[0] });
			}
		}),
		table.column({
			accessor: 'category',
			header: 'Category',
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'price',
			header: 'Price',
			plugins: {
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				const formatted = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD'
				}).format(value);
				return formatted;
			}
		}),
		table.column({
			accessor: 'quantity',
			header: 'Quantity',
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'visibility',
			header: 'Visibility',
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: ({ _id }) => _id,
			header: '',
			plugins: {
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return createRender(DataTableActions, { id: value });
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns);

  const { filterValue } = pluginStates.filter

	$: console.log({ products: data.products });
</script>

<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold">Catalogo</h2>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button class="dark:bg-[#202020] dark:text-gray-200 hover:dark:bg-[#252525]">Agregar</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="bg-background mt-2 border border-[#222222]">
			<DropdownMenu.Item href="/admin/catalog/addproduct">Agregar Producto</DropdownMenu.Item>
			<DropdownMenu.Item disabled>Agregar Servicio</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

{#if data.sucess === false}
	<h1>Error al hacer la solicitud</h1>
{:else}
  <div class="flex items-center mx-10 mt-5">
    <Input class="max-w-sm" placeholder="Filter names..." type="text" bind:value={$filterValue} />
  </div>
	<div class="rounded-md border border-[#202020] mx-10 my-5">
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
{/if}
