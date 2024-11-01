<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js"
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { page } from '$app/stores';
	import { formatPrice } from '$lib/utils/formatprice';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { format } from 'timeago.js';

	export let data: PageData;

	$: console.log({ token: data.sessionToken });

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

	let walletData: any;
	let openDialogAddCart = false;
	let openDialogwithdraw = false;
  let openDialogRemove = false
	let withdrawalAmount = '';
	let withdrawalAmountforExchange = 0;

	$: console.log({ data: $page.data?.user?.walletId });
	$: console.log({ userData: $page.data?.user });

	async function fetchWallet(walletId: any) {
		const response = await fetch(`${serverUrl}/wallet/${walletId}`);

		const data = await response.json();
		walletData = data;

		return data;
	}

	onMount(() => {
		fetchWallet($page.data?.user?.walletId);
		getWithdrawals($page.data?.user?.walletId);
		fetchExchangeRate();
		// getPaypalAccount($page.data.user._id)
	});

	$: console.log({ walletData });

	let paypalAccountEmail = '';
	let paypalAccount: any;

	async function getPaypalAccount() {
		try {
			const response = await fetch(
				`${serverUrl}/users/getpaypal/${$page.data?.user?._id}`
			);

			const { account } = await response.json();
			paypalAccount = account;
      paypalAccountEmail = account
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
				`${serverUrl}/users/paypalaccount/${$page.data.user._id}`,
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

      await getPaypalAccount()
		} catch (error) {
			console.error('Error guardando la cuenta de paypal:', error);
			toast.error('Error al guardar la cuenta de PayPal');
		}
	}

  async function handleRemovePaypalAccount() {
		try {
			const response = await fetch(
				`${serverUrl}/users/removepaypalaccount/${$page.data.user._id}`,
				{
					method: 'DELETE'	
				}
			);

			if (!response.ok) {
				throw new Error('Error actualizando la cuenta del Usuario');
			}

			toast.success(`Cuenta de Paypal eliminada con exito`);
			openDialogRemove = false;

      await getPaypalAccount()
		} catch (error) {
			console.error('Error eliminando la cuenta de paypal:', error);
			toast.error('Error al eliminar la cuenta de PayPal');
		}
	}

  async function actionsPaypalAccount() {
    openDialogAddCart = true 
  }

	function formatCurrency(value: any, currencyType: any) {
		const formatter = new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: currencyType,
			minimumFractionDigits: 0
		});
		return formatter.format(value);
	}

	let exchangeRate = 0;
	let usdEquivalent = 0;

	// obtener la tasa de cambio de COP a USD
	async function fetchExchangeRate() {
		try {
			const response = await fetch(
				'https://v6.exchangerate-api.com/v6/2f1a8fc7fbff4f769bb0d245/latest/USD'
			);
			const data = await response.json();
			exchangeRate = data.conversion_rates.COP;
		} catch (error) {
			console.error('Error al obtener la tasa de cambio:', error);
		}
	}

	function calculateUsdEquivalent() {
		if (exchangeRate && withdrawalAmount !== '') {
			usdEquivalent = withdrawalAmountforExchange / exchangeRate;
		} else {
			usdEquivalent = 0;
		}
	}

	function handleInput(event: any) {
		let rawValue = event.target.value.replace(/[^0-9]/g, '');
		let processedValue = Number(rawValue);

		// valor minimo
		if (processedValue < 1) {
			processedValue = 0;
		}
		// valor maximo disponible
		if (processedValue > walletData.availableBalance) {
			processedValue = walletData.availableBalance;
		}

		if (processedValue) {
			withdrawalAmount = formatCurrency(processedValue, 'COP');
			withdrawalAmountforExchange = processedValue;
		} else {
			withdrawalAmount = '';
			withdrawalAmountforExchange = 0;
		}

		calculateUsdEquivalent();
	}

	async function handleSubmit(account: any, amount: number, amountUsd: number) {
		try {
			if (!data.sessionToken) {
				toast.error('Token de sesion no encontrado');
				return;
			}

			if (amount <= 0 || amountUsd <= 0) {
				toast.error('El monto debe ser mayor a 0');
				return;
			}

			// Formatear los montos segun requerimientos de Paypal
			const formattedAmount = amount.toFixed(2);
			const formattedAmountUsd = amountUsd.toFixed(2);

			console.log('Datos enviados:', { account, formattedAmount, formattedAmountUsd });

			const response = await fetch(`${serverUrl}/wallet/withdraw/${account}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.sessionToken}`
				},
				body: JSON.stringify({
					amount: formattedAmount, //monto en COP
					amountUsd: formattedAmountUsd // monto en dolares
				})
			});

			if (response.ok) {
				toast.success('Retiro solicitado con exito');
				openDialogwithdraw = false;

				// Recargar los datos de la pagina
				await fetchWallet($page.data?.user?.walletId);
			} else {
				const errorMessage = await response.json();
				console.error('Detalles del error:', errorMessage);
				toast.error(`Error al solicitar retiro: ${errorMessage.message || 'Error desconocido'}`);
			}
		} catch (error) {
			console.error('Error al procesar el retiro:', error);
			toast.error(`Error en la conexión con el servidor: ${error?.message || 'Error desconocido'}`);
		}
	}

	////////////////
	// Tabla de retiros //
	let withdrawals: any = [];
	let withdrawalsPaypalDetails: any = [];
	let table: any;

	$: console.log({ withdrawals });

	async function getWithdrawals(walletId: string) {
		try {
			const response = await fetch(`${serverUrl}/wallet/getwithdrawals/${walletId}`);

			if (response.ok) {
				const data = await response.json();
				console.log({ Datos: data });

				if (data) {
					withdrawals = data;
				} else {
					console.error('La respuesta no contiene la propiedad withdrawals');
				}
			} else {
				console.error('Error al obtener la billetera');
			}
		} catch (error) {
			console.error('Error en la solicitud:', error);
		}
	}

	async function getWithdrawalsPaypalDetails(batchId: any) {
		try {
			const response = await fetch(
				`${serverUrl}/wallet/getPaypalPayoutDetails/${batchId?.payoutBatchId}`
			);
			if (response.ok) {
				const data = await response.json();
				console.log({ data });
				withdrawalsPaypalDetails = [...withdrawalsPaypalDetails, data];
				return data;
			} else {
				console.error('Error en la solicitud: Paypal Details');
			}
		} catch (error) {
			console.error('Error al solicitar informacion');
		}
	}

	$: if (withdrawals) {
		withdrawals.map((batchId: any) => {
			getWithdrawalsPaypalDetails(batchId);
		});
	}

	$: console.log({ withdrawalsPaypalDetails });
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
			<div class="flex flex-col bg-[#202020] h-48 w-96 rounded-md">
				<div class="flex flex-row-reverse h-10 w-full">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="m-2">
							<iconify-icon icon="charm:menu-kebab" height="1.5rem" width="1.5rem"></iconify-icon>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Group>
								<DropdownMenu.Label>Actions</DropdownMenu.Label>
								<DropdownMenu.Item on:click={() => actionsPaypalAccount()}>
									<iconify-icon
										icon="material-symbols:update"
										height="1.1rem"
										width="1.1rem"
										class="text-gray-200 flex justify-center items-center"
									/>
									<span class="ml-3">Actualizar</span>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:!bg-red-500 bg-opacity-60"
                  on:click={() => {
                    openDialogRemove = true
                  }}>
									<iconify-icon
										icon="material-symbols:delete"
										height="1.1rem"
										width="1.1rem"
										class="text-gray-200 flex justify-center items-center"
									/>
									<span class="ml-3">Eliminar</span>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<div class="flex flex-col gap-5 items-center mt-3">
					<iconify-icon icon="logos:paypal" height="2rem" width="2rem"></iconify-icon>
					<h1 class="text-lg font-semibold">{paypalAccount}</h1>
				</div>
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
	<h2 class="my-5 text-xl font-semibold">Retiros</h2>
