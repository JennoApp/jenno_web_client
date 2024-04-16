<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter, addPagination } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let followersList: any = [];
	let currentPage = 1;
	let limitPerPage = 10;
	// let NextPage = false;
	// let PreviousPage = false;

	async function fetchFollowers() {
		try {
			const response = await fetch(
				`http://localhost:3000/users/followers/${$page.data.user._id}?page=${currentPage}&limit=${limitPerPage}`
			);
			const dataFetch = await response.json();
			// NextPage = meta.hasNextPage;
			// PreviousPage = meta.hasPreviousPage;

			for (const followerId of dataFetch.data) {
				const response = await fetch(`http://localhost:3000/users/${followerId}`);
				const followerData = await response.json();
				followersList = [...followersList, followerData];
			}
			
		} catch (err) {
			console.error('Error la recuperar la lista de seguidores:', err);
		}
	}

	// onMount(() => {
	// 	fetchFollowers();
	// });

  $: fetchFollowers()

	const table = createTable(followersList
		// page: addPagination(),
		// filter: addTableFilter({
		// 	fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		// })
	);

	const columns = table.createColumns([
		table.column({
			accessor: 'profileImg',
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
			accessor: 'username',
			header: 'Name'
		}),
		table.column({
			accessor: 'email',
			header: 'Email',
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),

		// table.column({
		// 	accessor: ({ _id }) => _id,
		// 	header: '',
		// 	plugins: {
		// 		filter: {
		// 			exclude: true
		// 		}
		// 	}
		// 	// cell: ({ value }) => {
		// 	// 	return createRender(DataTableActions, { id: value });
		// 	// }
		// })
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	// const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	// const { filterValue } = pluginStates.filter;

	$: console.log({ followersList });
	$: console.log({ $headerRows, $pageRows });
</script>

<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold">Customers</h2>
</div>

{#if followersList.lenght === 0}
	<h1>Error al hacer la solicitud</h1>
{:else}
	<div class="flex items-center mx-10 mt-5">
		<!-- <Input class="max-w-sm" placeholder="Filter names..." type="text" bind:value={$filterValue} /> -->
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
	<div class="flex items-center justify-end space-x-4 mx-10">
		<Button
			class="border-[#252525]"
			variant="outline"
			size="sm"
		>
			Previous
		</Button>
		<Button
			class="border-[#252525]"
			variant="outline"
			size="sm"
		>
			Next
		</Button>
	</div>
{/if}

<!-- {#each followersList as f}
  <p>{f.username}</p>  
{/each} -->
