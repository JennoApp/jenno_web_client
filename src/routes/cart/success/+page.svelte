<script lang="ts">
	import { goto } from '$app/navigation';
	import { removeTotal, cartItems } from '$lib/stores/cartStore';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import Progress from '$lib/components/ui/progress/progress.svelte';

	// State reactivo con runes de Svelte 5
	let serverUrl = $state<string>('');
	let ordersCreated = $state(false);
	let progressValue = $state(0);

	// Derivar el usuario desde la página
	let user = $derived(page.data.user);
	let searchParams = $derived(page.url.searchParams);

	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();
			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server Url:', error);
		}
	}

	/**
	 * Prepara los datos de la orden dependiendo del tipo de producto
	 * @param item - Item del carrito
	 */
	function prepareOrderData(
		item: any,
		buyerId: string,
		buyerName: string,
		buyerProfileImg: string
	) {
		// Determinar si es un producto con variante compleja o simple
		const hasVariant = item.selectedVariant && item.selectedVariant.options;

		let finalPrice: number | null;
		let finalSelectedOptions: Array<{ name: string; value: string }>;

		if (hasVariant) {
			// Producto con variante compleja
			finalPrice = item.selectedVariant.price;
			finalSelectedOptions = item.selectedVariant.options || [];
		} else {
			// Producto simple
			finalPrice = item.price;
			finalSelectedOptions = item.selectedOptions || [];
		}

		return {
			product: item,
			buyerId,
			sellerId: item?.user,
			buyerName,
			buyerProfileImg,
			amount: item.amount,
			price: finalPrice,
			status: 'pending',
			selectedOptions: finalSelectedOptions,
			// Incluir información de la variante si existe
			...(hasVariant && {
				variant: {
					sku: item.selectedVariant.sku,
					price: item.selectedVariant.price,
					meta: item.selectedVariant.meta
				}
			})
		};
	}

	async function createOrders() {
		const items = $cartItems;
		const buyer = user;

		if (!items || items.length === 0) {
			toast.error('El carrito está vacío');
			return;
		}

		if (!buyer) {
			toast.error('No se encontró la información del comprador');
			return;
		}

		const buyerId = buyer?._id;
		const buyerName = buyer?.username;
		let buyerProfileImg = buyer?.profileImg || '';

		try {
			await getServerUrl();
			if (!serverUrl) {
				toast.error('No se pudo obtener la URL del servidor');
				return;
			}

			// Calcular cuánto avanza la barra por cada item creado
			const totalItems = items.length;
			const increment = 100 / totalItems;

			for (let item of items) {
				const maxAttempts = 3;
				let success = false;
				let attempts = 0;

				while (!success && attempts < maxAttempts) {
					try {
						const orderData = prepareOrderData(item, buyerId, buyerName, buyerProfileImg);

						console.log('Intentando crear orden:', orderData);

						const response = await fetch(`${serverUrl}/orders/createOrder`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(orderData)
						});

						if (!response.ok) {
							const errorText = await response.text();
							console.error('Backend Error:', errorText);
							throw new Error(`Error al crear la orden: ${response.statusText}`);
						}

						success = true;
						progressValue += increment;
					} catch (error) {
						console.error(`Intento ${attempts + 1} fallido:`, error);
						attempts++;
						if (attempts >= maxAttempts) {
							throw new Error(`Error al crear la orden después de ${maxAttempts} intentos`);
						}
					}
				}
			}

			// Forzar 100% al finalizar
			progressValue = 100;

			toast.success('Todas las órdenes se han creado correctamente');

			// Vaciar el carrito
			removeTotal();

			// Recargar la página
			location.reload();
		} catch (error: any) {
			toast.error(`Error: ${error.message}`);
		}
	}

	// Effect para manejar la creación automática de órdenes
	$effect(() => {
		if (user && !ordersCreated && searchParams) {
			const mercadoPagoStatus = searchParams.get('status');
			const paypalSuccess = searchParams.get('paymentSuccess');

			if (mercadoPagoStatus === 'approved' || paypalSuccess === '1') {
				ordersCreated = true;
				createOrders();
			}
		}
	});

	// Log para debugging
	$inspect('Cart Items:', $cartItems);
</script>

<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
	<!-- Ícono de éxito -->
	<iconify-icon
		icon="material-symbols:check-circle-outline"
		height="5rem"
		width="5rem"
		class="text-green-500 mb-4"
	></iconify-icon>

	<h1 class="text-2xl font-semibold text-gray-200 mb-2">Pago Exitoso</h1>

	{#if $cartItems.length !== 0}
		<p class="text-md text-gray-400 mb-6">
			Estamos creando tus órdenes. ¡Por favor, espera un momento!
		</p>
		<!-- Barra de progreso -->
		<Progress value={progressValue} class="w-3/4" />
	{:else}
		<p class="text-md text-gray-400 mb-6">
			Tus órdenes se han creado correctamente. ¡Gracias por tu compra!
		</p>

		<button
			class="dark:bg-[#303030] w-44 h-10 rounded-lg hover:dark:bg-[#353535] mt-8"
			onclick={() => goto('/')}
		>
			Volver a la tienda
		</button>
	{/if}
</div>
