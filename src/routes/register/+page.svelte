<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { toast } from 'svelte-sonner';

  let googleLoaded = false;
  let serverUrl = '';

  // 1) Carga la librería de Google Identity
  onMount(async () => {
    if (!browser) return;

    // 1.a) Busca la URL de tu backend
    await getServerUrl();

    // 1.b) Inserta el script de Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleLoaded = true;
      /* 2) Inicializa el botón de Google */
      // @ts-ignore
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      // @ts-ignore
      window.google?.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large' }
      );
    };
    document.head.appendChild(script);
  });

  // Helper para obtener la URL del servidor desde tu endpoint /api/server
  async function getServerUrl() {
    try {
      const res = await fetch('/api/server');
      if (!res.ok) throw new Error('No se pudo obtener server_url');
      const data = await res.json();
      serverUrl = data.server_url;
    } catch (err) {
      console.error('Error al obtener la URL del servidor:', err);
      toast.error('No se pudo conectar con el servidor');
    }
  }

  // 3) Cuando Google nos devuelve el id_token
  async function handleCredentialResponse(response: any) {
    const idToken = response.credential;
    try {
      const res = await fetch(`/api/auth/google/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login fallido');
      }

      goto('/', { replaceState: true }).then(() => {
        location.reload();
      });
    } catch (err: any) {
      console.error('Error de login Google:', err);
      toast.error(err.message || 'Error al ingresar con Google');
    }
  }
</script>

<div class="relative flex flex-col lg:flex-row w-full h-screen">
	<!-- Separador vertical en desktop -->
	<div class="hidden lg:block divider-vertical"></div>

	<!-- Personal -->
	<div class="half-panel dark:bg-[#161616] flex flex-col justify-center items-center p-6">
		<!-- Título -->
		<h2 class="text-2xl font-semibold mb-6 dark:text-gray-200">Registro Personal</h2>

		<!-- Botón clásico -->
		<button
			class="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#272727]
             h-16 w-10/12 rounded-md mb-4 text-lg font-medium transition"
			on:click={() => goto('/register/personal')}
		>
			Registro con Email
		</button>

		<!-- Separador “o” -->
		<div class="flex items-center w-10/12 my-4">
			<div class="flex-grow h-px bg-gray-400"></div>
			<span class="px-3 text-gray-500 dark:text-gray-400">o</span>
			<div class="flex-grow h-px bg-gray-400"></div>
		</div>

		<!-- Botón Google -->
		<div id="google-btn" class="w-10/12 flex justify-center mb-6"></div>
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center">
			Regístrate con tu cuenta de Google en un solo clic
		</p>

		<!-- Beneficios -->
		<div class="w-10/12 bg-gray-200 dark:bg-[#252525] p-4 rounded-md">
			<ul class="list-disc pl-5 space-y-2">
				<li class="dark:text-white">Compra productos y servicios.</li>
				<li class="dark:text-white">Guarda y comparte tus favoritos.</li>
				<li class="dark:text-white">Descubre nuevas tendencias.</li>
			</ul>
		</div>
	</div>

	<!-- Empresa -->
	<div class="half-panel dark:bg-[#161616] flex flex-col justify-center items-center p-6">
		<h2 class="text-2xl font-semibold mb-6 dark:text-gray-200">Registro Empresa</h2>

		<button
			class="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#272727]
             h-16 w-10/12 rounded-md mb-4 text-lg font-medium transition"
			on:click={() => goto('/register/business')}
		>
			Registro con Email
		</button>

		<div class="w-10/12 bg-gray-200 dark:bg-[#252525] p-4 rounded-md overflow-y-auto">
			<ul class="list-disc pl-5 space-y-2">
				<li class="dark:text-white">Administra tu tienda fácilmente.</li>
				<li class="dark:text-white">Gestiona tus ventas en línea.</li>
				<li class="dark:text-white">Llega a más clientes.</li>
			</ul>
			<div class="flex gap-3 border border-gray-400 dark:border-[#161616] mt-4 p-3 rounded-md">
				<iconify-icon icon="ic:round-warning" class="text-yellow-500" />
				<p class="dark:text-white text-sm">
					Se requiere información legal de la empresa para completar el registro.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.half-panel {
		width: 100%;
		height: 50%;
	}
	@media (min-width: 1024px) {
		.half-panel {
			width: 50%;
			height: 100%;
		}
		.divider-vertical {
			position: absolute;
			left: 50%;
			top: 10%;
			bottom: 10%;
			width: 1px;
			background: var(--border);
		}
	}
</style>
