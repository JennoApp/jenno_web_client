<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';

	export let user: string;

	$: console.log({ user });
	let products: any[];

	async function loadProducts(userId: string) {
		const response = await fetch(`http://localhost:3000/products/user/random/${userId}`);
		const data = await response.json();
		products = data;
		console.log({ products });
	}

	$: if (user) {
		loadProducts(user);
	}
</script>

{#if products !== undefined}
	<div class="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 m-10 gap-5 grid-flow-row">
		{#each products as productData}
			<Card data={productData} />
		{/each}
	</div>
{/if}
