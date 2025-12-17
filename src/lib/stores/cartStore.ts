import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';

interface Product {
	_id: string;
	username: string;
	productname: string;
	description: string;
	imgs: [string];
	price: number;
	quantity: number;
	shippingfee: number;
	user: string;
	options: [];
	variants?: Variant[];
	status: string;
}

interface Variant {
	_id?: string;
	sku?: string;
	price: number;
	quantity?: number;
	imgs?: string[];
	options: { name: string; value: string }[];
	weight?: number;
	meta?: any;
}

interface SelectedOption {
	name: string;
	value: string;
}

interface CartItem extends Product {
	amount: number;
	selectedOptions: SelectedOption[];
	selectedVariant?: Variant;
}

export const cartItems = writable<CartItem[]>([]);

if (browser) {
	if (localStorage.cartItems) {
		cartItems.set(JSON.parse(localStorage.cartItems));
	}
	cartItems.subscribe((items) => (localStorage.cartItems = JSON.stringify(items)));
}

function isSameCartItem(
	item: CartItem,
	productId: string,
	selectedOptions: SelectedOption[] = [],
	variant?: Variant
): boolean {
	if (item._id !== productId) return false;

	// Comparar opciones simples (asegurar que ambos sean arrays)
	const itemOptions = item.selectedOptions || [];
	const newOptions = selectedOptions || [];

	const itemOptionsKey = JSON.stringify(
		[...itemOptions].sort((a, b) => a.name.localeCompare(b.name))
	);
	const newOptionsKey = JSON.stringify(
		[...newOptions].sort((a, b) => a.name.localeCompare(b.name))
	);

	if (itemOptionsKey !== newOptionsKey) return false;

	// Comparar variantes
	const itemVariantKey = item.selectedVariant
		? item.selectedVariant.sku ||
			item.selectedVariant._id ||
			JSON.stringify(item.selectedVariant.options || [])
		: 'no-variant';
	const newVariantKey = variant
		? variant.sku || variant._id || JSON.stringify(variant.options || [])
		: 'no-variant';

	return itemVariantKey === newVariantKey;
}

// Helper para obtener precio considerando variante
export function getItemPrice(item: CartItem): number {
	// Prioridad: variante > producto
	if (item.selectedVariant?.price != null && !isNaN(Number(item.selectedVariant.price))) {
		return Number(item.selectedVariant.price);
	}
	if (item.price != null && !isNaN(Number(item.price))) {
		return Number(item.price);
	}
	return 0;
}

// Agregar producto al carrito con opciones simples y/o variante
export function addToCart(
	product: Product,
	selectedOptions: SelectedOption[] = [],
	quantity: number = 1,
	variant?: Variant
) {
	// Verificar si el producto está agotado
	if (product.status === 'sold_out') {
		console.warn('Este producto está agotado y no se puede agregar al carrito');
		return;
	}

	// Verificar si se requieren opciones
	if (product.options.length > 0 && selectedOptions.length === 0 && !variant) {
		console.warn('No options selected');
		return;
	}

	let items = get(cartItems);

	// Calcular stock disponible
	let availableStock: number;
	if (variant) {
		// Si hay variante, usar su stock
		availableStock = variant.quantity ?? 0;
	} else {
		// Si no hay variante, usar stock del producto
		availableStock = product.quantity;
	}

	// Calcular cuánto ya tenemos de este item específico en el carrito
	const existingAmount = items
		.filter((i) => isSameCartItem(i, product._id, selectedOptions, variant))
		.reduce((sum, i) => sum + i.amount, 0);

	if (existingAmount >= availableStock) {
		console.warn(`Ya alcanzaste el stock máximo de ${availableStock}`);
		return;
	}

	const remaining = availableStock - existingAmount;

	// Buscar si ya existe el item exacto en el carrito
	let found = false;
	const updated = items.map((i) => {
		if (isSameCartItem(i, product._id, selectedOptions, variant)) {
			found = true;
			const addable = Math.min(quantity, remaining);
			if (addable <= 0) {
				console.warn('No queda stock disponible para esta variante');
			}
			i.amount += addable;
		}
		return i;
	});

	if (!found) {
		const qty = Math.min(quantity, remaining);
		if (qty <= 0) {
			console.warn('No queda stock disponible para este producto');
			return;
		}

		// Crear nuevo item de carrito
		const cartItem: CartItem = {
			...product,
			amount: qty,
			selectedOptions: selectedOptions || [],
			selectedVariant: variant
		};

		// Si hay variante, usar su precio e imágenes
		if (variant) {
			cartItem.price = variant.price;
			if (variant.imgs && variant.imgs.length > 0) {
				cartItem.imgs = variant.imgs as [string];
			}
		}

		updated.push(cartItem);
	}

	cartItems.set(updated);
}

export function decrementCartItem(
	id: string,
	selectedOptions: SelectedOption[],
	variant?: Variant
) {
	let items = get(cartItems);

	for (let item of items) {
		if (isSameCartItem(item, id, selectedOptions, variant)) {
			if (item.amount > 1) {
				item.amount--;
			} else {
				items = items.filter((i) => !isSameCartItem(i, id, selectedOptions, variant));
			}
			cartItems.set(items);
			return;
		}
	}
}

export function removeFromCart(
	id: string,
	selectedOptions: SelectedOption[] = [],
	variant?: Variant
) {
	let items = get(cartItems);

	// Usar isSameCartItem para comparar correctamente con variantes
	items = items.filter((item) => !isSameCartItem(item, id, selectedOptions, variant));

	cartItems.set(items);
}

export function getTotal() {
	let items = get(cartItems);
	let total = 0;

	for (let item of items) {
		// Usar precio de variante si existe
		const price = getItemPrice(item);
		total += price * item.amount;
	}

	return total;
}

export function removeTotal() {
	cartItems.set([]);
}

// Usar precio de variante si existe
export const subtotal = derived(cartItems, ($cartItems) =>
	$cartItems.reduce((acc, item) => {
		const price = getItemPrice(item);
		return acc + price * item.amount;
	}, 0)
);

// Manejar shippingfee que puede ser undefined/null
export const totalEnvio = derived(cartItems, ($cartItems) =>
	$cartItems.reduce((acc, product) => {
		const fee = Number(product.shippingfee) || 0;
		return acc + fee * product.amount;
	}, 0)
);

export const P_goal = derived(
	[subtotal, totalEnvio],
	([$subtotal, $totalEnvio]) => $subtotal + $totalEnvio
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
			config = { fixed: 0.3, percent: 0.034 };
			break;
		default:
			config = { fixed: 0, percent: 0 };
			break;
	}
	// Fórmula para calcular la comisión
	return (P_goal + config.fixed) / (1 - config.percent) - P_goal;
}

export function computeTotal(paymentMethod: string, P_goal: number): number {
	const commission = computeCommission(paymentMethod, P_goal);
	return P_goal + commission;
}
