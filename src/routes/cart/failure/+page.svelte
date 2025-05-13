<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

  onMount(async () => {
		const url = $page.url;

		if (url.searchParams.get('fail') === '1') {
			// 1. Crear nuevos parámetros sin el 'fail'
			const cleanParams = new URLSearchParams(url.searchParams);
			cleanParams.delete('fail');

			// 2. Construir la nueva URL limpia
			const cleanUrl = url.pathname + (cleanParams.toString() ? `?${cleanParams}` : '');

			// 3. Redirigir sin el parámetro 'fail'
			await goto(cleanUrl, { replaceState: true });

			// 4. Invalidar datos (opcional si estás usando `load`)
			await invalidateAll();

			// 5. Recargar si necesitas una recarga completa
			requestAnimationFrame(() => {
				location.reload();
			});
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
