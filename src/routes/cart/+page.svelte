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
	<!-- =========================================================
	     CARRITO VACÍO
	========================================================== -->

	<div class="min-h-[calc(100vh-56px)] w-full flex items-center justify-center px-4">
		<div
			class="w-full max-w-md
			       rounded-2xl
			       border border-gray-200 dark:border-[#303030]
			       bg-white dark:bg-[#161616]
			       shadow-sm
			       px-6 py-10
			       text-center"
		>
			<div
				class="mx-auto mb-5
				       w-20 h-20
				       rounded-full
				       bg-gray-100 dark:bg-[#202020]
				       flex items-center justify-center"
			>
				<iconify-icon
					icon="mdi:cart-outline"
					height="2.5rem"
					width="2.5rem"
					class="text-gray-400 dark:text-gray-500"
				></iconify-icon>
			</div>

			<h1 class="text-xl font-semibold dark:text-gray-200">
				{m.cart_nocart_title()}
			</h1>

			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				{m.cart_nocart_p()}
			</p>

			<button
				type="button"
				class="mt-6 h-11 px-6
				       rounded-xl
				       bg-gray-900 dark:bg-white
				       text-white dark:text-black
				       font-semibold
				       shadow-sm
				       hover:bg-gray-700
				       dark:hover:bg-gray-200
				       transition-all duration-200
				       active:scale-[0.99]"
				onclick={() => goto('/')}
			>
				Explorar productos
			</button>
		</div>
	</div>
{:else}
	<!-- =========================================================
	     CARRITO
	========================================================== -->

	<div class="w-full flex justify-center px-4 py-8">
		<div class="w-full max-w-6xl">
			<!-- Header -->
			<div class="mb-6">
				<h1 class="text-2xl sm:text-3xl font-semibold tracking-tight dark:text-gray-200">
					{m.cart_title()}
				</h1>

				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Revisa tus productos antes de continuar con la compra.
				</p>
			</div>

			<!-- =====================================================
			     LAYOUT
			====================================================== -->

			<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<!-- =================================================
				     PRODUCTOS
				================================================== -->

				<div class="lg:col-span-3">
					<div
						class="rounded-2xl
						       border border-gray-200 dark:border-[#303030]
						       bg-white dark:bg-[#161616]
						       shadow-sm"
					>
						<!-- Header productos -->
						<div
							class="px-5 py-4
							       border-b border-gray-200 dark:border-[#303030]
							       flex items-center justify-between"
						>
							<div>
								<h2 class="text-lg font-semibold dark:text-gray-200">Tu carrito</h2>

								<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{$cartItems.length} producto{$cartItems.length !== 1 ? 's' : ''}
								</p>
							</div>
						</div>

						<!-- Lista -->
						<div class="p-4 sm:p-5">
							{#each $cartItems as cartItem}
								<a href={`/${cartItem.username}/${cartItem._id}`} class="block mb-3 last:mb-0">
									<div
										class="group relative
										       flex gap-4
										       rounded-xl
										       border border-transparent
										       bg-gray-100 dark:bg-[#202020]
										       p-3 sm:p-4
										       transition-all duration-200
										       hover:border-gray-300
										       dark:hover:border-[#404040]
										       hover:bg-gray-200
										       dark:hover:bg-[#252525]"
									>
										<!-- Imagen -->
										<div class="shrink-0">
											{#if cartItem.imgs?.[0]}
												<img
													src={cartItem.imgs[0]}
													alt={cartItem.productname}
													class="w-20 h-20 sm:w-24 sm:h-24
													       object-cover rounded-xl"
												/>
											{:else}
												<div
													class="w-20 h-20 sm:w-24 sm:h-24
													       rounded-xl
													       bg-gray-200 dark:bg-[#303030]
													       flex items-center justify-center"
												>
													<iconify-icon
														icon="mdi:package-variant-closed"
														height="2rem"
														width="2rem"
														class="text-gray-400 dark:text-gray-500"
													></iconify-icon>
												</div>
											{/if}
										</div>

										<!-- Información -->
										<div class="flex-1 min-w-0 pr-7">
											<div
												class="flex flex-col sm:flex-row
												       sm:items-start
												       sm:justify-between
												       gap-2"
											>
												<div class="min-w-0">
													<h3
														class="text-sm sm:text-base
														       font-semibold
														       dark:text-gray-200
														       truncate"
													>
														{cartItem.productname}
													</h3>

													<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
														@{cartItem.username}
													</p>
												</div>

												<p
													class="shrink-0
													       text-sm sm:text-base
													       font-semibold
													       dark:text-gray-200"
												>
													{formatPrice(getItemPrice(cartItem), 'es-CO', 'COP')}
												</p>
											</div>

											<!-- Opciones -->
											{#if cartItem.selectedOptions?.length || cartItem.selectedVariant}
												{@const displayOptions = [
													...(cartItem.selectedOptions ?? []),
													...(cartItem.selectedVariant?.options ?? []),
													...(cartItem.selectedVariant?.meta?.color
														? [
																{
																	name: 'Color',
																	value: cartItem.selectedVariant.meta.color
																}
															]
														: [])
												]}

												<div class="flex flex-wrap gap-1 mt-3">
													{#each displayOptions as opt}
														<span
															class="px-2 py-1
															       text-[11px]
															       rounded-md
															       bg-gray-200 dark:bg-[#303030]
															       text-gray-600 dark:text-gray-300"
														>
															<strong>{opt.name}:</strong>
															{opt.value}
														</span>
													{/each}
												</div>
											{/if}

											<!-- Cantidad -->
											<div class="mt-4 flex items-center justify-between">
												<div
													class="flex items-center
													       rounded-lg
													       border border-gray-300
													       dark:border-[#3a3a3a]
													       bg-white dark:bg-[#181818]"
													onclick={(e) => e.preventDefault()}
												>
													<button
														type="button"
														aria-label="Disminuir cantidad"
														class="w-9 h-9
														       flex items-center justify-center
														       rounded-l-lg
														       dark:text-gray-200
														       hover:bg-gray-100
														       dark:hover:bg-[#252525]
														       transition"
														onclick={(e) => {
															e.preventDefault();

															decrementCartItem(
																cartItem._id,
																cartItem.selectedOptions ?? [],
																cartItem.selectedVariant ?? null
															);
														}}
													>
														<iconify-icon icon="ic:round-minus" height="1.1rem" width="1.1rem"
														></iconify-icon>
													</button>

													<span
														class="w-10
														       text-center
														       text-sm
														       font-semibold
														       dark:text-gray-200"
													>
														{cartItem.amount}
													</span>

													<button
														type="button"
														aria-label="Aumentar cantidad"
														disabled={cartItem.amount >=
															(cartItem.selectedVariant?.quantity ?? cartItem.quantity)}
														class="w-9 h-9
														       flex items-center justify-center
														       rounded-r-lg
														       dark:text-gray-200
														       hover:bg-gray-100
														       dark:hover:bg-[#252525]
														       transition
														       disabled:opacity-30
														       disabled:cursor-not-allowed"
														onclick={(e) => {
															e.preventDefault();

															const maxStock =
																cartItem.selectedVariant?.quantity ?? cartItem.quantity;

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
													>
														<iconify-icon icon="ic:round-plus" height="1.1rem" width="1.1rem"
														></iconify-icon>
													</button>
												</div>
											</div>
										</div>

										<!-- Eliminar -->
										<button
											type="button"
											aria-label="Eliminar producto"
											class="absolute
											       top-3 right-3
											       w-8 h-8
											       flex items-center justify-center
											       rounded-lg
											       text-gray-400
											       dark:text-gray-500
											       hover:text-red-500
											       hover:bg-gray-200
											       dark:hover:bg-[#303030]
											       transition"
											onclick={(e) => {
												e.preventDefault();

												removeFromCart(
													cartItem._id,
													cartItem.selectedOptions ?? [],
													cartItem.selectedVariant ?? null
												);
											}}
										>
											<iconify-icon icon="ic:round-close" height="1.2rem" width="1.2rem"
											></iconify-icon>
										</button>
									</div>
								</a>
							{/each}
						</div>
					</div>
				</div>

				<!-- =================================================
				     RESUMEN
				================================================== -->

				<div class="lg:col-span-2">
					<div
						class="lg:sticky lg:top-20
						       rounded-2xl
						       border border-gray-200 dark:border-[#303030]
						       bg-white dark:bg-[#161616]
						       shadow-sm"
					>
						<!-- Header -->
						<div
							class="px-5 py-4
							       border-b border-gray-200 dark:border-[#303030]"
						>
							<h2 class="text-lg font-semibold dark:text-gray-200">
								{m.cart_sumary_title()}
							</h2>

							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Resumen de tu compra</p>
						</div>

						<div class="p-5">
							<!-- Productos -->
							<div class="flex justify-between items-center mb-4">
								<span class="text-sm text-gray-500 dark:text-gray-400"> Productos </span>

								<span class="text-sm font-medium dark:text-gray-200">
									{$cartItems.length}
								</span>
							</div>

							<!-- Subtotal -->
							<div class="flex justify-between items-center mb-3">
								<span class="text-sm text-gray-500 dark:text-gray-400">
									{m.cart_summary_subtotal()}
								</span>

								<span class="text-sm font-medium dark:text-gray-200">
									{formatPrice($subtotal, 'es-CO', 'COP')}
								</span>
							</div>

							<!-- Envío -->
							<div class="flex justify-between gap-4 mb-3">
								<span class="text-sm text-gray-500 dark:text-gray-400">
									{m.cart_summary_shipment()}
								</span>

								<span
									class="text-xs font-medium
									       text-gray-500
									       dark:text-gray-400
									       text-right"
								>
									Contra entrega
								</span>
							</div>

							<!-- Comisión -->
							<div class="flex justify-between gap-4 mb-4">
								<span class="text-sm text-gray-500 dark:text-gray-400"> Comisión de pago </span>

								<span
									class="text-xs text-gray-500
									       dark:text-gray-400
									       text-right"
								>
									Se calculará después
								</span>
							</div>

							<!-- Divider -->
							<div class="h-px bg-gray-200 dark:bg-[#303030] my-5"></div>

							<!-- Total -->
							<div class="flex items-end justify-between gap-4">
								<div>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										{m.cart_summary_total()}
									</p>

									<h3
										class="text-2xl font-bold
										       mt-1
										       dark:text-gray-100"
									>
										{formatPrice($subtotal, 'es-CO', 'COP')}
									</h3>
								</div>

								<span
									class="text-[11px]
									       text-gray-400
									       dark:text-gray-500
									       text-right"
								>
									+ comisión
								</span>
							</div>

							<!-- Continue -->
							<button
								type="button"
								class="mt-6 h-12 w-full
								       rounded-xl
								       bg-gray-900 dark:bg-white
								       text-white dark:text-black
								       font-semibold
								       shadow-sm
								       hover:bg-gray-700
								       dark:hover:bg-gray-200
								       hover:shadow-md
								       transition-all duration-200
								       active:scale-[0.99]"
								onclick={(e) => {
									e.preventDefault();
									goto('/cart/paymentroute/shipping');
								}}
							>
								<span class="flex items-center justify-center gap-2">
									{m.cart_summary_button()}
									<span aria-hidden="true">→</span>
								</span>
							</button>

							<p
								class="mt-3 text-center
								       text-[11px]
								       leading-relaxed
								       text-gray-500 dark:text-gray-400"
							>
								El costo de envío y la comisión de pago se calcularán en los siguientes pasos.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
