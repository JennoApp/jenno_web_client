<script lang="ts">
  import { goto } from '$app/navigation'
  import { updatePaymentMethod, paymentMethod } from '$lib/stores/paymentMethod'

  let enumPayments = ['payu', 'stripe']

  const selectedPayuButton = () => {
    updatePaymentMethod(enumPayments[0])
  }

  const selectedStripeButton = () => {
    updatePaymentMethod(enumPayments[1])
  }

  $: console.log($paymentMethod)

</script>

<div class="w-full h-64 mt-14">
	<div class="flex gap-5 justify-center items-center h-full w-full">
		<button class="bg-[#252525] w-40 h-40 rounded-lg hover:bg-[#303030] {$paymentMethod === 'payu' ? 'border-2 border-gray-200': ''}" on:click={() => selectedPayuButton()}>
			<iconify-icon icon="fontisto:payu" height="5.5rem" width="5.5rem"></iconify-icon>
		</button>

		<button class="bg-[#252525] w-40 h-40 rounded-lg hover:bg-[#303030] {$paymentMethod === 'stripe' ? 'border-2 border-gray-200': ''}" on:click={() => selectedStripeButton()}>
			<iconify-icon icon="fa-brands:stripe" height="5.5rem" width="5.5rem"></iconify-icon>
		</button>
	</div>

	<!-- Shipping Submit -->
	<div class="flex w-full justify-center">
		<button
			class="h-10 w-96 mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525] {$paymentMethod === '' ? 'disabled:bg-black': ''}"
      disabled={!$paymentMethod || $paymentMethod === ''}
      on:click={() => goto('/cart/paymentroute/confirm')}
		>
			Save & Next
		</button>
	</div>
</div>
