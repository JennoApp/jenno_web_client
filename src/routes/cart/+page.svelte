<script lang="ts">
	import {
		cartItems,
		addToCart,
		decrementCartItem,
		removeFromCart,
		getTotal,
		subtotal as sub,
		transferStripe,
		total as T
	} from '$lib/stores/cartStore';
	import { onDestroy } from 'svelte';
	import * as Table from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';

	/// Total reactivo basado en svelte/store
	let total = getTotal();

	const unsubscribe = cartItems.subscribe(() => {
		total = getTotal();
	});

	onDestroy(() => {
		unsubscribe();
	});
	///

	const calculateTotalShippingFee = (cartitems: any[]) => {
		const items = cartitems.length !== 0 ? cartitems : [];
		let totalShippingFee: number = 0;

		for (const item of items) {
			totalShippingFee += item?.shippingfee * item?.amount;
		}

		return totalShippingFee;
	};

	//////
	// calcular el subtotal de los productos en el carrito
	const subtotal = $cartItems.reduce((acc, product) => acc + product.price * product.amount, 0);

	// Calcular el costo total de envío
	const totalEnvio = $cartItems.reduce(
		(acc, product) => acc + product.shippingfee * product.amount,
		0
	);

	// Calcular la comision del 3%
	const P_goal = subtotal + totalEnvio;
	const F_fixed = 0;
	const F_percent = 0.03;

	const P_charge = (P_goal + F_fixed) / (1 - F_percent);

	// const transferStripe = P_charge - P_goal
</script>

{#if $cartItems.length === 0}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="mdi:cart" height="5rem" width="5rem" class="text-[#707070] mb-4" />

		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.cart_nocart_title()}</h1>
		<p class="text-lg text-[#707070]">
			{m.cart_nocart_p()}
		</p>
	</div>
{:else}
	<div>
		<h1 class="text-2xl m-5">{m.cart_title()}</h1>
	</div>
	<div class="flex flex-col md:flex-col lg:flex-row gap-3">
		<!-- Shopping cart List -->
		<div class="mx-5 lg:w-4/6">
			{#each $cartItems as cartItem}
				<a href={`/${cartItem.username}/${cartItem._id}`} class="cursor-default">
					<div
						class="flex gap-3 items-center rounded-sm mb-3 p-3 relative bg-gray-200 dark:bg-[#202020] hover:dark:bg-[#252525]"
					>
						<img
							class="w-12 h-12 object-cover rounded-sm mr-2"
							src={`${cartItem.imgs[0]}`}
							alt={cartItem.productname}
						/>
						<div class="flex w-full mx-7 justify-between">
							<div class="flex gap-5 items-center">
								<h2 class="text-lg font-semibold">{cartItem.productname}</h2>
								<p class="text-base dark:text-white">
									{formatPrice(cartItem.price, 'es-CO', 'COP')}
								</p>
								<div class="flex gap-3">
									<h3>{cartItem.selectedOptions[0].name}:</h3>
									<p>{cartItem.selectedOptions[0].value}</p>
								</div>
							</div>

							<div class="flex justify-center items-center mt-2 mr-14">
								<button
									on:click|preventDefault={() =>
										decrementCartItem(cartItem._id, cartItem.selectedOptions)}
									class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
								>
									<!-- Minus Icon -->
									<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
								<span class="mx-2">{cartItem.amount}</span>
								<button
									on:click|preventDefault={() => addToCart(cartItem, cartItem.selectedOptions)}
									class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
								>
									<!-- Plus Icon -->
									<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
							</div>
						</div>
						<button
							on:click|preventDefault={() => removeFromCart(cartItem._id, cartItem.selectedOptions)}
							class="absolute top-2 right-2 dark:text-white hover:text-primary cursor-pointer"
						>
							<!-- Close Icon -->
							<iconify-icon icon="ic:round-close" height="1.5rem" width="1.5rem"></iconify-icon>
						</button>
					</div>
				</a>
			{/each}
		</div>

		<!-- Shopping cart Order Summary -->
		<div class="lg:w-2/6 h-auto md:mr-5 p-2 bg-gray-200 dark:bg-[#202020] rounded-sm">
			<h2 class="text-lg">{m.cart_sumary_title()}</h2>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.cart_order_tableheader_name()}</Table.Head>
						<Table.Head>{m.cart_order_tableheader_shop()}</Table.Head>
						<Table.Head>{m.cart_order_tableheader_price()}</Table.Head>
						<Table.Head>{m.cart_order_tableheader_quantity()}</Table.Head>
						<Table.Head>Opciones</Table.Head>
						<Table.Head>{m.cart_order_tableheader_total()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each $cartItems as cartItem}
						<Table.Row>
							<Table.Cell>{cartItem.productname}</Table.Cell>
							<Table.Cell
								><a href={`/${cartItem.username}`} class="hover:underline">@{cartItem.username}</a
								></Table.Cell
							>
							<Table.Cell>{formatPrice(cartItem.price, 'es-CO', 'COP')}</Table.Cell>
							<Table.Cell class="mx-3">{cartItem.amount}</Table.Cell>
							<Table.Cell
								>{cartItem.selectedOptions[0].name}: {cartItem.selectedOptions[0].value}</Table.Cell
							>
							<Table.Cell
								>{formatPrice(cartItem.price * cartItem.amount, 'es-CO', 'COP')}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<!-- Subtotal -->
			<div class="flex justify-between my-1 mt-3 mr-5">
				<h3>{m.cart_summary_subtotal()}</h3>
				<p>{formatPrice(Number(total.toFixed(0)), 'es-CO', 'COP')}</p>
			</div>

			<!-- Delivery -->
			<!-- <div class="flex justify-between my-1 mr-5">
				<div class="flex gap-1">
					<h3>{m.cart_summary_shipment()}</h3>
					<!- {#if $location_data !== undefined}
            <h3>-</h3>
            <h3 class="ml-1 font-semibold">{$location_data?.data[0].region}</h3>
          {/if} ->
				</div>
				<p>{formatPrice(calculateTotalShippingFee($cartItems), 'es-CO', 'COP')}</p>
			</div> -->

			<!-- Delivery -->
			<div class="flex justify-between my-1 mr-5">
				<div class="flex gap-1">
					<h3>{m.cart_summary_shipment()}</h3>
					<h3 class="ml-1 text-sm text-gray-500">
						(El envío se coordinará manualmente y se paga contra entrega)
					</h3>
				</div>
				<p class="text-gray-400 text-sm">Beta: Sin costos de envío automáticos</p>
			</div>
			<!-- tax -->
			<div class="flex justify-between my-1 mr-5">
				<h3>transferencia</h3>
				<p>{formatPrice($transferStripe, 'es-CO', 'COP')}</p>
			</div>

			<Separator class="bg-[#707070] my-2" />

			<!-- Total -->
			<div class="flex justify-between my-1 mr-5 mt-2">
				<h3 class="font-bold">{m.cart_summary_total()}</h3>
				<p>{formatPrice($T, 'es-CO', 'COP')}</p>
			</div>

			<button
				class="bg-gray-300 hover:bg-gray-400 dark:bg-[#303030] border-none rounded w-full h-12 font-medium dark:text-white text-base cursor-pointer hover:dark:bg-[#353535]"
				on:click={() => goto('/cart/paymentroute/shipping')}
			>
				{m.cart_summary_button()}
			</button>
		</div>
	</div>
{/if}
