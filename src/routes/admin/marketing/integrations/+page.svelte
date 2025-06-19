<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let connected = false;
	let loading = true;
	let error = '';

	onMount(async () => {
		if (!browser) return;

		try {
			const res = await fetch('/api/marketing/googlestatus');

			if (!res.ok) throw new Error('No se pudo verificar el estado.');

			const data = await res.json();
			console.log('🧪 Datos recibidos:', data);

			if (typeof data.googleConnected !== 'boolean') {
				error = 'Respuesta inesperada del servidor.';
			} else {
				connected = data.googleConnected;
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function connectWithGoogle() {
		try {
			const res = await fetch('/api/marketing/googleauthurl');
			const data = await res.json();

			if (data.url) {
				window.location.href = data.url;
			} else {
				error = 'No se pudo obtener la URL de autenticación.';
			}
		} catch (err) {
			error = 'Error al conectar con Google.';
		}
	}
</script>

{#if loading}
	<p class="text-sm text-gray-600 dark:text-gray-300">Cargando...</p>
{:else if error}
	<p class="text-red-500 text-sm">Error: {error}</p>
{:else if connected}
	<div class="p-4 bg-green-100 text-green-800 rounded-lg dark:bg-green-900 dark:text-green-200">
		✅ Tu tienda está conectada a Google Ads.
	</div>
{:else}
	<div class="p-4 bg-yellow-100 text-yellow-800 rounded-lg dark:bg-yellow-900 dark:text-yellow-200">
		⚠️ Tu tienda aún no está conectada a Google Ads.
	</div>
	<button
		on:click={connectWithGoogle}
		class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
	>
		Conectar con Google
	</button>
{/if}
