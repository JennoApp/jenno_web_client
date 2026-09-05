<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/Card.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import type { PageServerData } from './$types';
	import { toast } from 'svelte-sonner';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';
	import { goto, invalidateAll } from '$app/navigation';
	import { getThemeConfig } from '$lib/utils/themes';
	import type { ThemeConfig } from '$lib/utils/themes';
	import type Theme from 'quill/core/theme';
	import { applyTheme } from '$lib/stores/customThemesStore';

	let { data }: { data: PageServerData } = $props();

	let userInfo = $derived(page.data.user);

	let productsStore = $state<any>([]);
	let originalProducts = $state<any>([]);
	let metaStore = $state<any>();
	let pageload = $state(1);
	let initialLoading = $state(true);
	let selectedCategory = $state<string>('');
	let serverUrl = $state<string>('');

	let dataStatus = $derived(data.status);
	let userData = $derived(data.userData);
	let isFollowing = $derived(userData.followers?.includes(page.data?.user?._id));

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	// Cargar productos del Usuario
	async function loadInitialProducts(userId: any, country?: string) {
		await getServerUrl();

		const limit: number = 20;
		const resolvedCountry = country ?? 'Colombia';
		const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : '';

		try {
			const response = await fetch(
				`${serverUrl}/products/user/${userId}?page=${1}&limit=${limit}&country=${resolvedCountry}${categoryQuery}`
			);

			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}

			const { data, meta } = await response.json();

			productsStore = data;
			if (selectedCategory === '') {
				originalProducts = data;
			}
			metaStore = meta;
			pageload = 1;
		} catch (error) {
			console.log('Error al cargar los productos del usuario: ', error);
		}
	}

	const handleFollow = async (customerId: string) => {
		await getServerUrl();
		if (page.data.isSession) {
			try {
				const followingResponse = await fetch(`${serverUrl}/users/following/${customerId}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${data.session}`
					},
					credentials: 'include'
				});

				if (!followingResponse.ok) {
					const errorData = await followingResponse.json();
					console.error('Error al seguir al usuario', errorData);
					throw new Error('Error al seguir al usuario');
				}

				// Actualiza el estado de isFollowing
				isFollowing = true;
				invalidateAll();

				toast.success('Usuario seguido exitosamente!');
			} catch (error) {
				console.log(error);
			}
		} else {
			toast.info('Debes iniciar sesion para seguir a este usuario!!!');
		}
	};

	const createConversation = async () => {
		// Verificar si el usuario está en sesión
		if (!userInfo || !userInfo._id) {
			toast.error('Debes iniciar sesión para enviar un mensaje.');
			return;
		}

		const conversationData = {
			members: [page.data.user?._id, userData._id]
		};

		try {
			await getServerUrl();
			const response = await fetch(`${serverUrl}/chat/conversations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(conversationData)
			});

			const result = await response.json();

			if (result.status === 200) {
				// Si la conversación se crea correctamente, redirigir al chat
				const conversationId = result.conversationId;
				goto(`/chat?conversationId=${conversationId}`); // Redirigir al chat con el nuevo conversationId
			} else {
				console.error('Error al crear la conversación:', result.message);
			}
		} catch (error) {
			console.error('Error en la solicitud:', error);
		}
	};

	$effect(() => {
		if (dataStatus === 500) {
			productsStore = [];
			metaStore = [];
			initialLoading = false;
			return;
		}

		// País por defecto
		let country = 'Colombia';

		// Si existe location_data, usar la ubicación detectada
		if ($location_data?.data?.[0]?.country) {
			country = $location_data.data[0].country;
		}

		loadInitialProducts(data.userData._id, country)
			.then(() => {
				initialLoading = false;
			})
			.catch(() => {
				initialLoading = false;
			});
	});

	async function loadingProducts() {
		await getServerUrl();

		const country = page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		const nextPage = metaStore?.nextPage || pageload + 1;

		const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : '';

		try {
			const response = await fetch(
				`${serverUrl}/products/user/${data.userData._id}?page=${nextPage}&limit=${limit}&country=${country}${categoryQuery}`
			);
			const result = await response.json();

			// Agrega los nuevos productos a la store
			productsStore = [...productsStore, ...result.data];
			metaStore = result.meta;
			pageload = nextPage;
		} catch (error) {
			console.log('Error al cargar más productos:', error);
		}
	}

	// Shuffle function for categories
	function shuffleArray<T>(array: T[]): T[] {
		return array.sort(() => Math.random() - 0.5);
	}

	let storeCategories = $derived(
		shuffleArray(
			Array.from(new Set(originalProducts.map((product: any) => product.category).filter(Boolean)))
		).slice(0, 10)
	);

	// --- SCROLL INFINITO CON INTERSECTION OBSERVER ---
	let loadingRef = $state<HTMLElement | undefined>();

	$effect(() => {
		if (loadingRef) {
			const observer = new IntersectionObserver(async (entries) => {
				const element = entries[0];
				if (element.isIntersecting) {
					console.log('Cargando nuevos productos...');
					await loadingProducts();
				}
			});
			observer.observe(loadingRef);

			return () => observer.disconnect();
		}
	});

	// -------------------------------
	//    FILTRO DE CATEGORÍAS
	// -------------------------------
	async function handleCategoryClick(categoryParam: string) {
		selectedCategory = categoryParam;

		if (categoryParam === '') {
			// volver a cargar TODO como en el primer código
			if ($location_data) await loadInitialProducts(userData._id, $location_data.data[0].country);
			else await loadInitialProducts(userData._id);
			return;
		}

		// cargar por categoría como en el primer código
		try {
			const res = await fetch(
				`${serverUrl}/products/user/${userData._id}?page=1&limit=20&country=Colombia&category=${categoryParam}`
			);
			if (!res.ok) return console.error('Error al cargar categoría');

			const { data: filtered, meta } = await res.json();

			productsStore = filtered;
			metaStore = meta;
			pageload = 1;
		} catch (error) {
			console.error('Error filtrando categoría:', error);
		}
	}

	// -------------------------------
	//    TEMA DEL USUARIO
	// -------------------------------

	let userTheme = $derived(data.userData?.theme || 'ocean_blue');
	let themeConfig = $derived(getThemeConfig(userTheme));

	$effect(() => {
		if (page.data.userData?.theme) {
			applyTheme('ocean_blue');
		}
	});
</script>

<svelte:head>
	<title>{data.userData?.displayname} - Tienda en Jenno</title>
	<meta
		name="description"
		content={data.userData?.bio ||
			'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}
	/>

	<!-- Open Graph (para Facebook, WhatsApp, etc.) -->
	<meta property="og:title" content="{data.userData?.displayname} - Tienda en Jenno" />
	<meta
		property="og:description"
		content={data.userData?.bio ||
			'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}
	/>
	<meta property="og:type" content="website" />
	<!-- Usamos la URL actual; por ejemplo, si usas $page.url.href, asegúrate de importarlo -->
	<meta property="og:url" content={page.url.href} />
	<!-- La imagen destacada: si el usuario tiene profileImg, la usamos; de lo contrario, una imagen por defecto -->
	<meta
		property="og:image"
		content={data.userData?.profileImg || 'https://www.jenno.com.co/oplogo.jpg'}
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Previsualización de la tienda de {data.userData?.displayname}"
	/>

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{data.userData?.displayname} - Tienda en Jenno" />
	<meta
		name="twitter:description"
		content={data.userData?.bio ||
			'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}
	/>
	<meta
		name="twitter:image"
		content={data.userData?.profileImg || 'https://www.jenno.com.co/oplogo.jpg'}
	/>
	<meta
		name="twitter:image:alt"
		content="Previsualización de la tienda de {data.userData?.displayname}"
	/>
</svelte:head>

{#if userData}
	{#await userData}
		<p>Waiting...</p>
	{:then user}
		<!-- Store profile card -->
		<div class="w-full mt-6 px-4">
			<div
				class="w-full max-w-6xl mx-auto rounded-2xl border border-gray-200 dark:border-[#303030] bg-white dark:bg-[#161616] shadow-sm p-5 sm:p-6"
			>
				<div class="flex flex-col sm:flex-row sm:items-center gap-5">
					<!-- Profile image -->
					<div class="flex justify-center sm:justify-start shrink-0">
						{#if user?.profileImg}
							<img
								class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full border border-gray-200 dark:border-[#303030]"
								src={user?.profileImg}
								alt={user?.username}
								height={400}
								width={400}
							/>
						{:else}
							<div
								class="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 dark:bg-[#202020]"
							>
								<iconify-icon
									icon="bxs:store"
									height="3rem"
									width="3rem"
									class="text-gray-500 dark:text-gray-400"
								></iconify-icon>
							</div>
						{/if}
					</div>

					<!-- Store information -->
					<div class="flex-1 min-w-0 text-center sm:text-left">
						<div class="flex flex-col gap-1">
							<h2
								class="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white truncate"
							>
								{user?.displayname}
							</h2>

							<p class="text-sm text-gray-500 dark:text-gray-400">
								@{user?.username}
							</p>
						</div>

						{#if user?.bio}
							<p class="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
								{user.bio}
							</p>
						{/if}
					</div>

					<!-- Actions -->
					{#if user?._id === data?.user?._id}
						<div class="shrink-0 w-full sm:w-auto">
							<button
								type="button"
								class="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-gray-300 dark:border-[#383838] bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#202020] active:scale-[0.98]"
								onclick={(e) => {
									e.preventDefault();

									const tienda = user?.username;
									const store_link = `https://www.jenno.com.co/${tienda}`;

									navigator.clipboard
										.writeText(store_link)
										.then(() => {
											toast.success('Enlace de la tienda copiado');
										})
										.catch(() => {
											toast.error('Error al copiar el enlace. Inténtalo nuevamente');
										});
								}}
							>
								<iconify-icon icon="lucide:share-2" height="1rem" width="1rem"></iconify-icon>

								<span>Compartir Tienda</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:catch error}
		<p class="text-red-500">{error.message}</p>
	{/await}

	<!-- Barra de categorías por tienda -->
	<div
		class="flex items-center bg-[#f7f7f7] dark:bg-[#121212] gap-3 w-full h-12 my-1 z-20 mt-7 m-5"
	>
		<!-- Botón "Todos" -->
		<button
			class={`text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10
    ${
			selectedCategory === ''
				? 'bg-[#202020] text-gray-200 dark:bg-gray-200 dark:text-black'
				: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-[#202020] dark:hover:bg-[#2a2a2a] dark:text-gray-200'
		}`}
			onclick={(e) => {
				e.preventDefault();
				handleCategoryClick('');
			}}
		>
			Todos
		</button>

		<!-- Categorías de la tienda -->
		{#each storeCategories as category}
			<button
				class={`text-sm font-semibold border-none rounded-xl w-auto h-8 px-3 cursor-pointer z-10
      ${
				selectedCategory === category
					? 'bg-[#202020] text-gray-200 dark:bg-gray-200 dark:text-black'
					: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-[#202020] dark:hover:bg-[#2a2a2a] dark:text-gray-200'
			}`}
				onclick={(e) => {
					e.preventDefault();
					handleCategoryClick(category as string);
				}}
			>
				{category}
			</button>
		{/each}
	</div>

	{#if initialLoading}
		<!-- Loader mientras se cargan los productos -->
		<div class="flex justify-center items-center py-10" bind:this={loadingRef}>
			<svg
				class="animate-spin h-8 w-8 text-gray-500 dark:text-gray-300"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				/>
			</svg>
			<span class="ml-2 text-gray-500 dark:text-gray-300 text-sm">Cargando productos...</span>
		</div>
	{:else if productsStore.length === 0}
		<!-- No hay productos disponibles para el cliente -->
		<div class="flex flex-col items-center justify-center mt-40 w-full">
			<iconify-icon icon="tabler:package-off" height="5rem" width="5rem" class="text-[#707070] mb-4"
			></iconify-icon>
			<h1 class="text-xl font-semibold text-[#707070] mb-2">
				Esta tienda aún no tiene productos disponibles
			</h1>
			<p class="text-lg text-[#707070] text-center">
				El vendedor aún no ha agregado productos. ¡Vuelve pronto para descubrir nuevas ofertas!
			</p>
		</div>
	{:else}
		<!-- Lista de productos -->
		<div
			class="grid grid-cols-2 sm:grid-cols-3 sm:mx-0 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-[1600px] mx-auto gap-3 mt-7"
		>
			{#each productsStore as productData}
				<Card data={productData} currentUsername={userData.username} />
			{/each}
		</div>
	{/if}

	<!-- Div para el observer del scroll infinito (se muestra si hay siguiente página) -->
	{#if metaStore?.hasNextPage}
		<div class="flex justify-center items-center py-4" bind:this={loadingRef}>
			<svg
				class="animate-spin h-8 w-8 text-gray-500 dark:text-gray-300"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
			<span class="ml-2 text-gray-500 dark:text-gray-300 text-sm">Cargando productos...</span>
		</div>
	{/if}
	<!-- Error al encontrar la informacion del usuario -->
{:else if data?.userData?.error}
	<h1>{data?.userData?.error}</h1>
{:else}
	<h1>El usuario no existe</h1>
{/if}
