<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button/index';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import CurrencyInput from '@canutin/svelte-currency-input';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';
	import { browser } from '$app/environment';
	import { additionalInfo } from '$lib/stores/additionalInfo';

	let { form }: { form: ActionData } = $props();

	let optionsItems = $state<any[]>([]);
	let especificationsItems = $state<any[]>([]);

	let isLoading = $state<boolean>(true);

	let QuillEditor = $state<any>(null);
	if (browser) {
		import('$lib/components/QuillEditor.svelte')
			.then((mod) => {
				QuillEditor = mod.default;
			})
			.catch((err) => {
				console.error('Error loading QuillEditor:', err);
			});
	}

	// Obtener url del servidor
	let serverUrl = $state<string>('');

	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
			return data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server Url');
			return '';
		}
	}

	$effect(() => {
		if (form?.status === 201) {
			console.log(`formStatus: ${form.status}`);
			if (product) {
				toast.success('Producto Actualizado!');
			} else {
				toast.success('Producto creado!');
			}
			goto('/admin/catalog');
		}
	});

	$effect(() => {
		if (form?.errors) {
			console.error(form?.errors);
			toast.error('Error al crear o actualizar el producto');
		}
	});

	$inspect({ errors: form?.errors });

	let fileList = $state<any[]>([]);

	function handleFiles(event: any) {
		const files = Array.from(event.target.files);
		console.log({ files });

		if (files.length > 5) {
			toast.error('No puedes cargar mas de 5 imagenes.');
			fileList = [];
		} else {
			// Ordenar los archivos basados en el patron "{nombre}-{numero}"
			const sortedFiles = files.sort((a: any, b: any) => {
				const getNumber = (name: any) => {
					const match = name.match(/-(\d+)$/);
					return match ? parseInt(match[1], 10) : null;
				};

				const numA = getNumber(a.name);
				const numB = getNumber(b.name);

				// Si ambos tienen numero, ordenar por numero
				if (numA !== null && numB !== null) {
					return numA - numB;
				}

				// Si solo uno tiene numero, ese va despues
				if (numA !== null) return -1;
				if (numB !== null) return 1;

				// Si ninguno tiene numero, mantener el orden original
				return 0;
			});

			fileList = sortedFiles.map((file: any) => ({
				name: file.name,
				size: file.size
			}));
		}
	}

	function formatFileSize(size: any) {
		if (size === 0) return '0 bytes';
		const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(size) / Math.log(1024));
		return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
	}

	function addOptionsItem() {
		if (optionsItems.length < 1) {
			optionsItems = [...optionsItems, {}];
		}
	}

	function removeOptionItem(index: number) {
		optionsItems = optionsItems.filter((_, i) => i != index);
	}

	function addEspecificationsItem() {
		if (especificationsItems.length < 7) {
			especificationsItems = [...especificationsItems, {}];
		}
	}

	function removeEspecificationItem(index: number) {
		especificationsItems = especificationsItems.filter((_, i) => i != index);
	}

	/// load product data for update

	let product = $state<any>(null);
	let visibility = $state<boolean>(true);
	let isvisibilityInitialized = $state<boolean>(false);
	let productStatus = $derived<any>(product?.status || '');

	let editorRef = $state<any>(null);

	$inspect(product);
	$inspect($location_data);

	onMount(async () => {
		try {
			const productId = page.url.searchParams.get('id') as string;
			console.log('Product ID:', productId);

			if (productId) {
				isLoading = true;

				const url = await getServerUrl();
				if (url) {
					try {
						const response = await fetch(`${url}/products/${productId}`);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const productData = await response.json();
						product = productData;
						console.log({ productData });
					} catch (error) {
						console.error('Error al cargar los datos del producto:', error);
						toast.error('Error al cargar el producto');
					}
				}
			} else {
				await getServerUrl();
			}
		} catch (error) {
			console.error('Error en onMount:', error);
		} finally {
			isLoading = false;
		}
	});

	$effect(() => {
		if (product?.additionalInfo) {
			additionalInfo.set(product.additionalInfo);
		}
	});

	$effect(() => {
		if (product?.options) {
			optionsItems = product.options.map((option: any) => ({
				name: option.name || '',
				optionslist: option.optionslist || ''
			}));
		}
	});

	$effect(() => {
		if (product?.especifications) {
			especificationsItems = product.especifications.map((especification: any) => ({
				title: especification.title || '',
				content: especification.content || ''
			}));
		}
	});

	$effect(() => {
		if (product && !isvisibilityInitialized) {
			console.log({ productId: product._id });
			console.log({ imagesUrl: product.imgs });
			visibility = product.visibility ?? true;
			isvisibilityInitialized = true;
		}
	});

	$inspect('AdditionalInfo:', { $additionalInfo });

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const html = editorRef?.getHTML() ?? '';
		formData.set('additionalInfo', html);

		try {
			const response = await fetch(form.action, {
				method: form.method,
				body: formData
			});

			if (!response.ok) {
				console.error('Error al guardar el producto', await response.text());
				toast.error('Error al guardar el producto');
				return;
			}

			additionalInfo.set('');
			const result = await response.json();
			console.log('Producto guardado:', result);

			if (result.product?.productId) {
				toast.success('Producto creado!');
			} else {
				toast.success('Producto actualizado!');
			}
			goto('/admin/catalog');
		} catch (error) {
			console.error('Error en handleSubmit:', error);
			toast.error('Error al procesar la solicitud');
		}
	}
