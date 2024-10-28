<script lang="ts">	
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import ShippingInFoDialog from '$lib/components/ShippingInFoDialog.svelte';
  import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
  import { addTableFilter } from 'svelte-headless-table/plugins';
  import * as Table from '$lib/components/ui/table';
  import { readable } from 'svelte/store';

	interface meta {
		page: number;
		limit: number;
		itemCount: number;
		pageCount: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	}

  export let datalist: any[] | undefined
	export let metaData: meta;
  export let columnsData: any[]
  export let sucess: boolean

  const table = createTable(readable(datalist), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});


  const transformColumnData = columnsData.map(item => table.column(item))
  const columns = table.createColumns(transformColumnData)

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { filterValue } = pluginStates.filter;


	// export let modifier: Record<string, { header: string; accessor: (data: any) => any }> | null =
	// 	null;

	// let modifierData: { [key: string]: any }[] = [];

	// $: modifierData = modifier
	// 	? datalist.map((item) => {
	// 			const modifierItem: { [key: string]: any } = {};
	// 			for (const columnKey in modifier) {
	// 				const columnConfig = modifier[columnKey];
	// 				modifierItem[columnKey] = columnConfig.accessor(item);
	// 			}
	// 			return modifierItem;
	// 		})
	// 	: [];

	// $: console.log({ modifierData });
</script>

<!-- 
<div class="flex items-center mx-10 mt-5">
	<Input class="max-w-sm" placeholder="Filter names..." type="text" />
</div> -->

{#if datalist?.length !== 0}
	{#if sucess === false}
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
					items: {metaData.itemCount} - pages: {metaData.pageCount}
				</h3>
			</div>
			<div class="flex items-center justify-end space-x-4">
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!metaData.hasPreviousPage}
					on:click={() => {}}
				>
					Anterior
				</Button>
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!metaData.hasNextPage}
					on:click={() => {}}
				>
					Siguiente
				</Button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="mdi:cash" height="5rem" width="5rem" class="text-[#707070] mb-4" />

		<h1 class="text-xl font-semibold text-[#707070] mb-2">A</h1>
		<p class="text-lg text-[#707070]">B</p>
	</div>
{/if}


<!-- ######### -->
<!-- ########## -->
<!-- <div class="rounded-md border mx-10 my-5">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				{#each Object.values(modifier) as column}
					<Table.Head>{column.header}</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each modifierData as item}
				<Table.Row>
					{#each Object.keys(modifier) as columnKey}
						<Table.Cell>
							{#if item[columnKey] === 'shippingInfoDialog'}
								<button on:click|preventDefault={() => alert('Open')}>Open</button>
							{:else}
								{@html item[columnKey]}
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<div class="flex justify-between mx-10">
	<div class="">
		<h3 class="text-sm dark:text-[#707070]">items: {metaData.itemCount} - pages: {metaData.pageCount}</h3>
	</div>
	<div class="flex items-center justify-end space-x-4">
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!metaData.hasPreviousPage}
			on:click={() => {}}
		>
			Previous
		</Button>
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!metaData.hasNextPage}
			on:click={() => {}}
		>
			Next
		</Button>
	</div>
</div> -->
