<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
  import { PRIVATE_SERVER_URL } from '$env/static/private'

	let userInfo = $page.data.user;
	$: console.log({ userInfo });

	export let id: string;
  $: console.log({ id })

	let openDialog = false;
	let rating = 0;
	let reviewText = '';

	function handleDialogOpen() {
		openDialog = true;
	}

	function handleRating(index: number) {
		rating = index;
	}

  async function getProductFromOrder(orderId: string) {
    try {
      const response = await fetch(`${PRIVATE_SERVER_URL}/orders/${orderId}`)
      if (response.ok) {
        const orderData = await response.json()
        return orderData.product._id
      } else {
        console.error('Error al obtener la orden')
        toast.error('No se pudo obtener la orden. Intentalo Nuevamente')
        return null
      }
    } catch (error) {
      console.error('Error al obtener la order:', error)
      toast.error('Ocurrio un error al obtener la orden. Intentalo nuevamente')
      return null
    }
  }

	async function sendReview(orderId: string) {
    if (!userInfo || !userInfo._id || !orderId) {
			console.error('Falta información del usuario o del producto');
			toast.error('No se pudo enviar la reseña. Falta información del usuario o del producto.');
			return;
		}

    const productId = await getProductFromOrder(orderId)
    if (!productId) {
      return
    }

		try {
			const response = await fetch(`${PRIVATE_SERVER_URL}/products/review/${productId}`, {
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
        openDialog = false

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
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative w-8 h-8 p-0">
			<MoreHorizontal class="w-4 h-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				on:click={() => {
					handleDialogOpen();
				}}
			>
				<iconify-icon
					icon="ic:round-reviews"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				/>
				<span class="ml-3">calificar y reseñar</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<!-- <DropdownMenu.Separator />
		<DropdownMenu.Item>View customer</DropdownMenu.Item>
		<DropdownMenu.Item>View payment details</DropdownMenu.Item> -->
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={openDialog}>
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
						<button on:click|preventDefault={() => handleRating(index + 1)}>
							<iconify-icon
								icon="mdi:star"
								height="1.5rem"
								width="1.5rem"
								class="w-8 h-8 cursor-pointer transition-colors duration-200 {rating >= index + 1
									? 'text-yellow-400'
									: 'text-gray-400'}"
							/>
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
					class="dark:bg-purple-600 dark:text-gray-200">Enviar Reseña</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
