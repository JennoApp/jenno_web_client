<script lang="ts">
	import type { PageServerData } from './$types';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter, addPagination } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import DataTableActions from './data-table-actions.svelte';
  import * as Dialog from "$lib/components/ui/dialog"
  import * as m from '$paraglide/messages'

	export let data: PageServerData;

	$: console.log({ data });

	const table = createTable(readable(data.products), {
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'productname',
			header: `${m.admin_catalog_tableheader_name()}`
		}),
		table.column({
			accessor: 'imgs',
			header: `${m.admin_catalog_tableheader_image()}`,
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
			header: `${m.admin_catalog_tableheader_category()}`,
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'price',
			header: `${m.admin_catalog_tableheader_price()}`,
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
			header: `${m.admin_catalog_tableheader_category()}`,
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		/*
		table.column({
			accessor: 'visibility',
			header: 'Visibility',
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
    */
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

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;

	$: console.log({ products: data.products });
</script>

<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold dark:text-gray-200">{m.admin_catalog_title()}</h2>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button
				class="bg-purple-600 dark:bg-[#202020] dark:text-gray-200               hover:bg-purple-700 dark:hover:bg-[#252525]"
				>{m.admin_catalog_button()}</Button
			>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="bg-background mt-2">
			<DropdownMenu.Item href="/admin/catalog/addproduct">{m.admin_catalog_button_addproduct()}</DropdownMenu.Item>
			<DropdownMenu.Item disabled>{m.admin_catalog_button_addservice()}</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

{#if data.products.length !== 0}
	{#if data.sucess === false}
		<h1>Error al hacer la solicitud</h1>
	{:else}
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
				<h3 class="text-sm dark:text-[#707070]">items: {data.meta.itemCount} - pages: {data.meta.pageCount}</h3>
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

		<!-- <div class="flex items-center justify-end space-x-4 mx-10">
			<Button
				class="border-[#252525]"
				variant="outline"
				size="sm"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}>Previous</Button
			>
			<Button
				class="border-[#252525]"
				variant="outline"
				size="sm"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
			>
		</div> -->
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center mt-40 w-full">
		<iconify-icon icon="solar:box-bold" height="5rem" width="5rem" class="text-[#707070] mb-4" />
		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_catalog_nocatalog_title()}</h1>
		<p class="text-lg text-[#707070]">
			{m.admin_catalog_nocatalog_p()}
		</p>
	</div>
{/if}


<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
