<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { page } from '$app/stores';
	import TableData from '$lib/components/Table.svelte';

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
			header: 'Profile Image',
			accessor: (data) =>
				`<img class="h-10 w-10 rounded-md" src="${data.profileImg}" alt="${data.username}"/>`
		},
		username: { header: 'Name', accessor: (data) => data.username },
		email: { header: 'Email', accessor: (data) => data.email },
		accountType: { header: 'Account Type', accessor: (data) => data.accountType }
	};
</script>

<div class="flex max-w-full h-20 px-5 m-5 py-6 flex-shrink">
	<h2 class="text-xl font-semibold">Customers</h2>
</div>

<TableData datalist={followersList} {modifier} {NextPage} {PreviousPage} {itemsCount} {pageCount} />
