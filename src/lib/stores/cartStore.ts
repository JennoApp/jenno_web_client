import { browser } from '$app/environment'
import { derived, get, writable } from 'svelte/store'

interface Product {
  _id: string;
  username: string;
  productname: string;
  description: string;
  imgs: [string];
  price: number;
  quantity: number;
  shippingfee: number
  user: string,
  options: [],
  status: string,
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
  // 0) Verificamos si el producto está agotado
  if (product.status === 'sold_out') {
    console.warn('Este producto está agotado y no se puede agregar al carrito')
    return
  }

  // Exit if no options are selected
  if (product.options.length > 0 && selectedOptions.length === 0) {
    console.warn("No options selected")
    return
  }

  let items = get(cartItems)

  const totalGlobal = items
    .filter(i => i._id === product._id)
    .reduce((sum, i) => sum + i.amount, 0)

  if (totalGlobal >= product.quantity) {
    console.warn(`Ya alcanzaste el stock máximo de ${product.quantity}`)
    return
  }

  const remaining = product.quantity - totalGlobal

  let found = false
  const updated = items.map(i => {
    if (
      i._id === product._id &&
      JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions)
    ) {
      found = true
      // sólo sumamos hasta remaining, no más
      const addable = Math.min(quantity, remaining)
      if (addable <= 0) {
        console.warn('No queda stock disponible para esta variante')
      }
      i.amount += addable
    }
    return i
  })

  if (!found) {
    const qty = Math.min(quantity, remaining)
    if (qty <= 0) {
      console.warn('No queda stock disponible para este producto')
    }
    const cartItem: CartItem = {
      ...product,
      amount: qty,
      selectedOptions
    }
    updated.push(cartItem)
  }

  cartItems.set(updated)
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
      config = { fixed: 952, percent: 0.03915 };
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

