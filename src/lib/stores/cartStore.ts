import { browser } from '$app/environment'
import { derived, get, writable } from 'svelte/store'

interface Product {
  _id: string;
  username: string;
  productname: string;
  description: string;
  imgs: [string];
  price: number;
  shippingfee: number
  user: string,
  options: []
}

interface SelectedOption {
  name: string
  value: string
}

interface CartItem extends Product {
  amount: number;
  selectedOptions: SelectedOption[]
}

export const cartItems = writable<CartItem[]>([])

if (browser) {
  if (localStorage.cartItems) {
    cartItems.set(JSON.parse(localStorage.cartItems))
  }
  cartItems.subscribe((items) => localStorage.cartItems = JSON.stringify(items))
}

// No solo agrega el producto al carrito sino que tambien
// incrementa una unidad cuando este ya esta agregado
export function addToCart(product: Product, selectedOptions: SelectedOption[] = [], quantity: number = 1) {
  // Exit if no options are selected
  if (product.options.length > 0 && selectedOptions.length === 0) {
    console.warn("No options selected")
    return
  }

  let items = get(cartItems)
  let found = false

  items = items.map((item) => {
    if (item._id === product._id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)) {
      item.amount += quantity
      found = true
    }
    return item
  })

  if (!found) {
    const cartItem: CartItem = {...product, amount: quantity, selectedOptions}
    items = [...items, cartItem]
  }

  cartItems.set(items)
}

export function decrementCartItem(id: string, selectedOptions: SelectedOption[]) {
  let items = get(cartItems)

  for (let item of items) {
    if (item._id === id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)) {
      if (item.amount > 1) {
        item.amount--
      } else {
        items = items.filter(
          (item) => item._id !== id || JSON.stringify(item.selectedOptions) !== JSON.stringify(selectedOptions)
        )
      }
      cartItems.set(items)
      return
    }
  }
}

export function removeFromCart(id: string, selectedOptions: SelectedOption[]) {
  let items = get(cartItems)

  items = items.filter(item => item._id !== id || JSON.stringify(item.selectedOptions) !== JSON.stringify(selectedOptions))

  cartItems.set(items)
}

export function getTotal() {
  let items = get(cartItems)
  let total = 0

  for (let item of items) {
    total += item.price * item.amount
  }

  return total
}

export function removeTotal() {
  cartItems.set([])
}


// Derivados para calcular los totales sin comisión (estos se mostrarán en el carrito)
export const subtotal = derived(cartItems, $cartItems =>
  $cartItems.reduce((acc, product) => acc + product.price * product.amount, 0)
);

export const totalEnvio = derived(cartItems, $cartItems =>
  $cartItems.reduce((acc, product) => acc + product.shippingfee * product.amount, 0)
);

export const P_goal = derived([subtotal, totalEnvio], ([$subtotal, $totalEnvio]) =>
  $subtotal + $totalEnvio
);

// Función para calcular la comisión según el método de pago
export function computeCommission(paymentMethod: string, P_goal: number): number {
	let config;
	switch (paymentMethod) {
		case 'mercadopago':
      // 3,29% + $800,00 COP
			config = { fixed: 800, percent: 0.035 };
			break;
		case 'paypal':
      // 3.40% + $0.30 USD
			config = { fixed: 0.30, percent: 0.034 };
			break;
		default:
			config = { fixed: 0, percent: 0 };
			break;
	}
	// Fórmula para calcular la comisión: se asume que se quiere que el total recibido sea P_goal,
	// y se aplica la comisión para saber cuánto se debe cobrar adicionalmente.
	return (P_goal + config.fixed) / (1 - config.percent) - P_goal;
}


export function computeTotal(paymentMethod: string, P_goal: number): number {
  const commission = computeCommission(paymentMethod, P_goal);
  return P_goal + commission;
}

