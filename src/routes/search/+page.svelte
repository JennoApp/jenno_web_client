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

<div class="grid lg:grid-cols-4 sm:grid-cols-3 mx-5 mt-14 gap-5 grid-flow-row">
	{#each productsSearch as productData}
		<Card data={productData}/>
	{/each}
</div>
