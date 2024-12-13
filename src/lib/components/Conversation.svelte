<script lang="ts">
	import { onMount } from 'svelte';

	export let conversation: any[];
	export let userId: string;

	let user: any = null;
	let serverUrl: string;

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			if (data.server_url) {
				serverUrl = data.server_url; // Asignar la URL del servidor
			} else {
				console.error('Error: server_url no está presente en la respuesta.');
			}
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	// Obtener datos del usuario amigo
	async function getUser(friendId: string) {
		if (!serverUrl) {
			console.error('Error: serverUrl no está definido.');
			return;
		}

		if (!friendId) {
			console.error('Error: friendId no está definido.');
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/users/${friendId}`);

			if (!response.ok) {
				console.error(`Error: Falló la solicitud con el estado ${response.status}`);
				return;
			}

			const data = await response.json();
			user = data; // Asignar datos del amigo
			console.log('Datos del amigo:', data);
		} catch (err) {
			console.error('Error al obtener datos del amigo:', err);
		}
	}

	// Ejecutar al montar el componente
	onMount(async () => {
		await getServerUrl(); // Obtener serverUrl primero

		// Identificar el ID del amigo y obtener sus datos
		const friendId = conversation?.members.find((m) => m !== userId);
		if (friendId) {
			await getUser(friendId);
		} else {
			console.error('Error: friendId no se pudo determinar.');
		}
	});
</script>

<div class="flex items-center p-3 cursor-pointer bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]">
	{#if user?.profileImg !== ''}
		<img
			src={user?.profileImg}
			alt={user?.username}
			class="w-10 h-10 rounded-full object-cover mr-5"
		/>
	{:else}
		<iconify-icon
			icon="mdi:user"
			height="1.5rem"
			width="1.5rem"
			class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#181818] rounded-full mr-5"
		/>
	{/if}
	<span class="font-medium">{user?.username}</span>
</div>
