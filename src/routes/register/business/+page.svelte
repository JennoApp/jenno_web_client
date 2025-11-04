<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select';
	import { countryList } from '$lib/utils/countries';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';

	export let form: ActionData;

	let selectedCountry: any = 'Colombia';

	$: console.log($location_data?.data[0]?.country_module?.currencies[0]?.code);

	$: console.log(form?.success);

	$: if (form?.success) {
		toast.success('Usuario creado!');
		goto('/', { replaceState: true }).then(() => {
            location.reload()
        })
	}

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

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">
		{m.register_business_title()}
	</h1>

	<!-- Form -->
	<form method="POST" action="?/business" class="flex-col gap-2 min-w-xs w-96 mx-auto" use:enhance>
		<!-- Businessname Input -->
		<div class="flex flex-col">
			<label for="businessname" class="text-base dark:text-gray-200 font-medium"
				>{m.register_business_username_label()}</label
			>
			<input
				type="text"
				name="businessname"
				class="h-8 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.businessname
					? 'border border-red-500'
					: ''}"
				value={form?.data?.businessname ?? ''}
			/>
			<label for="businessname">
				{#if form?.errors?.businessname}
					<span class="dark:text-red-500 font-medium">{form?.errors?.businessname[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Email Input -->
		<div class="flex flex-col mt-2">
			<label for="email" class="text-base dark:text-gray-200 font-medium"
				>{m.register_business_email_label()}</label
			>
			<input
				type="email"
				name="email"
				class="h-8 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.email
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
		<div class="flex flex-col mt-2">
			<label for="country" class="text-base dark:text-gray-200 font-medium"
				>{m.register_business_country_label()}</label
			>
			<!-- <Select.Root
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
			</Select.Root> -->
			<input hidden name="country" value={
        // selectedCountry
        "Colombia"
      } />

      <h3>* Solo Accesible para Colombia</h3>

			<label for="country">
				{#if form?.errors?.country}
					<span class="dark:text-red-500 font-medium">{form?.errors?.country[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Legal information -->
		<h2 class="font-semibold text-lg mt-2">{m.register_business_legal_title()}</h2>
		<div class=" my-1">
			<div class="flex">
				<!-- Name Input -->
				<div class="flex flex-col w-1/2">
					<label for="name" class="text-base dark:text-gray-200 font-medium"
						>{m.register_business_legal_name_label()}</label
					>
					<input
						type="text"
						name="name"
						class="h-8 bg-gray-200 rounded-md text-black font-semibold mr-2 px-2 {form?.errors?.email
							? 'border border-red-500'
							: ''} "
						value={form?.data?.name ?? ''}
					/>
					<label for="name">
						{#if form?.errors?.name}
							<span class="dark:text-red-500 font-medium">{form?.errors?.name[0]}</span>
						{/if}
					</label>
				</div>

				<!-- Lastname Input -->
				<div class="flex flex-col w-1/2">
					<label for="lastname" class="text-base dark:text-gray-200 font-medium"
						>{m.register_business_legal_lastname_label()}</label
					>
					<input
						type="text"
						name="lastname"
						class="h-8 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.email
							? 'border border-red-500'
							: ''} "
						value={form?.data?.lastname ?? ''}
					/>
					<label for="username">
						{#if form?.errors?.lastname}
							<span class="dark:text-red-500 font-medium">{form?.errors?.lastname[0]}</span>
						{/if}
					</label>
				</div>
			</div>

			<!---------------------------------------------->
			<!-- Tax Id Input -->
			<div class="flex mt-2">
				<div class="flex flex-col w-full">
					<label for="taxid" class="text-base dark:text-gray-200 font-medium"
						>{m.register_business_legal_taxid_label()}</label
					>
					<input
						type="string"
						name="taxid"
						class="h-8 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.taxid
							? 'border border-red-500'
							: ''} "
						value={form?.data?.taxid ?? ''}
					/>
					<label for="username">
						{#if form?.errors?.taxid}
							<span class="dark:text-red-500 font-medium">{form?.errors?.taxid[0]}</span>
						{/if}
					</label>
				</div>
			</div>
		</div>

		<!-- Password Input -->
		<div class="flex flex-col mt-2">
			<label for="password" class="text-base dark:text-gray-200 font-medium"
				>{m.register_business_password_label()}</label
			>
			<div class="relative">
				<!-- Input de contraseña -->
				<input
					type="password"
					id="password"
					name="password"
					class="h-8 w-full bg-gray-200 text-black font-medium px-2 text-lg rounded-md pr-10 {form
						?.errors?.password
						? 'border border-red-500'
						: ''}"
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
			<label for="password">
				{#if form?.errors?.password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- verified Password Input -->
		<div class="flex flex-col mt-2">
			<label for="verified_password" class="text-base dark:text-gray-200 font-medium"
				>{m.register_business_password_confirm()}</label
			>
			<div class="relative">
				<!-- Input de contraseña -->
				<input
					type="password"
					id="confirm-password"
					name="verified_password"
					class="h-8 w-full bg-gray-200 text-black font-medium px-2 text-lg rounded-md pr-10 {form
						?.errors?.password
						? 'border border-red-500'
						: ''}"
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
			<label for="verified_password">
				{#if form?.errors?.verified_password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.verified_password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- currency Input hidden -->
		<input
			type="text"
			name="currency"
			class="hidden"
			value={$location_data?.data[0]?.country_module?.currencies[0]?.code}
		/>
		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4  bg-gray-200  dark:bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			>{m.register_business_button_title()}</button
		>
	</form>

	<!-- Terms & Services Info -->
	<p class="px-8 mt-6 text-center text-sm dark:text-gray-200 text-muted-foreground">
		<a href="/terms" class="hover:text-primary">
			{m.register_business_termsandservice()}
		</a>
	</p>
</div>
