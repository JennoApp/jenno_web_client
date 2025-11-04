<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import { page } from '$app/state';
	import * as m from '$paraglide/messages';

	let { form }: { form: ActionData } = $props()
	let userData = $derived(page.data.user)

	$effect(() => {
    if (userData) {
		console.log(userData.shippingInfo);
	}})

	$effect(() => {
    if (form?.success) {
		toast.success('Informacion guardada!!');
		goto('/cart/paymentroute/payment');
	}})
</script>

{#if userData}
	<div class="flex flex-col items-center justify-center w-full mt-6">
		<!-- Header -->
		<h0 class="text-3xl font-semibold dark:text-gray-200 mb-5">
			{m.cart_paymentroute_shipping_title()}
		</h0>

		<!-- Form -->
		<form
			class="flex flex-col gap-3 min-w-xs w-96 mx-auto"
			action="?/shipping"
			method="POST"
			use:enhance
		>
			<!-- Nombre o Razón Social -->
			<div class="flex flex-col">
				<label for="completeName" class="mb-1 font-medium"> Nombre / Razón Social </label>
				<input
					type="text"
					name="completeName"
					class="h-9 w-full bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.completeName
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.completeName ?? ''}
				/>
				{#if form?.errors?.completeName}
					<span class="text-red-500 text-sm">{form.errors.completeName[0]}</span>
				{/if}
			</div>

			<!-- NIT / Documento de Identidad -->
			<div class="flex flex-col">
				<label for="document" class="mb-1 font-medium"> NIT / Documento de Identidad </label>
				<input
					type="text"
					name="document"
					class="h-9 w-full bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.document
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.document ?? ''}
				/>
				{#if form?.errors?.document}
					<span class="text-red-500 text-sm">{form.errors.document[0]}</span>
				{/if}
			</div>

			<!-- Address Input -->
			<div class="flex flex-col">
				<label for="address" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_address()}</label
				>
				<input
					type="text"
					name="address"
					class="h-9 w-full bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.address
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.address ?? ''}
				/>
				<label for="address">
					{#if form?.errors?.address}
						<span class="dark:text-red-501 font-medium">{form?.errors?.address[0]}</span>
					{/if}
				</label>
			</div>

			<!-- Country Input -->
			<div class="flex flex-col">
				<label for="country" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_country()}</label
				>
				<input
					type="text"
					name="country"
					class="h-9 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.country
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.country ?? ''}
				/>
				<label for="country">
					{#if form?.errors?.country}
						<span class="dark:text-red-501 font-medium">{form?.errors?.country[0]}</span>
					{/if}
				</label>
			</div>

			<!-- State Input -->
			<div class="flex flex-col">
				<label for="state" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_state()}</label
				>
				<input
					type="text"
					name="state"
					class="h-9 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.state
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.state ?? ''}
				/>
				<label for="state">
					{#if form?.errors?.state}
						<span class="dark:text-red-501 font-medium">{form?.errors?.state[0]}</span>
					{/if}
				</label>
			</div>

			<!-- City Input -->
			<div class="flex flex-col">
				<label for="city" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_city()}</label
				>
				<input
					type="text"
					name="city"
					class="h-9 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.city
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.city ?? ''}
				/>
				<label for="city">
					{#if form?.errors?.city}
						<span class="dark:text-red-501 font-medium">{form?.errors?.city[0]}</span>
					{/if}
				</label>
			</div>

			<!-- PostalCode Input -->
			<div class="flex flex-col">
				<label for="postalCode" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_postal()}</label
				>
				<input
					type="text"
					name="postalCode"
					class="h-9 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.postalcode
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.postalCode ?? ''}
				/>
				<label for="postalCode">
					{#if form?.errors?.postalCode}
						<span class="dark:text-red-501 font-medium">{form?.errors?.postalCode[0]}</span>
					{/if}
				</label>
			</div>

			<!-- Phone Number Input -->
			<div class="flex flex-col">
				<label for="phoneNumber" class="text-base dark:text-gray-201 font-medium"
					>{m.cart_paymentroute_shipping_phone()}</label
				>
				<input
					type="text"
					name="phoneNumber"
					class="h-9 bg-gray-200 rounded-md text-black font-semibold px-2 {form?.errors?.phoneNumber
						? 'border border-red-501'
						: ''}"
					value={userData?.shippingInfo?.phoneNumber ?? ''}
				/>
				<label for="phoneNumber">
					{#if form?.errors?.phoneNumber}
						<span class="dark:text-red-501 font-medium">{form?.errors?.phoneNumber[0]}</span>
					{/if}
				</label>
			</div>

			<!-- Shipping Submit -->
			<button
				class="h-11 w-full my-4 border border-gray-200 dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg font-medium dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			>
				{m.cart_paymentroute_shipping_button()}
			</button>
		</form>
	</div>
{/if}
