<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  let googleLoaded = false;

  // 1) Carga la librería de Google Identity
  onMount(() => {
    if (!browser) return;
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

  // 3) Cuando Google nos devuelve el id_token
  async function handleCredentialResponse(response: any) {
    const idToken = response.credential;
    try {
      const res = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      if (!res.ok) throw new Error('Login fallido');
      const { access_token } = await res.json();
      // Guarda tu JWT (ej: en localStorage o cookie)
      localStorage.setItem('jwt', access_token);
      // Redirige al usuario ya logueado
      goto('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error al ingresar con Google');
    }
  }
</script>

<style>
  .half-panel { width:100%; height:50%; }
  @media(min-width: 1024px) {
    .half-panel { width:50%; height:100%; }
  }
</style>

<div class="flex flex-col lg:flex-row w-full h-screen">
  <!-- Personal -->
  <div class="half-panel dark:bg-[#161616] flex flex-col justify-center items-center p-6">
    <button
      class="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#272727] h-20 w-10/12 rounded-md mb-4"
      on:click={() => goto('/register/personal')}
    >
      <span class="text-xl font-medium">Registro Personal</span>
    </button>

    <div id="google-btn" class="w-10/12 flex justify-center"></div>

    <div class="w-10/12 bg-gray-200 dark:bg-[#252525] mt-6 p-4 rounded-md">
      <ul class="list-disc pl-5">
        <li class="dark:text-white">Compra productos y servicios.</li>
        <li class="dark:text-white">Guarda y comparte tus productos favoritos.</li>
        <li class="dark:text-white">Interactúa con otros usuarios y descubre nuevas tendencias.</li>
      </ul>
    </div>
  </div>

  <!-- Empresa -->
  <div class="half-panel dark:bg-[#161616] flex flex-col justify-center items-center p-6">
    <button
      class="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#272727] h-20 w-10/12 rounded-md mb-4"
      on:click={() => goto('/register/business')}
    >
      <span class="text-xl font-medium">Registro Empresa</span>
    </button>

    <div class="w-10/12 bg-gray-200 dark:bg-[#252525] mt-2 p-4 rounded-md overflow-y-auto">
      <ul class="list-disc pl-5">
        <li class="dark:text-white">Administra tu tienda y productos fácilmente.</li>
        <li class="dark:text-white">Inicia y gestiona tus ventas en línea.</li>
        <li class="dark:text-white">Promociona tus productos y llega a más clientes.</li>
      </ul>
      <div class="flex gap-3 border border-gray-400 dark:border-[#161616] mt-4 p-3 rounded-md">
        <iconify-icon icon="ic:round-warning" class="text-yellow-500" />
        <p class="dark:text-white text-sm">
          Se requiere información legal de la empresa para la creación de la cuenta.
        </p>
      </div>
    </div>
  </div>
</div>

