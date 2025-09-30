<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button/index';
	import { MoreHorizontal } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let userInfo = $page.data.user;
	$: console.log({ userInfo });

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	$: getServerUrl();

	export let id: string;
	$: console.log({ id });

	// Estado para los diálogos
	let openReview = false;
	let openReturn = false;
	let openExchange = false;

	let rating = 0;
	let reviewText = '';

	function handleRating(index: number) {
		rating = index;
	}

	async function getProductFromOrder(orderId: string) {
		try {
			const response = await fetch(`${serverUrl}/orders/${orderId}`);
			if (response.ok) {
				const orderData = await response.json();
				return orderData.product._id;
			} else {
				console.error('Error al obtener la orden');
				toast.error('No se pudo obtener la orden. Intentalo Nuevamente');
				return null;
			}
		} catch (error) {
			console.error('Error al obtener la order:', error);
			toast.error('Ocurrio un error al obtener la orden. Intentalo nuevamente');
			return null;
		}
	}

	async function sendReview(orderId: string) {
		if (!userInfo || !userInfo._id || !orderId) {
			console.error('Falta información del usuario o del producto');
			toast.error('No se pudo enviar la reseña. Falta información del usuario o del producto.');
			return;
		}

		const productId = await getProductFromOrder(orderId);
		if (!productId) {
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/products/review/${productId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: userInfo._id,
					userName: userInfo.username,
					userProfileImg: userInfo.profileImg,
					stars: rating,
					review: reviewText
				})
			});

			if (response.ok) {
				rating = 0;
				reviewText = '';
				openReview = false;

				toast.success('Reseña enviada con exito!');
			} else {
				const errorData = await response.json();
				console.error('Error en la respuesta del servidor:', errorData);
				toast.error('No se pudo enviar la reseña. Inténtalo nuevamente.');
			}
		} catch (error) {
			console.log('Error al enviar la reseña:', error);
			toast.error('Ocurrió un error al enviar la reseña. Inténtalo nuevamente.');
		}
	}

	// --- Devolución / Cambio ---
	let returnReason = '';
	let exchangeProductId = '';

	async function requestReturn(type: 'refund' | 'exchange') {
		if (!returnReason.trim()) return toast.error('Escribe una razón');

		const body: any = { type, reason: returnReason };

    if (type === 'exchange') body.exchangeProductId = exchangeProductId;

    const res = await fetch(`${serverUrl}/orders/return-request/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (res.ok) {
			toast.success(type === 'refund' ? 'Devolución solicitada' : 'Cambio solicitado');
			openReturn = openExchange = false;
		} else {
			toast.error('Error al solicitar');
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative w-8 h-8 p-0">
			<MoreHorizontal class="w-4 h-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Acciones</DropdownMenu.Label>

			<!-- Review -->
			<DropdownMenu.Item on:click={() => (openReview = true)}>
				<iconify-icon
					icon="ic:round-reviews"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				></iconify-icon>
				<span class="ml-2">Calificar y reseñar</span>
			</DropdownMenu.Item>

			<!-- Solicitar devolución -->
			<DropdownMenu.Item
				on:click={() => {
					openReturn = true;
					returnReason = '';
				}}
			>
				<iconify-icon
					icon="mdi:package-down"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				></iconify-icon>
				<span class="ml-2">Solicitar devolución</span>
			</DropdownMenu.Item>

			<!-- Solicitar cambio -->
			<DropdownMenu.Item
				on:click={() => {
					openExchange = true;
					returnReason = '';
					exchangeProductId = '';
				}}
			>
				<iconify-icon
					icon="mdi:swap-horizontal"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				></iconify-icon>
				<span class="ml-2">Solicitar cambio</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={openReview}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Calificar y Reseñar</Dialog.Title>
		</Dialog.Header>
		<div class="">
			<div class="flex gap-2">
				<h2>Puntuacion:</h2>
				<div class="flex gap-1 items-center">
					{#each Array(5).fill(0) as _, index}
						<button on:click|preventDefault={() => handleRating(index + 1)}
              aria-label="Calificar con {index + 1} estrellas">
							<iconify-icon
								icon="mdi:star"
								height="1.5rem"
								width="1.5rem"
								class="w-8 h-8 cursor-pointer transition-colors duration-200 {rating >= index + 1
									? 'text-yellow-400'
									: 'text-gray-400'}"
							></iconify-icon>
						</button>
					{/each}
				</div>
				<!-- <p>puntuacion: {rating} de 5</p> -->
			</div>

			<div>
				<h2>Reseña:</h2>
				<Textarea class="h-28" bind:value={reviewText} />
				<!-- <p>{reviewText}</p> -->
			</div>

			<div class="mt-5 flex flex-row-reverse">
				<Button
					on:click={() => {
						sendReview(id);
					}}
					class="bg-gray-200 text-black dark:bg-[#202020] dark:text-gray-200">Enviar Reseña</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Diálogo de devolución -->
<Dialog.Root bind:open={openReturn}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Solicitar devolución</Dialog.Title>
		</Dialog.Header>
		<Textarea bind:value={returnReason} placeholder="Razón de la devolución" />
		<div class="flex justify-end mt-4">
			<Button on:click={() => requestReturn('refund')}>Enviar solicitud</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Diálogo de cambio -->
<Dialog.Root bind:open={openExchange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Solicitar cambio</Dialog.Title>
		</Dialog.Header>
		<Textarea bind:value={returnReason} placeholder="Razón del cambio" />
		<input
			type="text"
			placeholder="ID del nuevo producto"
			bind:value={exchangeProductId}
			class="border p-2 rounded w-full mt-2"
		/>
		<div class="flex justify-end mt-4">
			<Button on:click={() => requestReturn('exchange')}>Enviar solicitud</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
