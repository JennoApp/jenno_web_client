<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
  import * as Select from '$lib/components/ui/select';
	import { countryList } from '$lib/utils/countries'
  import * as m from '$paraglide/messages';

	export let form: ActionData;
  let selectedCountry: any = ''

	$: if (form?.success) {
		toast.success('Usuario creado!');
		goto('/', { replaceState: true }).then(() => {
      location.reload()
    })
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

  function toggleConfirmPasswordVisibility() {
    const passwordInput = document.getElementById('confirm-password') as HTMLInputElement
    const eyeIcon = document.getElementById('confirm-eyeIcon')

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
	<title>Register-Personal</title>
	<meta name="description" content="register personal account" />
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">
		{m.register_personal_title()}
	</h1>

	<!-- Form -->
	<form method="POST" action="?/personal" class="flex-col gap-2 min-w-xs w-96 mx-auto" use:enhance>
		<!-- Username Input -->
		<div class="flex flex-col">
			<label for="username" class="text-base dark:text-gray-200 font-medium">{m.register_personal_username_label()}</label>
			<input
				type="text"
				name="username"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.username
					? 'border border-red-500'
					: ''}"
				value={form?.data?.username ?? ''}
			/>
			<label for="username">
				{#if form?.errors?.username}
					<span class="dark:text-red-500 font-medium">{form?.errors?.username[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Email Input -->
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium">{m.register_personal_email_label()}</label>
			<input
				type="email"
				name="email"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.email
					? 'border border-red-500'
					: ''} "
				value={form?.data?.email ?? ''}
			/>
			<label for="username">
				{#if form?.errors?.email}
					<span class="dark:text-red-500 font-medium">{form?.errors?.email[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Country Input -->
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium">{m.register_personal_country_label()}</label>
			<Select.Root
				onSelectedChange={(v) => {
					selectedCountry = v?.value;
				}}
			>
				<Select.Trigger>
					<Select.Value placeholder="Escoge un Pais" />
				</Select.Trigger>
				<Select.Content class="overflow-y-auto max-h-[20rem]">
					{#each countryList as country}
						<Select.Item value={`${country}`}>{country}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden name="country" bind:value={selectedCountry} />

			<label for="country">
				{#if form?.errors?.country}
					<span class="dark:text-red-500 font-medium">{form?.errors?.country[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Password Input -->
		<div class="flex flex-col">
			<label for="password" class="text-base dark:text-gray-200 font-medium">{m.register_personal_password_label()}</label>
      <div class="relative">
				<!-- Input de contraseña -->
				<input
					type="password"
					id="password"
					name="password"
					class="h-8 w-full border text-black font-medium px-2 text-lg rounded-md pr-10 {form?.errors?.password ? 'border border-red-500': ''}"
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

			<label for="username">
				{#if form?.errors?.password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- verified Password Input -->
		<div class="flex flex-col">
			<label for="verified_password" class="text-base dark:text-gray-200 font-medium"
				>{m.register_personal_password_confirm()}</label
			>
      <div class="relative">
				<!-- Input de contraseña -->
				<input
					type="password"
					id="confirm-password"
					name="verified_password"
					class="h-8 w-full border text-black font-medium px-2 text-lg rounded-md pr-10 {form?.errors?.password ? 'border border-red-500': ''}"
				/>

				<!-- Icono de ojo -->
				<button
					type="button"
					class="absolute right-2 top-1/2 transform -translate-y-1/2"
					on:click={() => toggleConfirmPasswordVisibility()}
				>
					<span id="confirm-eyeIcon">👁️</span>
				</button>
			</div>
			<label for="username">
				{#if form?.errors?.verified_password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.verified_password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4 border bg-gray-200 dark:border-[#222222] dark:bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			>{m.register_personal_button_title()}</button
		>
	</form>

	<!-- Terms & Services Info -->
	<p class="px-8 mt-6 text-center text-sm dark:text-gray-200 text-muted-foreground">
		<a href="/terms" class="hover:underline hover:text-primary">
			{m.register_personal_termsandservice()}
		</a>
	</p>
</div>
