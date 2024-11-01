<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { removeTotal, cartItems } from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

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

	async function createOrders() {
		const items = $cartItems;
		const buyer = $page.data.user;

		console.log({ buyer });

		const buyerId = buyer?._id;
		const buyerName = buyer?.username;
		let buyerProfileImg = buyer?.profileImg;

    if (buyerProfileImg == null || buyerProfileImg == undefined) {
      buyerProfileImg = ""
    }

		if (!buyerId || !buyerName) {
			toast.error('Informacion del comprador imcompleta');
			return;
		}

		const maxAttempts = 3;

		try {
			for (let item of items) {
				let success = false;
				let attemps = 0;

				while (!success && attemps < maxAttempts) {
					try {
						const orderData = {
							product: item,
							buyerId,
							sellerId: item?.user,
							buyerName,
							buyerProfileImg,
							amount: item.amount,
							status: 'pending', // Estado inicial de la orden
							selectedOptions: item.selectedOptions
						};

						const response = await fetch(`${serverUrl}/orders`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(orderData)
						});

						if (!response.ok) {
							throw new Error('Error al crear la orden');
						}

            success = true
					} catch (error) {
            if (attemps >= maxAttempts) {
              throw new Error(`Error al crear la orden despues de ${maxAttempts} intentos`)
            }
          }
				}
			}

			toast.success('Todas las ordenes se han creado correctamente');

			// vaciar el carrito
			removeTotal();
		} catch (error: any) {
			toast.error(`Error: ${error.message}`);
		}
	}

	onMount(() => {
		invalidateAll();
	});

	$: if ($page.data.user) {
		createOrders();
	}

	$: {
		console.log($cartItems);
	}
</script>

<div class="flex justify-center w-full h-[calc(100vh-56px)]">
	<div class="w-1/2 h-56 mt-40 bg-[#202020] rounded-lg">
		<h1 class="mt-2 text-3xl font-semibold text-center">Pago Exitoso</h1>
		<p class="p-5 text-center mt-2 font-medium">
			¡Gracias por tu compra! Tu pago se ha procesado correctamente
		</p>

		<div class="text-center mt-14">
			<button
				class="dark:bg-[#303030] w-44 h-10 rounded-lg hover:dark:bg-[#353535]"
				on:click={() => goto('/')}>Volver a la tienda</button
			>
		</div>
	</div>
</div>
