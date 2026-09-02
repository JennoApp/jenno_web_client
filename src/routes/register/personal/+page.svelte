<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select';
	import { countryList } from '$lib/utils/countries';
	import * as m from '$paraglide/messages';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { form }: { form: ActionData } = $props();

	let selectedCountry: any = 'Colombia';

	let googleLoaded = $state(false);
	let serverUrl = $state('');

	// FORM SUCCESS
	$effect(() => {
		if (form?.success) {
			toast.success('Usuario creado!');
			goto('/', { replaceState: true }).then(() => {
				location.reload();
			});
		}
	});

	// GOOGLE IDENTITY
	onMount(async () => {
		if (!browser) return;

		// Verificar si el Script ya existe
		let script = document.querySelector(
			'script[src="https://accounts.google.com/gsi/client"]'
		) as HTMLScriptElement | null;

		// Si no existe, crearlo
		if (!script) {
			script = document.createElement('script');

			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			script.defer = true;

			document.head.appendChild(script);

			// Esperar a que cargue
			await new Promise<void>((resolve, reject) => {
				if (!script) {
					reject(new Error('No se pudo crear el script de Google'));
					return;
				}

				script.onload = () => resolve();
				script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
			});
		} else {
			// Si ya existe, esperar a que Google esté disponible
			if (!window.google) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error('Google Identity Service no respondio'));
					}, 10000);

					script!.addEventListener(
						'load',
						() => {
							clearTimeout(timeout);
							resolve();
						},
						{ once: true }
					);
				});
			}
		}

		try {
			// @ts-ignore
			window.google?.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleCredentialResponse
			});

			const googleButton = document.getElementById('google-btn');

			if (!googleButton) {
				console.error('No se encontró #google-btn');
				return;
			}
			// @ts-ignore
			window.google?.accounts.id.renderButton(googleButton, {
				theme: 'outline',
				size: 'large',
				width: 400,
				text: 'signup_with'
			});

			googleLoaded = true;
		} catch (error) {
			console.error('Error inicializando Google Identity:', error);
			toast.error('No se pudo inicializar el registro con Google');
		}
	});

	// GOOGLE CREDENTIAL RESPONSE
	async function handleCredentialResponse(response: any) {
		const idToken = response?.credential;
		if (!idToken) {
			toast.error('Google no devolvió las credenciales necesarias');
			return;
		}
		try {
			const res = await fetch('/api/auth/google/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.message || 'No se pudo completar el registro con Google');
			}
			toast.success('¡Cuenta creada correctamente!');
			await goto('/', { replaceState: true });
			location.reload();
		} catch (error) {
			console.error('Error de registro con Google:', error);
			const message = error instanceof Error ? error.message : 'Error al registrarse con Google';
			toast.error(message);
		}
	}

	// PASSWORD VISIBILITY
	function togglePasswordVisibility() {
		const passwordInput = document.getElementById('password') as HTMLInputElement;
		const eyeIcon = document.getElementById('eyeIcon');

		if (passwordInput?.type === 'password') {
			passwordInput.type = 'text';
			if (eyeIcon !== null) {
				eyeIcon.textContent = '🙈'; // Cambia el icono a un "ojo cerrado" cuando la contraseña está visible
			}
		} else {
			passwordInput.type = 'password';
			if (eyeIcon !== null) {
				eyeIcon.textContent = '👁️'; // Cambia el icono a un "ojo abierto" cuando la contraseña está oculta
			}
		}
	}

	function toggleConfirmPasswordVisibility() {
		const passwordInput = document.getElementById('confirm-password') as HTMLInputElement;
		const eyeIcon = document.getElementById('confirm-eyeIcon');

		if (passwordInput?.type === 'password') {
			passwordInput.type = 'text';
			if (eyeIcon !== null) {
				eyeIcon.textContent = '🙈'; // Cambia el icono a un "ojo cerrado" cuando la contraseña está visible
			}
		} else {
			passwordInput.type = 'password';
			if (eyeIcon !== null) {
				eyeIcon.textContent = '👁️'; // Cambia el icono a un "ojo abierto" cuando la contraseña está oculta
			}
		}
	}
</script>

<svelte:head>
	<title>Crear cuenta</title>
	<meta
		name="description"
		content="Crea tu cuenta personal para comprar productos y descubrir nuevas tiendas."
	/>
</svelte:head>

