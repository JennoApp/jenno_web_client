<script lang="ts">
  import * as Card from '$lib/components/ui/card';
	import Bar from '$lib/components/Bar.svelte';
  import { page } from '$app/stores'
  import { formatPrice } from '$lib/utils/formatprice'
</script>



<div class="flex max-w-full h-20 px-5 m-5 py-4 flex-shrink">
  <h2 class="text-xl font-semibold text-gray-200">Wallet</h2>
</div>

<div class="grid gap-4 mx-5 md:grid-cols-2 lg:grid-cols-3">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Total Ganado</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">$10000</div>
			<!-- <p class="text-xs text-muted-foreground">+20.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Saldo Disponible</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">$45000</div>
			<!-- <p class="text-xs text-muted-foreground">+180.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Saldo Pendiente</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">$45000</div>
			<!-- <p class="text-xs text-muted-foreground">+19% from last month</p> -->
		</Card.Content>
	</Card.Root>
</div>
