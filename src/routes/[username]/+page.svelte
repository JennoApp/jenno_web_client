<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageServerData } from './$types';
	import { toast } from 'svelte-sonner';
	import { location_data } from '$lib/stores/ipaddressStore';
	import { onMount } from 'svelte';
	import * as m from '$paraglide/messages';
	import { goto, invalidateAll } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { getThemeConfig } from '$lib/utils/themes';
	import type { ThemeConfig } from '$lib/utils/themes';
	import type Theme from 'quill/core/theme';
	import { applyTheme } from '$lib/stores/customThemesStore';

	export let data: PageServerData;
	let userInfo: any = $page.data.user;

	let productsStore = writable<any>([]);
	let metaStore = writable<any>();
	let pageload = 1;
	let initialLoading = true;
	let selectedCategory: string = '';

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	$: dataStatus = data.status;
	$: userData = data.userData;
	$: console.log($location_data);
	$: console.log({ userD: $page.data.user });

	$: isFollowing = userData.followers?.includes($page.data?.user?._id);

	$: console.log({ isFollowing });

	// Cargar productos del Usuario
	async function loadInitialProducts(userId: any, country?: string) {
		await getServerUrl();
		const limit: number = 20;
		const resolvedCountry = country ?? 'Colombia';

		const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : '';

		try {
			const response = await fetch(
				`${serverUrl}/products/user/${userId}?page=${1}&limit=${limit}&country=${resolvedCountry}`
			);

			if (!response.ok) {
				console.error('Error al cargar productos:', response.statusText);
				return;
			}

			const { data, meta } = await response.json();
			productsStore.set(data);
			metaStore.set(meta);
      pageload = 1;
		} catch (error) {
			console.log('Error al cargar los productos del usuario: ', error);
		}
	}

	// Carga los datos si el resutaldo del data.Status es diferente a 500
	$: if (dataStatus === 500) {
		console.log('usuario no existe');
		// products = []; // vacia la lista de productos cuando el usuario no existe

		productsStore.set([]);
		metaStore.set({});
	} else {
		if ($location_data) {
			loadInitialProducts(data.userData._id, $location_data.data[0].country);
		} else {
			loadInitialProducts(data.userData._id);
		}
	}

	$: console.log({ userData });

	$: console.log({ datasession: data.session });

	const handleFollow = async (customerId: string) => {
		await getServerUrl();
		if ($page.data.isSession) {
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
			members: [$page.data.user?._id, userData._id]
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

	onMount(async () => {
		if ($location_data) {
			loadInitialProducts(data.userData._id, $location_data.data[0].country);
			initialLoading = false;
		} else {
			loadInitialProducts(data.userData._id);
			initialLoading = false;
		}
	});

	async function loadingProducts() {
		await getServerUrl();

		const country = $page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		const nextPage = $metaStore?.nextPage || pageload + 1;

    const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : '';

		try {
			const response = await fetch(
				`${serverUrl}/products/user/${data.userData._id}?page=${nextPage}&limit=${limit}&country=${country}${categoryQuery}`
			);
			const result = await response.json();

			// Agrega los nuevos productos a la store
			productsStore.update((products) => [...products, ...result.data]);
			metaStore.set(result.meta);
      pageload = nextPage;
		} catch (error) {
			console.log('Error al cargar más productos:', error);
		}
	}

	function shuffleArray(array: string[]) {
		return array.sort(() => Math.random() - 0.5);
	}

	$: storeCategories = shuffleArray(
		Array.from(new Set($productsStore.map((product: any) => product.category).filter(Boolean)))
	).slice(0, 10);

	// --- SCROLL INFINITO CON INTERSECTION OBSERVER ---
	let loadingRef: HTMLElement | undefined;
	$: if (loadingRef) {
		const loadingObserver = new IntersectionObserver(async (entries) => {
			const element = entries[0];
			if (element.isIntersecting) {
				console.log('Cargando nuevos productos...');
				await loadingProducts();
			}
		});
		loadingObserver.observe(loadingRef);
	}

	// Obtener la configuración del tema
	// $: userTheme = data.userData?.theme || 'default';
	$: userTheme = 'ocean_blue';
	$: themeConfig = getThemeConfig(userTheme);

	$: if ($page.data.userData?.theme) {
		applyTheme('ocean_blue');
	}
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
	<meta property="og:url" content={$page.url.href} />
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
		<!-- user Information -->
		<div class="flex flex-col md:flex-row gap-3 mt-5 w-full">
			<div class="flex justify-center md:w-3/12">
				{#if user?.profileImg}
					<img
						class="w-32 h-32 object-cover rounded-full"
						src={user?.profileImg}
						alt={user?.username}
						height={400}
						width={400}
					/>
				{:else}
					<div class="flex justify-center items-center h-32 w-32 bg-[#202020] rounded-full">
						<iconify-icon icon="bxs:store" height="3.5rem" width="3.5rem" class="text-[#707070]" />
					</div>
				{/if}
			</div>

			<div class="mx-5 md:w-5/12">
				<div class="flex flex-col gap-3 items-center md:items-start">
					<h2 class="text-2xl font-medium text-center md:text-left">{user?.displayname}</h2>
					<p class="flex flex-wrap text-center md:text-left">
						{user?.bio !== undefined ? user?.bio : ''}
					</p>
				</div>
			</div>

			<div class="flex flex-col items-center gap-5 md:w-4/12">
				<!-- Verifica que el usuario actual no sea el mismo que el usuario en sesión -->
				{#if user?._id === data?.user?._id}
					<!-- Botón de Compartir Tienda para el dueño -->
					<button
						class="w-[80%] mx-auto flex items-center justify-center bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525] p-2 rounded-md"
						on:click|preventDefault={() => {
							const tienda = user?.username;
							const store_link = `https://www.jenno.com.co/${tienda}`;
							navigator.clipboard
								.writeText(store_link)
								.then(() => {
									toast.success('Enlace copiado al portapapeles');
								})
								.catch((err) => {
									toast.error('Error al copiar el enlace. Inténtalo nuevamente');
								});
						}}
					>
						<span class="text-black dark:text-gray-200">Compartir Tienda</span>
					</button>
				{:else}
					<div class="flex items-center gap-5 ml-10">
						<div class="hidden">
							{#if isFollowing}
								<Button
									class="bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]"
								>
									<span class="text-black dark:text-gray-200">Siguiendo</span>
								</Button>
							{:else}
								<Button
									on:click={() => handleFollow(user?._id)}
									class="bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]"
								>
									<span class="text-black dark:text-gray-200">Seguir</span>
								</Button>
							{/if}
						</div>

						<Button
							class="bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]"
							on:click={createConversation}
						>
							<span class="text-black dark:text-gray-200">Enviar Mensaje</span>
						</Button>
					</div>
				{/if}

				<div class="hidden">
					<div class="flex gap-10">
						<div class="text-center">
							<span class="text-lg font-semibold dark:text-gray-200">{user?.followers.length}</span>
							<span class="block text-sm text-gray-500">{m.shop_page_followers()}</span>
						</div>
						<div class="text-center">
							<span class="text-lg font-semibold dark:text-gray-200">{user?.following.length}</span>
							<span class="block text-sm text-gray-500">{m.shop_page_following()}</span>
						</div>
					</div>
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
			on:click={() => (selectedCategory = '')}
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
				on:click={() => (selectedCategory = category)}
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
	{:else if $productsStore.length === 0}
		<!-- No hay productos disponibles para el cliente -->
		<div class="flex flex-col items-center justify-center mt-40 w-full">
			<iconify-icon
				icon="tabler:package-off"
				height="5rem"
				width="5rem"
				class="text-[#707070] mb-4"
			/>
			<h1 class="text-xl font-semibold text-[#707070] mb-2">
				Esta tienda aún no tiene productos disponibles
			</h1>
			<p class="text-lg text-[#707070] text-center">
				El vendedor aún no ha agregado productos. ¡Vuelve pronto para descubrir nuevas ofertas!
			</p>
		</div>
	{:else}
		<!-- Lista de productos -->
		<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-5 gap-5 grid-flow-row">
			{#each $productsStore as productData}
				<Card data={productData} />
			{/each}
		</div>
	{/if}

	<!-- Div para el observer del scroll infinito (se muestra si hay siguiente página) -->
	{#if $metaStore?.hasNextPage}
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
