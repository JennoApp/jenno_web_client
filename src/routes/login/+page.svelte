<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as m from '$paraglide/messages';

	export let form;
	$: if (form?.success) {
		console.log('login succesful');
		goto('/');
	}

	$: if (form?.success === false) {
		toast.error('Credenciales Incorrectas o Usuario no registrado');
	}

  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement
    const eyeIcon = document.getElementById('eyeIcon')

    if (passwordInput?.type === 'password') {
      passwordInput.type = 'text'
      if (eyeIcon !== null) {
        eyeIcon.textContent = '🙈' // Cambia el icono a un "ojo cerrado" cuando la contraseña está visible
      }
      
    } else {
      passwordInput.type = 'password'
      if (eyeIcon !== null) {
        eyeIcon.textContent = '👁️' // Cambia el icono a un "ojo abierto" cuando la contraseña está oculta       
      }      
    }
  }
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">{m.login_title()}</h1>

	<!-- Form -->
	<form method="POST" action="?/login" class="flex-col gap-2 min-w-xs w-96 mx-auto" use:enhance>
		<!-- Email Input -->
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium"
				>{m.login_email_label()}</label
			>
			<input
				type="email"
				name="email"
				class="h-8 border rounded-md text-black font-semibold px-2"
			/>
		</div>

		<!-- Password Input -->
		<div class="flex flex-col">
			<label for="password" class="text-base dark:text-gray-200 font-medium"
				>{m.login_password_label()}</label
			>
			<div class="relative">
				<!-- Input de contraseña -->
				<input
					type="password"
					id="password"
					name="password"
					class="h-8 w-full border text-black font-medium px-2 text-lg rounded-md pr-10"
				/>

				<!-- Icono de ojo -->
				<button
					type="button"
					class="absolute right-2 top-1/2 transform -translate-y-1/2"
					on:click={() => togglePasswordVisibility()}
				>
					<span id="eyeIcon">👁️</span>
				</button>
			</div>

			<!-- Forgot Password Link -->
			<div class="flex justify-end mt-1">
				<a href="/forgotpassword" class="text-sm text-gray-400 hover:underline"
					>{m.login_password_forget()}</a
				>
			</div>
		</div>

		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
			>{m.login_button_title()}</button
		>
	</form>

	<Separator class="w-96 mt-5" />

	<!-- Sign Up Link -->
	<p class="px-8 mt-3 text-center text-sm dark:text-gray-200 text-muted-foreground">
		<a href="/register" class="text-gray-400 hover:underline">{m.login_goto_register()}</a>
	</p>

	<!-- Terms & Services Info -->
	<p class="px-8 mt-6 text-center text-sm dark:text-gray-200 text-muted-foreground">
		<a href="/terms" class="hover:underline hover:text-primary">
			{m.login_termsandservice()}
		</a>
	</p>
</div>
