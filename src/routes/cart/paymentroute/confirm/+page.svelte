<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		cartItems,
		computeTotal,
		computeCommission,
		subtotal as sub
		// totalEnvio,
	} from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { formatPrice } from '$lib/utils/formatprice';
	import * as m from '$paraglide/messages';
	import PaymentButtons from '$lib/components/paymentButtons.svelte';
	import { onMount } from 'svelte';
	import { paymentMethod } from '$lib/stores/paymentMethod';

	let shippingData = $page.data?.user?.shippingInfo;
	let openDialogPayment = false;

	// Estado del carrito y calculos
	$: subtotal = $cartItems.reduce((acc, product) => acc + product.price * product.amount, 0);
	$: totalEnvio = $cartItems.reduce(
		(acc, product) => acc + product.shippingfee * product.amount,
		0
	);
	$: P_goal = subtotal + totalEnvio;

	$: transferAmount = computeCommission($paymentMethod, P_goal);

	// total a pagar segun metodo de pago seleccionado
	$: total = computeTotal($paymentMethod, P_goal);

	// Conversion a USD (solo para PayPal)
	let exchangeRate = 0;
	let usdEquivalent: number = 0;
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

	$: if (exchangeRate && total) {
		if ($paymentMethod === 'paypal') {
			usdEquivalent = parseFloat(((total + 0.3) / exchangeRate).toFixed(2));
		} else {
			usdEquivalent = parseFloat((total / exchangeRate).toFixed(2));
		}
	} else {
		usdEquivalent = 0;
	}

	$: console.log({ exchangeRate, T: total, usdEquivalent });

	async function payWithMercadoPago() {
		try {
			// Construir items para la preferencia de Mercado Pago
			const items = $cartItems.map((item) => ({
				title: item.productname,
				description: item.description,
				quantity: item.amount,
				currency_id: 'COP',
				unit_price: item.price
			}));

			// Calcular la comisión para Mercado Pago
			const commission = computeCommission('mercadopago', P_goal);

      const commissionRounded = Math.round(commission);

			// Agregar un item adicional para el costo de la transferencia (comisión)
			items.push({
				title: 'Comisión de transferencia',
				description: 'Costo de transferencia de pago con Mercado Pago',
				quantity: 1,
				currency_id: 'COP',
				unit_price: commissionRounded
			});

			// Crear Preferencia de Mercado Pago
			const response = await fetch('/api/mercadopago', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items,
					email: $page.data.user.email
				})
			});

			const data = await response.json();
			if (data.init_point) {
				window.location.href = data.init_point;
			} else {
				toast.error('No se pudo iniciar el pago con Mercado Pago');
			}
		} catch (error) {
			console.error('Error al pagar con Mercado Pago:', error);
			toast.error('Error al iniciar pago con Mercado Pago');
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

<div class="flex flex-col lg:flex-row md:w-3/5 lg:w-10/12 mx-auto mt-5">
	<div class="lg:w-3/5 p-3">
		{#each $cartItems as cartItem}
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
							<!-- Mostrar selectedOptions solo si existen -->
							{#if cartItem.selectedOptions && cartItem.selectedOptions.length > 0}
								<div class="flex gap-3">
									<h3>{cartItem.selectedOptions[0].name}:</h3>
									<p>{cartItem.selectedOptions[0].value}</p>
								</div>
							{/if}
							<p class="text-base dark:text-white">{formatPrice(cartItem.price, 'es-Co', 'COP')}</p>
							<div class="flex gap-1">
								<h3>Cantidad:</h3>
								<span class="mx-2">{cartItem.amount}</span>
							</div>
						</div>
					</div>
				</div>
			</a>
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
				<p>{formatPrice($sub, 'es-CO', 'COP')}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>{m.cart_summary_shipment()}</h3>
				(El envío se paga contra entrega)
			</div>
			<div class="flex justify-between gap-2">
				<h3>transferencia</h3>
				<p>{formatPrice(transferAmount, 'es-CO', 'COP')}</p>
			</div>

			<Separator class="bg-[#707070] my-1" />

			<div class="flex justify-between gap-2">
				<h3 class="font-bold">{m.cart_summary_total()}</h3>
				<p>{formatPrice(total, 'es-CO', 'COP')}</p>
			</div>

			{#if $paymentMethod === 'paypal'}
				<div class="flex flex-row-reverse">
					<h3 class="text-gray-400">Equivalente en Dolares: ${usdEquivalent.toFixed(2)}</h3>
				</div>
			{/if}
		</div>

		<!-- Cofirm Button -->
		<!-- Shipping Submit -->
		<button
			class="h-10 w-10/12 mt-4 border dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg font-medium dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			on:click|preventDefault={() => handlePaymentButton()}
		>
			Pagar
		</button>
		<!-- <div class="w-10/12 mt-3" id="paypal-button-container" />     -->
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
