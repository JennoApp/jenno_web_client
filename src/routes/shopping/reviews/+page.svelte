<script lang="ts">
	import type { PageServerData } from './$types';
	import Image from '$lib/components/Image.svelte';
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { format } from 'timeago.js';
	import * as m from '$paraglide/messages';
	import TableActions from './table_actions.svelte';
	import Status from '$lib/components/Status.svelte';
	import Options from '$lib/components/Options.svelte';
	import { goto } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import { page } from '$app/stores';

	export let data: PageServerData;

	let shoppingWithoutReviewsStore = writable(data.shoppingWithoutReviews || []);
	let metaStore = writable(data.meta || {});

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener la url del servidor: ', error);
		}
	}

	async function loadSales(page: number, limit: number = 10) {
		try {
			await getServerUrl();

			const response = await fetch(
				`${serverUrl}/users/shoppingwithoutreviews/${$page.data.user._id}?page=${page}&limit=${limit}`
			);
			const result = await response.json();

			const shoppingList = await Promise.all(
				result.data.map(async (id: string) => {
					const productResponse = await fetch(`${serverUrl}/orders/${id}`);
					return await productResponse.json();
				})
			);

			// devuelve { data: [], meta: {} }
			shoppingWithoutReviewsStore.set(shoppingList);
			metaStore.set(result.meta);
		} catch (error) {
			console.error('Error al cargar los productos del usuario: ', error);
		}
	}

	function changePage(newPage: number) {
		if (newPage < 1) return;
		loadSales(newPage, 10);
	}

	$: console.log({ shoppingData: $shoppingWithoutReviewsStore });
</script>

<div class="flex p-5">
	<button
		class="flex justify-center items-center h-10 w-10 dark:bg-[#202020] rounded-sm hover:dark:bg-[#252525]"
		on:click|preventDefault={() => goto('/shopping')}
	>
		<iconify-icon
			icon="material-symbols:chevron-left-rounded"
			heigth="2.5rem"
			width="2.5rem"
			class="dark:text-gray-200"
		></iconify-icon>
	</button>
	<div>
		<div class="flex flex-col ml-3">
			<h4 class="text-sm dark:text-slate-300">Volver a Compras</h4>
			<h2 class="text-xl font-semibold">Valoración y Reseñas</h2>
		</div>
	</div>
</div>

{#if Array.isArray($shoppingWithoutReviewsStore) && $shoppingWithoutReviewsStore.length > 0}
	<div class="overflow-x-auto w-full p-4">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-b bg-gray-100 dark:bg-[#202020]">
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Imágen</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Nombre</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Cantidad</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Precio</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Total</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Categoria</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Opciones</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200">Estado</th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200"></th>
					<th class="py-2 px-4 font-semibold dark:text-gray-200"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-[#252525]">
				{#each $shoppingWithoutReviewsStore as order}
					<tr class="hover:bg-gray-50 dark:hover:bg-[#2c2c2c]">
						<!-- Imágenes (mostrar la primera o un recuento) -->
						<td class="py-2 px-4 dark:text-gray-200">
							{#if Array.isArray(order?.product?.imgs) && order?.product?.imgs.length > 0}
                <Image url={order?.product?.imgs[0]} iconType="product" />
							{:else}
								<span class="text-gray-500 dark:text-gray-400">Sin imágenes</span>
							{/if}
						</td>

						<!-- Nombre del producto -->
						<td class="py-2 px-4 dark:text-gray-200">{order?.product?.productname}</td>

						<!-- Cantidad -->
						<td class="py-2 px-4 dark:text-gray-200 text-center">{order?.amount}</td>

						<!-- Precio (con formato) -->
						<td class="py-2 px-4 dark:text-gray-200">
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(order?.product?.price || 0)}
						</td>

						<!-- Total -->
						<td class="py-2 px-4 dark:text-gray-200"
							>{formatPrice(order?.product?.price * order?.product?.amount, 'es-CO', 'COP')}</td
						>

						<!-- Categoría -->
						<td class="py-2 px-4 dark:text-gray-200">{order?.product?.category}</td>

						<!-- Opciones -->
						<td class="py-2 px-4 dark:text-gray-200">
							<Options options={order?.product?.selectedOptions[0]} />
						</td>

						<!-- Estado -->
						<td class="py-2 px-4 dark:text-gray-200">
							<Status status={order?.status} />
						</td>

						<!-- tiempo de actualizacion de <<Estado>> -->
						<td class="py-2 px-4 dark:text-gray-200">
							{format(order?.updatedAt)}
						</td>

						<!-- Acciones -->
						<td class="py-2 px-4 dark:text-gray-200">
							<TableActions id={order?._id} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex justify-between mt-2 m-5">
		<div class="">
			<h3 class="text-sm dark:text-[#707070]">
				Items: {$metaStore.itemCount} | Página: {$metaStore.page} de {$metaStore.pageCount}
			</h3>
		</div>

		<div class="flex items-center justify-end space-x-4">
			<Button
				class="border-gray-400 dark:border-[#252525] dark:hover:bg-[#252525]"
				variant="outline"
				size="sm"
				disabled={!$metaStore.hasPreviousPage}
				on:click={() => changePage(Number($metaStore.page) - 1)}
			>
				Anterior
			</Button>
			<Button
				class="border-gray-400 dark:border-[#252525] dark:hover:bg-[#252525]"
				variant="outline"
				size="sm"
				disabled={!$metaStore.hasNextPage}
				on:click={() => changePage(Number($metaStore.page) + 1)}
			>
				Siguiente
			</Button>
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="ic:round-reviews" height="5rem" width="5rem" class="text-[#707070] mb-4" ></iconify-icon>
		<p class="text-lg font-semibold text-[#707070] mb-2">No tienes Reseñas pendientes</p>
		<p class="text-lg text-[#707070]">{m.shopping_noshopping_p()}</p>
	</div>
{/if}
