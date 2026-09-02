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

<div class="min-h-screen w-full flex items-center justify-center px-4 py-10">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight">
				{m.login_title()}
			</h1>

			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				Inicia sesión para continuar comprando y descubrir productos.
			</p>
		</div>

		<!-- Card -->
		<div
			class="w-full rounded-2xl
			       border border-gray-200 dark:border-[#303030]
			       bg-white dark:bg-[#161616]
			       p-6 sm:p-8 shadow-sm"
		>
			<!-- Google -->
			<div class="flex flex-col items-center">
				<div id="google-btn" class="w-full flex justify-center"></div>

				<p class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
					Inicia sesión con tu cuenta de Google
				</p>
			</div>

			<!-- Separador -->
			<div class="flex items-center w-full my-6">
				<div class="flex-1 h-px bg-gray-300 dark:bg-[#303030]"></div>

				<span class="px-4 text-xs text-gray-500 dark:text-gray-400"> o continúa con email </span>

				<div class="flex-1 h-px bg-gray-300 dark:bg-[#303030]"></div>
			</div>

			<!-- Formulario -->
			<form method="POST" action="?/login" class="flex flex-col gap-4 w-full" use:enhance>
				<!-- Email -->
				<div class="flex flex-col gap-1.5">
					<label for="email" class="text-sm dark:text-gray-200 font-medium">
						{m.login_email_label()}
					</label>

					<input
						id="email"
						type="email"
						name="email"
						required
						autocomplete="email"
						class="h-10 w-full
						       bg-gray-200 dark:bg-[#202020]
						       rounded-lg
						       text-black dark:text-gray-200
						       font-medium px-3
						       outline-none
						       border border-transparent
						       focus:border-gray-400
						       dark:focus:border-gray-500"
					/>
				</div>

				<!-- Password -->
				<div class="flex flex-col gap-1.5">
					<label for="password" class="text-sm dark:text-gray-200 font-medium">
						{m.login_password_label()}
					</label>

					<div class="relative">
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="current-password"
							class="w-full h-10
							       bg-gray-200 dark:bg-[#202020]
							       rounded-lg
							       text-black dark:text-gray-200
							       font-medium
							       px-3 pr-11
							       outline-none
							       border border-transparent
							       focus:border-gray-400
							       dark:focus:border-gray-500"
						/>

						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={togglePasswordVisibility}
							aria-label="Mostrar u ocultar contraseña"
						>
							<span id="eyeIcon">👁️</span>
						</button>
					</div>

					<!-- Forgot password -->
					<div class="text-right mt-1">
						<a
							href="/forgotpassword"
							class="text-xs text-gray-500 dark:text-gray-400
							       hover:text-gray-800 dark:hover:text-gray-200
							       hover:underline"
						>
							{m.login_password_forget()}
						</a>
					</div>
				</div>

				<!-- Login -->
				<button
					type="submit"
					class="h-11 w-full rounded-xl
                    border border-gray-300 dark:border-[#3a3a3a]
                    bg-transparent
                    text-gray-800 dark:text-gray-200
                    font-semibold
                    hover:bg-gray-100 dark:hover:bg-[#202020]
                    transition-all duration-200
                    active:scale-[0.99]"
				>
					{m.login_button_title()}
				</button>
			</form>

			<!-- Google note -->
			<p class="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
				Si te registraste con Google, inicia sesión nuevamente con Google.
			</p>

			<!-- Register -->
			<div class="mt-6 pt-6 border-t border-gray-200 dark:border-[#303030]">
				<p class="text-center text-sm text-gray-500 dark:text-gray-400">
					¿No tienes cuenta?

					<a href="/register" class="font-semibold dark:text-gray-200 hover:underline ml-1">
						{m.login_goto_register()}
					</a>
				</p>
			</div>

			<!-- Terms -->
			<p
				class="mt-5 text-center text-xs leading-relaxed
				       text-gray-500 dark:text-gray-400"
			>
				{m.login_termsandservice()}

				<a href="/terms" class="font-medium hover:underline hover:text-primary ml-1">
					Términos y condiciones
				</a>
			</p>
		</div>
	</div>
</div>
