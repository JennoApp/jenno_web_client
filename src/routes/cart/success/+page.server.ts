import type { PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ locals, cookies }) => {
  // Cargar carrito de la cookie
  const cartCookie = cookies.get('cartItems');
  let cartItems: any
  if (cartCookie) {
    try {
      cartItems = JSON.parse(cartCookie);
    } catch (error) {
      console.error('Error al parsear la cookie cartItems:', error);
    }
  }

  // obtener informacion del usuario que compra
  const user = locals.user || null;

  if (!user || cartItems.length === 0) {
    console.log('No hay usuario o el carrito está vacío. No se crearán órdenes.');
    return {
      user,
      cartItems,
      ordersCreated: false
    };
  }

  const maxAttempts = 3;

  try {
    for (const item of cartItems) {
      let success = false;
      let attempts = 0;

      while (!success && attempts < maxAttempts) {
        try {
          const orderData = {
            product: item,
            buyerId: user._id,
            sellerId: item?.user,
            buyerName: user.username,
            buyerProfileImg: user.profileImg || '',
            amount: item.amount,
            status: 'pending', // Estado inicial
            selectedOptions: item.selectedOptions
          };

          console.log('Intentando crear orden en el servidor:', orderData);

          const response = await fetch(`${PRIVATE_SERVER_URL}/orders/createOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend Error:', errorText);
            throw new Error(`Error al crear la orden: ${response.statusText}`);
          }

          success = true;
        } catch (error) {
          attempts++;
          console.error(`Intento ${attempts} fallido al crear orden:`, error);
          if (attempts >= maxAttempts) {
            throw new Error(`Error al crear la orden después de ${maxAttempts} intentos`);
          }
        }
      }
    }

    console.log('Todas las órdenes se han creado correctamente en el servidor.');

    // Vaciar la cookie del carrito
    cookies.set('cartItems', '', {
      path: '/',
      maxAge: 0
    });

    return {
      user,
      cartItems: [],
      ordersCreated: true
    };
  } catch (error: any) {
    console.error('Error creando órdenes:', error);
    return {
      user,
      cartItems,
      ordersCreated: false,
      error: error.message
    };
  }
}
