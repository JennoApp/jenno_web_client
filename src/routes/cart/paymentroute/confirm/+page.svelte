<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	import { loadScript } from '@paypal/paypal-js';
	import {
		cartItems,
		getTotal,
		subtotal as sub,
		// totalEnvio,
		transferStripe,
		total as T
	} from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { formatPrice } from '$lib/utils/formatprice';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';
	import PaymentButtons from '$lib/components/paymentButtons.svelte';
	import { onMount } from 'svelte';

 
	let shippingData = $page.data?.user?.shippingInfo;

	onMount(() => {
		fetchExchangeRate();
    getPaypalClientId()
	});

  let paypalClientId: string
  async function getPaypalClientId() {
    try {
      const response = await fetch(`/api/paypal`)
      const data = await response.json()

      paypalClientId = data.clientId 
    } catch (error) {
      console.error('Error al solicitar Paypal Id')
    }
  }	

	let items = [];
	let openDialogPayment = false;

	// calcular el subtotal de los productos en el carrito
	$: subtotal = $cartItems.reduce((acc, product) => acc + product.price * product.amount, 0);

	// Calcular el costo total de envío
	$: totalEnvio = $cartItems.reduce(
		(acc, product) => acc + product.shippingfee * product.amount,
		0
	);

	// Calcular la comision del 3%
	const F_fixed = 0;
	const F_percent = 0.03;

	$: P_goal = subtotal + totalEnvio;
	$: P_charge = (P_goal + F_fixed) / (1 - F_percent);
	$: tStripe = P_charge - P_goal;

	// transformar datos para stripe
	$: productsFormattedStripe = $cartItems.map((product) => ({
		price_data: {
			product_data: {
				name: product.productname,
				description: product?.description,
				images: [product.imgs[0]]
			},
			currency: 'cop',
			unit_amount: product.price * 100
		},
		quantity: product.amount
	}));

	// Añadir el ítem de transferencia de Stripe a la lista de productos
	$: productsFormattedStripe.push({
		price_data: {
			product_data: {
				name: 'Transferencia Stripe',
				description: 'Costo de transferencia de Stripe',
				images: []
			},
			currency: 'cop',
			unit_amount: Math.round(tStripe * 100) // Convertir a centavos y redondear
		},
		quantity: 1
	});

	// Añadir el ítem de costo de envío a la lista de productos
	$: productsFormattedStripe.push({
		price_data: {
			product_data: {
				name: 'Costo de Envío',
				description: 'Costo total de envío',
				images: []
			},
			currency: 'cop',
			unit_amount: Math.round(totalEnvio * 100) // Convertir a centavos y redondear
		},
		quantity: 1
	});

	
	////////
	$: console.log($cartItems);
	$: console.log(shippingData);
	$: console.log($location_data);

	//////////////////
	let paypal: any;

	async function paypalInit() {
		try {
			paypal = await loadScript({
				clientId: paypalClientId
			});
		} catch (error) {
			console.error('failed to load the Paypal SDK script', error);
		}

		if (paypal) {
			console.log('paypal started');
			try {
				await paypal
					.Buttons({
						style: {
							color: 'blue',
							shape: 'rect'
						},
						createOrder: function (data: any, actions: any) {
							const formattedUsdEquivalent = parseFloat(usdEquivalent).toFixed(2);
							console.log('usdEquivalent enviado a PayPal:', formattedUsdEquivalent);

							// Set up the transaction
							return actions.order.create({
								purchase_units: [
									{
										amount: {
                      currency_code: "USD",
											value: formattedUsdEquivalent
										}
									}
								],
								application_context: {
									shipping_preference: 'NO_SHIPPING'
								}
							});
						}
					})
					.render('#paypal-button-container');
			} catch (error) {
				console.error('Failed to render the Paypal Buttons', error);
			}
		}
	}

	// $: paypalInit();
	$: if (usdEquivalent > 0) {
		paypalInit(); // Solo inicializa PayPal cuando el valor de usdEquivalent está listo
	}

	let paypalButtonLoaded = false;

	$: if (usdEquivalent && paypalButtonLoaded) {
		document.getElementById('paypal-button-container').innerHTML = ''; // Eliminar el botón existente
		paypalInit(); // Volver a inicializar PayPal con el valor actualizado
	}



	let exchangeRate = 0;
	let usdEquivalent: any;

	// obtener la tasa de cambio de COP a USD
	async function fetchExchangeRate() {
		try {
			const response = await fetch(
				'https://v6.exchangerate-api.com/v6/2f1a8fc7fbff4f769bb0d245/latest/USD'
			);
			const data = await response.json();
			exchangeRate = data.conversion_rates.COP;
		} catch (error) {
			console.error('Error al obtener la tasa de cambio:', error);
		}
	}

	$: if (exchangeRate && $T) {
		usdEquivalent = $T / exchangeRate;
	} else {
		usdEquivalent = 0;
	}

	$: console.log({ exchangeRate });
	$: console.log({ T: $T });
	$: console.log(usdEquivalent);
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
							<div class="flex gap-3">
								<h3>{cartItem.selectedOptions[0].name}:</h3>
								<p>{cartItem.selectedOptions[0].value}</p>
							</div>
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
				<p>{formatPrice(totalEnvio, 'es-CO', 'COP')}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>transferencia</h3>
				<p>{formatPrice($transferStripe, 'es-CO', 'COP')}</p>
			</div>

			<Separator class="bg-[#707070] my-1" />

			<div class="flex justify-between gap-2">
				<h3 class="font-bold">{m.cart_summary_total()}</h3>
				<p>{formatPrice($T, 'es-CO', 'COP')}</p>
			</div>

			<div class="flex flex-row-reverse">
				<h3 class="text-gray-400">Equivalente en Dolares: ${usdEquivalent.toFixed(2)}</h3>
			</div>
		</div>

		<!-- Cofirm Button -->
		<!-- Shipping Submit -->
		<button
			class="h-10 w-10/12 mt-4 border dark:border-[#222222] bg-gray-200 dark:bg-[#202020] rounded-lg font-medium dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#252525]"
			on:click={() => {
				openDialogPayment = true;
			}}
		>
			Pagar
		</button>
		<!-- <div class="w-10/12 mt-3" id="paypal-button-container" />     -->
	</div>
</div>

<!-- Dialog Payment -->
<Dialog.Root bind:open={openDialogPayment}>
	<Dialog.Trigger />
	<Dialog.Content class="max-h-screen">
		<Dialog.Header>
			<Dialog.Title>Opciones de Pago</Dialog.Title>
		</Dialog.Header>
		<Dialog.Description>
			<div class="h-auto">
        {#if usdEquivalent !== 0}
          <PaymentButtons TotalAmount={usdEquivalent} />      
        {/if}	
			</div>
		</Dialog.Description>
	</Dialog.Content>
</Dialog.Root>
