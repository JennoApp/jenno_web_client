<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog"
	import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
	import { page } from '$app/stores'
	import { formatPrice } from '$lib/utils/formatprice'
	import { onMount } from 'svelte'

	let walletData: any;
  let openDialogAddCart = false
  let openDialogwithdraw = false

	$: console.log({ data: $page.data.user.walletId });

	async function fetchWallet(walletId: any) {
		const response = await fetch(`http://localhost:3000/wallet/${walletId}`);

		const data = await response.json();
		walletData = data;

		return data;
	}

	onMount(() => {
		fetchWallet($page.data.user.walletId);
	});

	$: console.log({ walletData });
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
	<div class="flex  items-center justify-between">
		<h2 class="my-5 text-xl font-semibold">Cuenta Bancaria</h2>
    <Button on:click={() => {
      openDialogwithdraw = true
    }}>Retirar</Button>
	</div>
	<div>
		<button
			class="flex items-center justify-center bg-[#202020] h-48 w-96 rounded-md"
			on:click|preventDefault={() => {
        openDialogAddCart = true
      }}
		>
			<iconify-icon icon="ph:plus-bold" height="2rem" width="2rem"></iconify-icon>
		</button>
	</div>
</div>

<div class="m-5 mt-10">
  <h2 class="my-5 text-xl font-semibold">Historial de transacciones</h2>
  <div>
    
  </div>
</div>



<!-- Dialog Add Bank Account -->
<Dialog.Root bind:open={openDialogAddCart}>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Agregar Cuenta Bancaria</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<!-- Dialog Withdraw -->
<Dialog.Root bind:open={openDialogwithdraw}>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Retirar Deposito</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
