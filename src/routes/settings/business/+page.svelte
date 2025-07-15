<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import * as Select from '$lib/components/ui/select';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	export let data: PageData;
	export let form: ActionData;
	// let selected: any[] = [];
  // let initialized = false;

	// $: console.log({ 'selected Carriers': selected });

	// const addCarrier = (index: string) => {
	// 	console.log('Valor recibido:', index);
	// 	const i = parseInt(index);
	// 	const carrier = data.availableCarriers[i];
	// 	if (!carrier) return;

	// 	console.log('Transportadora seleccionada:', carrier);

	// 	if (selected.find((c) => c.name === carrier.name)) return;
	// 	if (selected.length >= 3) {
	// 		toast.error('Solo puedes seleccionar hasta 3 transportadoras');
	// 		return;
	// 	}
	// 	selected = [...selected, carrier];
	// };

	// const removeCarrier = (carrierName: string) => {
	// 	selected = selected.filter((c) => c.name !== carrierName);
	// };

	let user = $page.data.user;


	// $: if (
	// 	!initialized &&
	// 	user?.carriersAllowed?.length > 0 &&
	// 	data?.availableCarriers?.length > 0
	// ) {
	// 	selected = user.carriersAllowed
	// 		.map((savedCarrier: any) => data.availableCarriers.find((c: any) => c.name === savedCarrier.name))
	// 		.filter(Boolean); // Por si hay alguna no encontrada

  //   initialized = true;
	// }

	// Mostrar toast en éxito
	$: if (form) {
		if (form?.success) {
			toast.success('Información guardada correctamente');
			location.reload();
		} else if (form.errors) {
			toast.error('Ocurrió un error al guardar. Revisa los campos e inténtalo de nuevo.');
		}
	}
</script>

<div class="flex flex-col items-center justify-center w-full mt-5">
	<h1 class="text-2xl font-semibold dark:text-gray-200 mb-5">Configuración de envíos</h1>

	<form class="flex flex-col gap-2 min-w-xs w-96 mx-auto" method="POST" use:enhance>
		<!-- Dirección de recogida -->
		<div class="flex flex-col">
			<label for="contactName" class="font-medium dark:text-gray-200">Nombre de contacto:</label>
			<input
				type="text"
				name="contactName"
				value={user?.pickupAddress?.contactName ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.contactName
					? 'border border-red-500'
					: ''}"
			/>
			{#if form?.errors?.contactName}
				<span class="text-sm text-red-500">{form.errors.contactName[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="phoneNumber" class="font-medium dark:text-gray-200">Teléfono:</label>
			<input
				type="text"
				name="phoneNumber"
				value={user?.pickupAddress?.phoneNumber ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.phoneNumber
					? 'border border-red-500'
					: ''}"
			/>
			{#if form?.errors?.phoneNumber}
				<span class="text-sm text-red-500">{form.errors.phoneNumber[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="country" class="font-medium dark:text-gray-200">País:</label>
			<input
				type="text"
				name="country"
				value={user?.pickupAddress?.country ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.country
					? 'border border-red-500'
					: ''}"
			/>
			{#if form?.errors?.country}
				<span class="text-sm text-red-500">{form.errors.country[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="state" class="font-medium dark:text-gray-200">Departamento:</label>
			<input
				type="text"
				name="state"
				value={user?.pickupAddress?.state ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.state ? 'border border-red-500' : ''}"
			/>
			{#if form?.errors?.state}
				<span class="text-sm text-red-500">{form.errors.state[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="city" class="font-medium dark:text-gray-200">Ciudad:</label>
			<input
				type="text"
				name="city"
				value={user?.pickupAddress?.city ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.city ? 'border border-red-500' : ''}"
			/>
			{#if form?.errors?.city}
				<span class="text-sm text-red-500">{form.errors.city[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="postalCode" class="font-medium dark:text-gray-200">Código Postal:</label>
			<input
				type="text"
				name="postalCode"
				value={user?.pickupAddress?.postalCode ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.postalCode
					? 'border border-red-500'
					: ''}"
			/>
			{#if form?.errors?.postalCode}
				<span class="text-sm text-red-500">{form.errors.postalCode[0]}</span>
			{/if}
		</div>

		<div class="flex flex-col">
			<label for="address" class="font-medium dark:text-gray-200">Dirección:</label>
			<input
				type="text"
				name="address"
				value={user?.pickupAddress?.address ?? ''}
				class="h-8 px-2 rounded-md text-black {form?.errors?.address
					? 'border border-red-500'
					: ''}"
			/>
			{#if form?.errors?.address}
				<span class="text-sm text-red-500">{form.errors.address[0]}</span>
			{/if}
		</div>
<!--
		<!- Transportadoras permitidas ->
		<div class="flex flex-col">
			<label class="font-medium dark:text-gray-200 mb-2">Transportadoras aceptadas:</label>

			<!- Info adicional ->
			<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
				Puedes seleccionar hasta <strong>3 transportadoras</strong>.
			</p>

			<!- Selector ->
			<Select.Root onSelectedChange={(v) => addCarrier(v.value)}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Selecciona una transportadora..." />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each data.availableCarriers as carrier, index (carrier.name)}
							<Select.Item value={index.toString()}>{carrier.name}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<!- Lista de seleccionados ->
			<div class="mt-4 flex flex-wrap gap-2">
				{#each selected as carrier (carrier.name)}
					<Badge
						class="flex items-center gap-1 text-black bg-gray-200  hover:bg-gray-400 dark:bg-[#222222] dark:text-gray-200 dark:hover:bg-[#333333]"
					>
						{carrier.name}
						<Button
							variant="ghost"
							size="icon"
							class="h-4 w-4 text-red-600 hover:bg-gray-400 hover:text-red-400 dark:hover:bg-[#333333] dark:text-red-400"
							on:click={() => removeCarrier(carrier.name)}
						>
							✕
						</Button>
					</Badge>
				{/each}
			</div>

			{#if form?.errors?.carriersAllowed}
				<span class="text-sm text-red-500">{form.errors.carriersAllowed[0]}</span>
			{/if}
		</div>

		<input type="hidden" name="carriersAllowed" value={JSON.stringify(selected)} /> -->

		<button
			type="submit"
			class="mt-4 h-10 w-full rounded-lg border bg-gray-200 dark:border-[#222] dark:bg-[#202020] font-medium dark:text-white hover:bg-gray-300 dark:hover:bg-[#252525]"
		>
			Guardar configuración
		</button>
	</form>
</div>
