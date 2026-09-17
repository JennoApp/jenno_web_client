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
	import { onDestroy, onMount } from 'svelte';

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

	// APIs
	let thumbsApi = $state<any>(null);

	// setApi callbacks (shadcn-svelte pattern)
	function setMainApi(api: any) {
		mainApi = api;
		attachMainListeners();
		// inicializar índice si ya hay snaps
		tryInitIndexFromMain();
	}

	function setThumbsApi(api: any) {
		thumbsApi = api;
		// opcional: sincronizar thumbs al index actual
		if (thumbsApi && typeof indexCarousel === 'number') {
			thumbsApi.scrollTo(indexCarousel);
		}
	}

	// inicializar index seguro
	function tryInitIndexFromMain() {
		if (!mainApi) return;
		if (typeof mainApi.selectedScrollSnap === 'function') {
			indexCarousel = mainApi.selectedScrollSnap();
		}
	}

	// listeners
	let removeMainSelectListener: (() => void) | null = null;
	function attachMainListeners() {
		if (!mainApi) return;

		// quitar listener viejo
		if (removeMainSelectListener) {
			try {
				removeMainSelectListener();
			} catch {}
			removeMainSelectListener = null;
		}

		// register listener and keep a remover if API provides
		if (typeof mainApi.on === 'function') {
			const handler = () => {
				try {
					indexCarousel = mainApi.selectedScrollSnap();
					// mantener thumbs en vista
					if (thumbsApi && typeof thumbsApi.scrollTo === 'function') {
						thumbsApi.scrollTo(indexCarousel);
					}
				} catch (err) {
					// ignore
				}
			};

			mainApi.on('select', handler);

			// crear función para remover: algunos apis devuelven "off" distinto,
			// intentamos usar `off` si existe, sino removemos con guard.
			removeMainSelectListener = () => {
				try {
					if (typeof mainApi.off === 'function') mainApi.off('select', handler);
				} catch {}
			};
		} else {
			// fallback polling (muy raro)
			tryInitIndexFromMain();
		}
	}

	onDestroy(() => {
		if (removeMainSelectListener) removeMainSelectListener();
	});

	// navegación
	function goPrev() {
		try {
			mainApi?.scrollPrev?.();
		} catch {}
	}
	function goNext() {
		try {
			mainApi?.scrollNext?.();
		} catch {}
	}
	function scrollTo(i: number) {
		try {
			mainApi?.scrollTo?.(i);
			// actualizar índice inmediatamente para UI responsiva
			indexCarousel = i;
			// sync thumbs view
			thumbsApi?.scrollTo?.(i);
		} catch {}
	}
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

