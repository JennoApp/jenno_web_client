<script lang="ts">
	import { search } from '$lib/stores/searchStore'
  import {onMount} from 'svelte'
  import Card from '$lib/components/Card.svelte';
  import { page } from '$app/stores'

	let productsSearch: any[] = [];

   // Obtener url del servidor
  let serverUrl: string
  async function getServerUrl() {
    try {
      const response = await fetch(`/api/server`)
      const data = await response.json()

      serverUrl = data.server_url 
    } catch (error) {
      console.error('Error al solicitar Paypal Id')
    }
  }

  $: getServerUrl()

	const fetchSearchProducts = async (param: string) => {
		const response = await fetch(
			`${serverUrl}/products/searchbyuser/${$page.params.username}?query=${param}&page=${1}&limit=${20}`
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
