<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { goto } from '$app/navigation';
	import * as m from '$paraglide/messages';
	import { getStartColor } from '$lib/utils/getstartcolor';
	import Label from '$lib/components/Label.svelte';

	interface Variant {
		_id?: string;
		sku?: string;
		price: number;
		quantity?: number;
	}

	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: string[];
		price: number;
		user: string;
		reviews: any[];
		status: string;
		quantity: number;

		variants?: Variant[];
		selectedVariant?: Variant | null;
	}

	import { formatPrice } from '$lib/utils/formatprice';
	import { toast } from 'svelte-sonner';

	let { data, currentUsername }: { data: CardData; currentUsername: string } = $props();

	let profileImg = $state('');
	let openDialogreview = $state(false);
	let userName = $state('');
	let serverUrl = $state<string>('');
	let imageLoaded = $state<boolean>(false);
	let totalStars = $state<number>(0);

	const displayedPrice = $derived(() => {
		// Si hay variante seleccionada (ej: desde carrito o navegación)
		if (data?.selectedVariant?.price != null) {
			return data.selectedVariant.price;
		}

		// Si hay variantes, usar el primer precio como base
		if (data?.variants && data.variants.length > 0) {
			return data.variants[0]?.price ?? 0;
		}

		// Precio normal del producto
		return data?.price ?? 0;
	});

	const hasVariants = $derived(() => {
		return Array.isArray(data?.variants) && data.variants.length > 0;
	});

	const priceHint = $derived(() => {
		if (!hasVariants) return null;
		return 'Precio varía según la opción';
	});

	const isOwnProduct = $derived(() => {
		return currentUsername && data?.username === currentUsername;
	});

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener la URL del servidor:', error);
		}
	}

	const calculateStars = (reviews: any[]) => {
		if (!Array.isArray(reviews) || reviews.length === 0) {
			return 0;
		}

		const total = reviews.reduce((accum, review) => accum + (review.stars || 0), 0);

		return total / reviews.length;
	};

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

	async function loadProfileImg() {
		await getServerUrl();

		if (!data || !data?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			);
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/users/getprofileimg/${data?.user}`);

			const userData = await response.json();

			profileImg = userData?.profileImg;
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`);
		}
	}

	function handleOpenDialgoReview() {
		openDialogreview = true;
	}

	function handleImageLoaded() {
		imageLoaded = true;
	}

	$effect(() => {
		if (!isOwnProduct()) {
			loadProfileImg();
		}
	});

	$effect(() => {
		if (!isOwnProduct()) {
			getUserName(data.user);
		} else {
			userName = data.username;
		}
	});

	$effect(() => {
		totalStars = calculateStars(data?.reviews || []);
	});
</script>

