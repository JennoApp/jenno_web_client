<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Bar from '$lib/components/Bar.svelte';
  import { page } from '$app/stores'
  import { formatPrice } from '$lib/utils/formatprice'
  import { onMount } from 'svelte'
  import * as m from '$paraglide/messages'

  $: console.log($page.data.user)

  let totalRevenue = 0
  let numberOfSales = 0

  const getTotalRevenue = async (id: string) => {
    const result = await fetch(`http://localhost:3000/orders/totalrevenue/${id}`)
    const data = await result.json()

    totalRevenue = data
  }

  const getNumberOfSales = async (id: string) => {
    const result = await fetch(`http://localhost:3000/orders/numberofsales/${id}`)
    const data = await result.json()

    numberOfSales = data
  }

  $: if ($page.data.user) {
    getTotalRevenue($page.data.user._id)
    getNumberOfSales($page.data.user._id)
  }

  $: console.log($page.data.user)
</script>

<div class="grid gap-4 m-5 md:grid-cols-2 lg:grid-cols-3">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_dashboard_revenue()}</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{formatPrice(totalRevenue, 'es-CO', 'COP')}</div>
			<!-- <p class="text-xs text-muted-foreground">+20.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_dashboard_followers()}</Card.Title>
			<iconify-icon icon="gravity-ui:persons" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{$page.data.user !== undefined ? $page.data.user.followers.length: ''}</div>
			<!-- <p class="text-xs text-muted-foreground">+180.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_dashboard_sales()}</Card.Title>
			<iconify-icon icon="mdi:credit-card-outline" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{numberOfSales}</div>
			<!-- <p class="text-xs text-muted-foreground">+19% from last month</p> -->
		</Card.Content>
	</Card.Root>
</div>

<div class="grid gap-4 m-5 md:grid-cols-2">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{m.admin_dashboard_overview()}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Bar />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{m.admin_dashboard_recent_sales()}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="space-y-8">
				<div class="flex items-center">
					<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"></iconify-icon>
					<div class="ml-4 space-y-1">
						<p class="text-sm font-medium leading-none">Olivia Martin</p>
						<p class="text-sm text-muted-foreground">olivia.martin@email.com</p>
					</div>
					<div class="ml-auto font-medium">+$1,999.00</div>
				</div>
				<div class="flex items-center">
					<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"></iconify-icon>
					<div class="ml-4 space-y-1">
						<p class="text-sm font-medium leading-none">Jackson Lee</p>
						<p class="text-sm text-muted-foreground">jackson.lee@email.com</p>
					</div>
					<div class="ml-auto font-medium">+$39.00</div>
				</div>
				<div class="flex items-center">
					<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"></iconify-icon>
					<div class="ml-4 space-y-1">
						<p class="text-sm font-medium leading-none">Isabella Nguyen</p>
						<p class="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
					</div>
					<div class="ml-auto font-medium">+$299.00</div>
				</div>
				<div class="flex items-center">
					<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"></iconify-icon>
					<div class="ml-4 space-y-1">
						<p class="text-sm font-medium leading-none">William Kim</p>
						<p class="text-sm text-muted-foreground">will@email.com</p>
					</div>
					<div class="ml-auto font-medium">+$99.00</div>
				</div>
				<div class="flex items-center">
					<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"></iconify-icon>
					<div class="ml-4 space-y-1">
						<p class="text-sm font-medium leading-none">Sofia Davis</p>
						<p class="text-sm text-muted-foreground">sofia.davis@email.com</p>
					</div>
					<div class="ml-auto font-medium">+$39.00</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
