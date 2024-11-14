<script lang="ts">
	import type { PageServerData } from './$types';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter } from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import { page } from '$app/stores';
	import { readable } from 'svelte/store';
	import * as m from '$paraglide/messages';
	import { goto, invalidateAll } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import { format } from 'timeago.js';
	import Options from '$lib/components/Options.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
  import Image from '$lib/components/Image.svelte'

	export let data: PageServerData;
	const currentPage = data.meta?.page;
  const followerList = data.followers


	function changePage(newPage: number) {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', newPage.toString());
		invalidateAll();
	}

	const table = createTable(readable(data.followers), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			header: `${m.shopping_tableheader_image()}`,
			accessor: 'profileImg',
      cell: ({ value }) => {
				return createRender(Image, { url: value.profileImg });
			}
		}),

		table.column({
			header: `Name`,
			accessor: (row) => row.username
		}),
		table.column({
			header: `Email`,
			accessor: (row) => row.email,
		}),
		table.column({
			header: `Account Type`,
			accessor: (row) => row.accountType,	
		})
	]);


	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { filterValue } = pluginStates.filter;
</script>

{#if followerList?.length !== 0}
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
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="f7:person-3-fill" height="5rem" width="5rem" class="text-[#707070] mb-4" />

		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_customers_nocustomers_title()}</h1>
		<p class="text-lg text-[#707070]">{m.admin_customers_nocustomers_p()}</p>
	</div>
{/if}
