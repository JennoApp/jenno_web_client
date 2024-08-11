<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
  import ShippingInFoDialog from '$lib/components/ShippingInFoDialog.svelte';

	export let datalist: any[];
	export let NextPage: boolean = false;
	export let PreviousPage: boolean = false;
	export let itemsCount: number;
	export let pageCount: number;

	export let modifier: Record<string, { header: string; accessor: (data: any) => any }> | null =
		null;

	let modifierData: { [key: string]: any }[] = [];

	$: modifierData = modifier
		? datalist.map((item) => {
				const modifierItem: { [key: string]: any } = {};
				for (const columnKey in modifier) {
					const columnConfig = modifier[columnKey];
					modifierItem[columnKey] = columnConfig.accessor(item);
				}
				return modifierItem;
			})
		: [];

	$: console.log({ modifierData });
</script>

<!-- 
<div class="flex items-center mx-10 mt-5">
	<Input class="max-w-sm" placeholder="Filter names..." type="text" />
</div> -->

<div class="rounded-md border mx-10 my-5">
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
		<h3 class="text-sm dark:text-[#707070]">items: {itemsCount} - pages: {pageCount}</h3>
	</div>
	<div class="flex items-center justify-end space-x-4">
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!PreviousPage}
			on:click={() => {}}
		>
			Previous
		</Button>
		<Button
			class="border-gray-400 dark:border-[#252525]"
			variant="outline"
			size="sm"
			disabled={!NextPage}
			on:click={() => {}}
		>
			Next
		</Button>
	</div>
</div>
