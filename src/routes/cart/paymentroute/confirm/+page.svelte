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

<div class="w-full flex justify-center px-4 py-6">
	<div class="w-full max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<!-- =====================================================
			     PRODUCTOS
			====================================================== -->

			<div class="lg:col-span-3">
				<div
					class="rounded-2xl
					       border border-gray-200 dark:border-[#303030]
					       bg-white dark:bg-[#161616]
					       shadow-sm"
				>
					<!-- Header -->
					<div
						class="px-5 py-4
						       border-b border-gray-200 dark:border-[#303030]"
					>
						<h2 class="text-lg font-semibold dark:text-gray-200">Productos</h2>

						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Revisa los productos y las cantidades de tu pedido.
						</p>
					</div>

					<!-- Lista -->
					<div class="p-4 sm:p-5">
						{#each $cartItems as cartItem}
							{#if cartItem?.username && cartItem?._id}
								<a href={`/${cartItem.username}/${cartItem._id}`} class="block mb-3 last:mb-0">
									<div
										class="group flex gap-4 items-center
										       rounded-xl
										       border border-transparent
										       bg-gray-100 dark:bg-[#202020]
										       p-3
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
													class="w-16 h-16 object-cover rounded-lg"
													src={cartItem.imgs[0]}
													alt={cartItem.productname}
												/>
											{:else}
												<div
													class="w-16 h-16 rounded-lg
													       bg-gray-200 dark:bg-[#303030]
													       flex items-center justify-center"
												>
													<iconify-icon
														icon="mdi:package-variant-closed"
														height="1.8rem"
														width="1.8rem"
														class="text-gray-400 dark:text-gray-500"
													></iconify-icon>
												</div>
											{/if}
										</div>

										<!-- Información -->
										<div class="flex-1 min-w-0">
											<div class="flex justify-between gap-4">
												<div class="min-w-0">
													<h3
														class="text-sm sm:text-base
														       font-semibold
														       truncate
														       dark:text-gray-200"
													>
														{cartItem.productname}
													</h3>

													<!-- Opciones -->
													{#if cartItem.selectedOptions?.length || cartItem.selectedVariant?.options?.length || cartItem.selectedVariant?.meta}
														<div class="flex flex-wrap gap-1 mt-2">
															{#if cartItem.selectedOptions?.length}
																{#each cartItem.selectedOptions as opt}
																	<span
																		class="px-2 py-0.5
																		       text-[11px]
																		       rounded-md
																		       bg-gray-200
																		       dark:bg-[#303030]
																		       text-gray-600
																		       dark:text-gray-300"
																	>
																		<strong>{opt.name}:</strong>
																		{opt.value}
																	</span>
																{/each}
															{/if}

															{#if cartItem.selectedVariant?.options?.length}
																{#each cartItem.selectedVariant.options as opt}
																	<span
																		class="px-2 py-0.5
																		       text-[11px]
																		       rounded-md
																		       bg-gray-200
																		       dark:bg-[#303030]
																		       text-gray-600
																		       dark:text-gray-300"
																	>
																		<strong>{opt.name}:</strong>
																		{opt.value}
																	</span>
																{/each}
															{/if}

															{#if cartItem.selectedVariant?.meta}
																{#each Object.entries(cartItem.selectedVariant.meta) as [key, value]}
																	<span
																		class="px-2 py-0.5
																		       text-[11px]
																		       rounded-md
																		       bg-gray-200
																		       dark:bg-[#303030]
																		       text-gray-600
																		       dark:text-gray-300"
																	>
																		<strong>{key}:</strong>
																		{value}
																	</span>
																{/each}
															{/if}
														</div>
													{/if}
												</div>

												<!-- Precio -->
												<p
													class="shrink-0
													       text-sm sm:text-base
													       font-semibold
													       dark:text-gray-200"
												>
													{formatPrice(getItemPrice(cartItem), 'es-CO', 'COP')}
												</p>
											</div>

											<!-- Cantidad -->
											<div
												class="flex items-center gap-2
												       mt-2
												       text-xs
												       text-gray-500
												       dark:text-gray-400"
											>
												<span>Cantidad</span>

												<span
													class="px-2 py-0.5
													       rounded-md
													       bg-gray-200
													       dark:bg-[#303030]
													       font-medium"
												>
													{cartItem.amount}
												</span>
											</div>
										</div>
									</div>
								</a>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<!-- =====================================================
			     RESUMEN
			====================================================== -->

			<div class="lg:col-span-2">
				<div
					class="rounded-2xl
					       border border-gray-200 dark:border-[#303030]
					       bg-white dark:bg-[#161616]
					       shadow-sm
					       lg:sticky lg:top-20"
				>
					<!-- Header -->
					<div
						class="px-5 py-4
						       border-b border-gray-200 dark:border-[#303030]"
					>
						<h2 class="text-lg font-semibold dark:text-gray-200">Resumen del pedido</h2>

						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Comprueba la información antes de realizar el pago.
						</p>
					</div>

					<div class="p-5">
						<!-- ==================================================
						     ENVÍO
						=================================================== -->

						<div>
							<div class="flex items-center justify-between mb-3">
								<h3 class="text-sm font-semibold dark:text-gray-200">Información de envío</h3>

								<a
									href="/cart/paymentroute/shipping"
									class="text-xs
									       text-gray-500
									       dark:text-gray-400
									       hover:text-gray-900
									       dark:hover:text-white
									       hover:underline"
								>
									Editar
								</a>
							</div>

							<div
								class="rounded-xl
								       bg-gray-100 dark:bg-[#202020]
								       p-4
								       space-y-2"
							>
								<div class="flex justify-between gap-4">
									<span class="text-xs text-gray-500 dark:text-gray-400"> Dirección </span>

									<span
										class="text-xs font-medium
										       text-right
										       dark:text-gray-200"
									>
										{shippingData?.address}
									</span>
								</div>

								<div class="flex justify-between gap-4">
									<span class="text-xs text-gray-500 dark:text-gray-400"> Ciudad </span>

									<span
										class="text-xs font-medium
										       text-right
										       dark:text-gray-200"
									>
										{shippingData?.city}
									</span>
								</div>

								<div class="flex justify-between gap-4">
									<span class="text-xs text-gray-500 dark:text-gray-400"> Departamento </span>

									<span
										class="text-xs font-medium
										       text-right
										       dark:text-gray-200"
									>
										{shippingData?.state}
									</span>
								</div>

								<div class="flex justify-between gap-4">
									<span class="text-xs text-gray-500 dark:text-gray-400"> Código postal </span>

									<span
										class="text-xs font-medium
										       text-right
										       dark:text-gray-200"
									>
										{shippingData?.postalCode}
									</span>
								</div>

								<div class="flex justify-between gap-4">
									<span class="text-xs text-gray-500 dark:text-gray-400"> Teléfono </span>

									<span
										class="text-xs font-medium
										       text-right
										       dark:text-gray-200"
									>
										{shippingData?.phoneNumber}
									</span>
								</div>
							</div>
						</div>

						<!-- Divider -->
						<div class="h-px bg-gray-200 dark:bg-[#303030] my-5"></div>

						<!-- ==================================================
						     TOTAL
						=================================================== -->

						<div class="space-y-3">
							<div class="flex justify-between gap-4">
								<span class="text-sm text-gray-500 dark:text-gray-400">
									{m.cart_summary_subtotal()}
								</span>

								<span class="text-sm font-medium dark:text-gray-200">
									{formatPrice($subtotal, 'es-CO', 'COP')}
								</span>
							</div>

							<div class="flex justify-between gap-4">
								<span class="text-sm text-gray-500 dark:text-gray-400">
									{m.cart_summary_shipment()}
								</span>

								<span class="text-sm font-medium dark:text-gray-200 text-right">
									Contra entrega
								</span>
							</div>

							<div class="flex justify-between gap-4">
								<span class="text-sm text-gray-500 dark:text-gray-400"> Transferencia </span>

								<span class="text-sm font-medium dark:text-gray-200">
									{formatPrice(
										computeCommission($paymentMethod ?? 'mercadopago', $P_goal),
										'es-CO',
										'COP'
									)}
								</span>
							</div>
						</div>

						<!-- Divider -->
						<div class="h-px bg-gray-200 dark:bg-[#303030] my-5"></div>

						<!-- Total -->
						<div class="flex items-end justify-between gap-4">
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Total a pagar</p>

								<h3 class="text-2xl font-bold mt-1 dark:text-gray-100">
									{formatPrice(
										computeTotal($paymentMethod ?? 'mercadopago', $P_goal),
										'es-CO',
										'COP'
									)}
								</h3>
							</div>

							{#if $paymentMethod === 'paypal'}
								<span
									class="text-xs text-gray-500
									       dark:text-gray-400
									       text-right"
								>
									USD ${usdEquivalent.toFixed(2)}
								</span>
							{/if}
						</div>

						<!-- ==================================================
						     PAY
						=================================================== -->

						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								handlePaymentButton();
							}}
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
						>
							<span class="flex items-center justify-center gap-2">
								Pagar pedido
								<span aria-hidden="true">→</span>
							</span>
						</button>

						<p
							class="mt-3 text-center text-[11px]
							       text-gray-500 dark:text-gray-400"
						>
							Al continuar, confirmas que la información de tu pedido es correcta.
						</p>
					</div>
				</div>
			</div>
		</div>
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
