<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button/index';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import CurrencyInput from '@canutin/svelte-currency-input';
	import * as m from '$paraglide/messages';
	import { browser } from '$app/environment';
	import { additionalInfo } from '$lib/stores/additionalInfo';

	let { form }: { form: ActionData } = $props();

	let simpleOptions = $state<any[]>([]);
	let complexOptions = $state<any[]>([]);
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

	// =========================================================
	// SERVER URL
	// =========================================================

	let serverUrl = $state<string>('');

	async function getServerUrl() {
		try {
			const response = await fetch('/api/server');
			const data = await response.json();

			serverUrl = data.server_url;

			return data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server URL:', error);
			return '';
		}
	}

	// =========================================================
	// PRODUCT
	// =========================================================

	let product = $state<any>(null);

	let visibility = $state<boolean>(true);
	let isvisibilityInitialized = $state<boolean>(false);

	let productStatus = $state<string>('in_stock');

	let editorRef = $state<any>(null);

	let fileList = $state<any[]>([]);

	// =========================================================
	// FORM FEEDBACK
	// =========================================================

	$effect(() => {
		if (form?.status === 201) {
			console.log(`formStatus: ${form.status}`);

			if (product) {
				toast.success('Producto actualizado!');
			} else {
				toast.success('Producto creado!');
			}

			goto('/admin/catalog');
		}
	});

	$effect(() => {
		if (form?.errors) {
			console.error(form.errors);
			toast.error('Error al crear o actualizar el producto');
		}
	});

	// =========================================================
	// LOAD PRODUCT
	// =========================================================

	onMount(async () => {
		try {
			const productId = page.url.searchParams.get('id');

			console.log('Product ID:', productId);

			if (productId) {
				isLoading = true;

				const url = await getServerUrl();

				console.log('Server URL:', url);

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

	// =========================================================
	// PRODUCT DATA EFFECTS
	// =========================================================

	$effect(() => {
		if (product?.additionalInfo) {
			additionalInfo.set(product.additionalInfo);
		}
	});

	$effect(() => {
		if (product?.options) {
			simpleOptions = product.options.map((option: any) => ({
				name: option.name ?? '',
				values: Array.isArray(option.values) ? option.values : []
			}));
		}
	});

	$effect(() => {
		if (product?.variants && Array.isArray(product.variants)) {
			const grouped: Record<string, any> = {};

			product.variants.forEach((variant: any) => {
				const optionName = variant.options?.[0]?.name || 'Default';

				if (!grouped[optionName]) {
					grouped[optionName] = {
						name: optionName,
						values: []
					};
				}

				grouped[optionName].values.push({
					label: variant.options?.[0]?.value || '',
					price: variant.price || 0,
					stock: variant.quantity || 0,
					sku: variant.sku || '',
					weight: variant.weight || null,
					color: variant.meta?.color || ''
				});
			});

			complexOptions = Object.values(grouped);
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
			visibility = product.visibility ?? true;
			productStatus = product.status ?? 'in_stock';

			isvisibilityInitialized = true;
		}
	});

	// =========================================================
	// FILES
	// =========================================================

	function handleFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		if (!input.files) {
			fileList = [];
			return;
		}

		const files = Array.from(input.files);

		console.log({ files });

		if (files.length > 5) {
			toast.error('No puedes cargar más de 5 imágenes.');
			input.value = '';
			fileList = [];
			return;
		}

		const sortedFiles = files.sort((a: File, b: File) => {
			const getNumber = (name: string) => {
				const match = name.match(/-(\d+)$/);
				return match ? parseInt(match[1], 10) : null;
			};

			const numA = getNumber(a.name);
			const numB = getNumber(b.name);

			if (numA !== null && numB !== null) {
				return numA - numB;
			}

			if (numA !== null) return -1;
			if (numB !== null) return 1;

			return 0;
		});

		fileList = sortedFiles.map((file: File) => ({
			name: file.name,
			size: file.size
		}));
	}

	function formatFileSize(size: number) {
		if (size === 0) return '0 bytes';

		const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(size) / Math.log(1024));

		return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
	}

	// =========================================================
	// SPECIFICATIONS
	// =========================================================

	function addEspecificationsItem() {
		if (especificationsItems.length < 7) {
			especificationsItems = [
				...especificationsItems,
				{
					title: '',
					content: ''
				}
			];
		}
	}

	function removeEspecificationItem(index: number) {
		especificationsItems = especificationsItems.filter((_, i) => i !== index);
	}

	// =========================================================
	// SIMPLE OPTIONS
	// =========================================================

	function addSimpleOption() {
		simpleOptions = [
			...simpleOptions,
			{
				name: '',
				values: ['']
			}
		];
	}

	function removeSimpleOption(index: number) {
		simpleOptions = simpleOptions.filter((_, i) => i !== index);
	}

	function addSimpleValue(optionIndex: number) {
		const updated = [...simpleOptions];

		updated[optionIndex] = {
			...updated[optionIndex],
			values: [...updated[optionIndex].values, '']
		};

		simpleOptions = updated;
	}

	function removeSimpleValue(optionIndex: number, valueIndex: number) {
		const updated = [...simpleOptions];

		updated[optionIndex] = {
			...updated[optionIndex],
			values: updated[optionIndex].values.filter((_: any, i: number) => i !== valueIndex)
		};

		simpleOptions = updated;
	}

	// =========================================================
	// COMPLEX OPTIONS
	// =========================================================

	function addComplexOption() {
		complexOptions = [
			...complexOptions,
			{
				name: '',
				values: [
					{
						label: '',
						price: null,
						stock: null,
						sku: null,
						weight: null,
						color: null
					}
				]
			}
		];
	}

	function removeComplexOption(index: number) {
		complexOptions = complexOptions.filter((_, i) => i !== index);
	}

	function addComplexValue(optionIndex: number) {
		const updated = [...complexOptions];

		updated[optionIndex] = {
			...updated[optionIndex],
			values: [
				...updated[optionIndex].values,
				{
					label: '',
					price: null,
					stock: null,
					sku: null,
					weight: null,
					color: null
				}
			]
		};

		complexOptions = updated;
	}

	function removeComplexValue(optionIndex: number, valueIndex: number) {
		const updated = [...complexOptions];

		updated[optionIndex] = {
			...updated[optionIndex],
			values: updated[optionIndex].values.filter((_: any, i: number) => i !== valueIndex)
		};

		complexOptions = updated;
	}

	// =========================================================
	// SUBMIT
	// =========================================================

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const formElement = event.currentTarget as HTMLFormElement;
		const formData = new FormData(formElement);

		const html = editorRef?.getHTML() ?? '';

		formData.set('additionalInfo', html);

		// =====================================================
		// SIMPLE OPTIONS
		// =====================================================

		formData.set('options', JSON.stringify(simpleOptions));

		// =====================================================
		// COMPLEX OPTIONS -> VARIANTS
		// =====================================================

		const variants = complexOptions.flatMap((option) =>
			option.values.map((v: any) => ({
				sku: v.sku || '',
				price: v.price || 0,
				quantity: v.stock || 0,
				options: [
					{
						name: option.name,
						value: v.label
					}
				],
				weight: v.weight || null,
				meta: {
					color: v.color || ''
				}
			}))
		);

		formData.set('variants', JSON.stringify(variants));

		try {
			const response = await fetch(formElement.action, {
				method: formElement.method,
				body: formData
			});

			if (!response.ok) {
				console.error('Error al guardar el producto:', await response.text());

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

<!-- ==========================================================
HEADER
=========================================================== -->

<div class="flex w-full items-center gap-3 px-4 py-5 sm:px-6">
	<button
		aria-label="Volver"
		class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 dark:border-[#303030] dark:bg-[#161616] dark:hover:bg-[#202020]"
		onclick={() => goto('/admin/catalog')}
		type="button"
	>
		<iconify-icon
			icon="material-symbols:chevron-left-rounded"
			height="2rem"
			width="2rem"
			class="dark:text-gray-200"
		></iconify-icon>
	</button>

	<div class="min-w-0">
		<p class="text-sm text-gray-500 dark:text-slate-400">
			{m.admin_catalog_addproduct_back()}
		</p>

		<h2 class="text-xl font-semibold tracking-tight dark:text-gray-100 sm:text-2xl">
			{m.admin_catalog_addproduct_title()}
		</h2>
	</div>
</div>

{#if isLoading}
	<div class="flex min-h-[300px] items-center justify-center px-4">
		<p class="text-lg text-gray-500 dark:text-gray-400">Cargando...</p>
	</div>
{:else}
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/saveProduct"
		onsubmit={handleSubmit}
		class="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 pb-10 sm:px-6"
	>
		<!-- =====================================================
		PRODUCT ID
		====================================================== -->

		{#if product}
			<input type="hidden" name="productId" value={product._id} />

			<input type="hidden" name="imagesUrls" value={JSON.stringify(product.imgs)} />
		{/if}

		<!-- =====================================================
		PRODUCT INFORMATION
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_product()}
				</Card.Title>

				<p class="text-sm text-gray-500 dark:text-gray-400">Información básica del producto.</p>
			</Card.Header>

			<Card.Content class="flex flex-col gap-5">
				<!-- Nombre -->
				<div class="flex flex-col gap-1.5">
					<label for="productname" class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_product_name()}
					</label>

					<Input
						id="productname"
						type="text"
						name="productname"
						value={product?.productname ?? ''}
						required
					/>

					{#if form?.errors?.productname}
						<span class="text-xs font-medium text-red-500">
							{form.errors.productname[0]}
						</span>
					{/if}
				</div>

				<!-- Descripción -->
				<div class="flex flex-col gap-1.5">
					<label for="description" class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_product_description()}
					</label>

					<Textarea
						id="description"
						class="min-h-24 resize-y"
						name="description"
						maxlength={400}
						value={product?.description ?? ''}
					/>

					{#if form?.errors?.description}
						<span class="text-xs font-medium text-red-500">
							{form.errors.description[0]}
						</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
        PRICING
        ====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_pricing()}
				</Card.Title>

				<p class="text-sm text-gray-500 dark:text-gray-400">
					Define el precio de venta del producto.
				</p>
			</Card.Header>

			<Card.Content class="flex flex-col gap-5">
				<!-- Información sobre el uso del precio -->
				<div
					class="rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-[#303030] dark:bg-[#202020]"
				>
					<div class="flex gap-2.5">
						<div class="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400">
							<iconify-icon icon="lucide:info" width="17" height="17"></iconify-icon>
						</div>

						<p class="text-xs leading-5 text-gray-600 dark:text-gray-300">
							Este precio se utiliza únicamente cuando el producto
							<strong>no tiene opciones complejas</strong>. Si el producto utiliza opciones
							complejas, debes especificar el precio de cada variante dentro de sus opciones.
						</p>
					</div>
				</div>

				<!-- Precio -->
				<div class="flex flex-col gap-1.5">
					<label for="price" class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_pricing_price()}
					</label>

					<CurrencyInput
						name="price"
						value={product?.price ?? 0}
						locale="es-CO"
						currency="COP"
						fractionDigits={0}
						required
						inputClasses={{
							formatted:
								'bg-gray-100 border border-gray-200 dark:border-none dark:bg-[#121212] h-11 w-full rounded-xl px-3'
						}}
					/>

					{#if form?.errors?.price}
						<span class="text-xs font-medium text-red-500">
							{form.errors.price[0]}
						</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		INVENTORY
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_inventory()}
				</Card.Title>
			</Card.Header>

			<Card.Content class="flex flex-col gap-5">
				<div class="flex flex-col gap-1.5">
					<label for="quantity" class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_inventory_quantity()}
					</label>

					<Input
						id="quantity"
						type="number"
						name="quantity"
						min="0"
						value={product?.quantity ?? ''}
					/>

					{#if form?.errors?.quantity}
						<span class="text-xs font-medium text-red-500">
							{form.errors.quantity[0]}
						</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

        <!-- =====================================================
		SHIPPING
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>Información de envío</Card.Title>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Estos datos se utilizarán para calcular automáticamente el costo del envío.
				</p>
			</Card.Header>

			<Card.Content class="flex flex-col gap-5">
				<!-- Información -->
				<div
					class="rounded-xl border border-gray-200 bg-gray-50 p-3.5
				dark:border-[#303030] dark:bg-[#202020]"
				>
					<div class="flex gap-2.5">
						<div class="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400">
							<iconify-icon icon="lucide:package" width="17" height="17"></iconify-icon>
						</div>

						<div class="flex flex-col gap-1">
							<p class="text-sm font-medium dark:text-gray-200">Datos del paquete</p>

							<p class="text-xs leading-5 text-gray-600 dark:text-gray-400">
								Ingresa el peso y las dimensiones del paquete
								<strong>ya empacado</strong>. Estos datos son los que se utilizarán para cotizar el
								transporte.
							</p>
						</div>
					</div>
				</div>

				<!-- Tipo de paquete -->
				<div class="flex flex-col gap-1.5">
					<label for="shippingPackageType" class="text-sm font-medium dark:text-gray-200">
						Tipo de paquete
					</label>

					<div
						class="flex h-11 items-center rounded-xl border border-gray-200
					bg-gray-100 px-3 text-sm text-gray-700
					dark:border-[#303030] dark:bg-[#121212] dark:text-gray-300"
					>
						Caja
					</div>

					<input type="hidden" name="shippingPackageType" value="box" />
				</div>

				<!-- Peso -->
				<div class="flex flex-col gap-1.5">
					<label for="shippingWeight" class="text-sm font-medium dark:text-gray-200">
						Peso del paquete
					</label>

					<div class="flex gap-2">
						<Input
							id="shippingWeight"
							type="number"
							name="shippingWeight"
							value={product?.shippingWeight ?? product?.weight ?? ''}
							min="0.01"
							step="0.01"
							placeholder="Ej. 2"
							class="h-11 rounded-xl"
							required
						/>

						<div
							class="flex h-11 w-20 shrink-0 items-center justify-center
						rounded-xl border border-gray-200 bg-gray-100 text-sm
						font-medium text-gray-600
						dark:border-[#303030] dark:bg-[#121212] dark:text-gray-300"
						>
							KG
						</div>
					</div>

					<p class="text-xs text-gray-500 dark:text-gray-400">
						Indica el peso total del producto dentro de su empaque.
					</p>

					{#if form?.errors?.shippingWeight}
						<span class="text-xs font-medium text-red-500">
							{form.errors.shippingWeight[0]}
						</span>
					{/if}
				</div>

				<!-- Dimensiones -->
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium dark:text-gray-200"> Dimensiones del paquete </label>

					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div class="flex flex-col gap-1.5">
							<label for="shippingLength" class="text-xs text-gray-500 dark:text-gray-400">
								Largo
							</label>

							<Input
								id="shippingLength"
								type="number"
								name="shippingLength"
								value={product?.shippingLength ?? ''}
								min="1"
								step="0.1"
								placeholder="30"
								class="h-11 rounded-xl"
								required
							/>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="shippingWidth" class="text-xs text-gray-500 dark:text-gray-400">
								Ancho
							</label>

							<Input
								id="shippingWidth"
								type="number"
								name="shippingWidth"
								value={product?.shippingWidth ?? ''}
								min="1"
								step="0.1"
								placeholder="20"
								class="h-11 rounded-xl"
								required
							/>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="shippingHeight" class="text-xs text-gray-500 dark:text-gray-400">
								Alto
							</label>

							<Input
								id="shippingHeight"
								type="number"
								name="shippingHeight"
								value={product?.shippingHeight ?? ''}
								min="1"
								step="0.1"
								placeholder="10"
								class="h-11 rounded-xl"
								required
							/>
						</div>
					</div>

					<p class="text-xs text-gray-500 dark:text-gray-400">
						Las dimensiones corresponden al paquete final y se expresan en centímetros (CM).
					</p>

					<div
						class="flex h-10 items-center rounded-xl border border-gray-200
					bg-gray-100 px-3 text-sm font-medium text-gray-600
					dark:border-[#303030] dark:bg-[#121212] dark:text-gray-300"
					>
						Unidad: CM
					</div>

					<input type="hidden" name="shippingWeightUnit" value="KG" />

					<input type="hidden" name="shippingLengthUnit" value="CM" />

					{#if form?.errors?.shippingLength}
						<span class="text-xs font-medium text-red-500">
							{form.errors.shippingLength[0]}
						</span>
					{/if}

					{#if form?.errors?.shippingWidth}
						<span class="text-xs font-medium text-red-500">
							{form.errors.shippingWidth[0]}
						</span>
					{/if}

					{#if form?.errors?.shippingHeight}
						<span class="text-xs font-medium text-red-500">
							{form.errors.shippingHeight[0]}
						</span>
					{/if}
				</div>

				<!-- Valor declarado -->
				<div class="flex flex-col gap-1.5">
					<label for="shippingDeclaredValue" class="text-sm font-medium dark:text-gray-200">
						Valor declarado
					</label>

					<CurrencyInput
						name="shippingDeclaredValue"
						value={product?.shippingDeclaredValue ?? product?.price ?? 0}
						locale="es-CO"
						currency="COP"
						fractionDigits={0}
						required
						inputClasses={{
							formatted:
								'bg-gray-100 border border-gray-200 dark:border-none dark:bg-[#121212] h-11 w-full rounded-xl px-3'
						}}
					/>

					<p class="text-xs leading-5 text-gray-500 dark:text-gray-400">
						Es el valor del contenido declarado para el transporte. Por defecto se propone el precio
						del producto.
					</p>

					{#if form?.errors?.shippingDeclaredValue}
						<span class="text-xs font-medium text-red-500">
							{form.errors.shippingDeclaredValue[0]}
						</span>
					{/if}
				</div>

				<!-- Resumen -->
				<div
					class="rounded-xl border border-gray-200 p-4
				dark:border-[#303030] dark:bg-[#1a1a1a]"
				>
					<div class="flex flex-col gap-2">
						<p class="text-sm font-medium dark:text-gray-200">Resumen del paquete</p>

						<div class="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
							<div class="flex justify-between gap-3">
								<span class="text-gray-500 dark:text-gray-400">Tipo</span>
								<span class="font-medium dark:text-gray-200">Caja</span>
							</div>

							<div class="flex justify-between gap-3">
								<span class="text-gray-500 dark:text-gray-400">Peso</span>
								<span class="font-medium dark:text-gray-200">
									{product?.shippingWeight ?? product?.weight ?? '—'} KG
								</span>
							</div>

							<div class="flex justify-between gap-3">
								<span class="text-gray-500 dark:text-gray-400">Dimensiones</span>
								<span class="font-medium dark:text-gray-200">
									{product?.shippingLength ?? '—'} ×
									{product?.shippingWidth ?? '—'} ×
									{product?.shippingHeight ?? '—'} CM
								</span>
							</div>

							<div class="flex justify-between gap-3">
								<span class="text-gray-500 dark:text-gray-400"> Cantidad base </span>
								<span class="font-medium dark:text-gray-200"> 1 paquete </span>
							</div>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		CATEGORY
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_category()}
				</Card.Title>
			</Card.Header>

			<Card.Content>
				<div class="flex flex-col gap-1.5">
					<label for="category" class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_category_category()}
					</label>

					<Input id="category" name="category" value={product?.category ?? ''} />

					{#if form?.errors?.category}
						<span class="text-xs font-medium text-red-500">
							{form.errors.category[0]}
						</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		IMAGES
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<div
				class="border-b border-blue-300 bg-blue-50 px-5 py-4 text-blue-800 dark:border-[#303030] dark:bg-[#202020] dark:text-gray-200"
			>
				<div class="flex gap-3">
					<div class="mt-0.5 shrink-0">
						<iconify-icon icon="lucide:info" width="18" height="18"></iconify-icon>
					</div>

					<p class="text-sm leading-6">
						<strong>Imágenes:</strong>
						puedes cargar máximo 5 imágenes. Para controlar el orden, nombra los archivos usando el formato
						<em>{'{nombre}'}-{'{numero}'}</em>. Ejemplo:
						<em>producto-1, producto-2, producto-3</em>.
					</p>
				</div>
			</div>

			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_images()}
				</Card.Title>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="files" class="text-sm font-medium dark:text-gray-200">
						Seleccionar imágenes
					</label>

					<Input
						id="files"
						name="files"
						multiple
						type="file"
						accept="image/*"
						onchange={handleFiles}
					/>

					{#if form?.errors?.files}
						<span class="text-xs font-medium text-red-500">
							{form.errors.files[0]}
						</span>
					{/if}
				</div>

				{#if fileList.length > 0}
					<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#303030]">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>
										{m.admin_catalog_addproduct_images_name()}
									</Table.Head>
									<Table.Head>
										{m.admin_catalog_addproduct_images_type()}
									</Table.Head>
									<Table.Head>
										{m.admin_catalog_addproduct_images_size()}
									</Table.Head>
								</Table.Row>
							</Table.Header>

							<Table.Body>
								{#each fileList as file, i}
									<Table.Row>
										<Table.Cell>{i + 1}</Table.Cell>
										<Table.Cell class="max-w-[260px] truncate">
											{file.name.split('.')[0]}
										</Table.Cell>
										<Table.Cell>
											{file.name.split('.').pop()}
										</Table.Cell>
										<Table.Cell>
											{formatFileSize(file.size)}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{:else if product?.imgs?.length}
					<div class="flex flex-wrap gap-3">
						{#each product.imgs as image, i}
							<img
								class="h-20 w-20 rounded-xl border border-gray-200 object-cover dark:border-[#303030]"
								src={image}
								alt={`Imagen del producto ${i + 1}`}
							/>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		OPTIONS
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<div
				class="border-b border-blue-300 bg-blue-50 px-5 py-4 text-blue-800 dark:border-[#303030] dark:bg-[#202020] dark:text-gray-200"
			>
				<div class="flex gap-3">
					<div class="mt-0.5 shrink-0">
						<iconify-icon icon="lucide:info" width="18" height="18"></iconify-icon>
					</div>

					<p class="text-sm leading-6">
						Para crear opciones del producto, utiliza un nombre descriptivo y agrega sus valores.
						Las opciones complejas permiten definir precio, stock, SKU, peso y color por variante.
					</p>
				</div>
			</div>

			<Card.Header>
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Card.Title>
							{m.admin_catalog_addproduct_options()}
						</Card.Title>

						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Configura las variantes del producto.
						</p>
					</div>

					<div class="flex flex-col gap-2 sm:flex-row">
						<Button type="button" class="rounded-lg" onclick={addSimpleOption}>
							+ Opción simple
						</Button>

						<Button type="button" variant="outline" class="rounded-lg" onclick={addComplexOption}>
							+ Opción compleja
						</Button>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4">
				<!-- SIMPLE OPTIONS -->
				{#each simpleOptions as option, i}
					<div
						class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#303030] dark:bg-[#1a1a1a]"
					>
						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-1.5">
								<label class="text-sm font-medium dark:text-gray-200"> Nombre de la opción </label>

								<Input type="text" bind:value={option.name} placeholder="Ej. Color" />
							</div>

							<div class="flex flex-col gap-3">
								<div>
									<h4 class="text-sm font-semibold dark:text-gray-200">Valores</h4>

									<p class="text-xs text-gray-500 dark:text-gray-400">
										Agrega los valores disponibles para esta opción.
									</p>
								</div>

								{#each option.values as value, vi}
									<div class="flex gap-2">
										<Input type="text" bind:value={option.values[vi]} placeholder="Ej. Rojo" />

										<button
											type="button"
											aria-label="Eliminar valor"
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-[#303030] dark:bg-[#202020]"
											onclick={() => removeSimpleValue(i, vi)}
										>
											<iconify-icon icon="lucide:trash-2" width="16" height="16"></iconify-icon>
										</button>
									</div>
								{/each}

								<Button
									type="button"
									variant="outline"
									class="w-full rounded-lg sm:w-fit"
									onclick={() => addSimpleValue(i)}
								>
									+ Agregar valor
								</Button>
							</div>

							<Button
								type="button"
								variant="destructive"
								class="w-full rounded-lg sm:w-fit"
								onclick={() => removeSimpleOption(i)}
							>
								Eliminar opción
							</Button>
						</div>
					</div>
				{/each}

				<!-- COMPLEX OPTIONS -->
				{#each complexOptions as option, i}
					<div
						class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#303030] dark:bg-[#1a1a1a]"
					>
						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-1.5">
								<label class="text-sm font-medium dark:text-gray-200"> Nombre de la opción </label>

								<Input type="text" bind:value={option.name} placeholder="Ej. Peso" />
							</div>

							<div class="flex flex-col gap-3">
								<div>
									<h4 class="text-sm font-semibold dark:text-gray-200">Variantes</h4>

									<p class="text-xs text-gray-500 dark:text-gray-400">
										Cada variante puede tener su propio precio, stock, SKU, peso y color.
									</p>
								</div>

								{#each option.values as value, vi}
									<div
										class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#202020]"
									>
										<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> Label </label>

												<Input type="text" bind:value={value.label} placeholder="Ej. 3kg" />
											</div>

											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> Precio </label>

												<Input type="number" min="0" bind:value={value.price} />
											</div>

											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> Stock </label>

												<Input type="number" min="0" bind:value={value.stock} />
											</div>

											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> SKU </label>

												<Input type="text" bind:value={value.sku} />
											</div>

											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> Peso </label>

												<Input
													type="number"
													min="0"
													step="0.01"
													bind:value={value.weight}
													placeholder="Ej. 2"
												/>
											</div>

											<div class="flex flex-col gap-1.5">
												<label class="text-xs font-medium dark:text-gray-200"> Color </label>

												<Input type="text" bind:value={value.color} placeholder="Ej. Negro" />
											</div>
										</div>

										<div class="mt-4 flex justify-end">
											<button
												type="button"
												class="flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
												onclick={() => removeComplexValue(i, vi)}
											>
												<iconify-icon icon="lucide:trash-2" width="15" height="15"></iconify-icon>

												Eliminar variante
											</button>
										</div>
									</div>
								{/each}

								<Button
									type="button"
									variant="outline"
									class="w-full rounded-lg sm:w-fit"
									onclick={() => addComplexValue(i)}
								>
									+ Agregar variante
								</Button>
							</div>

							<Button
								type="button"
								variant="destructive"
								class="w-full rounded-lg sm:w-fit"
								onclick={() => removeComplexOption(i)}
							>
								Eliminar opción
							</Button>
						</div>
					</div>
				{/each}

				<!-- HIDDEN SIMPLE OPTIONS -->
				{#each simpleOptions as option, i}
					<input type="hidden" name={`simpleOption_${i}_name`} value={option.name} />

					<input
						type="hidden"
						name={`simpleOption_${i}_values`}
						value={option.values.join('|||')}
					/>
				{/each}

				<input type="hidden" name="simpleOptionsCount" value={simpleOptions.length} />

				<!-- HIDDEN COMPLEX OPTIONS -->
				{#each complexOptions as option, i}
					{#each option.values as value, vi}
						<input type="hidden" name={`variant_${i}_${vi}_optionName`} value={option.name} />

						<input type="hidden" name={`variant_${i}_${vi}_label`} value={value.label} />

						<input type="hidden" name={`variant_${i}_${vi}_price`} value={value.price || 0} />

						<input type="hidden" name={`variant_${i}_${vi}_stock`} value={value.stock || 0} />

						<input type="hidden" name={`variant_${i}_${vi}_sku`} value={value.sku || ''} />

						<input type="hidden" name={`variant_${i}_${vi}_weight`} value={value.weight || ''} />

						<input type="hidden" name={`variant_${i}_${vi}_color`} value={value.color || ''} />
					{/each}
				{/each}

				<input type="hidden" name="complexOptionsCount" value={complexOptions.length} />
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		ADDITIONAL INFORMATION
		====================================================== -->

		{#if QuillEditor}
			<Card.Root class="overflow-hidden rounded-2xl">
				<Card.Header>
					<Card.Title>Información adicional</Card.Title>

					<p class="text-sm text-gray-500 dark:text-gray-400">
						Información detallada que se mostrará en la página del producto.
					</p>
				</Card.Header>

				<Card.Content>
					<QuillEditor
						bind:this={editorRef}
						value={product?.additionalInfo}
						onChange={(html: string) => additionalInfo.set(html)}
						productId={product?._id ?? ''}
					/>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- =====================================================
		SPECIFICATIONS
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Card.Title>
							{m.admin_catalog_addproduct_specifications()}
						</Card.Title>

						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Agrega características técnicas o información estructurada.
						</p>
					</div>

					<Button
						type="button"
						variant="outline"
						class="rounded-lg"
						onclick={addEspecificationsItem}
					>
						{m.admin_catalog_addproduct_specifications_button()}
					</Button>
				</div>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4">
				{#if especificationsItems.length === 0}
					<div
						class="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-[#404040]"
					>
						<p class="text-sm text-gray-500 dark:text-gray-400">Aún no hay especificaciones.</p>
					</div>
				{/if}

				{#each especificationsItems as especification, i}
					<div
						class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#303030] dark:bg-[#1a1a1a]"
					>
						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-1.5">
								<label
									for={`especificationtitle-${i}`}
									class="text-sm font-medium dark:text-gray-200"
								>
									{m.admin_catalog_addproduct_specifications_title()}
								</label>

								<Input
									id={`especificationtitle-${i}`}
									type="text"
									name={`especificationtitle${i}`}
									value={especification?.title ?? ''}
									placeholder="Ej. Material"
								/>
							</div>

							<div class="flex flex-col gap-1.5">
								<label
									for={`especificationcontent-${i}`}
									class="text-sm font-medium dark:text-gray-200"
								>
									{m.admin_catalog_addproduct_specifications_content()}
								</label>

								<Textarea
									id={`especificationcontent-${i}`}
									name={`especificationcontent${i}`}
									value={especification?.content ?? ''}
									placeholder="Ej. Acero inoxidable"
									class="min-h-24 resize-y dark:bg-[#121212]"
								/>
							</div>

							<div class="flex justify-end">
								<button
									type="button"
									aria-label="Eliminar especificación"
									class="flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
									onclick={() => removeEspecificationItem(i)}
								>
									<iconify-icon icon="lucide:trash-2" width="15" height="15"></iconify-icon>

									Eliminar
								</button>
							</div>
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		STATUS
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_status()}
				</Card.Title>

				<p class="text-sm text-gray-500 dark:text-gray-400">
					Define si el producto puede comprarse actualmente.
				</p>
			</Card.Header>

			<Card.Content>
				<Select.Root type="single" bind:value={productStatus} name="status">
					<Select.Trigger class="h-11 rounded-xl border border-gray-300 dark:border-[#404040]">
						{productStatus === 'in_stock' ? 'Disponible' : 'Agotado'}
					</Select.Trigger>

					<Select.Content>
						<Select.Group>
							<Select.Item value="in_stock">
								{m.admin_catalog_addproduct_status_select_instock()}
							</Select.Item>

							<Select.Item value="sold_out">
								{m.admin_catalog_addproduct_status_select_soldout()}
							</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>

				{#if form?.errors?.status}
					<span class="mt-2 block text-xs font-medium text-red-500">
						{form.errors.status[0]}
					</span>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		VISIBILITY
		====================================================== -->

		<Card.Root class="overflow-hidden rounded-2xl">
			<Card.Header>
				<Card.Title>
					{m.admin_catalog_addproduct_visibility()}
				</Card.Title>

				<p class="text-sm text-gray-500 dark:text-gray-400">
					Controla si el producto será visible para los visitantes.
				</p>
			</Card.Header>

			<Card.Content>
				<label class="flex cursor-pointer items-center gap-3">
					<input
						class="h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:bg-green-600 dark:border-[#404040]"
						type="checkbox"
						bind:checked={visibility}
					/>

					<span class="text-sm font-medium dark:text-gray-200">
						{m.admin_catalog_addproduct_visibility()}
					</span>
				</label>

				<input type="hidden" name="visibility" value={visibility ? 'true' : 'false'} />
			</Card.Content>
		</Card.Root>

		<!-- =====================================================
		COUNTRY
		====================================================== -->

		<input type="hidden" name="country" value="Colombia" />

		<!-- =====================================================
		SUBMIT
		====================================================== -->

		<div class="sticky bottom-4 z-10 flex justify-end">
			<Button
				type="submit"
				class="h-12 w-full rounded-xl bg-gray-900 px-6 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
			>
				{m.admin_catalog_addproduct_button()}
			</Button>
		</div>
	</form>
{/if}
