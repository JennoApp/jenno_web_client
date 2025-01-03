<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import * as Select from '$lib/components/ui/select';
	import { countryList } from '$lib/utils/countries';
	import * as m from '$paraglide/messages';

	export let data: PageServerData;
	export let form: ActionData;

	let userInfo: any = null;
	let selectedCountry: any = '';

	$: userInfo = $page.data.user;

	$: if (form?.success) {
		toast.success('Informacion Actualizada!');
		setTimeout(() => {
			location.reload();
		}, 1000);
	}

	// Debuging
	$: console.log({ userInfo });
	$: console.log({ data });
</script>

<div class="flex items-center w-full md:w-11/12 h-32">
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
					<div
						class="flex justify-center items-center h-24 w-24 ml-5 bg-gray-200 dark:bg-[#202020] rounded-full"
					>
						<img
							src={`${data?.user?.profileImg}`}
							alt={`${data?.user?.username}`}
							class="rounded-full"
						/>
					</div>
				{:else}
					<div
						class="flex justify-center items-center h-24 w-24 ml-5 bg-gray-200 dark:bg-[#202020] rounded-full"
					>
						<iconify-icon icon="mdi:user" height="3rem" width="3rem" class="text-[#707070]" />
					</div>
				{/if}
			</div>

			<Input type="file" name="profile" class="ml-10" />
		</div>
		<Button
			type="submit"
			class="ml-5 text-black dark:text-white bg-gray-200 dark:bg-[#202020] hover:bg-gray-300 dark:hover:bg-[#252525]"
			>{m.settings_profile_uploadimage_button()}</Button
		>
	</form>
</div>

<div class="flex flex-col items-center w-full">
	<!-- Personal Information -->
	<form class="md:w-1/2" method="post" action="?/uploadUserInfo" use:enhance>
		<h2 class="mt-5 text-xl font-semibold">
			{m.settings_profile_title_account_info()}
		</h2>
		<div class="flex gap-5 items-center mt-5">
			<label for="username" class="text-base font-medium"
				>{m.settings_profile_account_name()}:</label
			>
			<input
				type="text"
				name="username"
				class="h-8 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.displayname}
			/>
		</div>
		<div class="flex gap-5 items-center mt-5">
			<label for="email" class="text-base font-medium">{m.settings_profile_account_email()}:</label>
			<input
				type="text"
				name="email"
				class="h-8 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.email}
			/>
		</div>

		<!-- Country Input -->
		<div class="flex flex-col mt-3">
			<label for="email" class="text-base dark:text-gray-200 font-medium"
				>{m.settings_profile_account_country()}</label
			>
			<Select.Root
				onSelectedChange={(v) => {
					selectedCountry = v?.value;
				}}
			>
				<Select.Trigger>
					<Select.Value placeholder={m.settings_profile_account_select_country()} />
				</Select.Trigger>
				<Select.Content class="overflow-y-auto max-h-[20rem]">
					{#each countryList as country}
						<Select.Item value={`${country}`}>{country}:</Select.Item>
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

		<div class="flex gap-5 items-center mt-5">
			<label for="bio" class="text-base font-medium">{m.settings_profile_account_bio()}:</label>
			<textarea
				name="bio"
				class="h-20 w-80 border rounded-md text-black font-semibold px-2"
				bind:value={userInfo.bio}
			/>
		</div>
		<div class="hidden">
			<div class="flex gap-5 items-center mt-5">
				<label for="country" class="text-base font-medium"
					>{m.settings_profile_account_country()}:</label
				>
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
				<h2 class="mt-5 text-xl font-semibold">{m.settings_profile_title_legal_info()}</h2>
				<div class="flex gap-5 items-center mt-5">
					<label for="legal_name" class="text-base font-medium"
						>{m.settings_profile_legal_name()}:</label
					>
					<input
						type="text"
						name="legal_name"
						class="h-8 border rounded-md text-black font-semibold px-2"
						bind:value={userInfo.legalname}
					/>
				</div>
				<div class="flex gap-5 items-center mt-5">
					<label for="legal_lastname" class="text-base font-medium"
						>{m.settings_profile_legal_lastname()}:</label
					>
					<input
						type="text"
						name="legal_lastname"
						class="h-8 border rounded-md text-black font-semibold px-2"
						bind:value={userInfo.legallastname}
					/>
				</div>
				<div class="flex gap-5 items-center mt-5">
					<label for="taxid" class="text-base font-medium"
						>{m.settings_profile_legal_taxid()}:</label
					>
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
			class="h-10 w-96 mt-10 border border-gray-200 dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
		>
			<span class="text-base font-semibold">{m.settings_profilw_update_button()}</span>
		</button>
	</form>
</div>
