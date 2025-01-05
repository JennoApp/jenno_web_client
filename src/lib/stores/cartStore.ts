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


// export function calculateTotals() {
//   let items = get(cartItems)

//   // Calcular el subtotal de los productos en el carrito
//   const subtotal = items.reduce((acc, product) => acc + product.price * product.amount, 0);

//   // Calcular el costo total de envío
//   const totalEnvio = items.reduce(
//     (acc, product) => acc + product.shippingfee * product.amount,
//     0
//   );

//   // Calcular la comisión de Stripe usando la fórmula proporcionada
//   const P_goal = subtotal + totalEnvio;
//   const F_fixed = 0; // Asumimos que no hay tarifa fija
//   const F_percent = 0.03; // Tarifa porcentual del 3%

//   const P_charge = (P_goal + F_fixed) / (1 - F_percent);
//   const transferStripe = P_charge - P_goal;

//   // Calcular el total
//   const total = subtotal + totalEnvio + transferStripe;

//   return { subtotal, totalEnvio, transferStripe, total };
// }


// Derivados para calcular el subtotal, totalEnvio, transferStripe y total
export const subtotal = derived(cartItems, $cartItems =>
  $cartItems.reduce((acc, product) => acc + product.price * product.amount, 0)
);

export const totalEnvio = derived(cartItems, $cartItems =>
  $cartItems.reduce((acc, product) => acc + product.shippingfee * product.amount, 0)
);

export const P_goal = derived([subtotal, totalEnvio], ([$subtotal, $totalEnvio]) =>
  $subtotal + $totalEnvio
);

const F_fixed = 0; // Asumimos que no hay tarifa fija
const F_percent = 0.03; // Tarifa porcentual del 3%

export const transferStripe = derived(P_goal, $P_goal =>
  ($P_goal + F_fixed) / (1 - F_percent) - $P_goal
);

export const total = derived([P_goal, transferStripe], ([$P_goal, $transferStripe]) =>
  $P_goal + $transferStripe
);