<!-- PRODUCTO -->
<div class="w-full min-w-0 overflow-x-hidden">
	<div class="flex flex-col gap-8 md:flex-row md:gap-8 lg:gap-10 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
		<!-- GALERÍA -->
		<div class="flex w-full min-w-0 flex-col md:w-1/2">
			<!-- MAIN CAROUSEL -->
			<div class="relative flex w-full min-w-0 items-center justify-center">
				<Carousel.Root
					class="w-full min-w-0 max-w-xl px-7 sm:px-8"
					opts={{ align: 'center', startIndex: indexCarousel }}
					setApi={setMainApi}
				>
					<Carousel.Content class="ml-0">
						{#each product.imgs as image, i (i)}
							<Carousel.Item class="pl-0">
								<div class="flex w-full justify-center">
									<img
										class="h-72 w-full max-w-md rounded-xl object-contain sm:h-80 md:h-96"
										src={image}
										alt={`image-${i + 1}`}
										loading="lazy"
									/>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>

					<!-- Previous -->
					<button
						type="button"
						onclick={goPrev}
						class="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white dark:bg-[#202020]/90 dark:hover:bg-[#252525] sm:left-1 sm:h-10 sm:w-10"
						aria-label="Anterior"
					>
						<svg
							class="h-4 w-4 sm:h-5 sm:w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<!-- Next -->
					<button
						type="button"
						onclick={goNext}
						class="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white dark:bg-[#202020]/90 dark:hover:bg-[#252525] sm:right-1 sm:h-10 sm:w-10"
						aria-label="Siguiente"
					>
						<svg
							class="h-4 w-4 sm:h-5 sm:w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</Carousel.Root>
			</div>

			<!-- THUMBNAILS -->
			<div class="mt-4 flex w-full min-w-0 justify-center">
				<Carousel.Root
					class="w-full max-w-sm min-w-0 px-1"
					setApi={setThumbsApi}
					opts={{ align: 'start' }}
				>
					<Carousel.Content class="-ml-2">
						{#each product.imgs as image, i (i)}
							<Carousel.Item class="basis-1/3 pl-2">
								<button
									type="button"
									class="flex h-20 w-full min-w-0 items-center justify-center sm:h-24"
									onclick={() => scrollTo(i)}
									aria-label={`Ir a imagen ${i + 1}`}
								>
									<img
										class="h-full w-full rounded-lg object-cover transition-all duration-150 ease-out
											{i !== indexCarousel
											? 'grayscale opacity-50'
											: 'border-2 border-[#404040] scale-[1.02] opacity-100'}"
										src={image}
										alt={`thumb-${i + 1}`}
									/>
								</button>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
				</Carousel.Root>
			</div>
		</div>

		<!-- DETALLES -->
		<div class="flex w-full min-w-0 flex-col md:w-1/2">
			<!-- PRODUCTO + TIENDA -->
			<div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<!-- Información principal -->
				<div class="min-w-0 flex-1">
					<h1
						class="break-words text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
					>
						{product?.productname}
					</h1>

					<h2 class="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
						{product?.category.charAt(0).toUpperCase() + product?.category.slice(1)}
					</h2>

					<!-- Rating -->
					<div class="mt-3 flex min-w-0 flex-wrap items-center gap-3">
						<div class="flex items-center gap-2">
							<StarRating rating={totalStars} />

							{#if totalStars !== 0}
								<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
									{totalStars}
								</span>
							{/if}
						</div>

						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								handleOpenDialgoReview();
							}}
							class="text-sm font-semibold text-gray-600 underline underline-offset-2 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							{m.product_page_reviews()}
						</button>
					</div>
				</div>

				<!-- TIENDA -->
				{#if userName}
					<button
						type="button"
						onclick={() => goto(`/${userName}`)}
						class="group w-full shrink-0 sm:w-40"
					>
						<div
							class="flex w-full min-w-0 flex-row items-center gap-3 rounded-xl
								border border-gray-200 bg-white px-3 py-3 text-left
								transition-all duration-150 hover:bg-gray-50
								dark:border-[#303030] dark:bg-[#181818] dark:hover:bg-[#202020]
								sm:flex-col sm:justify-center sm:text-center"
						>
							<!-- Avatar -->
							{#if profileImg}
								<img
									class="h-12 w-12 shrink-0 rounded-full object-cover transition
										group-hover:ring-2 group-hover:ring-gray-900
										dark:group-hover:ring-white sm:h-14 sm:w-14"
									src={profileImg}
									alt={product?.username}
								/>
							{:else}
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full
										bg-gray-100 dark:bg-[#202020] sm:h-14 sm:w-14"
								>
									<iconify-icon
										icon="bxs:store"
										height="2.25rem"
										width="2.25rem"
										class="text-gray-700 dark:text-gray-400"
									></iconify-icon>
								</div>
							{/if}

							<!-- Nombre -->
							<div class="min-w-0 flex-1 sm:w-full">
								<h2
									class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
									title={userName}
								>
									{userName}
								</h2>

								<span class="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
									Ver tienda →
								</span>
							</div>
						</div>
					</button>
				{:else}
					<!-- Skeleton -->
					<div
						class="flex w-full shrink-0 animate-pulse flex-row items-center gap-3 rounded-xl
							bg-gray-100 px-3 py-3 dark:bg-[#202020] sm:w-40 sm:flex-col"
					>
						<div class="h-12 w-12 shrink-0 rounded-full bg-gray-200 dark:bg-[#2a2a2a]"></div>
						<div class="h-4 w-24 rounded bg-gray-200 dark:bg-[#2a2a2a]"></div>
					</div>
				{/if}
			</div>

			<!-- PRECIO -->
			<div class="mt-5 border-t border-gray-200 pt-5 dark:border-[#303030]">
				{#if displayedPrice() !== null}
					<p class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
						{formatPrice(displayedPrice(), 'es-CO', 'COP')}
					</p>
				{:else}
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Selecciona opciones para ver el precio
					</p>
				{/if}
			</div>

			<!-- ESTADO -->
			<div class="mt-4">
				{#if product.status === 'sold_out'}
					<Label text="Agotado" color="bg-red-600" />
				{:else if product.status === 'on_sale'}
					<Label text="En oferta" color="bg-green-600" />
				{:else if product.quantity <= 10}
					<Label text="Últimas unidades" color="bg-yellow-600" />
				{/if}
			</div>

			<!-- DESCRIPCIÓN -->
			<div
				class="mt-4 max-h-48 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl bg-gray-50 p-4 dark:bg-[#181818]"
			>
				<p class="break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
					{product.description}
				</p>
			</div>

			<!-- OPCIONES -->
			<div class="mt-5 min-w-0">
				<!-- OPCIONES SIMPLES -->
				{#if product?.options && product.options.length > 0}
					<h3 class="text-base font-semibold text-gray-900 dark:text-white">Opciones</h3>

					<div class="mt-3 flex flex-col gap-3">
						{#each product.options as option}
							{@const values = option.values ?? option.optionslist ?? []}

							{#if values.length > 0}
								{@const currentValue = getSelectedValue(option.name) ?? ''}
								{@const triggerContent = currentValue || `Seleccionar ${option.name}`}

								<div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
									<h3 class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-28">
										{option.name}
									</h3>

									<Select.Root
										type="single"
										value={currentValue}
										onValueChange={(value) => handleSimpleOptionChange(option.name, value ?? '')}
									>
										<Select.Trigger
											class="h-11 w-full max-w-full rounded-xl border-gray-200 dark:border-[#303030] sm:w-[180px]"
										>
											<span class="truncate">
												{triggerContent}
											</span>
										</Select.Trigger>

										<Select.Content
											class="max-w-[calc(100vw-2rem)] border-gray-200 bg-gray-100 dark:border-[#303030] dark:bg-[#202020]"
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
					</div>
				{/if}

				<!-- VARIANTES -->
				{#if normalizedVariants().length > 0}
					<div class="mt-5">
						<h3 class="text-base font-semibold text-gray-900 dark:text-white">Opciones</h3>

						<div class="mt-3 flex flex-col gap-3">
							{#each getAllVariantOptionNames() as optName (optName)}
								{@const currentValue = selectedVariantOptions[optName] ?? ''}
								{@const triggerContent = currentValue || `Seleccionar ${optName}`}
								{@const allValues = getAllVariantValues(optName)}

								{#if allValues.length > 0}
									<div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
										<h4
											class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-28"
										>
											{optName}
										</h4>

										<Select.Root
											type="single"
											value={currentValue}
											onValueChange={(v) => handleVariantOptionChange(optName, v ?? '')}
										>
											<Select.Trigger
												class="h-11 w-full max-w-full rounded-xl border-gray-200 dark:border-[#303030] sm:w-[180px]"
											>
												<span class="truncate">
													{triggerContent}
												</span>
											</Select.Trigger>

											<Select.Content
												class="max-w-[calc(100vw-2rem)] border-gray-200 bg-gray-100 dark:border-[#303030] dark:bg-[#202020]"
											>
												{#each allValues as val (val)}
													{@const disabled =
														optName !== getAllVariantOptionNames()[0] &&
														!isValueCompatibleWithSelection(optName, val)}

													<Select.Item
														value={val}
														label={val}
														{disabled}
														class="disabled:opacity-50"
													>
														{val}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- CANTIDAD + COMPRA -->
			<div class="mt-6 flex flex-col gap-3">
				<!-- Stock -->
				{#if product.quantity <= 10}
					<span class="text-sm font-medium text-red-600 dark:text-red-400">
						* Sólo quedan {product.quantity} unidades
					</span>
				{/if}

				<!-- Quantity + Add -->
				<div class="flex w-full min-w-0 flex-col gap-3 sm:flex-row">
					<!-- Quantity -->
					<div
						class="flex h-12 w-full items-center justify-between rounded-xl
							border border-gray-300 bg-white dark:border-[#303030] dark:bg-[#181818]
							sm:w-2/5"
					>
						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								quantity = Math.max(1, quantity - 1);
							}}
							class="flex h-full w-10 shrink-0 items-center justify-center rounded-lg
								text-gray-700 transition hover:bg-gray-100 disabled:opacity-50
								dark:text-white dark:hover:bg-[#202020]"
							disabled={quantity <= 1}
							aria-label="Disminuir cantidad"
						>
							<iconify-icon icon="ic:round-minus" height="1.35rem" width="1.35rem"></iconify-icon>
						</button>

						<input
							type="number"
							bind:value={quantity}
							min="1"
							max={product.quantity}
							class="min-w-0 flex-1 bg-transparent text-center text-lg font-semibold
								text-gray-900 outline-none appearance-none dark:text-white"
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

						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								quantity = Math.min(product.quantity, quantity + 1);
							}}
							class="flex h-full w-10 shrink-0 items-center justify-center rounded-lg
								text-gray-700 transition hover:bg-gray-100 disabled:opacity-50
								dark:text-white dark:hover:bg-[#202020]"
							disabled={quantity >= product.quantity}
							aria-label="Aumentar cantidad"
						>
							<iconify-icon icon="ic:round-plus" height="1.35rem" width="1.35rem"></iconify-icon>
						</button>
					</div>

					<!-- Add to cart -->
					<button
						type="button"
						onclick={(e) => {
							e.preventDefault();
							handleAddToCart();
						}}
						class="h-12 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white
							transition-all duration-200 hover:bg-gray-800 active:scale-[0.99]
							dark:bg-white dark:text-black dark:hover:bg-gray-200
							sm:flex-1"
					>
						{m.card_button_addtocart()}
					</button>
				</div>

				<!-- Buy now -->
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						handleBuyNow();
					}}
					class="h-12 w-full rounded-xl border border-gray-300 bg-transparent px-4
						text-sm font-semibold text-gray-900 transition-all duration-200
						hover:bg-gray-100 active:scale-[0.99]
						dark:border-[#383838] dark:text-white dark:hover:bg-[#202020]"
				>
					{m.card_button_buynow()}
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Información del producto -->
<div class="flex flex-col gap-8 px-4 sm:px-6 lg:px-10 mt-12 mb-14">
	<!-- ESPECIFICACIONES -->
	{#if product.especifications?.length}
		<section
			class="w-full rounded-2xl border border-gray-200 dark:border-[#303030] bg-white dark:bg-[#161616] shadow-sm overflow-hidden"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-[#303030]"
			>
				<div>
					<h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
						{m.product_page_specifications()}
					</h2>

					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Características y detalles del producto
					</p>
				</div>
			</div>

			<!-- Specifications -->
			<div class="overflow-x-auto">
				<Table.Root class="w-full">
					<Table.Header>
						<Table.Row class="border-b border-gray-200 dark:border-[#303030]">
							{#each product.especifications as especification}
								<Table.Head
									class="h-12 px-5 sm:px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#202020]"
								>
									{especification.title}
								</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>

					<Table.Body>
						<Table.Row class="border-none hover:bg-transparent">
							{#each product.especifications as especification}
								<Table.Cell
									class="h-14 px-5 sm:px-6 text-sm text-gray-700 dark:text-gray-300 align-middle"
								>
									{especification.content}
								</Table.Cell>
							{/each}
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
		</section>
	{/if}

	<!-- INFORMACIÓN ADICIONAL -->
	{#if product.additionalInfo}
		<section
			class="w-full rounded-2xl border border-gray-200 dark:border-[#303030] bg-white dark:bg-[#161616] shadow-sm overflow-hidden"
		>
			<!-- Header -->
			<div
				class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-[#303030]"
			>
				<div
					class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#202020]"
				>
					<iconify-icon
						icon="lucide:info"
						height="1.1rem"
						width="1.1rem"
						class="text-gray-600 dark:text-gray-300"
					></iconify-icon>
				</div>

				<div>
					<h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
						Información Adicional
					</h2>

					<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
						Información proporcionada por la tienda
					</p>
				</div>
			</div>

			<!-- Rich content -->
			<div class="px-5 sm:px-6 py-6 sm:py-8">
				<div
					class="
						prose prose-base max-w-none
						dark:prose-invert

						prose-p:text-gray-700
						dark:prose-p:text-gray-300

						prose-p:leading-relaxed
						prose-p:my-3

						prose-headings:text-gray-900
						dark:prose-headings:text-white

						prose-headings:font-semibold

						prose-h3:text-lg
						prose-h4:text-base

						prose-ul:list-disc
						prose-ul:pl-6

						prose-ol:list-decimal
						prose-ol:pl-6

						prose-li:my-1
						prose-li:text-gray-700
						dark:prose-li:text-gray-300

						prose-strong:text-gray-900
						dark:prose-strong:text-white

						prose-a:text-gray-900
						dark:prose-a:text-white
						prose-a:underline

						prose-blockquote:border-l-4
						prose-blockquote:border-gray-300
						dark:prose-blockquote:border-[#404040]
						prose-blockquote:text-gray-600
						dark:prose-blockquote:text-gray-400

						prose-img:rounded-xl
						prose-img:max-w-full
						prose-img:h-auto
						prose-img:mx-auto
						prose-img:my-6
					"
				>
					{@html product.additionalInfo}
				</div>
			</div>
		</section>
	{/if}
</div>

<!-- Especificaciones del producto
{#if product.especifications.length !== 0}
	<div class="flex flex-col m-10 mt-14">
		<h2 class="text-xl font-bold">{m.product_page_specifications()}</h2>

		<Table.Root class="mt-7 overflow-x-auto">
			<Table.Header class="bg-gray-200 dark:bg-[#202020] h-14 hover:bg-gray-300 dark:hover:bg-[#252525]">
				<Table.Row>
					{#each product.especifications as especification}
						<Table.Head>{especification.title}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row class="h-14 bg-none hover:bg-none font-base hover:bg-gray-200 dark:hover:bg-[#252525]">
					{#each product.especifications as especification}
						<Table.Cell>{especification.content}</Table.Cell>
					{/each}
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<!- Informacion Adicional ->
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
{/if} -->

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
