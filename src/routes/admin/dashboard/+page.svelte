<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Bar from '$lib/components/Bar.svelte';
	import { page } from '$app/stores';
	import { formatPrice } from '$lib/utils/formatprice';
	import { onMount } from 'svelte';
	import * as m from '$paraglide/messages';
	import type { PageServerData } from './$types';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	export let data: PageServerData;

	// variables de estado
	let serverUrl: string;
	let walletData: any;
	let totalRevenue = 0;
	let numberOfSales = 0;

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	// $: getServerUrl();

	// Obtener datos de la cuenta del usuario
	const getTotalRevenue = async (id: string) => {
		if (!serverUrl) {
			await getServerUrl();
		}
		const response = await fetch(`${serverUrl}/orders/totalrevenue/${id}`);

		// Verifica el estado de la respuesta
		if (!response.ok) {
			console.error('Error en la solicitud al servidor:', response.statusText);
			return;
		}

		// Verifica que la respuesta sea de tipo JSON
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			console.error('La respuesta no es JSON');
			return;
		}

		const data = await response.json();
		totalRevenue = data.totalRevenue
	};

	// Obtener el número de ventas del usuario
	const getNumberOfSales = async (id: string) => {
		try {
			// Asegura que serverUrl esté definido
			if (!serverUrl) {
				await getServerUrl();
			}

			const response = await fetch(`${serverUrl}/orders/numberofsales/${id}`);

			// Verifica el estado de la respuesta
			if (!response.ok) {
				console.error('Error en la solicitud al servidor:', response.statusText);
				return;
			}

			// Verifica que la respuesta sea de tipo JSON
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				console.error('La respuesta no es JSON');
				return;
			}

			// Asigna los datos a numberOfSales
			const data = await response.json();
			numberOfSales = data.numberOfSales
		} catch (error) {
			console.error('Error al obtener el número de ventas:', error);
		}
	};

	// Obtener datos de la billetera del usuario
	async function fetchWallet(walletId: string) {
		try {
			if (!serverUrl) {
				await getServerUrl();
			}

			const response = await fetch(`${serverUrl}/wallet/${walletId}`);

			// Verifica el estado de la respuesta y si el contenido es JSON
			if (!response.ok) {
				console.error('Error en la solicitud al servidor:', response.statusText);
				return;
			}

			// Verifica el tipo de contenido para asegurarte de que sea JSON
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				console.error('La respuesta no es JSON');
				return;
			}

			const data = await response.json();
			walletData = data.wallet;

			return data;
		} catch (error) {
			console.error('Error al obtener informacion del wallet del usuario!');
		}
	}

	// Datos dependiente del usuario
	$: if ($page.data.user) {
		getTotalRevenue($page.data.user._id);
		getNumberOfSales($page.data.user._id);
		fetchWallet($page.data.user.walletId);
	}

	// Depuracion
	$: console.log($page.data.user);
	$: console.log({ data });
	$: console.log($page.data.user);
</script>

<div class="grid gap-4 m-5 md:grid-cols-2 lg:grid-cols-3">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_dashboard_revenue()}</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
        {walletData !== undefined
					? formatPrice(walletData?.totalEarned, 'es-CO', 'COP')
					: 'Cargando...'}
      </div>
			<!-- <p class="text-xs text-muted-foreground">+20.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_dashboard_followers()}</Card.Title>
			<iconify-icon icon="gravity-ui:persons" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{$page.data.user !== undefined ? $page.data.user.followers.length : ''}
			</div>
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

<div class="grid gap-4 m-5">
	<!-- <Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{m.admin_dashboard_overview()}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Bar />
		</Card.Content>
	</Card.Root> -->

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{m.admin_dashboard_recent_sales()}</Card.Title>
		</Card.Header>
		<Card.Content>
			<ScrollArea class="h-96 p-1">
				<div class="space-y-8">
					{#if data.salesList?.length !== 0}
						{#each data?.salesList as order}
							<div class="flex items-center">
								{#if order?.buyerProfileImg !== ''}
									<img
										src={order?.buyerProfileImg}
										alt={order?.buyerName}
										class="h-9 w-9 object-cover ml-1 rounded-full"
									/>
								{/if}
								<iconify-icon icon="material-symbols:person" height="1.5rem" width="1.5rem"
								></iconify-icon>
								<div class="ml-4 space-y-1">
									<p class="text-sm font-medium leading-none">{order.buyerName}</p>
								</div>
								<div class="ml-auto font-medium">
									+{formatPrice(order?.amount * order?.product?.price, 'es-CO', 'COP')}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</ScrollArea>
		</Card.Content>
	</Card.Root>
</div>
