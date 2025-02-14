<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePaymentMethod, paymentMethod } from '$lib/stores/paymentMethod';
  import { toast } from 'svelte-sonner';

	let enumPayments = ['paypal', 'nequi'];

	const selectedPaypalButton = () => {
		updatePaymentMethod(enumPayments[0]);
    toast.info('Haz seleccionado Paypal como metodo de pago.');
	};

	const selectedNequiButton = () => {
		updatePaymentMethod(enumPayments[1]);
    toast.info('Haz seleccionado Nequi como metodo de pago.');
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

<div class="w-full h-64 mt-14">
	<div class="flex gap-5 justify-center items-center h-full w-full">
		<button
			class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg hover:bg-gray-300 dark:hover:bg-[#303030] flex items-center justify-center {$paymentMethod ===
			'nequi'
				? 'border-2 border-[#202020] dark:border-gray-200'
				: ''}"
			on:click={() => selectedNequiButton()}
		>
			<img src="https://www.jenno.com.co/nequilogo.png" alt="logo nequi" class="w-24 h-24" />
		</button>

		<button
			class="bg-gray-200 dark:bg-[#252525] w-40 h-40 rounded-lg hover:bg-gray-300 dark:hover:bg-[#303030] {$paymentMethod ===
			'paypal'
				? 'border-2 border-[#202020] dark:border-gray-200'
				: ''}"
			on:click={() => selectedPaypalButton()}
		>
			<iconify-icon icon="logos:paypal" height="5rem" width="5rem"></iconify-icon>
		</button>
	</div>

	<!-- Shipping Submit -->
	<div class="flex w-full justify-center">
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
