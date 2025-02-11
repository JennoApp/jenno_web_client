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

	export let data: PageServerData;
	let userInfo: any = $page.data.user;

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

	let products: any[] = [];
	$: isFollowing = userData.followers?.includes($page.data?.user?._id);

	$: console.log({ isFollowing });

	// Cargar productos del Usuario
	async function loadProducts(userId: any, country?: string) {
		await getServerUrl();
		const limit: number = 20;

		const resolvedCountry = country !== undefined || country !== null ? country : 'Colombia';
		try {
			const response = await fetch(
				`${serverUrl}/products/user/${userId}?page=${1}&limit=${limit}&country=${resolvedCountry}`
			);
			const { data } = await response.json();

			products = data;
		} catch (error) {
			console.log('Error al cargar los productos del usuario: ', error);
		}
	}

	// Carga los datos si el resutaldo del data.Status es diferente a 500
	$: if (dataStatus === 500) {
		console.log('usuario no existe');
		products = []; // vacia la lista de productos cuando el usuario no existe
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

	onMount(() => {
		if ($location_data) {
			loadProducts(data.userData._id, $location_data.data[0].country);
		} else {
			loadProducts(data.userData._id);
		}
	});
</script>

<svelte:head>
  <title>{data.userData?.displayname} - Tienda en Jenno</title>
  <meta
    name="description"
    content="{data.userData?.bio || 'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}"
  />

  <!-- Open Graph (para Facebook, WhatsApp, etc.) -->
  <meta property="og:title" content="{data.userData?.displayname} - Mi Tienda en Jenno" />
  <meta
    property="og:description"
    content="{data.userData?.bio || 'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}"
  />
  <meta property="og:type" content="website" />
  <!-- Usamos la URL actual; por ejemplo, si usas $page.url.href, asegúrate de importarlo -->
  <meta property="og:url" content="{$page.url.href}" />
  <!-- La imagen destacada: si el usuario tiene profileImg, la usamos; de lo contrario, una imagen por defecto -->
  <meta
    property="og:image"
    content="{data.userData?.profileImg || 'https://jenno-aws-bucket.s3.us-east-2.amazonaws.com/opengraph/oplogo.jpg'}"
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
    content="{data.userData?.bio || 'Crea y comparte tu tienda online con Jenno. Vende tus productos de forma fácil y segura.'}"
  />
  <meta
    name="twitter:image"
    content="{data.userData?.profileImg || 'https://tu-dominio.com/path/to/default-image.jpg'}"
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
				<div class="flex items-center gap-5 ml-10">
					<!-- Verifica que el usuario actual no sea el mismo que el usuario en sesión -->
					{#if !(user?._id === data?.user?._id)}
						<!-- Botón de seguimiento basado en el estado de `isFollowing` -->
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

						<Button
							class="bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]"
							on:click={createConversation}
						>
							<span class="text-black dark:text-gray-200">Enviar Mensaje</span>
						</Button>
					{/if}
				</div>
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
	{:catch error}
		<p class="text-red-500">{error.message}</p>
	{/await}

	<!-- Lista de prod -->
	<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10 m-5 gap-5 grid-flow-row">
		{#each products as productData}
			<Card data={productData} />
		{/each}
	</div>

	<!-- Error al encontrar la informacion del usuario -->
{:else if data?.userData?.error}
	<h1>{data?.userData?.error}</h1>
{:else}
	<h1>El usuario no existe</h1>
{/if}
