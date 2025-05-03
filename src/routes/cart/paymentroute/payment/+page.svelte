<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePaymentMethod, paymentMethod } from '$lib/stores/paymentMethod';
	import { toast } from 'svelte-sonner';

	let enumPayments = ['paypal', 'nequi', 'mercadopago'];

	const selectedPaypalButton = () => {
		updatePaymentMethod(enumPayments[0]);
		toast.info('Haz seleccionado Paypal como metodo de pago.');
	};

	const selectedNequiButton = () => {
		updatePaymentMethod(enumPayments[1]);
		toast.info('Haz seleccionado Nequi como metodo de pago.');
	};

	const selectedMercadoPagoButton = () => {
		updatePaymentMethod(enumPayments[2]);
		toast.info('Haz seleccionado Mercado Pago como metodo de pago.');
	};

	function paymentSubmit() {
		if ($paymentMethod === '') {
			toast.error('Por favor selecciona un metodo de pago.');
		} else {
			goto('/cart/paymentroute/confirm');
		}
	}

	$: console.log($paymentMethod);
</script>

<div class="w-full h-80 mt-14">
	<div class="flex gap-5 justify-center items-start h-full w-full">
		<!-- Contenedor para Mercado Pago -->
		<div class="flex flex-col items-center">
			<button
				class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg hover:bg-gray-300 dark:hover:bg-[#303030] {$paymentMethod ===
				'mercadopago'
					? 'border-2 border-[#202020] dark:border-gray-200'
					: ''}"
				on:click={() => selectedMercadoPagoButton()}
			>
				<iconify-icon icon="simple-icons:mercadopago" height="5rem" width="5rem"></iconify-icon>
			</button>
			<h3 class="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">Mercado Pago</h3>
			<ul class="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
				<li>Saldo Mercado Pago</li>
				<li>Tarjeta Débito</li>
				<li>Tarjeta Crédito</li>
				<li class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-300">
					Comisión: 3,29% + COP $800
				</li>
			</ul>
		</div>

		<!-- Contenedor para Nequi (Próximamente) HIDDEN desarrollo para 1.0 -->
		<div class="hidden">
			<div class="flex flex-col items-center">
				<button
					class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed"
					on:click={() => {
						toast.warning('Nequi estará disponible próximamente.');
					}}
				>
					<img src="https://www.jenno.com.co/nequilogo.png" alt="logo nequi" class="w-24 h-24" />
				</button>
				<h3 class="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">Nequi</h3>
				<p class="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">Próximamente</p>
			</div>
		</div>

		<!-- Contenedor para Nequi (Development) -->
		<div class="hidden">
			<div class="flex flex-col items-center">
				<button
					class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg hover:bg-gray-300 dark:hover:bg-[#303030] flex items-center justify-center {$paymentMethod ===
					'nequi'
						? 'border-2 border-[#202020] dark:border-gray-200'
						: ''}"
					on:click={() => selectedNequiButton()}
				>
					<img src="https://www.jenno.com.co/nequilogo.png" alt="logo nequi" class="w-24 h-24" />
				</button>
				<h3 class="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">Nequi</h3>
				<ul class="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
					<li>Saldo Nequi</li>
					<li>Transferencias</li>
					<li>Pago con QR</li>
					<li class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-300">
						Comisión: 1.5% del valor + IVA
					</li>
					<li class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-300">
						(máximo $2.900 + IVA)
					</li>
				</ul>
			</div>
		</div>

		<!-- Contenedor para PayPal HIDDEN -->
		<div class="hidden">
			<div class="flex flex-col items-center">
				<button
					class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg hover:bg-gray-300 dark:hover:bg-[#303030] {$paymentMethod ===
					'paypal'
						? 'border-2 border-[#202020] dark:border-gray-200'
						: ''}"
					on:click={() => selectedPaypalButton()}
				>
					<iconify-icon icon="logos:paypal" height="5rem" width="5rem"></iconify-icon>
				</button>
				<h3 class="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">PayPal</h3>
				<ul class="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
					<li>Saldo PayPal</li>
					<li>Tarjeta Débito</li>
					<li>Tarjeta Crédito</li>
					<li class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-300">
						Comisión: 3.40% + USD $0.30
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Shipping Submit -->
	<div class="flex w-full justify-center mt-5">
		<button
			class="h-10 w-96 mt-4 border dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525] {$paymentMethod ===
			''
				? 'disabled:bg-black'
				: ''}"
			on:click={() => paymentSubmit()}
		>
			Continuar
		</button>
	</div>
</div>
