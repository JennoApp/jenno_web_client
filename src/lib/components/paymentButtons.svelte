<script lang="ts">
	import { loadScript } from '@paypal/paypal-js';

  export let TotalAmount: number
	let paypal: any;

  let paypalClientId: string
  async function getPaypalClientId() {
    try {
      const response = await fetch(`/api/paypal`)
      const data = await response.json()

      paypalClientId = data.clientId 
    } catch (error) {
      console.error('Error al solicitar Paypal Id')
    }
  }

  $: getPaypalClientId()
  

	async function paypalInit() {
		try {
			paypal = await loadScript({
				clientId: paypalClientId
			});
		} catch (error) {
			console.error('failed to load the Paypal SDK script', error);
		}

		if (paypal) {
			console.log('paypal started');
			try {
				await paypal
					.Buttons({
						style: {
							color: 'blue',
							shape: 'rect'
						},
						createOrder: function (data: any, actions: any) {
							// Set up the transaction
							return actions.order.create({
								purchase_units: [
									{
										amount: {
                      currency_code: 'USD',
											value: TotalAmount.toFixed(2)
										}
									}
								],
								application_context: {
									shipping_preference: 'NO_SHIPPING',
                  return_url: "http://localhost:5173/cart/success",
                  cancel_url: "http://localhost:5173",
                  user_action: "PAY_NOW",
								}
							});
						}
					})
					.render('#paypal-button-container');
			} catch (error) {
				console.error('Failed to redner the Paypal Buttons', error);
			}
		}
	}

	$: paypalInit();
</script>

<div class="w-full mt-3 overflow-auto" id="paypal-button-container" />



