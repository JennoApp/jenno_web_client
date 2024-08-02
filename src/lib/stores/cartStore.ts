import { browser } from '$app/environment'
import { get, writable } from 'svelte/store'

interface Product {
  _id: string;
  username: string;
  productname: string;
  imgs: [string];
  price: number;
  shippingfee: number
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
  if (selectedOptions.length === 0) {
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

export function decrementCartItem(id: string) {
  let items = get(cartItems)

  for (let item of items) {
    if (item._id === id) {
      if (item.amount > 1) {
        item.amount--
      } else {
        items = items.filter((item) => item._id !== id)
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
