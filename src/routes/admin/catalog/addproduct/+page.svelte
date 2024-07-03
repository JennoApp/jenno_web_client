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
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import CurrencyInput from '@canutin/svelte-currency-input';

	export let form: ActionData;
	let optionsItems: any[] = [];
	let especificationsItems: any[] = [];

	$: if (form?.status === 201) {
		console.log(`formStatus: ${form.status}`);
		toast.success('Producto creado!');
		goto('/admin/catalog');
	}

	$: console.log({ errors: form?.errors });

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

	function addOptionsItem() {
		if (optionsItems.length < 2) {
			optionsItems = [...optionsItems, optionsItems];
		}
	}

	function removeOptionItem(index: number) {
		optionsItems = optionsItems.filter((_, i) => i != index);
	}

	function addEspecificationsItem() {
		if (especificationsItems.length < 10) {
			especificationsItems = [...especificationsItems, especificationsItems];
		}
	}

	function removeEspecificationItem(index: number) {
		especificationsItems = especificationsItems.filter((_, i) => i != index);
	}

	/// load product data for update

	let product: any;

	$: console.log(product);

	onMount(async () => {
		const queryParams = $page.url;
		const productId = queryParams.searchParams.get('id');

		if (productId !== null) {
			try {
				const response = await fetch(`http://localhost:3000/products/${productId}`);
				const productData = await response.json();

				product = productData;
				console.log({ productData });
			} catch (error) {
				console.log('Error al cargar los datos del producto:', error);
			}
		}
	});

	$: if (product && product.options) {
		optionsItems = product.options.map((option: any) => ({
			name: option.name,
			optionslist: option.optionslist
		}));
	}

  $: if (product && product.especifications) {
    especificationsItems = product.especifications.map((especification: any) => ({
      title: especification.title,
      content: especification.content
    }))
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
			class="dark:text-gray-200"
		></iconify-icon>
	</button>
	<div>
		<div class="flex flex-col ml-3">
			<h4 class="text-sm dark:text-slate-300">Back to product list</h4>
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
						<label for="productname">Product name</label>
						<Input
							type="text"
							name="productname"
							value={`${product !== undefined ? product.productname : ''}`}
							required
						/>
						<label for="productname">
							{#if form?.errors?.productname}
								<span class="dark:text-red-500 font-medium">{form?.errors?.productname[0]}</span>
							{/if}
						</label>
					</div>
					<div>
						<label for="description">Description</label>
						<Textarea
							class="resize-y"
							name="description"
							value={`${product !== undefined ? product.description : ''}`}
						/>
						<label for="description">
							{#if form?.errors?.description}
								<span class="dark:text-red-500 font-medium">{form?.errors?.description[0]}</span>
							{/if}
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Pricing</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex gap-3 items-center w-full">
						<label for="price">Price:</label>
						<CurrencyInput
							name="total"
							value={product !== undefined ? product.price : 0}
							locale="es-CO"
							currency="COP"
							fractionDigits={0}
							required
							inputClasses={{
								formatted: 'bg-[#121212] h-9 rounded-md p-2'
							}}
						/>

						<!-- <Input 
              type="number" 
              name="price" 
              placeholder="Price" 
              min={0} 
              value={`${product !== undefined ? product.price: ""}`}
            /> -->
						<label for="price">
							{#if form?.errors?.price}
								<span class="dark:text-red-500 font-medium">{form?.errors?.price[0]}</span>
							{/if}
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Inventory</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="quantity">Quantity</label>
						<Input
							type="number"
							name="quantity"
							value={`${product !== undefined ? product.quantity : ''}`}
						/>
						<label for="quantity">
							{#if form?.errors?.quantity}
								<span class="dark:text-red-500 font-medium">{form?.errors?.quantity[0]}</span>
							{/if}
						</label>
					</div>
					<div>
						<label for="SKU">SKU</label>
						<Input type="text" name="SKU" value={`${product !== undefined ? product.SKU : ''}`} />
						<label for="SKU">
							{#if form?.errors?.SKU}
								<span class="dark:text-red-500 font-medium">{form?.errors?.SKU[0]}</span>
							{/if}
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Category</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="category">Category</label>
						<Input name="category" value={`${product !== undefined ? product.category : ''}`} />
						<label for="category">
							{#if form?.errors?.category}
								<span class="dark:text-red-500 font-medium">{form?.errors?.category[0]}</span>
							{/if}
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<div class="flex justify-between">
						<h3 class="font-semibold">Opciones</h3>
						<button
							class="bg-purple-600 text-white dark:bg-[#303030] h-8 w-32 rounded-md"
							on:click|preventDefault={addOptionsItem}>Agregar</button
						>
					</div>
				</Card.Header>

				<!-- Options List -->
				{#each optionsItems as option, i}
					<Card.Content class="flex gap-5 items-center">
						<div class="flex gap-3 items-center">
							<label for="optionname">Nombre: </label>
							<Input
								type="text"
								name={`optionname${i}`}
								value={option !== undefined ? option.name : ''}
							/>
						</div>
						<div class="flex gap-3 w-full items-center">
							<label for="options">Opciones:</label>
							<Input
								type="text"
								name={`options${i}`}
								value={option !== undefined ? option.optionslist : ''}
							/>
						</div>
						<button
							class="flex items-center justify-center bg-gray-200 dark:bg-[#353535] h-8 w-14 rounded-md hover:bg-red-500"
							on:click|preventDefault={() => removeOptionItem(i)}
						>
							<iconify-icon icon="pajamas:remove" height="1.3rem" width="1.3rem" />
						</button>
					</Card.Content>
				{/each}
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
						<label for="files">
							{#if form?.errors?.files}
								<span class="dark:text-red-500 font-medium">{form?.errors?.files[0]}</span>
							{/if}
						</label>
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
          {:else if product !== undefined}
            <div class="flex gap-3 mt-5">
            {#each product.imgs as image, i}
              <img class="h-14 w-14 rounded-md object-fill" src={image} alt={`image ${i}`}/>
            {/each}
            </div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Shipping and Delivery</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="weight">Weight</label>
						<Input
							type="number"
							name="weight"
							value={`${product !== undefined ? product.weight : ''}`}
						/>
						<label for="weight">
							{#if form?.errors?.weight}
								<span class="dark:text-red-500 font-medium">{form?.errors?.weight[0]}</span>
							{/if}
						</label>
					</div>
					<div class="flex gap-1">
						<div>
							<label for="length">Length</label>
							<Input
								type="number"
								name="length"
								value={`${product !== undefined ? product.length : ''}`}
							/>
							<label for="length">
								{#if form?.errors?.length}
									<span class="dark:text-red-500 font-medium">{form?.errors?.length[0]}</span>
								{/if}
							</label>
						</div>
						<div>
							<label for="width">Width</label>
							<Input type="number" name="width" />
							<label for="width">
								{#if form?.errors?.width}
									<span class="dark:text-red-500 font-medium">{form?.errors?.width[0]}</span>
								{/if}
							</label>
						</div>
						<div>
							<label for="height">Height</label>
							<Input type="number" name="height" />
							<label for="height">
								{#if form?.errors?.height}
									<span class="dark:text-red-500 font-medium">{form?.errors?.height[0]}</span>
								{/if}
							</label>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<div class="flex justify-between">
						<h3 class="font-semibold">Especificaciones</h3>
						<button
							class="bg-purple-600 dark:bg-[#303030] text-white h-8 w-32 rounded-md"
							on:click|preventDefault={addEspecificationsItem}>Agregar</button
						>
					</div>
				</Card.Header>
				<!-- Especification List -->
				{#each especificationsItems as especification, i}
					<Card.Content class="flex gap-5 items-center">
						<div class="flex gap-3 items-center">
							<label for="optionname">Titulo: </label>
							<Input class="overflow-x-scroll" type="text" name={`especificationtitle${i}`} value={product !== undefined ? especification?.title : ""} />
						</div>
						<div class="flex gap-3 w-full items-center">
							<label for="options">Contenido:</label>
							<Textarea class="dark:bg-[#121212]" name={`especificationcontent${i}`} value={product !== undefined ? especification?.content : ""} />
						</div>
						<button
							class="flex items-center justify-center bg-gray-200 dark:bg-[#353535] h-8 w-14 rounded-md hover:bg-red-500"
							on:click|preventDefault={() => removeEspecificationItem(i)}
						>
							<iconify-icon icon="pajamas:remove" height="1.3rem" width="1.3rem" />
						</button>
					</Card.Content>
				{/each}
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>Status</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<Label for="status">Status</Label>
						<Select.Root
							selected={{
								value: product !== undefined ? product.status : ''
							}}
						>
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
					<label for="status">
						{#if form?.errors?.status}
							<span class="dark:text-red-500 font-medium">{form?.errors?.status[0]}</span>
						{/if}
					</label>
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
				<Button type="submit" class="px-5 rounded-sm bg-purple-600 text-white hover:bg-purple-700">Guardar Producto</Button>
			</div>
		</div>
	</div>
</form>
