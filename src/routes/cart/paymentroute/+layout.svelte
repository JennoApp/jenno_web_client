<script lang="ts">
	import { page } from '$app/state';
	import { Progress } from '$lib/components/ui/progress';
	import * as m from '$paraglide/messages';

  let { children } = $props()

	let pathnameRoute = $derived(page.url.pathname)
</script>

<div class="flex flex-col justify-center items-center">
	<div
		class="flex items-center justify-evenly gap-2 bg-gray-200 dark:bg-[#252525] w-full md:w-3/5 h-24 mt-3 px-3 rounded-t-md"
	>
		<!-- step 1 -->
		<div class="flex flex-col items-center">
			<span
				class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>{m.cart_paymentroute_layout_shipping_info()}</h3>
		</div>

		<!-- step 2 -->
		<div class="flex flex-col items-center">
			<span
				class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>2</span
			>
			<h3>Metodo de Pago</h3>
		</div>

		<!-- step 3 -->
		<div class="flex flex-col justify-center items-center">
			<span
				class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>3</span
			>
			<h3>{m.cart_paymentroute_layout_confirm_order()}</h3>
		</div>
	</div>

	<div
		class="flex items-center px-14 bg-gray-200 dark:bg-[#252525] w-full md:w-3/5 h-10 rounded-b-md"
	>
		{#if pathnameRoute === '/cart/paymentroute/shipping'}
			<Progress value={33} />
		{:else if pathnameRoute === '/cart/paymentroute/payment'}
			<Progress value={66} />
		{:else if pathnameRoute === '/cart/paymentroute/confirm'}
			<Progress value={100} />
		{/if}
	</div>
</div>

{@render children()}
