<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	export let form: ActionData;

	$: if (form?.status === 201) {
		console.log(`formStatus: ${form.status}`)
		toast.success("Producto creado!")
		goto('/admin/catalog')
	} 

	let fileList: any[] = [];

	function handleFiles(event) {
		const files = event.target.files;
		fileList = Array.from(files).map((file) => ({
			name: file.name,
			size: file.size
		}));
	}

	function formatFileSize(size) {
		if (size === 0) return '0 bytes';
		const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(size) / Math.log(1024));
		return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
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

<form
	method="POST"
	enctype="multipart/form-data"
	action="?/addProduct"
	use:enhance
>
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
						<Input type="text" name="productname" required />
					</div>
					<div>
						<lebel for="productname">Description</lebel>
						<Textarea class="resize-y" name="description" />
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
						<Input type="number" name="price" placeholder="Price" min={0} />
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
						<Input type="number" name="quantity" />
					</div>
					<div>
						<lebel for="SKU">SKU</lebel>
						<Input type="text" name="SKU" />
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
						<Input name="category" />
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
						<Input name="files" multiple type="file" on:change={handleFiles} />
					</div>
					{#if fileList.length !== 0}
						<Table.Root class="mt-3">
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Type</Table.Head>
									<Table.Head>Size</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each fileList as file, i}
									<Table.Row>
										<Table.Cell>{i + 1}</Table.Cell>
										<Table.Cell>{file.name.split('.')[0]}</Table.Cell>
										<Table.Cell>{file.name.split('.')[1]}</Table.Cell>
										<Table.Cell>{formatFileSize(file.size)}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Shipping and Delivery</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<lebel>Weight</lebel>
						<Input type="number" name="weight" />
					</div>
					<div class="flex gap-1">
						<div>
							<lebel>Length</lebel>
							<Input type="number" name="length" />
						</div>
						<div>
							<lebel>Width</lebel>
							<Input type="number" name="width" />
						</div>
						<div>
							<lebel>Height</lebel>
							<Input type="number" name="height" />
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
						<Label>Status</Label>
						<Select.Root>
							<Select.Trigger>
								<Select.Value placeholder="Select product status" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="in_stock">in stock</Select.Item>
									<Select.Item value="sold_out">sold out</Select.Item>
									<Select.Item value="on_sale">on sale</Select.Item>
									<Select.Item value="active">active</Select.Item>
									<Select.Item value="paused">paused</Select.Item>
									<Select.Item value="inactive">inactive</Select.Item>
								</Select.Group>
							</Select.Content>
							<Select.Input name="status" />
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
						<input type="checkbox" name="visibility" checked />
						<span class="ml-2">visibility</span>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="w-full flex justify-end">
				<Button type="submit" class="px-5 rounded-sm">Add Product</Button>
			</div>
		</div>
	</div>
</form>
