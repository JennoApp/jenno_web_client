<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import * as m from '$paraglide/messages';
	import { onMount } from 'svelte';

	let googleLoaded = false;
	let serverUrl = '';

	// 1) Obtiene la URL de tu backend (igual que en el registro)
	async function getServerUrl() {
		try {
			const res = await fetch('/api/server');
			const json = await res.json();
			serverUrl = json.server_url;
		} catch (err) {
			console.error('No pude obtener server_url', err);
		}
	}

	// 2) Monta el botón de Google
	import.meta.env;
	async function setupGoogleButton() {
		if (!browser) return;

		await getServerUrl();
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			googleLoaded = true;
			// @ts-ignore
			window.google?.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleCredentialResponse
			});
			// @ts-ignore
			window.google?.accounts.id.renderButton(document.getElementById('google-btn'), {
				theme: 'outline',
				size: 'large'
			});
		};
		document.head.appendChild(script);
	}

	onMount(setupGoogleButton);

	// 3) Cuando Google devuelve el id_token
	async function handleCredentialResponse(response: any) {
		try {
			const res = await fetch('/api/auth/google/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken: response.credential })
			});
			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.message || 'Login fallido');
			}
			toast.success('Login exitoso! Redirigiendo...');
			goto('/', { replaceState: true }).then(() => location.reload());
		} catch (err: any) {
			console.error('Error al ingresar con Google:', err);
			toast.error(err.message || 'Error al ingresar con Google');
		}
	}

	export let form;
	$: if (form?.redirect) {
		toast.success('Login exitoso! Redirigiendo...');
		goto('/', { replaceState: true }).then(() => location.reload());
	}
	$: if (form?.success === false && form?.errorMessage) {
		toast.error('Credenciales incorrectas: ' + form.errorMessage);
	}

	function togglePasswordVisibility() {
		const pw = document.getElementById('password') as HTMLInputElement;
		const eye = document.getElementById('eyeIcon');
		if (!pw) return;
		pw.type = pw.type === 'password' ? 'text' : 'password';
		if (eye) eye.textContent = pw.type === 'password' ? '👁️' : '🙈';
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Inicia sesión en Jenno" />
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen w-full px-4">
	<h1 class="text-3xl font-semibold dark:text-gray-200 mb-8">{m.login_title()}</h1>

	<!-- Formulario  Email -->
	<form method="POST" action="?/login" class="w-full max-w-md space-y-4" use:enhance>
		<div>
			<label for="email" class="block mb-1 text-base dark:text-gray-200"
				>{m.login_email_label()}</label
			>
			<input
				type="email"
				name="email"
				required
				class="w-full h-10 px-3 bg-gray-200 rounded-md text-black"
			/>
		</div>

		<div>
			<label for="password" class="block mb-1 text-base dark:text-gray-200"
				>{m.login_password_label()}</label
			>
			<div class="relative">
				<input
					id="password"
					name="password"
					type="password"
					required
					class="w-full h-10 px-3 bg-gray-200 rounded-md pr-10 text-black"
				/>
				<button
					type="button"
					class="absolute inset-y-0 right-2 flex items-center"
					on:click={togglePasswordVisibility}
				>
					<span id="eyeIcon">👁️</span>
				</button>
			</div>
			<div class="text-right mt-1">
				<a href="/forgotpassword" class="text-sm text-gray-400 hover:underline">
					{m.login_password_forget()}
				</a>
			</div>
		</div>

		<button
			type="submit"
			class="w-full h-10 bg-gray-200 dark:bg-[#202020] dark:text-gray-200 rounded-md hover:bg-gray-300 hover:dark:bg-[#303030]"
		>
			{m.login_button_title()}
		</button>
	</form>

	<!-- Separador “o” -->
	<div class="flex items-center w-1/2 my-4">
		<div class="flex-grow h-px bg-gray-400"></div>
		<span class="px-3 text-gray-500 dark:text-gray-400">O inicia sesión con Google</span>
		<div class="flex-grow h-px bg-gray-400"></div>
	</div>


  <!-- Botón Google -->
		<div id="google-btn" class="w-10/12 flex justify-center mb-6"></div>
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center">
      * Si te registraste con Google, ingresa de nuevo con Google (sin contraseña).
		</p>

	<p class="mt-4 text-sm dark:text-gray-200">
		¿No tienes cuenta?&nbsp;
		<a href="/register" class="text-blue-600 hover:underline">
			{m.login_goto_register()}
		</a>
	</p>

	<p class="mt-6 text-xs dark:text-gray-400">
		<a href="/terms" class="hover:underline hover:text-primary">
			{m.login_termsandservice()}
		</a>
	</p>
</div>
