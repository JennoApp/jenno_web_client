import { browser } from '$app/environment'
import { get, writable } from 'svelte/store'

interface Product {
  _id: string;
  username: string;
  productname: string;
  imgs: [string];
  price: number;
}

interface CartItem extends Product {
  amount: number;
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
export function addToCart(product: Product) {
  let items = get(cartItems)

  // Increment amount if it exists
  for (let item of items) {
    if (item._id === product._id) {
      item.amount++
      cartItems.set(items)
      return
    }
  }

  // Otherwise, append it to cart
  const cartItem = { ...product, amount: 1 }
  cartItems.set([...items, cartItem])
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

export function removeFromCart(id: string) {
  let items = get(cartItems)

  items = items.filter(item => item._id !== id)

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
