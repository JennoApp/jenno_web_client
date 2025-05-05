<script lang="ts">
  import { onMount } from 'svelte';

  const publicKey: string = "APP_USR-db727e45-9640-4aa7-926a-4a7c72ed689e"
  export let locale: string = "es-CO";

  onMount(() => {
    const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')
    if (!existingScript) {
       const script = document.createElement('script');
       script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        const mp = new window.MercadoPago(publicKey, { locale });

        // Montar un cardForm oculto solo para validación de Mercado Pago
        mp.cardForm({
          amount: '1000', // puedes pasar un valor dummy
          autoMount: true,
          form: {
            id: 'form-checkout'
          }
        });
      };
      document.body.appendChild(script);
    }
  })
</script>

<!-- Puede estar oculto si no lo necesitas visualmente -->
<div id="form-checkout" style="display: none;"></div>