<div class="min-h-screen w-full flex items-center justify-center px-4 py-10">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight">
				{m.register_personal_title()}
			</h1>

			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				Crea tu cuenta para comprar y descubrir productos.
			</p>
		</div>

		<!-- Card -->
		<div
			class="w-full rounded-2xl
			       border border-gray-200 dark:border-[#303030]
			       bg-white dark:bg-[#161616]
			       p-6 sm:p-8 shadow-sm"
		>
			<!-- Registro con Google -->
			<div class="flex flex-col items-center">
				<div id="google-btn" class="w-full flex justify-center"></div>

				<p class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
					Regístrate con tu cuenta de Google en un solo clic
				</p>
			</div>

			<!-- Separador -->
			<div class="flex items-center w-full my-6">
				<div class="flex-1 h-px bg-gray-300 dark:bg-[#303030]"></div>

				<span class="px-4 text-xs text-gray-500 dark:text-gray-400"> o continúa con email </span>

				<div class="flex-1 h-px bg-gray-300 dark:bg-[#303030]"></div>
			</div>

			<!-- Form -->
			<form method="POST" action="?/personal" use:enhance class="flex flex-col gap-4 w-full">
				<!-- Username -->
				<div class="flex flex-col gap-1.5">
					<label for="username" class="text-sm dark:text-gray-200 font-medium">
						{m.register_personal_username_label()}
					</label>

					<input
						id="username"
						type="text"
						name="username"
						value={form?.data?.username ?? ''}
						autocomplete="username"
						class="h-10 w-full
						       bg-gray-200 dark:bg-[#202020]
						       rounded-lg
						       text-black dark:text-gray-200
						       font-medium px-3
						       outline-none
						       border border-transparent
						       focus:border-gray-400
						       dark:focus:border-gray-500
						       {form?.errors?.username ? 'border-red-500' : ''}"
					/>

					{#if form?.errors?.username}
						<span class="text-xs text-red-500 font-medium">
							{form.errors.username[0]}
						</span>
					{/if}
				</div>

				<!-- Email -->
				<div class="flex flex-col gap-1.5">
					<label for="email" class="text-sm dark:text-gray-200 font-medium">
						{m.register_personal_email_label()}
					</label>

					<input
						id="email"
						type="email"
						name="email"
						value={form?.data?.email ?? ''}
						autocomplete="email"
						class="h-10 w-full
						       bg-gray-200 dark:bg-[#202020]
						       rounded-lg
						       text-black dark:text-gray-200
						       font-medium px-3
						       outline-none
						       border border-transparent
						       focus:border-gray-400
						       dark:focus:border-gray-500
						       {form?.errors?.email ? 'border-red-500' : ''}"
					/>

					{#if form?.errors?.email}
						<span class="text-xs text-red-500 font-medium">
							{form.errors.email[0]}
						</span>
					{/if}
				</div>

				<!-- Country -->
				<div class="flex flex-col gap-1.5">
					<label for="country" class="text-sm dark:text-gray-200 font-medium">
						{m.register_personal_country_label()}
					</label>

					<div
						class="h-10 w-full
						       bg-gray-200 dark:bg-[#202020]
						       rounded-lg
						       flex items-center
						       px-3
						       text-sm
						       text-black dark:text-gray-200"
					>
						🇨🇴 Colombia
					</div>

					<input type="hidden" id="country" name="country" value="Colombia" />

					<span class="text-xs text-gray-500 dark:text-gray-400">
						Actualmente disponible únicamente para Colombia.
					</span>

					{#if form?.errors?.country}
						<span class="text-xs text-red-500 font-medium">
							{form.errors.country[0]}
						</span>
					{/if}
				</div>

				<!-- Password -->
				<div class="flex flex-col gap-1.5">
					<label for="password" class="text-sm dark:text-gray-200 font-medium">
						{m.register_personal_password_label()}
					</label>

					<div class="relative">
						<input
							id="password"
							type="password"
							name="password"
							class="h-10 w-full
							       bg-gray-200 dark:bg-[#202020]
							       rounded-lg
							       text-black dark:text-gray-200
							       font-medium
							       px-3 pr-11
							       outline-none
							       border border-transparent
							       focus:border-gray-400
							       dark:focus:border-gray-500
							       {form?.errors?.password ? 'border-red-500' : ''}"
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

					{#if form?.errors?.password}
						<span class="text-xs text-red-500 font-medium">
							{form.errors.password[0]}
						</span>
					{/if}
				</div>

				<!-- Confirm Password -->
				<div class="flex flex-col gap-1.5">
					<label for="confirm-password" class="text-sm dark:text-gray-200 font-medium">
						{m.register_personal_password_confirm()}
					</label>

					<div class="relative">
						<input
							id="confirm-password"
							type="password"
							name="verified_password"
							class="h-10 w-full
							       bg-gray-200 dark:bg-[#202020]
							       rounded-lg
							       text-black dark:text-gray-200
							       font-medium
							       px-3 pr-11
							       outline-none
							       border border-transparent
							       focus:border-gray-400
							       dark:focus:border-gray-500
							       {form?.errors?.verified_password ? 'border-red-500' : ''}"
						/>

						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={toggleConfirmPasswordVisibility}
							aria-label="Mostrar u ocultar contraseña"
						>
							<span id="confirm-eyeIcon">👁️</span>
						</button>
					</div>

					{#if form?.errors?.verified_password}
						<span class="text-xs text-red-500 font-medium">
							{form.errors.verified_password[0]}
						</span>
					{/if}
				</div>

				<!-- Botón de registro -->
				<button
					type="submit"
					class="h-11 w-full rounded-xl
                    bg-gray-900 dark:bg-white
                    text-white dark:text-black
                    font-semibold
                    shadow-sm
                    hover:bg-gray-700 dark:hover:bg-gray-200
                    hover:shadow-md
                    transition-all duration-200
                    active:scale-[0.99]"
				>
					{m.register_personal_button_title()}
				</button>
			</form>

			<!-- Terms -->
			<p
				class="mt-6 px-2 text-center
				       text-xs leading-relaxed
				       text-gray-500 dark:text-gray-400"
			>
				{m.register_personal_termsandservice()}

				<a href="/terms" class="font-medium hover:underline hover:text-primary">
					Términos y condiciones
				</a>
			</p>
		</div>

		<!-- Login -->
		<p class="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
			¿Ya tienes una cuenta?

			<a href="/login" class="font-semibold dark:text-gray-200 hover:underline"> Inicia sesión </a>
		</p>
	</div>
</div>