{#if data && data._id && userName}
	<a href={`/${userName}/${data._id}`} class="block w-full h-full">
		<div
			class="group relative flex h-[355px] w-full flex-col
			       overflow-hidden rounded-xl
			       border border-gray-200 dark:border-[#303030]
			       bg-white dark:bg-[#202020]
			       transition-all duration-200
			       hover:-translate-y-0.5
			       hover:shadow-md
			       dark:hover:bg-[#252525]"
		>
			<!-- =====================================================
			     IMAGEN
			====================================================== -->

			<div
				class="relative w-full aspect-square shrink-0 overflow-hidden
				       bg-gray-100 dark:bg-[#181818]"
			>
				<img
					src={data.imgs?.[0]}
					alt={data.productname}
					class="h-full w-full object-cover
					       transition-transform duration-300
					       group-hover:scale-[1.02]"
				/>

				<!-- Estado del producto -->
				{#if data.status === 'sold_out'}
					<div
						class="absolute left-2 top-2
						       rounded-md
						       bg-red-500
						       px-2 py-1
						       text-[10px]
						       font-semibold
						       text-white"
					>
						Agotado
					</div>
				{:else if data.quantity <= 10}
					<div
						class="absolute left-2 top-2
						       rounded-md
						       bg-yellow-500
						       px-2 py-1
						       text-[10px]
						       font-semibold
						       text-black"
					>
						Últimas unidades
					</div>
				{/if}
			</div>

			<!-- =====================================================
			     CONTENIDO
			====================================================== -->

			<div class="flex min-h-0 flex-1 flex-col px-2 py-1.5">
				<!-- =================================================
				     TIENDA + ACCIONES
				================================================== -->

				<div
					class="flex h-6 w-full items-center justify-between gap-1"
					onclick={(e) => e.preventDefault()}
				>
					<!-- Tienda -->
					<div class="flex min-w-0 flex-1 items-center">
						{#if profileImg !== ''}
							<img
								src={profileImg}
								alt={userName}
								class="h-4 w-4 shrink-0 rounded-full object-cover"
								onload={handleImageLoaded}
							/>
						{:else}
							<div
								class="flex h-5 w-5 shrink-0 items-center justify-center
								       rounded-full
								       bg-gray-100 dark:bg-[#303030]"
							>
								<iconify-icon
									icon="bxs:store"
									height="0.75rem"
									width="0.75rem"
									class="text-gray-400 dark:text-gray-500"
								></iconify-icon>
							</div>
						{/if}

						<button
							type="button"
							class="ml-1 min-w-0 truncate
							       text-left
							       text-xs font-medium
							       text-gray-500 dark:text-gray-400
							       hover:text-gray-900
							       dark:hover:text-gray-200
							       hover:underline"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								goto(`/${userName}`);
							}}
						>
							@{userName}
						</button>
					</div>

					<!-- =============================================
					     ACCIONES
					============================================== -->

					<div class="flex shrink-0 items-center gap-0.5">
						<!-- Rating -->
						<div
							class="flex h-6 items-center gap-1
							       rounded-md
							       px-1.5"
						>
							<iconify-icon
								class={getStartColor(totalStars)}
								icon="mdi:star"
								height="0.8rem"
								width="0.8rem"
							></iconify-icon>

							{#if totalStars !== 0}
								<span
									class="text-[10px]
									       font-medium
									       dark:text-gray-200"
								>
									{totalStars}
								</span>
							{/if}
						</div>

						<!-- Reviews -->
						<button
							type="button"
							class="flex h-6 w-6 items-center justify-center
							       rounded-md
							       text-gray-400
							       transition
							       hover:bg-gray-100
							       hover:text-gray-700
							       dark:hover:bg-[#303030]
							       dark:hover:text-gray-200"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleOpenDialgoReview();
							}}
							aria-label="Ver reseñas"
						>
							<iconify-icon icon="material-symbols-light:reviews" height="0.95rem" width="0.95rem"
							></iconify-icon>
						</button>

						<!-- Share -->
						<button
							type="button"
							class="flex h-6 w-6 items-center justify-center
							       rounded-md
							       text-gray-400
							       transition
							       hover:bg-gray-100
							       hover:text-gray-700
							       dark:hover:bg-[#303030]
							       dark:hover:text-gray-200"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();

								const product_link = `https://www.jenno.com.co/${data.username}/${data._id}`;

								navigator.clipboard
									.writeText(product_link)
									.then(() => {
										toast.success('Enlace copiado al portapapeles');
									})
									.catch(() => {
										toast.error('Error al copiar el enlace. Intentelo nuevamente');
									});
							}}
							aria-label="Compartir producto"
						>
							<iconify-icon icon="bitcoin-icons:share-filled" height="0.95rem" width="0.95rem"
							></iconify-icon>
						</button>
					</div>
				</div>

				<!-- =================================================
				     INFORMACIÓN DEL PRODUCTO
				================================================== -->

				<div class="mt-2 min-h-0">
					<!-- Nombre -->
					<h3
						class="line-clamp-2
						       text-sm
						       font-semibold
						       leading-tight
						       text-gray-800
						       dark:text-gray-200"
					>
						{data.productname}
					</h3>

					<!-- Precio -->
					<p
						class="mt-1
						       text-base
						       font-bold
						       leading-tight
						       text-gray-900
						       dark:text-gray-100"
					>
						{formatPrice(displayedPrice(), 'es-CO', 'COP')}
					</p>
				</div>

				<!-- =================================================
				     INFORMACIÓN ADICIONAL
				================================================== -->

				{#if hasVariants()}
					<div
						class="mt-auto
						       flex h-7 shrink-0
						       items-center gap-1.5
						       rounded-md
						       border border-gray-300
						       dark:border-[#3a3a3a]
						       bg-gray-100
						       dark:bg-[#2a2a2a]
						       px-2"
					>
						<iconify-icon
							icon="mdi:tag-multiple-outline"
							height="0.8rem"
							width="0.8rem"
							class="shrink-0
							       text-gray-500
							       dark:text-gray-400"
						></iconify-icon>

						<span
							class="truncate
							       text-[10px]
							       font-medium
							       text-gray-500
							       dark:text-gray-400"
						>
							Precio según opción
						</span>
					</div>
				{:else}
					<!--
						Espacio reservado.
						Mantiene todas las cards con la misma altura.
					-->
					<div class="mt-auto h-7 shrink-0"></div>
				{/if}
			</div>
		</div>
	</a>
{:else}
	<!-- =========================================================
	     SKELETON
	========================================================== -->

	<div
		class="flex h-[355px] w-full flex-col
		       overflow-hidden rounded-xl
		       border border-gray-200 dark:border-[#303030]
		       bg-gray-100 dark:bg-[#1e1e1e]
		       animate-pulse"
	>
		<!-- Imagen -->
		<div
			class="aspect-square w-full shrink-0
			       bg-gray-300 dark:bg-[#303030]"
		></div>

		<!-- Contenido -->
		<div class="flex flex-1 flex-col px-3 py-2.5">
			<!-- Tienda + acciones -->
			<div class="flex h-6 items-center justify-between">
				<div class="flex items-center gap-2">
					<div
						class="h-5 w-5 rounded-full
						       bg-gray-300 dark:bg-[#303030]"
					></div>

					<div
						class="h-3 w-20 rounded
						       bg-gray-300 dark:bg-[#303030]"
					></div>
				</div>

				<div class="flex items-center gap-1">
					<div
						class="h-6 w-12 rounded-md
						       bg-gray-300 dark:bg-[#303030]"
					></div>

					<div
						class="h-6 w-6 rounded-md
						       bg-gray-300 dark:bg-[#303030]"
					></div>

					<div
						class="h-6 w-6 rounded-md
						       bg-gray-300 dark:bg-[#303030]"
					></div>
				</div>
			</div>

			<!-- Producto -->
			<div class="mt-2 space-y-2">
				<div
					class="h-3 w-full rounded
					       bg-gray-300 dark:bg-[#303030]"
				></div>

				<div
					class="h-3 w-3/5 rounded
					       bg-gray-300 dark:bg-[#303030]"
				></div>

				<div
					class="mt-2 h-4 w-1/3 rounded
					       bg-gray-300 dark:bg-[#303030]"
				></div>
			</div>

			<!-- Espacio reservado inferior -->
			<div
				class="mt-auto h-7 w-full rounded-md
				       bg-gray-300 dark:bg-[#303030]"
			></div>
		</div>
	</div>
{/if}

<!-- Dialog Reviews -->
{#if openDialogreview}
	<Dialog.Root bind:open={openDialogreview}>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.product_page_reviews()}</Dialog.Title>
			</Dialog.Header>
			<div>
				{#if data?.reviews.length === 0}
					<div>
						<h2>No hay reseñas disponibles</h2>
					</div>
				{:else}
					<ScrollArea class="max-h-[600px] w-full">
						{#each data?.reviews as review}
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
												class="flex justify-center items-center h-9 w-9 {getStartColor(
													review.stars
												)}"
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
{/if}
