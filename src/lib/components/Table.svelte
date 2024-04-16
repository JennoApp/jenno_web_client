<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addTableFilter, addPagination } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import Image from '$lib/components/Image.svelte';
	import { Input } from '$lib/components/ui/input';


</script>

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
<div class="flex items-center justify-end space-x-4 mx-10">
	<Button
		class="border-[#252525]"
		variant="outline"
		size="sm"
		disabled={!$hasPreviousPage}
		on:click={() => ($pageIndex -= 1)}
	>
		Previous
	</Button>
	<Button
		class="border-[#252525]"
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex += 1)}
	>
		Next
	</Button>
</div>
