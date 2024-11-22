<script lang="ts">
	import { format } from 'timeago.js';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';


	export let own: boolean;
	export let friendId: any;
	export let message: any;

	let friendImg: string;

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

  onMount(async () => {
    await getServerUrl()
  })

	const getFriendImg = async (id: string) => {
     if (!serverUrl) {
        console.error('Error: serverUrl no está definido.');
        return;
    }

    if (!id) {
        console.error('Error: friendId no está definido.');
        return;
    }
    try {
        const response = await fetch(`${serverUrl}/users/getprofileimg/${id}`);
        const data = await response.json();
        friendImg = data;

        return data;
    } catch (error) {
        console.error('Error al obtener la imagen del amigo:', error);
    }	
	};

	$: if (friendId && serverUrl) {
		getFriendImg(friendId);
	}

	$: console.log(friendImg);
	$: console.log(friendId);
</script>

<div class="flex flex-col mb-3">
	{#if own}
		<div class="flex self-end">
			{#if $page.data.user.profileImg !== ''}
				<img
					src={$page.data.user.profileImg}
					alt=""
					class="w-8 h-8 rounded-full object-cover mr-3"
				/>
			{:else}
				<iconify-icon
					icon="mdi:user"
					height="1.3rem"
					width="1.3rem"
					class="dark:text-gray-200 flex justify-center items-center h-9 w-9 mr-3 bg-gray-200 dark:bg-[#202020] rounded-full"
				/>
			{/if}
			<p class={'p-2 rounded-3xl bg-gray-200 dark:bg-[#202020] max-w-72'}>{message.text}</p>
		</div>
		<div class="text-sm mt-2 self-end">
			{format(message.createdAt)}
		</div>
	{/if}

{#if own === false}
		<div class="flex">
			{#if friendImg?.profileImg !== ''}
				<img
					src={friendImg?.profileImg}
					alt=""
					class="w-8 h-8 rounded-full object-cover mr-3"
				/>
			{:else}
				<iconify-icon
					icon="mdi:user"
					height="1.3rem"
					width="1.3rem"
					class="dark:text-gray-200 flex justify-center items-center h-9 w-9 mr-3 bg-gray-200 dark:bg-[#202020] rounded-full"
				/>
			{/if}
			<p class={'p-2 rounded-3xl bg-gray-200 dark:bg-[#202020] max-w-72'}>{message.text}</p>
		</div>
		<div class="text-sm mt-2">
			{format(message.createdAt)}
		</div>
	{/if}
</div>
