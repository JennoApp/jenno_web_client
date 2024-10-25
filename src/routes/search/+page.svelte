<script lang="ts">
	import { search } from '$lib/stores/searchStore'
  import {onMount} from 'svelte'
  import Card from '$lib/components/Card.svelte';

	let productsSearch: any[] = [];

	const fetchSearchProducts = async (param: string) => {
		const response = await fetch(
			`http://localhost:3000/products/search?query=${param}&page=${1}&limit=${20}`
		);

		const { data } = await response.json();

		productsSearch = data
	};

  onMount(() => {
    fetchSearchProducts($search)
  })

	$: fetchSearchProducts($search);
  $: console.log({productsSearch})
</script>

{#if productsSearch.length === 0}
	<h1>No ahi productos que coincidan con la busquedad: "{$search}"</h1>	
{/if}

<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3 grid-flow-row sm:mx-0">
	{#each productsSearch as productData}
		<Card data={productData}/>
	{/each}
</div>
