<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
  import { toast } from 'svelte-sonner'
  import { invalidate } from '$app/navigation'

	export let data: PageServerData;
  export let form: ActionData

	let userInfo: any = null;

  $: userInfo = $page.data.user
	$: console.log({ userInfo });

	$: if (form?.success) {
		toast.success('Informacion Actualizada!');
    invalidate((url) => url.pathname === '/settings/profile')
	}
</script>

<div class="flex items-center w-11/12 h-32 border-2 border-[#141414] rounded-md">
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/uploadProfileImg"
		class="flex justify-between items-center w-full"
		use:enhance
	>
		<div class="flex items-center">
			<div class="w-36">
				{#if data?.user?.profileImg !== ''}
					<div class="flex justify-center items-center h-24 w-24 ml-5 bg-[#202020] rounded-full">
						<img
							src={`${data?.user?.profileImg}`}
							alt={`${data?.user?.username}`}
							class="rounded-full"
						/>
					</div>
				{:else}
					<div class="flex justify-center items-center h-24 w-24 ml-5 bg-[#202020] rounded-full">
						<iconify-icon icon="mdi:user" height="3rem" width="3rem" class="text-[#707070]" />
					</div>
				{/if}
			</div>

			<Input type="file" name="profile" class="ml-10" />
		</div>
		<Button type="submit" class="ml-5">Upload Image</Button>
	</form>
</div>

<div class="flex flex-col items-center w-full">
	<!-- Personal Information -->
	<form class="w-1/2" method="post" action="?/uploadUserInfo" use:enhance>
		<h2 class="mt-5 text-xl font-semibold">
			Informacion {userInfo?.accountType === 'personal' ? 'Personal' : 'Empresa'}
		</h2>
		<div class="flex gap-5 items-center mt-5">
			<label for="username" class="text-base font-medium">Nombre:</label>
			<input
				type="text"
				name="username"
				class="h-8 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.username}
			/>
		</div>
		<div class="flex gap-5 items-center mt-5">
			<label for="email" class="text-base font-medium">Email:</label>
			<input
				type="text"
				name="email"
				class="h-8 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.email}
			/>
		</div>
		<div class="flex gap-5 items-center mt-5">
			<label for="bio" class="text-base font-medium">Bio:</label>
			<textarea
				name="bio"
				class="h-20 w-80 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.bio}
			/>
		</div>
		<div class="hidden">
			<div class="flex gap-5 items-center mt-5">
				<label for="country" class="text-base font-medium">Pais:</label>
				<input
					type="text"
					name="country"
					class="h-8 border rounded-md text-black font-semibold px-2"
				/>
			</div>
		</div>

		<!-- Bussines Legal Information -->
		{#if userInfo?.accountType === 'business'}
			<div class="mt-10">
				<h2 class="mt-5 text-xl font-semibold">Informacion Legal</h2>
				<div class="flex gap-5 items-center mt-5">
					<label for="legal_name" class="text-base font-medium">Nombre:</label>
					<input
						type="text"
						name="legal_name"
						class="h-8 border rounded-md text-black font-semibold px-2"
            bind:value={userInfo.legalname}
					/>
				</div>
				<div class="flex gap-5 items-center mt-5">
					<label for="legal_lastname" class="text-base font-medium">Apellido:</label>
					<input
						type="text"
						name="legal_lastname"
						class="h-8 border rounded-md text-black font-semibold px-2"
            bind:value={userInfo.legallastname}
					/>
				</div>
				<div class="flex gap-5 items-center mt-5">
					<label for="taxid" class="text-base font-medium">TaxId:</label>
					<input
						type="text"
						name="taxid"
						class="h-8 border rounded-md text-black font-semibold px-2"
            bind:value={userInfo.taxid}
					/>
				</div>
			</div>
		{/if}

		<button
			class="h-10 w-96 mt-10 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
		>
			<span class="text-lg font-semibold">Actualizar</span>
		</button>
	</form>
</div>
