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
  let userInfo: any = $page.data.user

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
    await getServerUrl()
		const limit: number = 20;
		try {
			const response = await fetch(
				`${serverUrl}/products/user/${userId}?page=${1}&limit=${limit}&country=${country}`
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
		}
	}

	$: console.log({ userData });

	const handleFollow = async (customerId: string) => {
    await getServerUrl()
		if ($page.data.isSession) {
			try {
				const followingResponse = await fetch(`${serverUrl}/users/following/${customerId}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${data.session}`
					}
				});

				if (!followingResponse.ok) {
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
      return
    }

		const conversationData = {
			members: [$page.data.user?._id, userData._id]
		};

		try {
      await getServerUrl()
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
		}
	});
</script>

<svelte:head>
	<title>{userData?.username}</title>
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
				<div class="flex flex-col gap-3 items-start">
					<h2 class="text-2xl font-medium">{user?.username}</h2>
					<p class="flex flex-wrap">
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
							<Button class="dark:bg-[#202020] dark:hover:bg-[#252525]">
								<span class="text-gray-200">Siguiendo</span>
							</Button>
						{:else}
							<Button
								on:click={() => handleFollow(user?._id)}
								class="dark:bg-[#202020] dark:hover:bg-[#252525]"
							>
								<span class="text-gray-200">Seguir</span>
							</Button>
						{/if}

						<Button class="dark:bg-[#202020] dark:hover:bg-[#252525]" on:click={createConversation}>
							<span class="text-gray-200">Send Message</span>
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
