<script lang="ts">
	import TableData from '$lib/components/Table.svelte'
	import { page } from '$app/stores'
	import { format } from 'timeago.js'
  import * as m from '$paraglide/messages'
  import * as Dialog from "$lib/components/ui/dialog"

	let salesList: any = []
	let currentPage = 1
	let limitPerPage = 10
	let NextPage: boolean
	let PreviousPage: boolean
	let itemsCount: number
	let pageCount: number

	async function fetchSales() {
		try {
			const response = await fetch(
				`http://localhost:3000/users/orders/${$page.data.user?._id}?page=${currentPage}&limit=${limitPerPage}`
			);
			const dataFetch = await response.json();
			itemsCount = dataFetch.meta.itemCount;
			pageCount = dataFetch.meta.pageCount;
			NextPage = dataFetch.meta.hasNextPage;
			PreviousPage = dataFetch.meta.hasPreviousPage;

			for (const followerId of dataFetch.data) {
				const response = await fetch(`http://localhost:3000/orders/${followerId}`);
				const salesData = await response.json();
				salesList = [...salesList, salesData];
			}
		} catch (err) {
			console.error('Error la recuperar la lista de ordenes:', err);
		}
	}

	$: fetchSales();
	$: console.log({ salesList });

	$: console.log({ userData: $page.data.user });

	const modifier = {
		profileImg: {
			header: `${m.admin_sales_tableheader_image()}`,
			accessor: (data: any) =>
				`<img class="h-10 w-10 ml-1 rounded-md" src="${data.product?.imgs[0]}" alt="${data.product?.productname}"/>`
		},
		productName: { header: `${m.admin_sales_tableheader_name()}`, accessor: (data: any) => data.product?.productname },
		quantity: { header: `${m.admin_sales_tableheader_quantity()}`, accessor: (data: any) => data.amount },
		price: { header: `${m.admin_sales_tableheader_price()}`, accessor: (data: any) => data.product?.price },
		total: { header: `${m.admin_sales_tableheader_total()}`, accessor: (data: any) => data.product?.price * data.amount },
		sku: { header: `${m.admin_sales_tableheader_sku()}`, accessor: (data: any) => data.product?.SKU },
		category: { header: `${m.admin_sales_tableheader_category()}`, accessor: (data: any) => data.product?.category },
    options: { header: 'Opciones', accessor: (data: any) => {
    const selectedOption = data.product?.selectedOptions?.[0];
    
    if (selectedOption) {
      return `<div class="flex gap-1"><span>${selectedOption.name}:</span><span>${selectedOption.value}</span></div>`;
    } else {
      return `<div class="flex gap-1"><span>No options selected</span></div>`;
    }
  }},
    shippingInfo: { header: 'Shipping Info', accessor: (data: any) => {
      return `<button onclick="alert("info")">Info</button>`
    }},
		state: {
			header: `${m.admin_sales_tableheader_status()}`,
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
		buyer: {
			header: `${m.admin_sales_tableheader_customer()}`,
			accessor: (data: any) => {
				if (data.buyerProfileImg) {
					return `<a href="/personal/${data.buyerId}">
                    <div class="flex gap-2 items-center">
                      <img class="h-10 w-10 rounded-full" src="${data.buyerProfileImg}" alt="${data.buyerName}"/>
                      <h3>${data.buyerName}</h3>
                    </div>
                  </a>`;
				} else {
					return `<a href="/personal/${data.buyerId}">
                    <div class="flex gap-2 items-center"> 
                      <iconify-icon
										    icon="mdi:user"
										    height="1.5rem"
										    width="1.5rem"
										    class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
									    ></iconify-icon>
                      <h3>${data.buyerName}</h3>
                    </div>
                  </a>`;
				}
			}
		},
		date: { header: `${m.admin_sales_tableheader_date()}`, accessor: (data: any) => `${format(data.createdAt)}` }
	};


  let open = false

  const handleOpenDialog = () => {
    open = !open
  }
</script>

{#if salesList.length !== 0}
	<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
		<h2 class="text-xl font-semibold">{m.admin_sales_title()}</h2>
	</div>
	<TableData datalist={salesList} {modifier} {NextPage} {PreviousPage} {itemsCount} {pageCount} />
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon
			icon="mdi:cash"
			height="5rem"
			width="5rem"
			class="text-[#707070] mb-4"
		/>

    <h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_sales_nosales_title()}</h1>
    <p class="text-lg text-[#707070]">{m.admin_sales_nosales_p()}</p>
	</div>
{/if}


<button on:click|preventDefault={() => handleOpenDialog()}>Open Dialog</button>

<Dialog.Root bind:open>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
