<script lang="ts">

  let cartItems: any[] = []

  $: {
    cartItems = $cart.getCart()
  }

</script>

<section>
	<h2>Shopping cart</h2>
	<ul>
		{#each cartItems as item (item.id)}
			<li>
				<span>{item.itemId}</span>
				<button on:click={() => $cart.removeItem(item.id)}>Remove</button>
			</li>
		{/each}
	</ul>
</section>
