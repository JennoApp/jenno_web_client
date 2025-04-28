<script lang="ts">
	// Importaciones de componentes UI y utilidades
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as m from '$paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { formatPrice } from '$lib/utils/formatprice';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { format } from 'timeago.js';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/input/input.svelte';

	// Datos iniciales y variables de estado
	export let data: PageData;

	let walletData: any;
	let openDialogwithdraw = false;
	let openDialogRemove = false;
	let withdrawalAmount = '';
	let withdrawalAmountforExchange = 0;
	let bankAccounts: any[] = [];
	let exchangeRate = 0;
	let usdEquivalent = 0;
	let withdrawals: any = [];
	let withdrawalsPaypalDetails: any = [];

	// Estado del diálogo
	let openDialogAddBankAccount = false;
	// Si estamos editando, guardamos el objeto existente
	let editingBankAccount: any = null;
	let selectedAccountId: string = '';

	// Campos del formulario
	let bankType = '';
	let accountType = '';
	let accountNumber = '';
	let name = '';
	let legalIdType = '';
	let legalId = '';

	// Flag para evitar múltiples inicializaciones
	let isFirstOpen = true;

	// Solo inicializar una vez cuando se abre el diálogo
	$: if (openDialogAddBankAccount && isFirstOpen && editingBankAccount) {
		bankType = editingBankAccount.bankType;
		accountType = editingBankAccount.accountType;
		accountNumber = editingBankAccount.accountNumber;
		name = editingBankAccount.name;
		legalIdType = editingBankAccount.legalIdType;
		legalId = editingBankAccount.legalId;
		isFirstOpen = false; // ya cargado
	}

	// Reset cuando se cierra el modal
	$: if (!openDialogAddBankAccount) {
		isFirstOpen = true; // permite una nueva carga la próxima vez
		// Opcional: puedes limpiar los campos si es para "crear nueva cuenta"
	}

	function editBankAccount(account: any) {
		editingBankAccount = account;
		openDialogAddBankAccount = true;
	}

	/////////////////////////

	let serverUrl: string;

	// Obtener url del servidor
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Url del servidor');
		}
	}

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
			bankAccounts = data.wallet.bankAccounts || [];

			return data;
		} catch (error) {
			console.error('Error al obtener informacion del wallet del usuario!');
		}
	}

	// Eliminar cuenta bancaria
	async function handleRemoveBankAccount(accountId: string) {
		console.log('account:', accountId);

		if (!accountId) {
			toast.error('ID de la cuenta no válido');
			return;
		}
		try {
			const res = await fetch(`${serverUrl}/wallet/bankAccounts/delete/${accountId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${$page.data.sessionToken}`
				}
			});
			if (!res.ok) throw new Error(res.statusText);
			toast.success('Cuenta bancaria eliminada con éxito');

			// Recargar los datos de la pagina
			await fetchWallet($page.data?.user?.walletId);
		} catch (err) {
			console.error(err);
			toast.error('Error al eliminar la cuenta bancaria');
		}
	}

	// Formatear moneda
	function formatCurrency(value: any, currencyType: any) {
		const formatter = new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: currencyType,
			minimumFractionDigits: 0
		});
		return formatter.format(value);
	}

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

	// Calcular equivalente en USD
	function calculateUsdEquivalent() {
		if (exchangeRate && withdrawalAmount !== '') {
			usdEquivalent = withdrawalAmountforExchange / exchangeRate;
		} else {
			usdEquivalent = 0;
		}
	}

	// menejar el retiro
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

	function parseCurrency(value: string): number {
		const numeric = value.replace(/[^\d.-]/g, '');
		return Number(numeric);
	}

	// Manejar el envío de retiro
	async function handleSubmit() {
		const amount = parseCurrency(withdrawalAmount);
		if (!selectedAccountId) {
			toast.error('Seleccione una cuenta destino');
			return;
		}
		if (isNaN(amount) || amount <= 0) {
			toast.error('El monto debe ser mayor a 0');
			return;
		}
		const sessionToken = $page.data.sessionToken;
		if (!sessionToken) {
			toast.error('Token de sesión no encontrado');
			return;
		}

		console.log('Datos de retiro:', { selectedAccountId, amount });

		try {
			const response = await fetch(`${serverUrl}/wallet/withdraw/${selectedAccountId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$page.data?.sessionToken}`
				},
				body: JSON.stringify({ amount })
			});

			if (response.ok) {
				toast.success('Retiro solicitado con éxito');
				openDialogwithdraw = false;
				await fetchWallet($page.data?.user?.walletId);
			} else {
				const errorMessage = await response.json();
				console.error('Detalles del error:', errorMessage);
				toast.error(
					`Error al solicitar retiro: ${errorMessage.error || errorMessage.message || 'Error desconocido'}`
				);
			}
		} catch (error: any) {
			console.error('Error al procesar el retiro:', error);
			toast.error(`Error en la conexión con el servidor: ${error?.message || 'Error desconocido'}`);
		}
	}

	// Obtener retiros
	async function getWithdrawals(walletId: string) {
		try {
			const response = await fetch(`${serverUrl}/wallet/getwithdrawals/${walletId}`);

			if (response.ok) {
				const data = await response.json();
				console.log({ Datos: data.withdrawals });

				if (data) {
					withdrawals = data.withdrawals;
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

	// Carga inicial de datos
	onMount(async () => {
		await fetchWallet($page.data?.user?.walletId);
		await getWithdrawals($page.data?.user?.walletId);
		fetchExchangeRate();
	});
</script>

<div class="flex max-w-full h-20 px-5 m-5 py-4 flex-shrink">
	<h2 class="text-xl font-semibold text-black dark:text-gray-200">{m.admin_wallet_title()}</h2>
</div>

<div class="grid gap-4 mx-5 md:grid-cols-2 lg:grid-cols-3">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_wallet_earnings()}</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{walletData !== undefined
					? formatPrice(walletData?.totalEarned, 'es-CO', 'COP')
					: 'Cargando...'}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_wallet_available()}</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{walletData !== undefined
					? formatPrice(walletData?.availableBalance, 'es-CO', 'COP')
					: 'Cargando...'}
			</div>
			<!-- <p class="text-xs text-muted-foreground">+180.1% from last month</p> -->
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">{m.admin_wallet_pending()}</Card.Title>
			<iconify-icon icon="mdi:dollar" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{walletData !== undefined
					? formatPrice(walletData?.pendingBalance, 'es-CO', 'COP')
					: 'Cargando...'}
			</div>
			<!-- <p class="text-xs text-muted-foreground">+19% from last month</p> -->
		</Card.Content>
	</Card.Root>
</div>

<div class="m-5 mt-10">
	<h2 class="my-5 text-xl font-semibold">Cuentas Asociadas</h2>

	<div class="flex flex-wrap gap-4">
		{#each bankAccounts as account}
			<div class="flex flex-col bg-gray-200 dark:bg-[#202020] h-48 w-96 rounded-md">
				<div class="flex flex-row-reverse h-10 w-full">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="m-2">
							<iconify-icon icon="charm:menu-kebab" height="1.5rem" width="1.5rem" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Group>
								<DropdownMenu.Label>Acciones</DropdownMenu.Label>
								<DropdownMenu.Item on:click={() => editBankAccount(account)}>
									<iconify-icon
										icon="material-symbols:update"
										height="1.1rem"
										width="1.1rem"
										class="text-gray-200"
									/>
									<span class="ml-3">Actualizar</span>
								</DropdownMenu.Item>

								<DropdownMenu.Item
									class="hover:!bg-red-500 bg-opacity-60"
									on:click={() => handleRemoveBankAccount(account._id)}
								>
									<iconify-icon
										icon="material-symbols:delete"
										height="1.1rem"
										width="1.1rem"
										class="text-gray-200"
									/>
									<span class="ml-3">Eliminar</span>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>

				<div class="flex flex-col items-center justify-center flex-1 gap-2">
					{#if account.bankType === 'NEQUI'}
						<iconify-icon icon="arcticons:nequi-colombia" height="5rem" width="5rem" />
						<div class="text-lg font-semibold">{account.accountNumber}</div>
					{:else}
						<iconify-icon icon="arcticons:bancolombia" height="5rem" width="5rem" />
						<div class="text-lg font-semibold">{account.accountNumber}</div>
						<div class="text-sm text-gray-600 dark:text-gray-400">{account.accountType}</div>
					{/if}
				</div>
			</div>
		{/each}

		{#if bankAccounts.length < 2}
			<button
				class="flex items-center justify-center bg-gray-200 dark:bg-[#202020] h-48 w-96 rounded-md dark:text-white"
				on:click={() => {
					editingBankAccount = null;
					openDialogAddBankAccount = true;
				}}
			>
				<iconify-icon icon="ph:plus-bold" height="2rem" width="2rem" />
			</button>
		{/if}
	</div>
</div>

<div class="m-5 mt-10">
	<div class="flex items-center justify-between">
		<h2 class="my-5 text-xl font-semibold">{m.admin_wallet_withdrawals_title()}</h2>
		<Button
			class="bg-gray-200 hover:bg-gray-300 text-black dark:text-black"
			on:click={() => {
				openDialogwithdraw = true;
			}}>Retirar</Button
		>
	</div>
</div>

<div class="grid gap-4 mx-5 md:grid-cols-2 lg:grid-cols-3">
	<!-- Card: Total Retirado -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Total Retirado</Card.Title>
			<iconify-icon icon="mdi:bank-transfer-out" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{walletData
					? formatPrice(walletData?.withdrawalTotalBalance, 'es-CO', 'COP')
					: 'Cargando...'}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Card: Retiros Pendientes -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-md font-medium">Retiros Pendientes</Card.Title>
			<iconify-icon icon="mdi:timer-sand" height="1.5rem" width="1.5rem"></iconify-icon>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">
				{walletData
					? formatPrice(walletData?.withdrawalPendingBalance, 'es-CO', 'COP')
					: 'Cargando...'}
			</div>
		</Card.Content>
	</Card.Root>
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
	<p class="text-center text-gray-500">{m.admin_wallet_withdrawals_no_data()}</p>
{/if}

<!-- Dialog Add/Update Bank Account -->
<Dialog.Root bind:open={openDialogAddBankAccount}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{editingBankAccount ? 'Actualizar Cuenta Bancaria' : 'Agregar Cuenta Bancaria'}
			</Dialog.Title>
			<Dialog.Description>
				<form
					method="post"
					action="?/saveBankAccount"
					use:enhance={() => {
						return async () => {
							await fetchWallet($page.data?.user?.walletId); // Recargar datos
							openDialogAddBankAccount = false;
							toast.success(
								editingBankAccount ? 'Cuenta actualizada con éxito' : 'Cuenta agregada con éxito'
							);
						};
					}}
				>
					<!-- 1. Bank Type -->
					<div class="mt-3">
						<label for="bankType">Entidad</label>
						<select
							id="bankType"
							name="bankType"
							bind:value={bankType}
							class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
							required
						>
							<option value="" disabled selected>Selecciona Bancolombia o Nequi</option>
							<option value="BANCOLOMBIA" class="dark:text-gray-200">Bancolombia</option>
							<option value="NEQUI" class="dark:text-gray-200">Nequi</option>
						</select>
					</div>

					<!-- 2. Account Type -->
					<div class="mt-3">
						<label for="accountType">Tipo de Cuenta</label>
						<select
							id="accountType"
							name="accountType"
							bind:value={accountType}
							class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
							required
							disabled={bankType === 'NEQUI'}
						>
							<option value="" disabled selected>Selecciona Ahorros o Corriente</option>
							<option value="AHORROS" class="dark:text-gray-200">Ahorros</option>
							<option value="CORRIENTE" class="dark:text-gray-200">Corriente</option>
						</select>
						{#if bankType === 'NEQUI'}
							<p class="text-xs text-gray-500 mt-1">Nequi sólo soporta AHORROS</p>
						{/if}
					</div>

					<!-- 3. Número de Cuenta / Celular -->
					<div class="mt-3">
						<label for="accountNumber">
							{bankType === 'NEQUI' ? 'Número Celular' : 'Número de Cuenta'}
						</label>
						<input
							id="accountNumber"
							name="accountNumber"
							type="text"
							bind:value={accountNumber}
							class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
							placeholder={bankType === 'NEQUI' ? '3001234567' : '0001234567890'}
							required
						/>
					</div>

					<!-- 4. Nombre del Titular -->
					<div class="mt-3">
						<label for="name">Nombre del Titular</label>
						<input
							id="name"
							name="name"
							type="text"
							bind:value={name}
							class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
							placeholder="Juan Pérez"
							required
						/>
					</div>

					<!-- 5. Tipo y Número de Identificación -->
					<div class="mt-3 flex gap-2">
						<div class="w-1/3">
							<label for="legalIdType">Tipo Identificación</label>
							<select
								id="legalIdType"
								name="legalIdType"
								bind:value={legalIdType}
								class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
								required
							>
								<option value="" disabled selected>CC o NIT</option>
								<option value="CC" class="dark:text-gray-200">CC</option>
								<option value="NIT" class="dark:text-gray-200">NIT</option>
							</select>
						</div>
						<div class="w-2/3">
							<label for="legalId">Número Identificación</label>
							<input
								id="legalId"
								name="legalId"
								type="text"
								bind:value={legalId}
								class="w-full h-8 mt-2 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
								placeholder="1234567890"
								required
							/>
						</div>
					</div>

					<!-- Oculto si es actualización -->
					{#if editingBankAccount}
						<input type="hidden" name="accountId" value={editingBankAccount._id} />
					{/if}

					<!-- Submit -->
					<div class="flex justify-end mt-5">
						<button
							type="submit"
							class="h-10 px-4 bg-gray-200 text-black hover:bg-gray-300 rounded-md"
						>
							{editingBankAccount ? 'Actualizar' : 'Agregar'}
						</button>
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
			<Dialog.Title>{m.admin_wallet_withdrawals_modal_title()}</Dialog.Title>
			<Dialog.Description>
				{m.admin_wallet_withdrawals_modal_subtitle()}
			</Dialog.Description>
		</Dialog.Header>

		<form
			on:submit|preventDefault={handleSubmit}
		>
			<div class="flex w-full">
				<label for="withdrawAmount"
					>{m.admin_wallet_withdrawals_modal_amount_withdraw_label()}</label
				>
				<div class="flex flex-col w-full">
					<Input
						type="text"
						min={1}
						max={walletData?.availableBalance}
						on:input={handleInput}
						name="profile"
						bind:value={withdrawalAmount}
						placeholder="Ingrese el monto"
						required
					/>
					<small>Disponible: {walletData.availableBalance}</small>
				</div>
			</div>

			<!-- Selector de cuenta destino -->
			<div class="flex flex-col">
				<label for="" class="mb-1"> Elige cuenta destino para el retiro </label>
				{#if bankAccounts.length > 0}
					<select
						bind:value={selectedAccountId}
						class="w-full h-10 rounded-md dark:bg-[#202020] text-black dark:text-gray-200"
						required
					>
						<option value="" disabled selected>Seleccione cuenta destino</option>
						{#each bankAccounts as acct}
							<option value={acct._id}>
								{acct.bankType === 'NEQUI' ? 'Nequi' : 'Bancolombia'} —
								{acct.accountType === 'AHORROS' ? 'Ahorros' : 'Corriente'}:
								{acct.accountNumber}
							</option>
						{/each}
					</select>
				{:else}
					<p class="text-sm text-red-500">
						No tienes cuentas bancarias asociadas. Por favor agrega una cuenta primero.
					</p>
				{/if}
			</div>

			<div class="flex flex-row-reverse mt-3">
				<Button
					class="bg-gray-200 hover:bg-gray-300 text-black dark:text-black"
					type="submit"
					disabled={!selectedAccountId || parseCurrency(withdrawalAmount) <= 0}>Retirar</Button
				>
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
				Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y eliminará tus
				datos de nuestros servidores.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				class="dark:border-[#252525] dark:hover:bg-[#252525]"
				on:click={() => {
					openDialogRemove = false;
				}}>Cancelar</AlertDialog.Cancel
			>
			<AlertDialog.Action
				on:click={() => {
					// handleRemoveBankAccount();
				}}>Continuar</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
