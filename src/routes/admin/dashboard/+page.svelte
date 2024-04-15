<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Bar from '$lib/components/Bar.svelte';
</script>

<div class="grid gap-4 m-5 md:grid-cols-2 lg:grid-cols-4">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Total Revenue</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">$45,231.89</div>
			<p class="text-xs text-muted-foreground">+20.1% from last month</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Followers</Card.Title>
			<iconify-icon icon="gravity-ui:persons" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">+2350</div>
			<p class="text-xs text-muted-foreground">+180.1% from last month</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Sales</Card.Title>
			<iconify-icon icon="mdi:credit-card-outline" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">+12,234</div>
			<p class="text-xs text-muted-foreground">+19% from last month</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">Active Now</Card.Title>
			<iconify-icon icon="tabler:activity" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">+573</div>
			<p class="text-xs text-muted-foreground">+201 since last hour</p>
		</Card.Content>
	</Card.Root>
</div>

<div class="grid gap-4 m-5 md:grid-cols-2">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">Overview</Card.Title>
		</Card.Header>
		<Card.Content>
			<Bar />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">Recent Sales</Card.Title>
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
