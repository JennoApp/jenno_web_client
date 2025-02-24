<script lang="ts">
	import { goto } from '$app/navigation';
	import { removeTotal, cartItems } from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import Progress from '$lib/components/ui/progress/progress.svelte';

	// Obtener url del servidor
	let serverUrl: string;
	let ordersCreated = false;

	let progressValue = 0;

	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error el solicitar Server Url:', error);
		}
	}

	async function createOrders() {
		const items = $cartItems;
		const buyer = $page.data.user;

		if (!items || items.length === 0) {
			toast.error('El carrito esta vacio');
			return;
		}

		if (!buyer) {
			toast.error('No se encotro la informacion del comprador');
			return;
		}

		const buyerId = buyer?._id;
		const buyerName = buyer?.username;
		let buyerProfileImg = buyer?.profileImg;

		if (buyerProfileImg == null || buyerProfileImg == undefined) {
			buyerProfileImg = '';
		}

		try {
			await getServerUrl();
			if (!serverUrl) {
				toast.error('No se pudo obtener la URL del servidor');
				return;
			}

      // Calcular cuánto avanza la barra por cada item creado
      const totalItems = items.length;
      const increment = 100 / totalItems;

			for (let item of items) {
				const maxAttempts = 3;
				let success = false;
				let attempts = 0;

				while (!success && attempts < maxAttempts) {
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

						console.log('Intentando crear orden:', orderData);

						const response = await fetch(`${serverUrl}/orders/createOrder`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(orderData)
						});

						if (!response.ok) {
							const errorText = await response.text();
							console.error('Backend Error:', errorText);
							throw new Error(`Error al crear la orden: ${response.statusText}`);
						}

						success = true;
            progressValue += increment;
					} catch (error) {
						console.error(`Intento ${attempts + 1} fallido:`, error);
						attempts++;
						if (attempts >= maxAttempts) {
							throw new Error(`Error al crear la orden despues de ${maxAttempts} intentos`);
						}
					}
				}
			}

			toast.success('Todas las ordenes se han creado correctamente');

			// vaciar el carrito
			removeTotal();

			// Recargar la pagina
			location.reload();
		} catch (error: any) {
			toast.error(`Error: ${error.message}`);
		}
	}

	$: if ($page.data.user && !ordersCreated) {
		ordersCreated = true;
		createOrders();
	}

	console.log($cartItems);

   $: isCreating = progressValue < 100;
</script>

<!-- <div class="flex justify-center w-full h-[calc(100vh-56px)]">
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
</div> -->


<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
	<!-- Ícono de éxito -->
	<iconify-icon
		icon="material-symbols:check-circle-outline"
		height="5rem"
		width="5rem"
		class="text-green-500 mb-4"
	/>

  {#if isCreating}
    <h1 class="text-2xl font-semibold text-gray-200 mb-2">Pago Exitoso</h1>
    <p class="text-md text-gray-400 mb-6">
      Estamos creando tus órdenes. ¡Por favor, espera un momento!
    </p>
  {:else}
    <h1 class="text-2xl font-semibold text-gray-200 mb-2">¡Órdenes creadas!</h1>
    <p class="text-md text-gray-400 mb-6">
      Tus órdenes se han creado correctamente. ¡Gracias por tu compra!
    </p>
  {/if}

	<!-- Barra de progreso -->
	<Progress value={progressValue} class="w-3/4" />

  {#if !isCreating}
    <button
      class="dark:bg-[#303030] w-44 h-10 rounded-lg hover:dark:bg-[#353535] mt-8"
      on:click={() => goto('/')}
    >
      Volver a la tienda
    </button>
  {/if}
</div>
