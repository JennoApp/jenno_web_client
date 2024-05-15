<script lang="ts">
	import TableData from '$lib/components/Table.svelte';
	import { page } from '$app/stores';
	import { format } from 'timeago.js';

	let shoppingList: any = [];
	let currentPage = 1;
	let limitPerPage = 10;
	let NextPage: boolean;
	let PreviousPage: boolean;
	let itemsCount: number;
	let pageCount: number;

	async function fetchShopping() {
		try {
			const response = await fetch(
				`http://localhost:3000/users/shopping/${$page.data.user._id}?page=${currentPage}&limit=${limitPerPage}`
			);
			const dataFetch = await response.json();
			itemsCount = dataFetch.meta.itemCount;
			pageCount = dataFetch.meta.pageCount;
			NextPage = dataFetch.meta.hasNextPage;
			PreviousPage = dataFetch.meta.hasPreviousPage;

			for (const followerId of dataFetch.data) {
				const response = await fetch(`http://localhost:3000/orders/${followerId}`);
				const salesData = await response.json();
				shoppingList = [...shoppingList, salesData];
			}
		} catch (err) {
			console.error('Error la recuperar la lista de seguidores:', err);
		}
	}

	$: fetchShopping();
	$: console.log({ shoppingList });

	$: console.log({ userData: $page.data.user });

	const modifier = {
		profileImg: {
			header: 'Imagen',
			accessor: (data: any) =>
				`<img class="h-10 w-10 ml-1 rounded-md" src="${data.product?.imgs[0]}" alt="${data.product?.productname}"/>`
		},
		productName: { header: 'Nombre', accessor: (data: any) => data.product?.productname },
		quantity: { header: 'Cantidad', accessor: (data: any) => data.amount },
		price: { header: 'Precio c/u', accessor: (data: any) => data.product?.price },
		total: { header: 'Total', accessor: (data: any) => data.product?.price * data.amount },
		sku: { header: 'SKU', accessor: (data: any) => data.product?.SKU },
		category: { header: 'Categoria', accessor: (data: any) => data.product?.category },
		state: {
			header: 'Estado',
			accessor: (data: any) => {
				if (data.status == 'pending') {
					return `<div class="flex items-center justify-center bg-yellow-600 h-6 rounded-full"><span class="text-sm font-medium">${data.status}</span></div>`;
				}
				if (data.status == 'cancelled') {
					return `<div class="flex items-center justify-center bg-red-600 h-6 rounded-full"><span class="text-sm font-medium">${data.status}</span></div>`;
				}
				if (data.status == 'completed') {
					return `<div class="flex items-center justify-center bg-green-600 h-6 rounded-full"><span class="text-sm font-medium">${data.status}</span></div>`;
				}
			}
		},
		date: { header: 'Fecha', accessor: (data: any) => `${format(data.createdAt)}` }
	};
</script>

{#if shoppingList.length !== 0}
	<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
		<h2 class="text-xl font-semibold text-gray-200">Compras</h2>
	</div>

	<TableData
		datalist={shoppingList}
		{modifier}
		{NextPage}
		{PreviousPage}
		{itemsCount}
		{pageCount}
	/>
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon
			icon="fa6-solid:cart-shopping"
			height="5rem"
			width="5rem"
			class="text-[#707070] mb-4"
		/>
		<p class="text-lg text-[#707070] mb-2">Aún no has realizado ninguna compra.</p>
		<p class="text-lg text-[#707070]">¡Explora y encuentra productos que te interesen!</p>
	</div>
{/if}
