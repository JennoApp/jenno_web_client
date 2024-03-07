<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';

	export let form: ActionData;

	$: console.log(form?.success)

	$: if (form?.success) {
		toast.success("Usuario creado!")
	}
</script>

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">
		Crear Usuario Empresa
	</h1>

	<!-- Form -->
	<form method="POST" action="?/business" class="flex-col gap-2 min-w-xs w-96 mx-auto" use:enhance>
		<!-- Businessname Input -->
		<div class="flex flex-col">
			<label for="businessname" class="text-base dark:text-gray-200 font-medium">Businnes name</label>
			<input
				type="text"
				name="businessname"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.businessname
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
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium">Email</label>
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

		<!-- Legal information -->
		<h2 class="font-semibold text-lg mt-1">Legal Information</h2>
		<div class="border border-white my-1 p-2 rounded-md">
			<div class="flex">
				<!-- Name Input -->
				<div class="flex flex-col w-1/2">
					<label for="name" class="text-base dark:text-gray-200 font-medium">Name</label>
					<input
						type="text"
						name="name"
						class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.email
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
					<label for="lastname" class="text-base dark:text-gray-200 font-medium">Lastname</label>
					<input
						type="text"
						name="lastname"
						class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.email
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
			<div class="flex">
				<div class="flex flex-col w-full">
					<label for="taxid" class="text-base dark:text-gray-200 font-medium">Tax Id</label>
					<input
						type="string"
						name="taxid"
						class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.taxid
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
		<div class="flex flex-col">
			<label for="password" class="text-base dark:text-gray-200 font-medium">Password</label>
			<input
				type="password"
				name="password"
				class="h-8 border text-black font-semibold px-2 text-xl rounded-md {form?.errors?.password
					? 'border border-red-500'
					: ''}"
			/>
			<label for="password">
				{#if form?.errors?.password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- verified Password Input -->
		<div class="flex flex-col">
			<label for="verified_password" class="text-base dark:text-gray-200 font-medium"
				>Password confirmation</label
			>
			<input
				type="password"
				name="verified_password"
				class="h-8 border text-black font-semibold px-2 text-xl rounded-md {form?.errors
					?.verified_password
					? 'border border-red-500'
					: ''}"
			/>
			<label for="verified_password">
				{#if form?.errors?.verified_password}
					<span class="dark:text-red-500 font-medium">{form?.errors?.verified_password[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
			>Create User</button
		>
	</form>

	<!-- Terms & Services Info -->
	<p class="px-8 mt-6 text-center text-sm dark:text-gray-200 text-muted-foreground">
		By clicking Create User, you agree to our{' '}
		<a href="/terms" class="underline underline-offset-4 hover:text-primary">
			Terms of Service
		</a>{' '}
		and{' '}
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary"> Privacy Policy </a>
		.
	</p>
</div>
