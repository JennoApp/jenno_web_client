<script lang="ts">
	import TableData from '$lib/components/Table.svelte';
	import { page } from '$app/stores';
  import * as m from '$paraglide/messages'

	let followersList: any = [];
	let currentPage = 1;
	let limitPerPage = 10;
	let NextPage: boolean;
	let PreviousPage: boolean;
	let itemsCount: number;
	let pageCount: number;

	async function fetchFollowers() {
		try {
			const response = await fetch(
				`http://localhost:3000/users/followers/${$page.data.user._id}?page=${currentPage}&limit=${limitPerPage}`
			);
			const dataFetch = await response.json();
			itemsCount = dataFetch.meta.itemCount;
			pageCount = dataFetch.meta.pageCount;
			NextPage = dataFetch.meta.hasNextPage;
			PreviousPage = dataFetch.meta.hasPreviousPage;

			for (const followerId of dataFetch.data) {
				const response = await fetch(`http://localhost:3000/users/${followerId}`);
				const followerData = await response.json();
				followersList = [...followersList, followerData];
			}
		} catch (err) {
			console.error('Error la recuperar la lista de seguidores:', err);
		}
	}

	$: fetchFollowers();

	$: console.log({ followersList });
	$: console.log({ itemsCount, pageCount, NextPage, PreviousPage });

	const modifier = {
		profileImg: {
			header: `${m.admin_customers_tableheader_img()}`,
			accessor: (data: any) => {
				if (data.profileImg !== '') {
					return `<img class="h-10 w-10 ml-5 rounded-md" src="${data.profileImg}" alt="${data.username}"/>`
				} else {
					return `<iconify-icon
										icon="mdi:user"
										height="1.5rem"
										width="1.5rem"
										class="text-gray-200 flex justify-center items-center h-9 w-9 ml-5 bg-[#202020] rounded-full hover:bg-[#252525]"
									/>`
				}
			}
		},
		username: { header: `${m.admin_customers_tableheader_name()}`, accessor: (data: any) => data.username },
		email: { header: `${m.admin_customers_tableheader_email()}`, accessor: (data: any) => data.email },
		accountType: { header: `${m.admin_customers_tableheader_type()}`, accessor: (data: any) => data.accountType }
	};
</script>

<!-- <div class="flex items-center mx-10 mt-5">
	<Input class="max-w-sm" placeholder="Filter names..." type="text" />
</div> -->

{#if followersList.length !== 0}
	<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
		<h2 class="text-xl font-semibold">{m.admin_customers_title()}</h2>
	</div>
	<TableData
		datalist={followersList}
		{modifier}
		{NextPage}
		{PreviousPage}
		{itemsCount}
		{pageCount}
	/>
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="f7:person-3-fill" height="5rem" width="5rem" class="text-[#707070] mb-4" />
		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_customers_nocustomers_title()}</h1>
		<p class="text-lg text-[#707070]">
			{m.admin_customers_nocustomers_p()}
		</p>
	</div>
{/if}