</div>

{#if withdrawalsPaypalDetails && withdrawalsPaypalDetails.length > 0}
	<div class="overflow-x-auto mx-10 my-5 border rounded-md shadow">
		<table class="min-w-full table-auto divide-y divide-gray-200 dark:divide-[#303030]">
			<!-- Cabecera de la tabla -->
			<thead class="dark:bg-[#202020]">
				<tr>
					<th
						class="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider"
						>Payout ID</th
					>
					<th
						class="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider"
						>Monto USD</th
					>
					<th
						class="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider"
						>Estado</th
					>
					<th
						class="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider"
						>Fecha</th
					>
				</tr>
			</thead>

			<!-- Cuerpo de la tabla -->
			<tbody class="dark:bg-[#202020] divide-y divide-gray-200 dark:divide-[#303030]">
				{#each withdrawalsPaypalDetails as detail}
					<tr class="hover:bg-[#121212]">
						<td class="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-200"
							>{detail.batch_header.payout_batch_id || 'No ID'}</td
						>
						<td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200"
							>{detail.batch_header.amount.value || 'No amount'} USD</td
						>
						<td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200"
							>{detail.batch_header.batch_status || 'No status'}</td
						>
						<td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200"
							>{format(detail.batch_header.time_created) || 'No date'}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-center text-gray-500">No se encontraron datos.</p>
{/if}

<!-- Dialog Add Bank Account -->
<Dialog.Root bind:open={openDialogAddCart}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{paypalAccount ? 'Actualizar Cuenta de PayPal' : 'Agregar Cuenta de PayPal'}</Dialog.Title>
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
							>{paypalAccount ? 'Actualizar': 'Agregar'}</button
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

		<form
			on:submit|preventDefault={() =>
				handleSubmit(paypalAccount, Number(withdrawalAmountforExchange), Number(usdEquivalent))}
		>
			<div class="flex w-full">
				<label for="withdrawAmount">Monto a retirar:</label>
				<div class="flex flex-col w-full">
					<Input
						type="text"
						min={1}
						max={walletData?.availableBalance}
						on:input={handleInput}
						name="profile"
						class=""
						bind:value={withdrawalAmount}
						placeholder="Ingrese el monto"
					/>
					<div class="flex justify-between">
						<!-- Mostrar el equivalente en USD -->
						{#if exchangeRate}
							<p class="text-gray-500 text-sm">
								Equivalente en Dolares: ${usdEquivalent.toFixed(2)} USD
							</p>
						{:else}
							<p>Obteniendo tasa de cambio...</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="flex gap-3 mt-3">
				<label for="paypalEmail">Cuenta de PayPal:</label>
				{#if paypalAccount}
					<h3>{paypalAccount}</h3>
				{:else}
					<h3 class="text-orange-400">Agregar Cuenta de Paypal</h3>
				{/if}
			</div>
			<div class="flex flex-row-reverse mt-3">
				<Button type="submit">Retirar</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>


<AlertDialog.Root bind:open={openDialogRemove}>
  <AlertDialog.Trigger />
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>¿Estás absolutamente seguro?</AlertDialog.Title>
      <AlertDialog.Description>
         Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y eliminará tus datos de nuestros servidores.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel class="dark:border-[#252525] dark:hover:bg-[#252525]" on:click={() => {
        openDialogRemove = false
      }}>Cancelar</AlertDialog.Cancel>
      <AlertDialog.Action on:click={() => {
        handleRemovePaypalAccount()
      }}>Continuar</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
