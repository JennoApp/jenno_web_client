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
	<a href={`/${userName}/${data._id}`}>
		<div
			class="flex flex-col justify-between w-full max-w-sm mx-auto h-[400px] rounded-xl bg-white dark:bg-[#202020] dark:text-gray-200 shadow-lg shadow-gray-300 dark:shadow-none hover:dark:bg-[#252525] overflow-hidden"
		>
			{#if !isOwnProduct()}
				<!-- Header -->
				<div class="flex w-full h-12 px-4 items-center justify-between">
					<div class="flex items-center space-x-2">
						{#if profileImg !== ''}
							<img
								class="h-8 w-8 object-cover rounded-full"
								src={profileImg}
								alt="logo"
								onload={handleImageLoaded}
							/>
						{:else}
							<div
								class="h-8 w-8 rounded-full bg-gray-300 dark:bg-[#303030] flex items-center justify-center"
							>
								<iconify-icon class="text-[#454545]" icon="bxs:store" height="1.3rem" width="1.3rem"
								></iconify-icon>
							</div>
						{/if}
						<button
							onclick={(e) => {
								e.preventDefault();
								goto(`/${userName}`);
							}}
							class="truncate font-medium max-w-[200px]"
						>
							<h4>
								{userName}
							</h4>
						</button>
					</div>

					<!--  ####################### -->
					<div class="hidden">
						<!-- oculto los simbolos para agregar funcionalidad posteriormente -->
						<iconify-icon
							class="mr-1 cursor-pointer"
							icon="mdi:dots-vertical"
							height="1.5rem"
							width="1.5rem"
						></iconify-icon>
					</div>
					<!-- ######################### -->
				</div>
			{:else}
				<div class="mt-1"></div>
			{/if}

			<!-- Image -->
			<div class="flex justify-center px-4">
				<img class="h-52 w-full object-contain rounded-md" src={data.imgs[0]} alt="producto" />
			</div>

			<!-- Social -->
			<div class="flex items-center justify-between w-full h-8 mt-1 px-4">
				<div class="flex gap-2 items-center text-2xl text-center">
					<div
						class="flex gap-1 items-center justify-center bg-gray-200 dark:bg-[#303030] px-1 rounded-lg"
					>
						<iconify-icon
							class={getStartColor(totalStars)}
							icon="mdi:star"
							height="1.5rem"
							width="1.5rem"
						></iconify-icon>
						{#if totalStars !== 0}
							<span class="text-sm font-medium">{totalStars}</span>
						{/if}
					</div>
					<button
						class="flex items-center"
						onclick={(e) => {
							e.preventDefault();
							handleOpenDialgoReview();
						}}
						aria-label="Ver reseñas del producto"
					>
						<iconify-icon
							class="text-[#707070] dark:text-white"
							icon="material-symbols-light:reviews"
							height="1.5rem"
							width="1.5rem"
						></iconify-icon>
					</button>

					<button
						class="flex items-center"
						onclick={(e) => {
							e.preventDefault();
							const product_link = `https://www.jenno.com.co/${data.username}/${data._id}`;
							navigator.clipboard
								.writeText(product_link)
								.then(() => {
									toast.success('Enlace copiado al portapapeles');
								})
								.catch((err) => {
									toast.error('Error al copiar el enlace. Intentelo nuevamente');
								});
						}}
						aria-label="Compartir producto"
					>
						<iconify-icon
							class="text-[#707070] dark:text-white"
							icon="bitcoin-icons:share-filled"
							height="1.5rem"
							width="1.5rem"
						></iconify-icon>
					</button>
				</div>

				<div>
					<!-- Etiqueta condicional -->
					{#if data.status === 'sold_out'}
						<Label text="Agotado" color="bg-red-600" />
					{:else if data.quantity <= 10}
						<Label text="Últimas unidades" color="bg-yellow-600" />
					{/if}
				</div>
			</div>

			<!-- Info -->
			<div class="px-4 py-3">
				<h3 class="text-base font-semibold line-clamp-2 leading-tight">
					{data.productname}
				</h3>

				<div class="mt-1">
					<p class="text-lg font-bold leading-tight">
						{formatPrice(displayedPrice(), 'es-CO', 'COP')}
					</p>

					{#if hasVariants()}
						<div
							class="flex items-center gap-1 mt-1 px-2 py-1
								       rounded-lg border border-blue-400/40
								       bg-blue-100/60 dark:bg-blue-950/40
								       text-blue-800 dark:text-blue-300 text-xs font-semibold"
						>
							<iconify-icon icon="mdi:tag-multiple-outline" height="0.95rem" width="0.95rem"
							></iconify-icon>
							<span>Precio varía según la opción</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</a>
{:else}
	<div
		class="flex flex-col justify-between w-full max-w-sm mx-auto h-[400px] rounded-xl bg-gray-100 dark:bg-[#1e1e1e] shadow-lg shadow-gray-300 dark:shadow-none overflow-hidden animate-pulse"
	>
		<!-- Header -->
		<div class="flex w-full h-12 px-4 items-center justify-between">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-[#303030]"></div>
				<div class="h-4 w-32 bg-gray-300 dark:bg-[#303030] rounded"></div>
			</div>
			<div class="h-5 w-5 bg-gray-300 dark:bg-[#303030] rounded-full hidden"></div>
		</div>

		<!-- Image -->
		<div class="flex justify-center px-4">
			<div class="h-52 w-full rounded-md bg-gray-300 dark:bg-[#303030]"></div>
		</div>

		<!-- Social -->
		<div class="flex items-center justify-between w-full h-8 mt-1 px-4">
			<div class="flex gap-2 items-center text-2xl text-center">
				<div
					class="flex gap-1 items-center justify-center bg-gray-300 dark:bg-[#303030] px-2 py-1 rounded-lg w-16 h-6"
				></div>
				<div class="w-6 h-6 rounded bg-gray-300 dark:bg-[#303030]"></div>
				<div class="w-6 h-6 rounded bg-gray-300 dark:bg-[#303030]"></div>
			</div>
			<div class="w-24 h-6 rounded bg-gray-300 dark:bg-[#303030]"></div>
		</div>

		<!-- Info -->
		<div class="px-4 py-3 space-y-2">
			<div class="h-4 w-full rounded bg-gray-300 dark:bg-[#303030]"></div>
			<div class="h-4 w-1/2 rounded bg-gray-300 dark:bg-[#303030]"></div>
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
