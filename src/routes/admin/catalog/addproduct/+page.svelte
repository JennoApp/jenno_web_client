<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms'

	// cargar imagenes
	let files: FileList;

	$: if (files) {
		console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	}
</script>

<div class="flex p-5">
	<button
		class="flex justify-center items-center h-10 w-10 dark:bg-[#202020] rounded-sm hover:dark:bg-[#252525]"
		on:click={() => goto('/admin/catalog')}
	>
		<iconify-icon
			icon="material-symbols:chevron-left-rounded"
			heigth="2.5rem"
			width="2.5rem"
			class="text-gray-200"
		></iconify-icon>
	</button>
	<div>
		<div class="flex flex-col ml-3">
			<h4 class="text-sm text-slate-300">Back to product list</h4>
			<h2 class="text-xl font-semibold">Nuevo producto</h2>
		</div>
	</div>
</div>

<form method="POST" enctype="multipart/form-data" action="?/addProduct" use:enhance>
	<div class="flex flex-row gap-4 p-5">
		<!-- Columna 1 -->
		<div class="w-full">
			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Description</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel for="productname">Product name</lebel>
						<Input type="text" name="productname" />
					</div>
					<div>
						<lebel for="productname">Description</lebel>
						<Textarea class="resize-y" />
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Pricing</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Price</lebel>
						<Input type="number" placeholder="Price" min={0} />
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Inventory</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Quantity</lebel>
						<Input type="number" />
					</div>
					<div>
						<lebel for="SKU">SKU</lebel>
						<Input type="text" />
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Category</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Category</lebel>
						<Input />
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Columna 2 -->
		<div class="w-full">
			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Products Images</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Upload multiples files of any type:</lebel>
						<Input name="files" multiple type="file" />
						{#if files}
							<h2>Selected Files</h2>
							{#each Array.from(files) as file}
								<p>{file.name} ({file.size} bytes)</p>
							{/each}
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Shipping and Delivery</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Weight</lebel>
						<Input type="number" />
					</div>
					<div class="flex gap-1">
						<div>
							<lebel>Length</lebel>
							<Input type="number" />
						</div>
						<div>
							<lebel>Width</lebel>
							<Input type="number" />
						</div>
						<div>
							<lebel>Height</lebel>
							<Input type="number" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Status</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Status</lebel>
						<Select.Root>
							<Select.Trigger>
								<Select.Value placeholder="Select product status" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="in_stock">in stock</Select.Item>
								<Select.Item value="sold_out">sold out</Select.Item>
								<Select.Item value="on_sale">on sale</Select.Item>
								<Select.Item value="active">active</Select.Item>
								<Select.Item value="paused">paused</Select.Item>
								<Select.Item value="inactive">inactive</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Visibility</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<span class="ml-2">visibility</span>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="w-full flex justify-end">
				<Button  type="submit" class="px-5 rounded-sm">Add Product</Button>
			</div>
		</div>
	</div>
</form>
