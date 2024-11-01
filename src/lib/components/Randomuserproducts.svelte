<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	export let user: string;

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

	$: console.log({ user });
	let products: any[];

	async function loadProducts(userId: string) {
		const response = await fetch(`${serverUrl}/products/user/random/${userId}`);
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
