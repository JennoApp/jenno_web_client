import { loadScript } from '@paypal/paypal-js';

export async function initializePayPal(clientId: string, usdAmount: number, containerId: string) {
  try {
    const paypal: any = await loadScript({ clientId });
    if (paypal) {
      await paypal.Buttons({
        style: {
          color: 'blue',
          shape: 'rect',
        },
        createOrder(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: usdAmount.toFixed(2),
                },
              },
            ],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
          });
        },
        onApprove(data: any, actions: any) {
          return actions.order.capture().then(() => {
            // Redirigir al usuario a la página de éxito
            window.location.href = '/cart/success?paymentSuccess=1';
          });
        }
      }).render(`#${containerId}`);
    }
  } catch (error) {
    console.error('Error al inicializar PayPal:', error);
  }
}
