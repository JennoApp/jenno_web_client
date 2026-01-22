<script lang="ts">
	/* ---- tipos ---- */
	interface Option {
		name: string;
		optionslist: string[];
	}

	interface Especification {
		title: string;
		content: string;
	}

	interface Variant {
		_id?: string;
		sku?: string;
		price: number;
		quantity?: number;
		imgs?: string[];
		options: { name: string; value: string }[];
		meta?: any;
	}

	interface CardData {
		_id: string;
		username: string;
		productname: string;
		description: String;
		options: Option[];
		especifications: Especification[];
		imgs: string[];
		price: number;
		category: string;
		user: string;
		status?: string;
		quantity?: number;
		additionalInfo?: string;
		reviews?: any[];
		shippingfee?: number;
		variants?: Variant[];
	}

	/* ---- imports ---- */
	import * as Dialog from '$lib/components/ui/dialog';
	import type { PageServerData } from './$types';
	import * as Carousel from '$lib/components/ui/carousel/index';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import { addToCart, cartItems } from '$lib/stores/cartStore';
	import { goto } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import { getStartColor } from '$lib/utils/getstartcolor';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import RandomProducts from '$lib/components/Randomuserproducts.svelte';
	import { page } from '$app/state';
	import * as m from '$paraglide/messages';
	import { toast } from 'svelte-sonner';
	import Label from '$lib/components/Label.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { onMount } from 'svelte';

	/* ---- props / estado ---- */
	let { data: propData } = $props();
	let data: PageServerData = $state(propData);

	let userInfo: any = page.data.user;
	let product = $derived<any>(data.product);

	let serverUrl = $state<string>('');
	let api = $state<CarouselAPI>();
	let indexCarousel = $state<number>(0);
	let profileImg = $state<string>('');
	let openDialogreview = $state<boolean>(false);
	let quantity = $state(1);

	let selectedOptions = $state<{ name: string; value: string }[]>([]);
	let selectedVariantOptions = $state<Record<string, string>>({});

	let userName = $state<string>('');
	let matchedVariant = $state<Variant | null>(null);

	let mainApi = $state<any>(null);

	// Función para sincronizar carousel
	function syncCarousel(index: number) {
		indexCarousel = index;
		mainApi?.scrollTo(index);
	}

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener Url del Servidor');
		}
	}

	// get username
	async function getUserName(id: string) {
		try {
			await getServerUrl();
			const response = await fetch(`${serverUrl}/users/getusername/${id}`);

			if (response.ok) {
				const data = await response.json();
				userName = data.username;
			}
		} catch (error) {
			console.error('Error al cargar el nombre del usuario');
		}
	}

	/* ---- inspección (debug) ---- */
	$inspect('product', product);
	$inspect('userInfo', userInfo);
	$inspect('pathname', page.url.pathname);
	$inspect(`/${product.username}/${product._id}`);
	$inspect('CCCCCartItems', $cartItems);
	$inspect('selectedOptions', selectedOptions);

	// calcular la calificacion
	const calculateStars = (reviews: any[]) => {
		if (!Array.isArray(reviews) || reviews.length === 0) {
			return 0;
		}

		const total = reviews.reduce((accum, review) => accum + (review.stars || 0), 0);

		return total / reviews.length;
	};

	let totalStars = $derived(calculateStars(product.reviews || []));
	// $inspect('totalStars', totalStars);

	$effect(() => {
		if (product?.user) {
			getUserName(product.user);
		}
	});

	$effect(() => {
		getServerUrl().then(() => {
			if (!product || !product?.user) {
				console.error(
					'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
				);
				return;
			}

			fetch(`${serverUrl}/users/getprofileimg/${product?.user}`)
				.then((response) => response.json())
				.then((userData) => {
					console.log({ userData });
					profileImg = userData?.profileImg;
				})
				.catch((error: any) => {
					console.error(`Error al obtener la imagen de perfil: ${error.message}`);
				});
		});
	});

	/* ========== LOGICA DE VARIANTS y OPTIONS ========== */
	/* ---- NORMALIZACIÓN DE VARIANTS ---- */
	function normalizeVariants(variants: Variant[]): Variant[] {
		return variants.map((v) => {
			const options = [...(v.options ?? [])];

			if (v.meta?.color && !options.some((o) => o.name === 'Color')) {
				options.push({
					name: 'Color',
					value: v.meta.color
				});
			}

			// eliminar color en meta para evitar duplicados posteriores en la UI
			const metaCopy = { ...(v.meta ?? {}) };
			if (metaCopy.color) delete metaCopy.color;

			return {
				...v,
				options,
				meta: Object.keys(metaCopy).length ? metaCopy : undefined
			};
		});
	}

	// normalizedVariants es un $derived (es una función que debes llamar: normalizedVariants())
	const normalizedVariants = $derived<Variant[]>(() => {
		if (!product?.variants || product.variants.length === 0) return [];
		return normalizeVariants(product.variants);
	});

	// obtiene nombres de las opciones que usan las variants, respetando el orden de la primera variante
	function getVariantOptionNames(): string[] {
		// usa normalizedVariants()
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return [];
		const first = nv[0];
		return first.options ? first.options.map((o) => o.name) : [];
	}

	// obtén todos los valores únicos para una opción de variante (no usado en template, pero consistente)
	function getVariantValues(optionName: string): string[] {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return [];
		const set = new Set<string>();
		for (const v of nv) {
			const opt = v.options?.find((o) => o.name === optionName);
			if (opt?.value) set.add(opt.value);
		}
		return Array.from(set);
	}

	function getAllVariantOptionNames(): string[] {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return [];

		const set = new Set<string>();
		nv.forEach((v) => v.options.forEach((o) => set.add(o.name)));

		return Array.from(set);
	}

	// devuelve TODOS los valores únicos para una optionName (sin filtrar)
	function getAllVariantValues(optionName: string): string[] {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return [];

		const set = new Set<string>();
		for (const v of nv) {
			const opt = v.options.find((o) => o.name === optionName);
			if (opt?.value) set.add(opt.value);
		}
		return Array.from(set);
	}

	/*
  Determina si un valor concreto de optionName es compatible con las selecciones
  ya realizadas (selectedVariantOptions). Excluye la propia optionName de la verificación,
  para que al seleccionar un value para esa opción no dependa de sí misma.
*/
	function isValueCompatibleWithSelection(optionName: string, value: string): boolean {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return false;

		return nv.some((v) => {
			// esta variante debe tener optionName=value
			const matchesCurrent = v.options.some((o) => o.name === optionName && o.value === value);
			if (!matchesCurrent) return false;

			// y debe coincidir con lo ya seleccionado
			return Object.entries(selectedVariantOptions).every(([k, vSel]) => {
				if (k === optionName) return true;
				return v.options.some((o) => o.name === k && o.value === vSel);
			});
		});
	}

	function getFilteredVariantValues(optionName: string): string[] {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) return [];

		const values = new Set<string>();

		for (const v of nv) {
			// ❌ descartar variants que no coincidan con lo ya seleccionado
			let valid = true;

			for (const [key, selectedValue] of Object.entries(selectedVariantOptions)) {
				if (key === optionName) continue;

				const opt = v.options.find((o) => o.name === key);
				if (!opt || opt.value !== selectedValue) {
					valid = false;
					break;
				}
			}

			if (!valid) continue;

			// ✅ agregar valores posibles
			const opt = v.options.find((o) => o.name === optionName);
			if (opt?.value) values.add(opt.value);
		}

		return Array.from(values);
	}

	$effect(() => {
		const nv = normalizedVariants();
		if (!nv || nv.length === 0) {
			matchedVariant = null;
			return;
		}

		const required = getAllVariantOptionNames();

		// exigir selección completa
		const allSelected = required.every((n) => !!selectedVariantOptions[n]);
		if (!allSelected) {
			matchedVariant = null;
			return;
		}

		const found = nv.find((variant) =>
			variant.options.every((o) => selectedVariantOptions[o.name] === o.value)
		);

		matchedVariant = found ?? null;
	});

	// Precio mostrado: si hay variants, mostramos matchedVariant.price o null; si no, product.price
	let displayedPrice = $derived(() => {
		const nv = normalizedVariants();
		if (nv && nv.length > 0) {
			if (!areAllVariantOptionsSelected()) return null;
			return matchedVariant?.price ?? null;
		}
		return product?.price ?? 0;
	});

	/* ---- manejadores de selección ---- */
	function getSelectedValue(optionName: string) {
		return selectedOptions.find((o) => o.name === optionName)?.value;
	}

	function getSelectedVariantValue(optionName: string): string | null {
		return selectedVariantOptions[optionName] ?? null;
	}

	function handleSimpleOptionChange(optionName: string, optionValue: string) {
		const index = selectedOptions.findIndex((o) => o.name === optionName);
		if (index !== -1) {
			selectedOptions = [
				...selectedOptions.slice(0, index),
				{ name: optionName, value: optionValue },
				...selectedOptions.slice(index + 1)
			];
		} else {
			selectedOptions = [...selectedOptions, { name: optionName, value: optionValue }];
		}
	}

	/*
  Para el select de cada opción vamos a:
  - mostrar TODOS los valores (getAllVariantValues)
  - marcar disabled=true para aquellos que NO son compatibles con la selección actual,
    excepto para la opción principal (primer nombre) — esa dejamos siempre enabled.
  - si el usuario cambia una opción, reseteamos otras que queden incompatibles.
*/

	function handleVariantOptionChange(optionName: string, optionValue: string) {
		selectedVariantOptions = { ...selectedVariantOptions, [optionName]: optionValue };

		const names = getAllVariantOptionNames();

		for (const name of names) {
			if (name === optionName) continue;
			const current = selectedVariantOptions[name];
			if (!current) continue;

			if (!isValueCompatibleWithSelection(name, current)) {
				const copy = { ...selectedVariantOptions };
				delete copy[name];
				selectedVariantOptions = copy;
			}
		}

		const baseSimple = (selectedOptions || []).filter((o) => !names.includes(o.name));
		const variantSelectedArray = Object.entries(selectedVariantOptions).map(([k, v]) => ({
			name: k,
			value: v
		}));

		selectedOptions = [...baseSimple, ...variantSelectedArray];
	}

	function areAllSimpleOptionsSelected(
		product: any,
		selectedOptions: { name: string; value: string }[]
	): boolean {
		if (!Array.isArray(product?.options) || product.options.length === 0) {
			return true;
		}

		const requiredOptionNames = product.options.map((o) => o.name);
		const selectedOptionNames = selectedOptions.map((o) => o.name);

		return requiredOptionNames.every((name) => selectedOptionNames.includes(name));
	}

	/* ---- añadir al carrito ---- */
	function buildFinalSelectedOptions() {
		const variantOptionNames = getAllVariantOptionNames();
		const baseSimple = (selectedOptions || []).filter((o) => !variantOptionNames.includes(o.name));
		const variantEntries = Object.entries(selectedVariantOptions).map(([k, v]) => ({
			name: k,
			value: v
		}));
		// finalSelectedOptions: simples no-variant + opciones complejas seleccionadas
		return [...baseSimple, ...variantEntries];
	}

	function handleAddToCart() {
		// Verificar si el usuario está en sesión
		if (!userInfo || !userInfo._id) {
			toast.error('Debes iniciar sesión para agregar al carrito.');
			return;
		}

		// Verificar si el producto está agotado
		if (product.status === 'sold_out') {
			toast.error('Este producto está agotado y no se puede agregar al carrito.');
			return;
		}

		// Validación opciones simples: solo si existen opciones simples en el producto
		const hasSimpleOptions = Array.isArray(product?.options) && product.options.length > 0;
		if (hasSimpleOptions && !areAllSimpleOptionsSelected(product, selectedOptions)) {
			toast.error('Selecciona todas las opciones del producto antes de agregar al carrito.');
			return;
		}

		// Variants
		let variantToSend: Variant | null = null;
		const nv = normalizedVariants();
		const hasVariants = Array.isArray(nv) && nv.length > 0;
		if (hasVariants) {
			// exigir selección completa de variantes
			if (!areAllVariantOptionsSelected()) {
				toast.error('Selecciona todas las opciones del producto antes de agregar al carrito.');
				return;
			}
			variantToSend = matchedVariant;
			if (!variantToSend) {
				toast.error('Selecciona la variante correcta antes de agregar al carrito.');
				return;
			}
			if (variantToSend.quantity !== undefined && variantToSend.quantity <= 0) {
				toast.error('La variante seleccionada no tiene stock.');
				return;
			}
		} else {
			// no hay variants: verificar stock del producto
			if ((product.quantity ?? 0) <= 0) {
				toast.error('Este producto no tiene stock disponible.');
				return;
			}
		}

		const finalSelectedOptions = buildFinalSelectedOptions();
		addToCart(product, finalSelectedOptions, quantity, variantToSend || undefined);
		toast.success('Producto agregado al carrito');
	}

	function handleBuyNow() {
		// Verificar si el usuario está en sesión
		if (!userInfo || !userInfo._id) {
			toast.error('Debes iniciar sesión para continuar.');
			return;
		}

		// Verificar si el producto está agotado
		if (product.status === 'sold_out') {
			toast.error('Este producto está agotado.');
			return;
		}

		// Validación opciones simples: solo si existen opciones simples en el producto
		const hasSimpleOptions = Array.isArray(product?.options) && product.options.length > 0;
		if (hasSimpleOptions && !areAllSimpleOptionsSelected(product, selectedOptions)) {
			toast.error('Selecciona todas las opciones del producto antes de continuar.');
			return;
		}

		let variantToSend: Variant | null = null;
		const nv = normalizedVariants();
		const hasVariants = Array.isArray(nv) && nv.length > 0;
		if (hasVariants) {
			if (!areAllVariantOptionsSelected()) {
				toast.error('Selecciona todas las opciones del producto antes de continuar.');
				return;
			}
			variantToSend = matchedVariant;
			if (!variantToSend) {
				toast.error('Selecciona la variante correcta antes de continuar.');
				return;
			}
			if (variantToSend.quantity !== undefined && variantToSend.quantity <= 0) {
				toast.error('La variante seleccionada no tiene stock.');
				return;
			}
		} else {
			if ((product.quantity ?? 0) <= 0) {
				toast.error('Este producto no tiene stock disponible.');
				return;
			}
		}

		const finalSelectedOptions = buildFinalSelectedOptions();
		addToCart(product, finalSelectedOptions, quantity, variantToSend || undefined);

		// Ir al carrito
		goto('/cart');
	}

	function handleOpenDialgoReview() {
		openDialogreview = true;
	}

	function areAllVariantOptionsSelected(): boolean {
		const names = getAllVariantOptionNames();
		if (!names.length) return true;
		return names.every((n) => !!selectedVariantOptions[n]);
	}

	onMount(() => {
		if (!mainApi) return;

		mainApi.on('select', () => {
			indexCarousel = mainApi.selectedScrollSnap();
		});
	});
