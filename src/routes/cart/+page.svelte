<script>
	// @ts-nocheck

	import {
		cartItems,
		addToCart,
		decrementCartItem,
		removeFromCart,
		getTotal
	} from '$lib/stores/cartStore';
	import { onDestroy } from 'svelte';
	import * as Table from '$lib/components/ui/table';

	/// Total reactivo basado en svelte/store
	let total = getTotal();

	const unsubscribe = cartItems.subscribe(() => {
		total = getTotal();
	});

	onDestroy(() => {
		unsubscribe();
	});
	///
</script>

<div>
	<h1 class="text-2xl m-5">Shopping Cart</h1>
</div>

{#if $cartItems.length === 0}
	<div class="w- full flex m-5">
		<h2>Agregar Items al Carrito!</h2>
	</div>
{:else}
	<div class="flex">
		<!-- Shopping cart List -->
		<div class="mx-5 w-4/6">
			{#each $cartItems as cartItem}
				<a href={`/${cartItem.username}/${cartItem._id}`} class="cursor-default">
					<div
						class="flex gap-3 items-center rounded-sm mb-3 p-3 relative dark:bg-[#202020] hover:dark:bg-[#252525]"
					>
						<img
							class="w-12 h-12 object-cover rounded-sm mr-2"
							src={`${cartItem.imgs[0]}`}
							alt={cartItem.productname}
						/>
						<div class="flex w-full mx-7 justify-between">
							<div class="flex gap-5 items-center">
								<h2 class="text-lg font-semibold">{cartItem.productname}</h2>
								<p class="text-base text-white">${cartItem.price}</p>
							</div>

							<div class="flex justify-center items-center mt-2 mr-14">
								<button
									on:click|preventDefault={() => decrementCartItem(cartItem._id)}
									class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
								>
									<!-- Minus Icon -->
									<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
								<span class="mx-2">{cartItem.amount}</span>
								<button
									on:click|preventDefault={() => addToCart(cartItem)}
									class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
								>
									<!-- Plus Icon -->
									<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
							</div>
						</div>
						<button
							on:click|preventDefault={() => removeFromCart(cartItem._id)}
							class="absolute top-2 right-2 text-white hover:text-primary cursor-pointer"
						>
							<!-- Close Icon -->
							<iconify-icon icon="ic:round-close" height="1.5rem" width="1.5rem"></iconify-icon>
						</button>
					</div>
				</a>
			{/each}
		</div>

		<!-- Shopping cart Order Summary -->
		<div class="w-2/6 h-auto mr-5 p-2 bg-[#202020] rounded-sm">
			<h2 class="text-lg">Order Summary</h2>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Shop</Table.Head>
						<Table.Head>Price</Table.Head>
						<Table.Head>Quantity</Table.Head>
						<Table.Head>total</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each $cartItems as cartItem}
						<Table.Row>
							<Table.Cell>{cartItem.productname}</Table.Cell>
							<Table.Cell><a href={`/${cartItem.username}`} class="hover:underline">@{cartItem.username}</a></Table.Cell>
							<Table.Cell>${cartItem.price}</Table.Cell>
							<Table.Cell class="flex justify-center">{cartItem.amount}</Table.Cell>
							<Table.Cell>${cartItem.price * cartItem.amount}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
			<!-- Delivery -->
			<div class="flex justify-between my-2 mt-5 mr-5">
				<h3>Envio</h3>
				<p>$0.00</p>
			</div>
			<div class="flex my-2 mr-5">
				<!-- Close Icon -->
				<iconify-icon icon="tabler:map-pin-filled" height="1.5rem" width="1.5rem"></iconify-icon>
				<h3 class="ml-1">Deliver to</h3>
				<h3 class="ml-1 font-bold">Bogota - Colombia</h3>
			</div>

			<!-- Amount and tax -->
			<div class="flex justify-between my-2 mt-5 mr-5">
				<h3>Amount</h3>
				<p>${total.toFixed(0)}</p>
			</div>
			<div class="flex justify-between my-2 mr-5">
				<h3>Tax</h3>
				<p>${(total * 0.15).toFixed(2)}</p>
			</div>

			<!-- Total -->
			<div class="flex justify-between my-2 mr-5 mt-5">
				<h3>Order Total</h3>
				<p>${total + total * 0.15}</p>
			</div>

			<button
				class="dark:bg-[#303030] border-none rounded w-full h-12 text-white text-base cursor-pointer hover:dark:bg-[#353535]"
			>
				Checkout
			</button>
		</div>
	</div>
{/if}
