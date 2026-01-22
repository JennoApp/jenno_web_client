<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		cartItems,
		computeTotal,
		computeCommission,
		subtotal,
		totalEnvio,
		P_goal,
		getItemPrice
	} from '$lib/stores/cartStore';
	import { page } from '$app/state';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { formatPrice } from '$lib/utils/formatprice';
	import * as m from '$paraglide/messages';
	import PaymentButtons from '$lib/components/paymentButtons.svelte';
	import { onMount } from 'svelte';
	import { paymentMethod } from '$lib/stores/paymentMethod';
	import MercadoPagoLoader from '$lib/components/MercadoPagoLoader.svelte';

	let shippingData = page.data?.user?.shippingInfo;
	let openDialogPayment = $state(false);
	let isCreatingPreference = $state(false);

	// Conversion a USD (solo para PayPal)
	let exchangeRate = $state(0);
	let usdEquivalent = $state(0);

	onMount(() => {
		if ($paymentMethod === 'paypal') {
			fetchExchangeRate();
		}
	});

	async function fetchExchangeRate() {
		try {
			const response = await fetch(
				'https://v6.exchangerate-api.com/v6/0d8412accab4eaef08baff7f/latest/USD'
			);
			const data = await response.json();
			exchangeRate = data.conversion_rates.COP;
		} catch (error) {
			console.error('Error al obtener la tasa de cambio:', error);
		}
	}

	$effect(() => {
		const total = computeTotal($paymentMethod ?? 'mercadopago', $P_goal);

		if (!exchangeRate || !total) {
			usdEquivalent = 0;
			return;
		}

		if ($paymentMethod === 'paypal') {
			usdEquivalent = Number(((total + 0.3) / exchangeRate).toFixed(2));
		} else {
			usdEquivalent = Number((total / exchangeRate).toFixed(2));
		}
	});

	// Debug: ver los valores
	$effect(() => {
		console.log('Debug valores:', {
			subtotal: $subtotal,
			totalEnvio: $totalEnvio,
			P_goal: $P_goal,
			paymentMethod: $paymentMethod,
			transferencia: computeCommission($paymentMethod ?? 'mercadopago', $P_goal),
			total: computeTotal($paymentMethod ?? 'mercadopago', $P_goal)
		});
	});

	/**
	 * Construye la representación de items que el backend espera.
	 * Incluye selectedOptions, selectedVariant (si existe), imgs, sellerId, unit_price redondeado.
	 */
	function buildPreferenceItems() {
		return $cartItems.map((item) => {
			const unitPrice = getItemPrice(item);

			if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
				throw new Error(`Producto sin precio válido: ${item.productname} (id: ${item._id})`);
			}

			return {
				// id que identifica el producto/variant
				id: item.selectedVariant?._id ?? item._id,
				title: item.productname,
				description: item.description ?? '',
				quantity: Number(item.amount) || 1,
				currency_id: 'COP',
				unit_price: Math.round(Number(unitPrice)),
				// snapshot útil para crear órdenes en backend
				selectedOptions: item.selectedOptions ?? [],
				selectedVariant: item.selectedVariant ?? null,
				imgs: item.imgs ?? [],
				sellerId: item.user ?? item.username ?? null,
				// opcional: incluir product snapshot si lo necesitas
				productSnapshot: {
					_id: item._id,
					price: item.price,
					productname: item.productname
				}
			};
		});
	}

	async function payWithMercadoPago() {
		try {
			// UI guard
			isCreatingPreference = true;

			localStorage.removeItem('mercadopago_preference_id');
			localStorage.removeItem('mp-preference-id');

			// Validación básica
			if (!$cartItems || $cartItems.length === 0) {
				toast.error('El carrito está vacío');
				isCreatingPreference = false;
				return;
			}

			// Construir items con snapshot
			const items = buildPreferenceItems(); // lanza si hay item con precio inválido

			// Build buyer snapshot (envíalo para que backend lo guarde con el Payment)
			const buyer = {
				_id: page.data.user?._id ?? null,
				email: page.data.user?.email ?? '',
				name: page.data.user?.name ?? page.data.user?.username ?? '',
				lastname: page.data.user?.lastname ?? '',
				document: page.data.user?.document ?? '',
				documentType: page.data.user?.documentType ?? 'CC',
				username: page.data.user?.username ?? '',
				profileImg: page.data.user?.profileImg ?? ''
			};

			// Ajuste del P_goal (misma lógica que ya tienes en backend/otros cálculos)
			const rawPgoal = Number($P_goal ?? 0);
			const PGoalAdjusted = rawPgoal < 20000 && rawPgoal > 0 ? rawPgoal * 0.95 : rawPgoal;

			// Calcular la comisión y añadirla como item si aplica
			const commission = computeCommission('mercadopago', PGoalAdjusted);
			const commissionRounded = Math.round(commission);
			if (commissionRounded > 0) {
				items.push({
					id: 'commission',
					title: 'Comisión de transferencia',
					description: 'Costo de transferencia de pago con Mercado Pago',
					quantity: 1,
					currency_id: 'COP',
					unit_price: commissionRounded,
					selectedOptions: [],
					selectedVariant: null,
					imgs: [],
					sellerId: null,
					productSnapshot: { _id: 'commission', price: commissionRounded, productname: 'Comisión' }
				});
			}

			// Llamada al nuevo endpoint del backend que crea Payment + preference
			// Ajusta la ruta si tu backend la expone en otro path.
			const response = await fetch('/api/payments/mercadopago/preference', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items,
					buyer
				})
			});

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				console.error('Error servidor MP (backend):', response.status, data);
				toast.error(
					(data && (data.message || data.error)) ||
						'Error creando preferencia Mercado Pago (servidor)'
				);
				isCreatingPreference = false;
				return;
			}

			// backend devuelve initPoint, externalReference, paymentId
			if (data?.initPoint) {
				// opcional: guardar preference/payment ids en localStorage para debugging o seguimiento
				try {
					if (data.preferenceId)
						localStorage.setItem('mercadopago_preference_id', data.preferenceId);
					if (data.externalReference)
						localStorage.setItem('mp-external-reference', data.externalReference);
					if (data.paymentId) localStorage.setItem('mp-payment-id', data.paymentId);
				} catch (e) {
					/* ignore storage errors */
				}

				// redirigir al init_point de MercadoPago
				window.location.href = data.initPoint;
			} else {
				console.error('MP no devolvió initPoint:', data);
				toast.error('No se pudo iniciar el pago con Mercado Pago');
			}
		} catch (error: any) {
			console.error('Error al pagar con Mercado Pago:', error);
			toast.error(error?.message ?? 'Error al iniciar pago con Mercado Pago');
		} finally {
			isCreatingPreference = false;
		}
	}

	async function handlePaymentButton() {
		if ($paymentMethod === 'mercadopago') {
			await payWithMercadoPago();
		} else {
			openDialogPayment = true;
			toast.info('Si experimentas problemas, desactiva extensiones como bloqueadores de anuncios.');
		}
	}