</script>

<svelte:head>
	<title>{data.product?.productname} - Comprar en Jenno</title>
	<meta
		name="description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>

	<!-- Open Graph (Facebook, WhatsApp, etc.) -->
	<meta property="og:title" content="{data.product?.productname} - Comprar en Jenno" />
	<meta
		property="og:description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>
	<meta property="og:type" content="product" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={data.product?.imgs[0]} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Imagen del producto {data.product?.productname}" />
	<meta property="product:brand" content={data.product?.username || 'Marca desconocida'} />
	<meta property="product:category" content={data.product?.category || 'Otros'} />
	<meta property="product:price:amount" content={data.product?.price} />
	<meta property="product:price:currency" content="COP" />
	<meta
		property="product:availability"
		content={data.product?.status === 'in_stock' ? 'in stock' : 'out of stock'}
	/>

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{data.product?.productname} - Comprar en Jenno" />
	<meta
		name="twitter:description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>
	<meta name="twitter:image" content={data.product?.imgs[0]} />
	<meta name="twitter:image:alt" content="Imagen del producto {data.product?.productname}" />
</svelte:head>

<div class="flex flex-col md:flex-row gap-5 md:gap-3 p-7">
	<div class="flex flex-col w-full md:w-1/2">
		<div class="flex flex-col w-full md:w-1/2">
			<div class="flex justify-center items-center">
				<Carousel.Root
					class="w-5/6"
					opts={{
						align: 'start',
						startIndex: indexCarousel
					}}
					api={(api: any) => (mainApi = api)}
				>
					<Carousel.Content>
						{#each product.imgs as image, i}
							<Carousel.Item>
								<div class="flex justify-center">
									<img
										class="w-11/12 h-96 object-contain rounded-md"
										src={image}
										alt={`image-${i}`}
									/>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>

					<!-- Botones LATERALES -->
					<Carousel.Previous onclick={() => mainApi?.scrollPrev()} />
					<Carousel.Next onclick={() => mainApi?.scrollNext()} />
				</Carousel.Root>
			</div>

			<div class="flex justify-center items-center mt-5">
				<Carousel.Root class="w-full max-w-sm">
					<Carousel.Content class="-ml-1">
						{#each product.imgs as image, i (i)}
							<Carousel.Item class="basis-1/3">
								<div class="flex justify-center">
									<button
										class="pl-1 w-11/12 h-24"
										onclick={(e) => {
											e.preventDefault();
											syncCarousel(i);
										}}
									>
										<img
											class="w-full h-24 object-cover rounded-md transition
											{i !== indexCarousel ? 'grayscale opacity-60' : 'border-2 border-[#404040]'}"
											src={image}
											alt={`thumb-${i}`}
										/>
									</button>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
				</Carousel.Root>
			</div>
		</div>
	</div>

	<!-- DETALLES -->
	<div class="flex flex-col justify-between w-full md:w-1/2 ml-2">
		<div class="flex justify-between">
			<div class="mr-5">
				<h1 class="text-3xl">{product?.productname}</h1>
				<h2 class="text-base font-medium text-[#707070]">
					{product?.category.charAt(0).toUpperCase() + product?.category.slice(1)}
				</h2>

				<div class="flex gap-5 items-center mt-1">
					<div class="flex gap-2 items-center">
						<StarRating rating={totalStars} />
						{#if totalStars !== 0}
							<span class="text-base font-semibold">{totalStars}</span>
						{/if}
					</div>

					<button
						onclick={(e) => {
							e.preventDefault();
							handleOpenDialgoReview();
						}}
					>
						<h3 class="dark:text-[#707070] font-semibold underline cursor-pointer">
							{m.product_page_reviews()}
						</h3>
					</button>
				</div>
			</div>

			{#if userName}
				<button type="button" onclick={() => goto(`/${userName}`)} class="group">
					<div
						class="flex flex-col items-center justify-center gap-2
						       min-w-40 max-w-56 px-3 py-3
						       rounded-xl
						       border border-gray-200 dark:border-[#222222]
						       bg-white dark:bg-[#181818]
						       hover:bg-gray-50 dark:hover:bg-[#202020]
						       transition-all duration-150
						       cursor-pointer"
					>
						<!-- Avatar -->
						{#if profileImg}
							<img
								class="w-14 h-14 object-cover rounded-full
								       ring-2 ring-transparent group-hover:ring-black dark:group-hover:ring-white
								       transition"
								src={profileImg}
								alt={product?.username}
							/>
						{:else}
							<div
								class="w-14 h-14 rounded-full
								       bg-gray-200 dark:bg-[#1f1f1f]
								       flex items-center justify-center"
							>
								<iconify-icon
									icon="bxs:store"
									heigth="2.5rem"
									width="2.5rem"
									class="text-black dark:text-gray-400"
								></iconify-icon>
							</div>
						{/if}

						<!-- Nombre -->
						<h2
							class="text-sm font-semibold text-center truncate max-w-full
							       text-gray-900 dark:text-gray-100"
							title={userName}
						>
							{userName}
						</h2>

						<!-- hint sutil -->
						<span
							class="text-xs text-gray-500 dark:text-gray-400
							       opacity-0 group-hover:opacity-100 transition"
						>
							Ver tienda →
						</span>
					</div>
				</button>
			{:else}
				<!-- Skeleton -->
				<div
					class="flex flex-col items-center justify-center gap-2
					       min-w-40 max-w-56 px-3 py-3
					       rounded-xl animate-pulse
					       bg-[#202020]"
				>
					<div class="h-14 w-14 rounded-full bg-[#2a2a2a]"></div>
					<div class="h-4 w-24 rounded bg-[#2a2a2a]"></div>
				</div>
			{/if}
		</div>

		<!-- PRECIO: ahora reactivo -->
		<div class="mt-2 text-lg">
			{#if displayedPrice() !== null}
				<p>{formatPrice(displayedPrice(), 'es-CO', 'COP')}</p>
			{:else}
				<p class="text-gray-400">Selecciona opciones para ver el precio</p>
			{/if}
		</div>

		<!-- Etiqueta condicional -->
		{#if product.status === 'sold_out'}
			<Label text="Agotado" color="bg-red-600" />
		{:else if product.status === 'on_sale'}
			<Label text="En oferta" color="bg-green-600" />
		{:else if product.quantity <= 10}
			<Label text="Últimas unidades" color="bg-yellow-600" />
		{/if}

		<!-- Product Description -->
		<div class="h-auto max-h-[200px] w-full mt-1 rounded-md py-3 overflow-y-auto">
			<p>{product.description}</p>
		</div>

		<div class="mb-4">
			<!-- --- OPCIONES SIMPLES (options) --- -->
			{#if product?.options && product.options.length > 0}
				<h3 class="text-lg font-medium">Opciones:</h3>

				{#each product.options as option}
					{@const values = option.values ?? option.optionslist ?? []}
					{#if values.length > 0}
						{@const currentValue = getSelectedValue(option.name) ?? ''}
						{@const triggerContent = currentValue || `Seleccionar ${option.name}`}

						<div class="flex gap-5 mt-2 items-center">
							<h3 class="text-lg font-medium w-28">{option.name}:</h3>
							<Select.Root
								type="single"
								value={currentValue}
								onValueChange={(value) => handleSimpleOptionChange(option.name, value ?? '')}
							>
								<Select.Trigger class="w-[180px] border-gray-200 dark:border-[#303030]">
									{triggerContent}
								</Select.Trigger>
								<Select.Content
									class="bg-gray-100 dark:bg-[#202020] border-gray-200 dark:border-[#303030]"
								>
									{#each values as op (op)}
										<Select.Item
											value={op}
											label={op}
											onclick={() => handleSimpleOptionChange(option.name, op)}
											class="dark:hover:bg-[#303030]"
										>
											{op}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					{/if}
				{/each}
			{/if}

			<!-- --- VARIANTES (complejas) --- -->
			{#if normalizedVariants().length > 0}
				<div class="mt-1">
					<h3 class="text-lg font-medium">Opciones:</h3>

					{#each getAllVariantOptionNames() as optName (optName)}
						{@const currentValue = selectedVariantOptions[optName] ?? ''}
						{@const triggerContent = currentValue || `Seleccionar ${optName}`}
						{@const allValues = getAllVariantValues(optName)}

						{#if allValues.length > 0}
							<div class="flex gap-5 mt-2 items-center">
								<h4 class="w-28">{optName}:</h4>

								<Select.Root
									type="single"
									value={currentValue}
									onValueChange={(v) => handleVariantOptionChange(optName, v ?? '')}
								>
									<Select.Trigger class="w-[180px] border-gray-200 dark:border-[#303030]">
										{triggerContent}
									</Select.Trigger>

									<Select.Content
										class="bg-gray-100 dark:bg-[#202020] border-gray-200 dark:border-[#303030]"
									>
										{#each allValues as val (val)}
											{@const disabled =
												optName !== getAllVariantOptionNames()[0] &&
												!isValueCompatibleWithSelection(optName, val)}

											<Select.Item value={val} label={val} {disabled} class="disabled:opacity-50">
												{val}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Seleccionar Cantidad del Producto -->
		<div class="flex flex-col gap-3">
			<!-- Advertencia de stock bajo -->
			{#if product.quantity <= 10}
				<span class="mt-1 text-sm text-red-600 dark:text-red-400">
					* Sólo quedan {product.quantity} unidades
				</span>
			{/if}
			<div class="flex mt-1 gap-3">
				<div
					class="flex items-center justify-around w-2/5 border border-gray-300 dark:border-[#202020] rounded-md"
				>
					<button
						onclick={(e) => {
							e.preventDefault();
							quantity = Math.max(1, quantity - 1);
						}}
						class="flex flex-col justify-center items-center rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary disabled:opacity-50"
						disabled={quantity <= 1}
					>
						<!-- Minus Icon -->
						<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
					<input
						type="number"
						bind:value={quantity}
						min="1"
						max={product.quantity}
						class="mx-2 text-xl font-semibold text-center w-16 bg-transparent outline-none appearance-none"
						onblur={(e) => {
							let v = parseInt(e?.target?.value);
							if (isNaN(v) || v < 1) {
								v = 1;
							} else if (v > product.quantity) {
								v = product.quantity;
							}
							quantity = v;
						}}
					/>
					<!-- <span class="mx-2 text-xl font-semibold">{quantity}</span> -->
					<button
						onclick={(e) => {
							e.preventDefault();
							quantity = Math.min(product.quantity, quantity + 1);
						}}
						class="flex flex-col justify-center items-center rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary disabled:opacity-50"
						disabled={quantity >= product.quantity}
					>
						<!-- Plus Icon -->
						<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				</div>
				<button
					onclick={(e) => {
						e.preventDefault();
						handleAddToCart();
					}}
					class="dark:bg-[#202020] border-none rounded w-3/5 h-12 bg-gray-200 dark:text-gray-200 text-black text-base cursor-pointer hover:bg-gray-300 dark:hover:bg-[#252525]"
					>{m.card_button_addtocart()}</button
				>
			</div>
			<button
				onclick={(e) => {
					e.preventDefault();
					handleBuyNow();
				}}
				class="bg-gray-200 dark:bg-gray-200 border-none rounded w-full h-12 text-[#202020] text-base cursor-pointer hover:bg-gray-300 dark:hover:bg-[#202020] dark:hover:text-white"
				>{m.card_button_buynow()}</button
			>
		</div>
	</div>
</div>

<!-- Especificaciones del producto -->
{#if product.especifications.length !== 0}
	<div class="flex flex-col m-10 mt-14">
		<h2 class="text-xl font-bold">{m.product_page_specifications()}</h2>

		<Table.Root class="mt-7 overflow-x-auto">
			<Table.Header class="bg-gray-200 dark:bg-[#202020] h-14">
				<Table.Row>
					{#each product.especifications as especification}
						<Table.Head>{especification.title}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row class="h-14 bg-none hover:bg-none font-base">
					{#each product.especifications as especification}
						<Table.Cell>{especification.content}</Table.Cell>
					{/each}
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<!-- Informacion Adicional -->
{#if product.additionalInfo}
	<div class="flex flex-col m-10 mt-14">
		<h2 class="text-xl font-bold mb-6">Información Adicional</h2>

		<div
			class="prose prose-base max-w-none dark:prose-invert space-y-2
             prose-p:leading-relaxed prose-p:mb-2
             prose-ul:list-disc prose-ul:pl-6
             prose-ol:list-disc prose-ol:pl-6
             prose-li:mb-2 prose-img:rounded-lg prose-img:max-w-[400px] prose-img:mx-auto prose-img:my-4"
		>
			{@html product.additionalInfo}
		</div>
	</div>
{/if}

<div class="flex flex-col m-10 mt-10">
	<h2 class="text-xl font-bold">{m.product_page_more_products()}</h2>
</div>

<!-- Lista de productos del mismo vendedor -->
<RandomProducts user={product.user} />

<Dialog.Root bind:open={openDialogreview}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.product_page_reviews()}</Dialog.Title>
		</Dialog.Header>
		<div>
			{#if product?.reviews.length === 0}
				<div>
					<h2>No hay reseñas disponibles</h2>
				</div>
			{:else}
				<ScrollArea class="max-h-[600px] w-full">
					{#each product?.reviews as review}
						<div class="m-3">
							<div class="flex items-center justify-between">
								<div class="flex gap-2 items-center">
									{#if review.userProfileImg !== ''}
										<img
											src={review.userProfileImg}
											alt={review.userName}
											class="h-9 w-9 object-cover ml-1 rounded-full"
										/>
									{:else}
										<iconify-icon
											icon="mdi:user"
											height="1.5rem"
											width="1.5rem"
											class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full"
										></iconify-icon>
									{/if}
									<h3 class="text-base font-semibold">{review.userName}</h3>
								</div>

								<div class="flex">
									{#each Array(review.stars) as _, i}
										<iconify-icon
											icon="mdi:star"
											height="1.5rem"
											width="1.5rem"
											class="flex justify-center items-center h-9 w-9 {getStartColor(review.stars)}"
										></iconify-icon>
									{/each}
								</div>
							</div>
							<div class="m-3">
								<p>{review.review}</p>
							</div>
						</div>
					{/each}
				</ScrollArea>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
