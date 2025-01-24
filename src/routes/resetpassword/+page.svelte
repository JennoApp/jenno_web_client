<script lang="ts">
	import type { PageServerData } from './$types';
	import { toast } from 'svelte-sonner';
  import { goto } from '$app/navigation'

	export let data: PageServerData;

  // Mostrar el error si no hay token
  $: if (!data.token && data.error) {
    toast.error(data.error);
  }

	let newPassword: string = '';
	let confirmPassword: string = '';
	let token: string = data.token || '';
	let serverUrl: string;

	// Obtener la URL del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();
			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener la URL del servidor:', error);
		}
	}

	async function handleForm() {
		if (newPassword !== confirmPassword) {
			toast.error('Las contraseñas no coinciden.');
			return;
		}

		try {
			await getServerUrl();

			const response = await fetch(`${serverUrl}/mails/updatepassword`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token: token,
					newPassword: newPassword
				})
			});

			if (response.ok) {
				toast.success('Contraseña actualizada exitosamente.');
        goto('/login')
			} else {
				const errorResponse = await response.json();
				console.error('Error al actualizar la contraseña:', errorResponse.message);
				toast.error('Error al actualizar la contraseña. Intente nuevamente.');
			}
		} catch (error) {
			console.error('Error en la solicitud:', error);
			toast.error('Error al actualizar la contraseña. Intente nuevamente.');
		}
	}
</script>

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Encabezado -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">
		Restablecer Contraseña
	</h1>

	<!-- Formulario -->
	<form
		on:submit|preventDefault={handleForm}
		method="POST"
		class="flex-col gap-4 min-w-xs w-96 mx-auto"
	>
		<!-- Campo de nueva contraseña -->
		<div class="flex flex-col">
			<label for="newPassword" class="text-base dark:text-gray-200 font-medium"
				>Nueva Contraseña</label
			>
			<input
				bind:value={newPassword}
				type="password"
				name="newPassword"
				id="newPassword"
				required
				minlength="8"
				class="h-8 border rounded-md text-black font-semibold px-2"
			/>
		</div>

		<!-- Campo de confirmación de contraseña -->
		<div class="flex flex-col">
			<label for="confirmPassword" class="text-base dark:text-gray-200 font-medium"
				>Confirmar Contraseña</label
			>
			<input
				bind:value={confirmPassword}
				type="password"
				name="confirmPassword"
				id="confirmPassword"
				required
				minlength="8"
				class="h-8 border rounded-md text-black font-semibold px-2"
			/>
		</div>

		<!-- Botón de envío -->
		<button
			class="h-10 w-full mt-4 border dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
		>
			Restablecer Contraseña
		</button>
	</form>
</div>
