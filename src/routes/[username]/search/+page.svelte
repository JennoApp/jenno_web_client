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

	const fetchSearchProducts = async (userId: string, param: string) => {
    await getServerUrl()

    // const userId = $page.url.searchParams.get('id')

    console.log({
      serverUrl,
      username: $page.params.username,
      query: param,
    })

		const response = await fetch(
			`${serverUrl}/products/searchbyuser/${userId}?query=${param}&page=${1}&limit=${20}`
		);

		const { data } = await response.json();

    console.log({data})

		productsSearch = data
	};

  $: userId = $page.url.searchParams.get('id')
  $: console.log({userId})

  onMount(() => {
   const userId = $page.url.searchParams.get('id')
    fetchSearchProducts(userId as string, $search)
  })

	$: fetchSearchProducts(userId as string, $search);
  $: console.log({productsSearch})
</script>

{#if productsSearch.length === 0}
  <div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon
			icon="mdi:card-search"
			height="5rem"
			width="5rem"
			class="text-[#707070] mb-4"
		/>
		<p class="text-lg text-[#707070] mb-2">No hay productos que coincidan con tu búsqueda: "{$search}"</p>
		<p class="text-lg text-[#707070]">
			Intenta con otros términos o categorías para encontrar lo que buscas.
		</p>
	</div>
{/if}

<div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-5 mt-14 gap-3 grid-flow-row sm:mx-0">
	{#each productsSearch as productData}
		<Card data={productData}/>
	{/each}
</div>
