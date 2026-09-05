<script lang="ts">
	import { page } from '$app/state';
	import { Progress } from '$lib/components/ui/progress';
	import * as m from '$paraglide/messages';

	let { children } = $props();

	let pathnameRoute = $derived(page.url.pathname);

	let currentStep = $derived(
		pathnameRoute === '/cart/paymentroute/shipping'
			? 1
			: pathnameRoute === '/cart/paymentroute/payment'
				? 1
				: pathnameRoute === '/cart/paymentroute/confirm'
					? 2
					: 1
	);
</script>

<div class="w-full flex justify-center px-4 pt-4">
	<div
		class="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-[#303030] bg-white dark:bg-[#161616] shadow-sm px-5 py-5 sm:px-8"
	>
		<!-- Progress Header -->
		<div class="relative">
			<!-- Línea de fondo -->
			<div class="absolute top-5 left-5 right-5 h-px bg-gray-300 dark:bg-[#3a3a3a]"></div>
			<!-- Línea de progreso -->
			<div
				class={`absolute top-5 left-5 h-px transition-all duration-300 ${currentStep === 2 ? 'w-[calc(100%-40px)] bg-gray-900 dark:bg-white' : 'w-0 bg-gray-900 dark:bg-white'}`}
			></div>
			<!-- Steps -->
			<div class="relative flex items-start justify-between">
				<!-- Step 1 -->
				<div class="flex flex-col items-center">
					<div
						class={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-semibold transition-all duration-300 ${currentStep >= 1 ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white' : 'bg-white dark:bg-[#161616] text-gray-500 border-gray-300 dark:border-[#3a3a3a]'}`}
					>
						{#if currentStep > 1}
							✓
						{:else}
							1
						{/if}
					</div>
					<span
						class={`mt-3 text-sm font-medium ${currentStep >= 1 ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}`}
					>
						{m.cart_paymentroute_layout_shipping_info()}
					</span>
				</div>
				<!-- Step 2 -->
				<div class="flex flex-col items-center">
					<div
						class={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-semibold transition-all duration-300 ${currentStep >= 2 ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white' : 'bg-white dark:bg-[#161616] text-gray-500 border-gray-300 dark:border-[#3a3a3a]'}`}
					>
						2
					</div>
					<span
						class={`mt-3 text-sm font-medium ${currentStep >= 2 ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
					>
						{m.cart_paymentroute_layout_confirm_order()}
					</span>
				</div>
			</div>
		</div>
		<!-- Estado actual -->
		<div class="mt-6 pt-5 border-t border-gray-200 dark:border-[#303030]">
			{#if currentStep === 1}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Completa tu información de envío para continuar.
				</p>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Revisa los datos de tu pedido antes de finalizar la compra.
				</p>
			{/if}
		</div>
	</div>
</div>

{@render children()}