</script>

<div class="flex p-5">
	<button
		aria-label="Volver"
		class="flex justify-center items-center h-10 w-10 dark:bg-[#202020] rounded-sm hover:dark:bg-[#252525]"
		onclick={() => goto('/admin/catalog')}
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
			<h4 class="text-sm dark:text-slate-300">{m.admin_catalog_addproduct_back()}</h4>
			<h2 class="text-xl font-semibold">{m.admin_catalog_addproduct_title()}</h2>
		</div>
	</div>
</div>

{#if isLoading}
	<div class="flex justify-center items-center p-10">
		<p class="text-lg">Cargando...</p>
	</div>
{:else}
	<!-- Este input se enviará con el contenido HTML -->
	<input type="hidden" name="additionalInfo" bind:value={$additionalInfo} />

	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/saveProduct"
		onsubmit={handleSubmit}
		class="flex flex-row gap-4 p-5"
	>
		<!-- Product Id hidden -->
		{#if product}
			<input type="hidden" name="productId" value={product._id} />
			<input type="hidden" name="imagesUrls" value={JSON.stringify(product.imgs)} />
		{/if}

		<!-- Columna 1 -->
		<div class="w-full">
			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>{m.admin_catalog_addproduct_product()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="productname">{m.admin_catalog_addproduct_product_name()}</label>
						<Input type="text" name="productname" value={product?.productname ?? ''} required />
						<label for="productname">
							{#if form?.errors?.productname}
								<span class="dark:text-red-500 font-medium">{form?.errors?.productname[0]}</span>
							{/if}
						</label>
					</div>
					<div>
						<label for="description">{m.admin_catalog_addproduct_product_description()}</label>
						<Textarea
							class="h-20 resize-y"
							name="description"
							maxlength={400}
							value={product?.description ?? ''}
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
					<Card.Title>{m.admin_catalog_addproduct_pricing()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex gap-3 items-center w-full">
						<label for="price">{m.admin_catalog_addproduct_pricing_price()}:</label>
						<CurrencyInput
							name="price"
							value={product?.price ?? 0}
							locale="es-CO"
							currency={$location_data.data[0].country_module.currencies[0].code}
							fractionDigits={0}
							required
							inputClasses={{
								formatted:
									'bg-gray-100 border border-gray-200 dark:border-none dark:bg-[#121212] h-9 rounded-md p-2'
							}}
						/>
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
					<Card.Title>{m.admin_catalog_addproduct_inventory()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="quantity">{m.admin_catalog_addproduct_inventory_quantity()}</label>
						<Input type="number" name="quantity" value={product?.quantity ?? ''} />
						<label for="quantity">
							{#if form?.errors?.quantity}
								<span class="dark:text-red-500 font-medium">{form?.errors?.quantity[0]}</span>
							{/if}
						</label>
					</div>
					<!-- <div>
						<label for="SKU">{m.admin_catalog_addproduct_inventory_sku()}</label>
						<Input type="text" name="SKU" value={`${product !== undefined ? product.SKU : ''}`} />
						<label for="SKU">
							{#if form?.errors?.SKU}
								<span class="dark:text-red-500 font-medium">{form?.errors?.SKU[0]}</span>
							{/if}
						</label>
					</div> -->
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>{m.admin_catalog_addproduct_category()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<label for="category">{m.admin_catalog_addproduct_category_category()}</label>
						<Input name="category" value={product?.category ?? ''} />
						<label for="category">
							{#if form?.errors?.category}
								<span class="dark:text-red-500 font-medium">{form?.errors?.category[0]}</span>
							{/if}
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mb-4">
				<div class="bg-blue-200 border border-blue-300 text-blue-800 p-2 rounded-md">
					<p>
						<strong>Nota:</strong> Para crear las opciones del producto, ingrese un nombre
						descriptivo en el campo <em>Nombre</em> y, en el campo
						<em>Opciones</em>, escriba las opciones separadas por una coma (,). Por ejemplo:
						<em>Nombre: Color; Opciones: rojo, azul, verde</em>.
					</p>
				</div>
				<Card.Header>
					<div class="flex justify-between">
						<h3 class="font-semibold">{m.admin_catalog_addproduct_options()}</h3>
						<button
							type="button"
							class="bg-gray-200 dark:text-white dark:bg-[#303030] h-8 w-32 rounded-md"
							onclick={addOptionsItem}>{m.admin_catalog_addproduct_options_button()}</button
						>
					</div>
				</Card.Header>

				<!-- Options List -->
				{#each optionsItems as option, i}
					<Card.Content class="flex gap-5 items-center">
						<div class="flex gap-3 items-center">
							<label for="optionname">{m.admin_catalog_addproduct_options_name()}: </label>
							<Input type="text" name={`optionname${i}`} value={option?.name ?? ''} />
						</div>
						<div class="flex gap-3 w-full items-center">
							<label for="options">{m.admin_catalog_addproduct_options_options()}:</label>
							<Input type="text" name={`options${i}`} value={option?.optionslist ?? ''} />
						</div>
						<button
							aria-label="Eliminar opción"
							class="flex items-center justify-center bg-gray-200 dark:bg-[#353535] h-8 w-14 rounded-md hover:text-white hover:bg-red-600 dark:hover:bg-red-600"
							onclick={() => removeOptionItem(i)}
						>
							<iconify-icon icon="pajamas:remove" height="1.3rem" width="1.3rem"></iconify-icon>
						</button>
					</Card.Content>
				{/each}
			</Card.Root>

			{#if QuillEditor}
				<Card.Root class="h-auto">
					<Card.Header>
						<Card.Title>Información Adicional</Card.Title>
					</Card.Header>
					<Card.Content>
						<QuillEditor
							bind:this={editorRef}
							value={product?.additionalInfo}
							onChange={(html: any) => additionalInfo.set(html)}
							productId={product?._id ?? ''}
						/>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Columna 2 -->
		<div class="w-full">
			<Card.Root class="mb-4">
				<!-- Descripción informativa para la carga de imágenes -->
				<div class="bg-blue-200 border border-blue-300 text-blue-800 p-2 rounded-md">
					<p>
						<strong>Nota:</strong> Se pueden cargar máximo 5 imágenes. La carga se realiza de forma
						aleatoria por defecto. Si deseas elegir el orden en el que se mostrarán, nombra tus
						archivos usando el formato <em>{'{nombre}'}-{'{numero}'}"</em>
						(ejemplo: <em>producto-1, producto-2, producto-3</em>, etc.).
					</p>
				</div>
				<Card.Header>
					<Card.Title>{m.admin_catalog_addproduct_images()}</Card.Title>
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
					{#if fileList.length > 0}
						<Table.Root class="mt-3">
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>{m.admin_catalog_addproduct_images_name()}</Table.Head>
									<Table.Head>{m.admin_catalog_addproduct_images_type()}</Table.Head>
									<Table.Head>{m.admin_catalog_addproduct_images_size()}</Table.Head>
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
								<img class="h-14 w-14 rounded-md object-fill" src={image} alt={`image ${i}`} />
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- <Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>{m.admin_catalog_addproduct_shipping()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<!- Shipping fee ->
					<div class="flex gap-3 items-center w-full">
						<label for="shippingfee">{m.admin_catalog_addproduct_shipping_shipment_value()}:</label>
						<CurrencyInput
							name="shippingfee"
							value={product !== undefined ? product.shippingfee : 0}
							locale="es-CO"
							currency={$location_data.data[0].country_module.currencies[0].code}
							fractionDigits={0}
							required
							inputClasses={{
								formatted: 'bg-gray-100 border border-gray-200 dark:border-none dark:bg-[#121212] h-9 rounded-md p-2'
							}}
						/>
						<label for="shippingfee">
							{#if form?.errors?.price}
								<span class="dark:text-red-500 font-medium">{form?.errors?.price[0]}</span>
							{/if}
						</label>
					</div>
					<!- Optional shiping product info ->
					<div class="mt-5">
						<label for="weight">{m.admin_catalog_addproduct_shipping_weight()}</label>
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
							<label for="length">{m.admin_catalog_addproduct_shipping_length()}</label>
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
							<label for="width">{m.admin_catalog_addproduct_shipping_width()}</label>
							<Input type="number" name="width" />
							<label for="width">
								{#if form?.errors?.width}
									<span class="dark:text-red-500 font-medium">{form?.errors?.width[0]}</span>
								{/if}
							</label>
						</div>
						<div>
							<label for="height">{m.admin_catalog_addproduct_shipping_height()}</label>
							<Input type="number" name="height" />
							<label for="height">
								{#if form?.errors?.height}
									<span class="dark:text-red-500 font-medium">{form?.errors?.height[0]}</span>
								{/if}
							</label>
						</div>
					</div>
				</Card.Content>
			</Card.Root> -->

			<Card.Root class="mb-4">
				<Card.Header>
					<div class="flex justify-between">
						<h3 class="font-semibold">{m.admin_catalog_addproduct_specifications()}</h3>
						<button
							class="bg-gray-200 dark:bg-[#303030] dark:text-white h-8 w-32 rounded-md"
							onclick={addEspecificationsItem}
							>{m.admin_catalog_addproduct_specifications_button()}</button
						>
					</div>
				</Card.Header>
				<!-- Especification List -->
				{#each especificationsItems as especification, i}
					<Card.Content class="flex gap-5 items-center">
						<div class="flex gap-3 items-center">
							<label for="optionname">{m.admin_catalog_addproduct_specifications_title()}: </label>
							<Input
								class="overflow-x-scroll"
								type="text"
								name={`especificationtitle${i}`}
								value={product !== undefined ? especification?.title : ''}
							/>
						</div>
						<div class="flex gap-3 w-full items-center">
							<label for="options">{m.admin_catalog_addproduct_specifications_content()}:</label>
							<Textarea
								class="dark:bg-[#121212]"
								name={`especificationcontent${i}`}
								value={especification?.content ?? ''}
							/>
						</div>
						<button
							aria-label="Eliminar opción"
							class="flex items-center justify-center bg-gray-200 dark:bg-[#353535] h-8 w-14 rounded-md hover:bg-red-600 dark:hover:bg-red-600"
							onclick={() => removeEspecificationItem(i)}
						>
							<iconify-icon icon="pajamas:remove" height="1.3rem" width="1.3rem"></iconify-icon>
						</button>
					</Card.Content>
				{/each}
			</Card.Root>

			<Card.Root class="mb-4">
				<Card.Header>
					<Card.Title>{m.admin_catalog_addproduct_status()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div>
						<Select.Root
							type="single"
							bind:value={productStatus}
							name="status"
							onValueChange={(v) => (productStatus = v)}
						>
							<Select.Trigger>
								<Select.Label placeholder={m.admin_catalog_addproduct_status_select()} />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="in_stock"
										>{m.admin_catalog_addproduct_status_select_instock()}</Select.Item
									>
									<Select.Item value="sold_out"
										>{m.admin_catalog_addproduct_status_select_soldout()}</Select.Item
									>
								</Select.Group>
							</Select.Content>
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
					<Card.Title>{m.admin_catalog_addproduct_visibility()}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center">
						<input
							class="h-5 w-5 appearance-none rounded-md border cursor-pointer checked:bg-green-600"
							type="checkbox"
							bind:checked={visibility}
						/>
						<span class="ml-2">{m.admin_catalog_addproduct_visibility()}</span>

						<!-- Hidden input para garantizar que siempre haya un valor -->
						<input type="hidden" name="visibility" value={visibility ? 'true' : 'false'} />
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Hidden Input country info -->
			<input class="hidden" type="text" name="country" value={$location_data.data[0].country} />

			<div class="w-full flex justify-end">
				<Button
					type="submit"
					class="px-5 rounded-sm bg-gray-200 dark:bg-[#202020] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-[#252525]"
					>{m.admin_catalog_addproduct_button()}</Button
				>
			</div>
		</div>
	</form>
{/if}
