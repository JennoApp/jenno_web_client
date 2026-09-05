<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import { page } from '$app/state';
	import * as m from '$paraglide/messages';

	let { form }: { form: ActionData } = $props();
	let userData = $derived(page.data.user);

	$effect(() => {
		if (userData) {
			console.log(userData.shippingInfo);
		}
	});

	$effect(() => {
		if (form?.success) {
			toast.success('Informacion guardada!!');
			goto('/cart/paymentroute/confirm');
		}
	});
</script>

{#if userData}
	<div class="w-full flex justify-center px-4 py-8">
		<div class="w-full max-w-2xl">
			<!-- ======================================================
		     HEADER
		======================================================= -->

			<div class="mb-6">
				<h1 class="text-2xl sm:text-3xl font-semibold tracking-tight dark:text-gray-200">
					{m.cart_paymentroute_shipping_title()}
				</h1>

				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Ingresa los datos donde deseas recibir tu pedido.
				</p>
			</div>

			<!-- ======================================================
		     CARD
		======================================================= -->

			<div
				class="rounded-2xl
			       border border-gray-200 dark:border-[#303030]
			       bg-white dark:bg-[#161616]
			       shadow-sm
			       p-6 sm:p-8"
			>
				<form action="?/shipping" method="POST" use:enhance class="flex flex-col gap-7">
					<!-- ==================================================
				     DATOS DE FACTURACIÓN
				=================================================== -->

					<section>
						<div class="mb-4">
							<h2 class="text-sm font-semibold uppercase tracking-wide dark:text-gray-200">
								Datos personales
							</h2>

							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Información necesaria para procesar tu pedido.
							</p>
						</div>

						<div class="grid grid-cols-1 gap-4">
							<!-- Nombre -->
							<div class="flex flex-col gap-1.5">
								<label for="completeName" class="text-sm font-medium dark:text-gray-200">
									Nombre / Razón Social
								</label>

								<input
									id="completeName"
									type="text"
									name="completeName"
									value={userData?.shippingInfo?.completeName ?? ''}
									class="h-11 w-full rounded-xl
								       border border-transparent
								       bg-gray-100 dark:bg-[#202020]
								       px-3
								       text-sm font-medium
								       text-black dark:text-gray-200
								       outline-none
								       transition
								       focus:border-gray-400
								       dark:focus:border-gray-500
								       {form?.errors?.completeName ? 'border-red-500' : ''}"
								/>

								{#if form?.errors?.completeName}
									<span class="text-xs font-medium text-red-500">
										{form.errors.completeName[0]}
									</span>
								{/if}
							</div>

							<!-- Documento + Teléfono -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<!-- Documento -->
								<div class="flex flex-col gap-1.5">
									<label for="document" class="text-sm font-medium dark:text-gray-200">
										NIT / Documento de identidad
									</label>

									<input
										id="document"
										type="text"
										name="document"
										value={userData?.shippingInfo?.document ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.document ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.document}
										<span class="text-xs font-medium text-red-500">
											{form.errors.document[0]}
										</span>
									{/if}
								</div>

								<!-- Teléfono -->
								<div class="flex flex-col gap-1.5">
									<label for="phoneNumber" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_phone()}
									</label>

									<input
										id="phoneNumber"
										type="tel"
										name="phoneNumber"
										value={userData?.shippingInfo?.phoneNumber ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.phoneNumber ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.phoneNumber}
										<span class="text-xs font-medium text-red-500">
											{form.errors.phoneNumber[0]}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</section>

					<!-- ==================================================
				     DIVIDER
				=================================================== -->

					<div class="h-px bg-gray-200 dark:bg-[#303030]"></div>

					<!-- ==================================================
				     DIRECCIÓN
				=================================================== -->

					<section>
						<div class="mb-4">
							<h2 class="text-sm font-semibold uppercase tracking-wide dark:text-gray-200">
								Dirección de envío
							</h2>

							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Indica la dirección donde quieres recibir tu pedido.
							</p>
						</div>

						<div class="flex flex-col gap-4">
							<!-- Dirección -->
							<div class="flex flex-col gap-1.5">
								<label for="address" class="text-sm font-medium dark:text-gray-200">
									{m.cart_paymentroute_shipping_address()}
								</label>

								<input
									id="address"
									type="text"
									name="address"
									value={userData?.shippingInfo?.address ?? ''}
									placeholder="Ej. Calle 123 #45-67"
									class="h-11 w-full rounded-xl
								       border border-transparent
								       bg-gray-100 dark:bg-[#202020]
								       px-3
								       text-sm font-medium
								       text-black dark:text-gray-200
								       outline-none
								       transition
								       focus:border-gray-400
								       dark:focus:border-gray-500
								       {form?.errors?.address ? 'border-red-500' : ''}"
								/>

								{#if form?.errors?.address}
									<span class="text-xs font-medium text-red-500">
										{form.errors.address[0]}
									</span>
								{/if}
							</div>

							<!-- País + Departamento -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<!-- País -->
								<div class="flex flex-col gap-1.5">
									<label for="country" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_country()}
									</label>

									<input
										id="country"
										type="text"
										name="country"
										value={userData?.shippingInfo?.country ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.country ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.country}
										<span class="text-xs font-medium text-red-500">
											{form.errors.country[0]}
										</span>
									{/if}
								</div>

								<!-- Departamento -->
								<div class="flex flex-col gap-1.5">
									<label for="state" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_state()}
									</label>

									<input
										id="state"
										type="text"
										name="state"
										value={userData?.shippingInfo?.state ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.state ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.state}
										<span class="text-xs font-medium text-red-500">
											{form.errors.state[0]}
										</span>
									{/if}
								</div>
							</div>

							<!-- Ciudad + Código Postal -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<!-- Ciudad -->
								<div class="flex flex-col gap-1.5">
									<label for="city" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_city()}
									</label>

									<input
										id="city"
										type="text"
										name="city"
										value={userData?.shippingInfo?.city ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.city ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.city}
										<span class="text-xs font-medium text-red-500">
											{form.errors.city[0]}
										</span>
									{/if}
								</div>

								<!-- Código Postal -->
								<div class="flex flex-col gap-1.5">
									<label for="postalCode" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_postal()}
									</label>

									<input
										id="postalCode"
										type="text"
										name="postalCode"
										value={userData?.shippingInfo?.postalCode ?? ''}
										class="h-11 w-full rounded-xl
									       border border-transparent
									       bg-gray-100 dark:bg-[#202020]
									       px-3
									       text-sm font-medium
									       text-black dark:text-gray-200
									       outline-none
									       transition
									       focus:border-gray-400
									       dark:focus:border-gray-500
									       {form?.errors?.postalCode ? 'border-red-500' : ''}"
									/>

									{#if form?.errors?.postalCode}
										<span class="text-xs font-medium text-red-500">
											{form.errors.postalCode[0]}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</section>

					<!-- ==================================================
				     CONTINUE
				=================================================== -->

					<div class="pt-2">
						<button
							type="submit"
							class="h-12 w-full rounded-xl
						       bg-gray-900 dark:bg-white
						       text-white dark:text-black
						       font-semibold
						       shadow-sm
						       hover:bg-gray-700 dark:hover:bg-gray-200
						       hover:shadow-md
						       transition-all duration-200
						       active:scale-[0.99]"
						>
							<span class="flex items-center justify-center gap-2">
								{m.cart_paymentroute_shipping_button()}

								<span aria-hidden="true">→</span>
							</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
