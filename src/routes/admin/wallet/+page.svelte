<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { formatPrice } from '$lib/utils/formatprice';
	import { onMount } from 'svelte';
	import Stripe from 'stripe';
	import { toast } from 'svelte-sonner';

	// api key of stripe
	const stripe = new Stripe(
		'sk_test_51OwBS403Ci0grIYp0SpTaQX8L2K7dYLMLc6OBcVFgOMfx7848THFeaVXWI2HoaVDyjKIJHivaqLfq2SGZE1HUFhU00FqyBwntr'
	);

	let walletData: any;
	let openDialogAddCart = false;
	let openDialogwithdraw = false;
	let withdrawalAmount = '';

	let UserId = $page.data.user._id;

	$: console.log({ data: $page.data.user.walletId });
	$: console.log({ userData: $page.data.user });

	async function fetchWallet(walletId: any) {
		const response = await fetch(`http://localhost:3000/wallet/${walletId}`);

		const data = await response.json();
		walletData = data;

		return data;
	}

	onMount(() => {
		fetchWallet($page.data.user.walletId);
		// getPaypalAccount($page.data.user._id)
	});

	$: console.log({ walletData });

	let paypalAccountEmail = '';
	let paypalAccount: any;

	async function getPaypalAccount() {
		try {
			const response = await fetch(`http://localhost:3000/users/getpaypal/${$page.data.user._id}`);

			const { account } = await response.json();
			paypalAccount = account;
		} catch (error) {
			console.log(error);
		}
	}

	$: console.log({ usreData: paypalAccount });

	$: {
		getPaypalAccount();
	}

	async function handleSubmitAddPaypalAccount() {
		try {
			const response = await fetch(
				`http://localhost:3000/users/paypalaccount/${$page.data.user._id}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						paypalAccount: paypalAccountEmail.trim()
					})
				}
			);

			if (!response.ok) {
				throw new Error('Error actualizando la cuenta del Usuario');
			}
			// const data = await response.json()

			toast.success(`Cuenta de Paypal guardada con exito`);
			openDialogAddCart = false;
		} catch (error) {
			console.error('Error guardando la cuenta de paypal:', error);
			toast.error('Error al guardar la cuenta de PayPal');
		}
	}
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
			<div class="text-2xl font-bold">{formatPrice(walletData?.totalEarned, 'es-CO', 'COP')}</div>
			<!-- <p class="text-xs text-muted-foreground">+20.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Saldo Disponible</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{formatPrice(walletData?.availableBalance, 'es-CO', 'COP')}
			</div>
			<!-- <p class="text-xs text-muted-foreground">+180.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Saldo Pendiente</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{formatPrice(walletData?.pendingBalance, 'es-CO', 'COP')}
			</div>
			<!-- <p class="text-xs text-muted-foreground">+19% from last month</p> -->
		</Card.Content>
	</Card.Root>
</div>

<div class="m-5 mt-10">
	<div class="flex items-center justify-between">
		<h2 class="my-5 text-xl font-semibold">Cuenta Asociada</h2>
		<Button
			on:click={() => {
				openDialogwithdraw = true;
			}}>Retirar</Button
		>
	</div>
	<div>
		{#if paypalAccount}
			<div
				class="flex flex-col gap-5 items-center justify-center bg-[#202020] h-48 w-96 rounded-md"
			>
				<iconify-icon icon="logos:paypal" height="2rem" width="2rem"></iconify-icon>
				<h1 class="text-lg font-semibold">{paypalAccount}</h1>
			</div>
		{:else}
			<button
				class="flex items-center justify-center bg-[#202020] h-48 w-96 rounded-md"
				on:click|preventDefault={() => {
					openDialogAddCart = true;
				}}
			>
				<iconify-icon icon="ph:plus-bold" height="2rem" width="2rem"></iconify-icon>
			</button>
		{/if}
	</div>
</div>

<div class="m-5 mt-10">
	<h2 class="my-5 text-xl font-semibold">Historial de transacciones</h2>
	<div></div>
</div>

<!-- Dialog Add Bank Account -->
<Dialog.Root bind:open={openDialogAddCart}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Agregar Cuenta de PayPal</Dialog.Title>
			<Dialog.Description>
				<form on:submit|preventDefault={handleSubmitAddPaypalAccount}>
					<div class="mt-3">
						<label for="">Email PayPal</label>
						<input
							bind:value={paypalAccountEmail}
							class="flex w-full h-8 mt-2 text-gray-200 rounded-md dark:bg-[#202020]"
							type="email"
							placeholder="email@example.com"
							required
						/>
					</div>

					<div class="flex flex-row-reverse">
						<button
							class="h-8 p-2 mt-5 bg-purple-600 dark:text-gray-200 hover:bg-purple-700 rounded-md"
							>Agregar cuenta de PayPal</button
						>
					</div>
				</form>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<!-- Dialog Withdraw -->
<Dialog.Root bind:open={openDialogwithdraw}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Retirar Depósito</Dialog.Title>
			<Dialog.Description>
				Ingrese el monto que desea retirar a su cuenta de PayPal:
			</Dialog.Description>
		</Dialog.Header>

		<div class="">
			<label for="withdrawAmount">Monto a retirar</label>
			<input
				id="withdrawAmount"
				type="number"
				bind:value={withdrawalAmount}
				placeholder="Ingrese el monto en COP o USD"
			/>
		</div>

		<div class="flex gap-3">
			<label for="paypalEmail">Cuenta de PayPal:</label>
      {#if paypalAccount}
      <h3>{paypalAccount}</h3> 
      {:else}
      <h3 class="text-orange-400">Agregar Cuenta de Paypal</h3>
      {/if}
			
		</div>

		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
