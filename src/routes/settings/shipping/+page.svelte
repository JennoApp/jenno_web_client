<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner'
  import type { ActionData } from './$types'
  import { page } from '$app/state'
  import * as m from '$paraglide/messages'
  import { invalidateAll } from '$app/navigation';

  let { form }: { form: ActionData } = $props()

  let userData = page.data.user

  $effect(() => {
    if (form?.success) {
      toast.success("Informacion guardada!!")
      invalidateAll()
    }
  })
</script>

<div class="flex flex-col items-center justify-center w-full mt-5">
	<!-- Header -->
	<h1 class="text-2xl font-semibold dark:text-gray-200 mb-5">{m.settings_shipping_title()}</h1>

	<!-- Form -->
	<form class="flex flex-col gap-2 min-w-xs w-96 mx-auto" action="?/shipping" method="POST" use:enhance>
		<div class="flex flex-col">
			<label for="address" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_address()}:</label>
			<input
				type="text"
				name="address"
				class="h-8 w-full bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.address
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.address ?? ''}
			/>
			<label for="address">
				{#if form?.errors?.address}
					<span class="dark:text-red-500 font-medium">{form?.errors?.address[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Country Input -->
		<div class="flex flex-col">
			<label for="country" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_country()}:</label>
			<input
				type="text"
				name="country"
				class="h-8 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.country
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.country ?? ''}
			/>
			<label for="country">
				{#if form?.errors?.country}
					<span class="dark:text-red-500 font-medium">{form?.errors?.country[0]}</span>
				{/if}
			</label>
		</div>

		<!-- State Input -->
		<div class="flex flex-col">
			<label for="state" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_state()}:</label>
			<input
				type="text"
				name="state"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.state
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.state ?? ''}
			/>
			<label for="state">
				{#if form?.errors?.state}
					<span class="dark:text-red-500 font-medium">{form?.errors?.state[0]}</span>
				{/if}
			</label>
		</div>

		<!-- City Input -->
		<div class="flex flex-col">
			<label for="city" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_city()}:</label>
			<input
				type="text"
				name="city"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.city
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.city ?? ''}
			/>
			<label for="city">
				{#if form?.errors?.city}
					<span class="dark:text-red-500 font-medium">{form?.errors?.city[0]}</span>
				{/if}
			</label>
		</div>

		<!-- PostalCode Input -->
		<div class="flex flex-col">
			<label for="postalCode" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_postalcode()}:</label>
			<input
				type="text"
				name="postalCode"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.postalcode
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.postalCode ?? ''}
			/>
			<label for="postalCode">
				{#if form?.errors?.postalCode}
					<span class="dark:text-red-500 font-medium">{form?.errors?.postalCode[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Phone Number Input -->
		<div class="flex flex-col">
			<label for="phoneNumber" class="text-base dark:text-gray-200 font-medium">{m.settings_shipping_phone_number()}:</label>
			<input
				type="text"
				name="phoneNumber"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.phoneNumber
					? 'border border-red-500'
					: ''}"
				value={userData?.shippingInfo?.phoneNumber ?? ''}
			/>
			<label for="phoneNumber">
				{#if form?.errors?.phoneNumber}
					<span class="dark:text-red-500 font-medium">{form?.errors?.phoneNumber[0]}</span>
				{/if}
			</label>
		</div>

		<!-- Shipping Submit -->
		<button
			class="h-10 w-full mt-4 border border-gray-200 dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg font-medium dark:text-white hover:bg-gray-300 dark:hover:bg-[#252525]"
		>
			{m.settings_shipping_update_button()}
		</button>
	</form>
</div>
