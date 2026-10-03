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
			console.log('Shipping info:', userData.shippingInfo);
		}
	});

	$effect(() => {
		if (form?.success) {
			toast.success('Información de envío guardada.');
			goto('/cart/paymentroute/confirm');
		}
	});
</script>

{#if userData}
	<div class="flex w-full justify-center px-4 py-8">
		<div class="w-full max-w-2xl">
			<!-- HEADER -->
			<div class="mb-6">
				<h1 class="text-2xl font-semibold tracking-tight dark:text-gray-200 sm:text-3xl">
					{m.cart_paymentroute_shipping_title()}
				</h1>

				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Ingresa los datos donde deseas recibir tu pedido.
				</p>
			</div>

			<!-- FORM CARD -->
			<div
				class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#303030] dark:bg-[#161616] sm:p-8"
			>
				<form action="?/shipping" method="POST" use:enhance class="flex flex-col gap-7">
					<!-- DATOS PERSONALES -->
					<section>
						<div class="mb-4">
							<h2 class="text-sm font-semibold uppercase tracking-wide dark:text-gray-200">
								Datos personales
							</h2>

							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Información necesaria para procesar tu pedido.
							</p>
						</div>

						<div class="flex flex-col gap-4">
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
									class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
										?.errors?.completeName
										? 'border-red-500'
										: ''}"
								/>

								{#if form?.errors?.completeName}
									<span class="text-xs font-medium text-red-500">
										{form.errors.completeName[0]}
									</span>
								{/if}
							</div>

							<!-- Documento + teléfono -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
										class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
											?.errors?.document
											? 'border-red-500'
											: ''}"
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
										class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
											?.errors?.phoneNumber
											? 'border-red-500'
											: ''}"
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

					<div class="h-px bg-gray-200 dark:bg-[#303030]"></div>

					<!-- DIRECCIÓN -->
					<section>
						<div class="mb-4">
							<h2 class="text-sm font-semibold uppercase tracking-wide dark:text-gray-200">
								Dirección de envío
							</h2>

							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Indica la dirección exacta donde quieres recibir tu pedido.
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
									class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
										?.errors?.address
										? 'border-red-500'
										: ''}"
								/>

								{#if form?.errors?.address}
									<span class="text-xs font-medium text-red-500">
										{form.errors.address[0]}
									</span>
								{/if}
							</div>

							<!-- País + departamento -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<!-- País -->
								<div class="flex flex-col gap-1.5">
									<label for="countryDisplay" class="text-sm font-medium dark:text-gray-200">
										{m.cart_paymentroute_shipping_country()}
									</label>

									<!-- Valor real enviado al backend -->
									<input type="hidden" name="country" value="CO" />

									<!-- Valor visible -->
									<div
										id="countryDisplay"
										class="flex h-11 items-center rounded-xl bg-gray-100 px-3 text-sm font-medium text-black dark:bg-[#202020] dark:text-gray-200"
									>
										Colombia
									</div>
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
										placeholder="Ej. Antioquia"
										class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
											?.errors?.state
											? 'border-red-500'
											: ''}"
									/>

									{#if form?.errors?.state}
										<span class="text-xs font-medium text-red-500">
											{form.errors.state[0]}
										</span>
									{/if}
								</div>
							</div>

							<!-- Ciudad + código postal -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
										placeholder="Ej. Medellín"
										class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
											?.errors?.city
											? 'border-red-500'
											: ''}"
									/>

									{#if form?.errors?.city}
										<span class="text-xs font-medium text-red-500">
											{form.errors.city[0]}
										</span>
									{/if}
								</div>

								<!-- Código postal -->
								<div class="flex flex-col gap-1.5">
									<div class="flex items-center justify-between gap-2">
										<label for="postalCode" class="text-sm font-medium dark:text-gray-200">
											{m.cart_paymentroute_shipping_postal()}
										</label>
									</div>

									<input
										id="postalCode"
										type="text"
										name="postalCode"
										inputmode="numeric"
										autocomplete="postal-code"

										value={userData?.shippingInfo?.postalCode ?? ''}
										placeholder="Ej. 050001"
										class="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-3 text-sm font-medium text-black outline-none transition focus:border-gray-400 dark:bg-[#202020] dark:text-gray-200 dark:focus:border-gray-500 {form
											?.errors?.postalCode
											? 'border-red-500'
											: ''}"
									/>

									{#if form?.errors?.postalCode}
										<span class="text-xs font-medium text-red-500">
											{form.errors.postalCode[0]}
										</span>
									{/if}

									<!-- INFO CÓDIGO POSTAL -->
									<div
										class="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#303030] dark:bg-[#202020]"
									>
										<div class="flex gap-2.5">
											<div class="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400">
												<iconify-icon icon="lucide:info" width="17" height="17" />
											</div>

											<div class="min-w-0">
												<p class="text-xs font-medium leading-5 text-gray-700 dark:text-gray-200">
													El código postal debe ser preciso para evitar problemas con la cotización
													y entrega de tu pedido.
												</p>

												<a
													href="https://visor.codigopostal.gov.co/472/visor/"
													target="_blank"
													rel="noopener noreferrer"
													class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
												>
													Consultar mi código postal en el visor oficial de 4-72
													<span aria-hidden="true">↗</span>
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- ERROR GENERAL DEL BACKEND -->
							{#if form?.errors?._form}
								<div
									class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30"
								>
									<div class="flex gap-2.5">
										<div class="mt-0.5 shrink-0 text-red-500">
											<iconify-icon icon="lucide:circle-alert" width="17" height="17" />
										</div>

										<div class="flex flex-col gap-1">
											{#each form.errors._form as error}
												<p class="text-xs font-medium leading-5 text-red-600 dark:text-red-400">
													{error}
												</p>
											{/each}
										</div>
									</div>
								</div>
							{/if}
						</div>
					</section>

					<!-- CONTINUE -->
					<div class="pt-2">
						<button
							type="submit"
							class="h-12 w-full rounded-xl bg-gray-900 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md active:scale-[0.99] dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
