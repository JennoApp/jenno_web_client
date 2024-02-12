<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageServerData } from './$types';
	import { toast } from 'svelte-sonner';

	export let data: PageServerData;

	$: dataStatus = data.status;
	$: userData = data.userData;
	let products: any[] = [];

	$: console.log({ isSession: $page.data.isSession });

	async function loadUserData(userId: string) {
		const response = await fetch(`http://localhost:3000/users/${userId}`);
		const user = await response.json();
		userData = user;
	}

	async function loadProducts(userId: string) {
		const response = await fetch(`http://localhost:3000/products/user/${userId}`);
		const data = await response.json();
		products = data;
	}

	// Carga los datos si el resutaldo del data.Status es diferente a 500
	$: if (dataStatus === 500) {
		console.log('usuario no existe');
		products = []; // vacia la lista de productos cuando el usuario no existe
	} else {
		loadProducts(data.userData._id);
	}

	$: console.log({ userData });

	const handleFollow = async (customerId: string) => {
		if ($page.data.isSession) {
			try {
				const followingResponse = await fetch(
					`http://localhost:3000/users/following/${customerId}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${data.session}`
						}
					}
				);

				if (!followingResponse.ok) {
					throw new Error('Error al seguir al usuario');
				}

				// actualiza la informacion del usuario
				await loadUserData(customerId);

				console.log('Usuario seguido exitosamente');
			} catch (error) {
				console.log(error);
			}
		} else {
			toast.info("Debes iniciar sesion para seguir a este usuario!!!")
		}
	};
</script>

{#if userData}
	{#await userData}
		<p>Waiting...</p>
	{:then user}
		<!-- user Information -->
		<div class="flex mt-5 w-full h-48">
			<div class="flex justify-center w-3/12">
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

			<div class="w-5/12">
				<div class="flex flex-col gap-3 items-start">
					<h2 class="text-2xl font-medium">{user?.username}</h2>
					<p class="flex flex-wrap">
						Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a
						piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard
						McClintock.
					</p>
				</div>
			</div>

			<div class="flex flex-col items-center gap-5 w-4/12">
				<div class="flex items-center gap-5 ml-10">
					{#if !(user?._id === data?.user?._id)}
						{#if data?.user?.following.includes(user?._id)}
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

						<Button class="dark:bg-[#202020] dark:hover:bg-[#252525]">
							<span class="text-gray-200">Send Message</span></Button
						>
					{/if}
				</div>
				<div class="flex gap-10">
					<div class="text-center">
						<span class="text-lg font-semibold dark:text-gray-200">{user?.followers.length}</span>
						<span class="block text-sm text-gray-500">Seguidores</span>
					</div>
					<div class="text-center">
						<span class="text-lg font-semibold dark:text-gray-200">{user?.following.length}</span>
						<span class="block text-sm text-gray-500">Seguidos</span>
					</div>
				</div>
			</div>
		</div>
	{:catch error}
		<p class="text-red-500">{error.message}</p>
	{/await}

	<!-- Error al encontrar la informacion del usuario -->
{:else if data?.userData?.error}
	<h1>{data?.userData?.error}</h1>
{:else}
	<h1>El usuario no existe</h1>
{/if}

<div class="grid lg:grid-cols-4 sm:grid-cols-3 m-5 gap-5 grid-flow-row">
	{#each products as productData}
		<Card data={productData} />
	{/each}
</div>