</script>

<MercadoPagoLoader />

<div class="flex flex-col lg:flex-row md:w-3/5 lg:w-10/12 mx-auto mt-5">
	<div class="lg:w-3/5 p-3">
		{#each $cartItems as cartItem}
			{#if cartItem?.username && cartItem?._id}
				<a href={`/${cartItem.username}/${cartItem._id}`} class="cursor-default">
					<div
						class="flex gap-3 items-center rounded-lg mb-3 p-3 relative bg-gray-200 dark:bg-[#202020] hover:dark:bg-[#252525]"
					>
						<img
							class="w-12 h-12 object-cover rounded-sm mr-2"
							src={`${cartItem.imgs[0]}`}
							alt={cartItem.productname}
						/>
						<div class="flex w-full mx-7 justify-between">
							<div class="flex gap-5 items-center">
								<h2 class="text-lg font-semibold">{cartItem.productname}</h2>
								<!-- Opciones seleccionadas (simples + variantes) -->
								<div class="flex flex-wrap gap-1 mt-1">
									<!-- Opciones simples -->
									{#if cartItem.selectedOptions?.length}
										{#each cartItem.selectedOptions as opt}
											<span class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40">
												<strong>{opt.name}:</strong>
												{opt.value}
											</span>
										{/each}
									{/if}

									<!-- Opciones de variante (options) -->
									{#if cartItem.selectedVariant?.options?.length}
										{#each cartItem.selectedVariant.options as opt}
											<span class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40">
												<strong>{opt.name}:</strong>
												{opt.value}
											</span>
										{/each}
									{/if}

									<!-- Meta de variante (ej: color) -->
									{#if cartItem.selectedVariant?.meta}
										{#each Object.entries(cartItem.selectedVariant.meta) as [key, value]}
											<span class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40">
												<strong>{key}:</strong>
												{value}
											</span>
										{/each}
									{/if}
								</div>
								<p class="text-base dark:text-white">
									{formatPrice(getItemPrice(cartItem), 'es-Co', 'COP')}
								</p>
								<div class="flex gap-1">
									<h3>Cantidad:</h3>
									<span class="mx-2">{cartItem.amount}</span>
								</div>
							</div>
						</div>
					</div>
				</a>
			{/if}
		{/each}
	</div>

	<div class="flex flex-col items-center lg:w-2/5 h-full mx-2">
		<div class="bg-gray-200 dark:bg-[#202020] w-full lg:w-10/12 h-5/6 m-3 p-3 rounded-lg">
			<h3 class="text-md font-semibold">{m.cart_paymentroute_shipping_title()}</h3>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_address()}:</h3>
				<p>{shippingData?.address}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_country()}:</h3>
				<p>{shippingData?.country}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_state()}:</h3>
				<p>{shippingData?.state}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_city()}:</h3>
				<p>{shippingData?.city}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_postal()}:</h3>
				<p>{shippingData?.postalCode}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_paymentroute_shipping_phone()}:</h3>
				<p>{shippingData?.phoneNumber}</p>
			</div>

			<!-- Order Summary -->
			<h3 class="text-md font-semibold mt-3">{m.cart_sumary_title()}</h3>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_summary_subtotal()}</h3>
				<!-- ✅ Usar directamente el store con $ -->
				<p>{formatPrice($subtotal, 'es-CO', 'COP')}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_summary_shipment()}</h3>
				(El envío se paga contra entrega)
			</div>
			<div class="flex justify-between gap-2">
				<h3>transferencia</h3>
				<!-- ✅ Calcular directamente con los stores -->
				<p>
					{formatPrice(computeCommission($paymentMethod ?? 'mercadopago', $P_goal), 'es-CO', 'COP')}
				</p>
			</div>

			<Separator class="bg-[#707070] my-1" />

			<div class="flex justify-between gap-2">
				<h3 class="font-bold">{m.cart_summary_total()}</h3>
				<!-- ✅ Calcular directamente con los stores -->
				<p>{formatPrice(computeTotal($paymentMethod ?? 'mercadopago', $P_goal), 'es-CO', 'COP')}</p>
			</div>

			{#if $paymentMethod === 'paypal'}
				<div class="flex flex-row-reverse">
					<h3 class="text-gray-400">Equivalente en Dolares: ${usdEquivalent.toFixed(2)}</h3>
				</div>
			{/if}
		</div>

		<!-- Confirm Button -->
		<button
			class="h-10 w-10/12 mt-4 bg-gray-200 dark:bg-[#202020] rounded-lg font-medium dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			onclick={(e) => {
				e.preventDefault();
				handlePaymentButton();
			}}
		>
			Pagar
		</button>
	</div>
</div>

<!-- Dialog Payment -->
<Dialog.Root bind:open={openDialogPayment}>
	<Dialog.Trigger />
	<Dialog.Content
		class="max-h-screen overflow-auto [&::-webkit-scrollbar]:w-2
           [&::-webkit-scrollbar-track]:rounded-full
         [&::-webkit-scrollbar-track]:bg-gray-100
           [&::-webkit-scrollbar-thumb]:rounded-full
         [&::-webkit-scrollbar-thumb]:bg-gray-300
         dark:[&::-webkit-scrollbar-track]:bg-neutral-700
         dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
	>
		<Dialog.Description>
			<div class="h-auto">
				{#if $paymentMethod === 'nequi'}
					<p class="text-center text-lg font-semibold">Paga con Nequi</p>
				{:else if $paymentMethod === 'paypal'}
					{#if usdEquivalent !== 0}
						<PaymentButtons TotalAmount={usdEquivalent} />
					{/if}
				{/if}
			</div>
		</Dialog.Description>
	</Dialog.Content>
</Dialog.Root>
