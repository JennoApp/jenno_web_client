<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import type { ActionData } from './$types'
  import { page } from '$app/stores'

  export let form: ActionData
  let userData = $page.data.user

  // $: console.log(userData)

  $: if (form?.success) {
    toast.success("Informacion guardada!!")
    goto('/cart/paymentroute/payment') 
  }
</script>

<div class="flex flex-col items-center justify-center w-full mt-5">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 mb-5">Shipping Details</h1>

	<!-- Form -->
	<form class="flex flex-col gap-2 min-w-xs w-96 mx-auto" action="?/shipping" method="POST" use:enhance>
		<!-- Address Input -->
		<div class="flex flex-col">
			<label for="address" class="text-base dark:text-gray-200 font-medium">Address</label>
			<input
				type="text"
				name="address"
				class="h-8 w-full border rounded-md text-black font-semibold px-2 {form?.errors?.address
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
			<label for="country" class="text-base dark:text-gray-200 font-medium">Country</label>
			<input
				type="text"
				name="country"
				class="h-8 border rounded-md text-black font-semibold px-2 {form?.errors?.country
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
			<label for="state" class="text-base dark:text-gray-200 font-medium">State</label>
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
			<label for="city" class="text-base dark:text-gray-200 font-medium">City</label>
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
			<label for="postalCode" class="text-base dark:text-gray-200 font-medium">Postal code</label>
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
			<label for="phoneNumber" class="text-base dark:text-gray-200 font-medium">Phone number</label>
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
			class="h-10 w-full mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
		>
			Save & Next
		</button>
	</form>
</div>
