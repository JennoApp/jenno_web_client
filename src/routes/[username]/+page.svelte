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

	export let data: PageServerData;
	let userInfo: any = $page.data.user;

	let productsStore = writable<any>([]);
	let metaStore = writable<any>();
	let pageload = 1;
	let initialLoading = true;

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
	async function loadProducts(userId: any, country?: string) {
		await getServerUrl();
		const limit: number = 20;

		const resolvedCountry = country ?? 'Colombia';
		try {
			const response = await fetch(
				`${serverUrl}/products/user/${userId}?page=${1}&limit=${limit}&country=${resolvedCountry}`
			);
			const { data, meta } = await response.json();

			// products = data;

			productsStore.set(data);
			metaStore.set(meta);
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
			loadProducts(data.userData._id, $location_data.data[0].country);
		} else {
			loadProducts(data.userData._id);
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
			loadProducts(data.userData._id, $location_data.data[0].country);
			initialLoading = false;
		} else {
			loadProducts(data.userData._id);
			initialLoading = false;
		}
	});

	async function loadingProducts() {
		await getServerUrl();

		const country = $page.url.searchParams.get('country') || 'Colombia';
		const limit = 20;
		const nextPage = pageload + 1;

		try {
			const response = await fetch(
				`${serverUrl}/products/user/${data.userData._id}?page=${nextPage}&limit=${limit}&country=${country}`
			);
			const result = await response.json();
			// Agrega los nuevos productos a la store
			productsStore.update((products) => [...products, ...result.data]);
			pageload = nextPage;
			metaStore.set(result.meta);
		} catch (error) {
			console.log('Error al cargar más productos:', error);
		}
	}

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
	<div
		class="min-h-screen bg-[var(--page-bg)]"
		style="
    --store-bg: {themeConfig.background};
    --button-bg: {themeConfig.buttonBg};
    --button-text: {themeConfig.buttonText};
    background-image: var(--store-bg);
    background-blend-mode: overlay;
  "
	>
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
							<iconify-icon
								icon="bxs:store"
								height="3.5rem"
								width="3.5rem"
								class="text-[#707070]"
							/>
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
								<span class="text-lg font-semibold dark:text-gray-200"
									>{user?.followers.length}</span
								>
								<span class="block text-sm text-gray-500">{m.shop_page_followers()}</span>
							</div>
							<div class="text-center">
								<span class="text-lg font-semibold dark:text-gray-200"
									>{user?.following.length}</span
								>
								<span class="block text-sm text-gray-500">{m.shop_page_following()}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:catch error}
			<p class="text-red-500">{error.message}</p>
		{/await}

		<!-- Lista de productos -->
		<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10 m-5 gap-5 grid-flow-row">
			{#each $productsStore as productData}
				<Card data={productData} />
			{/each}
		</div>

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
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					></path>
				</svg>
				<span class="ml-2 text-gray-500 dark:text-gray-300 text-sm">Cargando productos...</span>
			</div>
		{/if}
	</div>

	<!-- Error al encontrar la informacion del usuario -->
{:else if data?.userData?.error}
	<h1>{data?.userData?.error}</h1>
{:else}
	<h1>El usuario no existe</h1>
{/if}
