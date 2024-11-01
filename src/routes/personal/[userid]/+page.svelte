<script lang="ts">
	import type { PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	export let data: PageServerData;

   // Obtener url del servidor
  let serverUrl: string
  async function getServerUrl() {
    try {
      const response = await fetch(`/api/server`)
      const data = await response.json()

      serverUrl = data.server_url 
    } catch (error) {
      console.error('Error al solicitar Paypal Id')
    }
  }

  $: getServerUrl()

	$: userData = data.userData;
	$: dataStatus = data.status;
	$: sessionUserData = data?.user;

	$: isFollowing = userData.followers?.includes($page.data?.user?._id);

	$: console.log({ isFollowing });

	const handleFollow = async (customerId: string) => {
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
			toast.error('Error al seguir usuario!');
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
						<iconify-icon icon="mdi:user" height="3.5rem" width="3.5rem" class="text-[#707070]" />
					</div>
				{/if}
			</div>

			<div class="w-5/12">
				<div class="flex flex-col gap-3 items-start">
					<h2 class="text-2xl font-medium">{user?.username}</h2>
					<p class="flex flex-wrap">
						{user?.bio !== undefined ? user?.bio : ''}
					</p>
				</div>
			</div>

			<div class="flex flex-col items-center gap-5 w-4/12">
				<div class="flex items-center gap-5 ml-10">
					<!-- Verifica que el usuario actual no sea el mismo que el usuario en sesión -->
					{#if !(user?._id === sessionUserData?._id)}
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
