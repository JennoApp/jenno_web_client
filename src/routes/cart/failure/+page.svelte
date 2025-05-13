<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';


  onMount(async () => {
		const url = $page.url;

		if (url.searchParams.get('fail') === '1') {
			// Quitar 'fail' de la URL
			const cleanParams = new URLSearchParams(url.searchParams);
			cleanParams.delete('fail');

			const cleanUrl = url.pathname + (cleanParams.toString() ? `?${cleanParams}` : '');

			// Redirige sin 'fail' y recarga datos
			await goto(cleanUrl, { replaceState: true });

			// Recargar datos del servidor (sin refrescar toda la página)
			await invalidateAll();
		}
	});
</script>

<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
	<!-- Ícono de error -->
	<iconify-icon
		icon="material-symbols:cancel-outline"
		height="5rem"
		width="5rem"
		class="text-red-500 mb-4"
	/>

	<h1 class="text-2xl font-semibold text-gray-200 mb-2">Pago fallido</h1>

	<p class="text-md text-gray-400 mb-6 text-center">
		Algo salió mal al procesar tu pago. Puedes intentar nuevamente o volver a la página principal.
	</p>

	<div class="flex gap-4">
		<button
			class="dark:bg-[#303030] w-44 h-10 rounded-lg hover:dark:bg-[#353535]"
			on:click={() => goto('/cart')}
		>
			Intentar de nuevo
		</button>

		<button
			class="dark:bg-[#404040] w-44 h-10 rounded-lg hover:dark:bg-[#454545]"
			on:click={() => goto('/')}
		>
			Página principal
		</button>
	</div>
</div>
