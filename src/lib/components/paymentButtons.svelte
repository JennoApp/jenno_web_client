<script lang="ts">
  import { initializePayPal } from '$lib/utils/paypalUtils'


  export let TotalAmount: number

  let paypalClientId: string
  async function getPaypalClientId() {
    try {
      const response = await fetch(`/api/paypal`)
      const data = await response.json()

      paypalClientId = data.clientId
    } catch (error) {
      console.error('Error al solicitar Client Id de PayPal')
    }
  }

  async function initializePayPalButtons() {
    await getPaypalClientId()
    if (paypalClientId) {
      await initializePayPal(paypalClientId, TotalAmount, 'paypal-button-container')
    }
  }

  $: initializePayPalButtons()
</script>

<div class="w-full mt-3 overflow-auto" id="paypal-button-container" />



