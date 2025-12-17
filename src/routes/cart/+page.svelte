<script lang="ts">
	import {
		cartItems,
		addToCart,
		decrementCartItem,
		removeFromCart,
		getItemPrice, // ✅ Importar getItemPrice
		subtotal,
		totalEnvio,
		P_goal
	} from '$lib/stores/cartStore';
	import * as Table from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import * as m from '$paraglide/messages';
</script>

{#if $cartItems.length === 0}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="mdi:cart" height="5rem" width="5rem" class="text-[#707070] mb-4"
		></iconify-icon>

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
								<!-- ✅ CORRECCIÓN: Usar getItemPrice para mostrar precio correcto -->
								<p class="text-base dark:text-white">
									{formatPrice(getItemPrice(cartItem), 'es-CO', 'COP')}
								</p>
								<!-- Mostrar selectedOptions solo si existen -->
								{#if cartItem.selectedOptions?.length || cartItem.selectedVariant}
									{@const displayOptions = [
										...(cartItem.selectedOptions ?? []),
										...(cartItem.selectedVariant?.options ?? []),
										...(cartItem.selectedVariant?.meta?.color
											? [{ name: 'Color', value: cartItem.selectedVariant.meta.color }]
											: [])
									]}

									<div class="flex flex-wrap gap-1 mt-1">
										{#each displayOptions as opt}
											<span
												class="px-2 py-0.5 text-xs rounded-md
               bg-blue-200 dark:bg-blue-900/40
               text-blue-900 dark:text-blue-200"
											>
												<strong>{opt.name}:</strong>
												{opt.value}
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<div class="flex justify-center items-center mt-2 mr-14">
								<button
									onclick={(e) => {
										e.preventDefault();
										// ✅ CORRECCIÓN: Pasar la variante
										decrementCartItem(
											cartItem._id,
											cartItem.selectedOptions ?? [],
											cartItem.selectedVariant ?? null
										);
									}}
									class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary hover:bg-gray-300 dark:hover:bg-[#303030] transition-colors"
								>
									<!-- Minus Icon -->
									<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
								<span class="mx-2">{cartItem.amount}</span>
								<button
									onclick={(e) => {
										e.preventDefault();
										const maxStock = cartItem.selectedVariant?.quantity ?? cartItem.quantity;
										const canAdd = cartItem.amount < maxStock;
										if (canAdd) {
											addToCart(
												cartItem,
												cartItem.selectedOptions ?? [],
												1,
												cartItem.selectedVariant ?? null
											);
										}
									}}
									disabled={cartItem.amount >=
										(cartItem.selectedVariant?.quantity ?? cartItem.quantity)}
									class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary hover:bg-gray-300 dark:hover:bg-[#303030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<!-- Plus Icon -->
									<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
								</button>
							</div>
						</div>
						<button
							onclick={(e) => {
								e.preventDefault();
								removeFromCart(
									cartItem._id,
									cartItem.selectedOptions ?? [],
									cartItem.selectedVariant ?? null
								);
							}}
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
						<!-- Mostrar selectedOptions solo si existen -->
						{#if $cartItems.some((cartItem) => cartItem.selectedOptions?.length || cartItem.selectedVariant)}
							<Table.Head>Opciones</Table.Head>
						{/if}
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
							<!-- ✅ CORRECCIÓN: Usar getItemPrice -->
							<Table.Cell>{formatPrice(getItemPrice(cartItem), 'es-CO', 'COP')}</Table.Cell>
							<Table.Cell class="mx-3">{cartItem.amount}</Table.Cell>
							<!-- Mostrar las opciones o una "—" si no existen -->
							{#if $cartItems.some((cartItem) => cartItem.selectedOptions?.length || cartItem.selectedVariant)}
								<Table.Cell>
									{@const displayOptions = [
										...(cartItem.selectedOptions ?? []),
										...(cartItem.selectedVariant?.options ?? []),
										...(cartItem.selectedVariant?.meta?.color
											? [{ name: 'Color', value: cartItem.selectedVariant.meta.color }]
											: [])
									]}

									{#if displayOptions.length}
										<div class="flex flex-wrap gap-1">
											{#each displayOptions as opt}
												<span
													class="px-2 py-0.5 text-xs rounded-md
                 bg-blue-200 dark:bg-blue-900/40
                 text-blue-900 dark:text-blue-200"
												>
													<strong>{opt.name}:</strong>
													{opt.value}
												</span>
											{/each}
										</div>
									{:else}
										<span class="text-gray-400 text-xs">—</span>
									{/if}
								</Table.Cell>
							{/if}
							<!-- ✅ CORRECCIÓN: Usar getItemPrice para el total -->
							<Table.Cell
								>{formatPrice(getItemPrice(cartItem) * cartItem.amount, 'es-CO', 'COP')}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<!-- Subtotal -->
			<div class="flex justify-between my-1 mt-3 mr-5">
				<h3>{m.cart_summary_subtotal()}</h3>
				<!-- ✅ CORRECCIÓN: Usar el store subtotal directamente -->
				<p>{formatPrice($subtotal, 'es-CO', 'COP')}</p>
			</div>

			<!-- Envío -->
			<div class="flex justify-between my-1 mr-5">
				<div class="flex gap-1">
					<h3 class="font-semibold">{m.cart_summary_shipment()}</h3>
				</div>
				<p class="text-gray-400 text-sm">(Se paga contra entrega)</p>
			</div>

			<!-- Comisión de Pago -->
			<div class="flex justify-between my-1 mr-5">
				<h3 class="font-semibold">Comisión de Pago</h3>
				<p class="text-gray-400 text-sm">Se calculará al elegir método de pago</p>
			</div>

			<Separator class="bg-[#707070] my-2" />

			<!-- Total -->
			<div class="flex justify-between my-1 mr-5 mt-2">
				<h3 class="font-bold">{m.cart_summary_total()}</h3>
				<!-- ✅ Mostrar subtotal como total preliminar -->
				<p class="font-bold">{formatPrice($subtotal, 'es-CO', 'COP')}</p>
			</div>
			<p class="text-xs text-gray-500 text-right mr-5">
				+ comisión de pago (se calculará en el siguiente paso)
			</p>

			<button
				class="bg-gray-300 hover:bg-gray-400 dark:bg-[#303030] border-none rounded w-full h-12 font-medium dark:text-white text-base cursor-pointer hover:dark:bg-[#353535] mt-3"
				onclick={(e) => {
					e.preventDefault();
					goto('/cart/paymentroute/shipping');
				}}
			>
				{m.cart_summary_button()}
			</button>
		</div>
	</div>
{/if}
