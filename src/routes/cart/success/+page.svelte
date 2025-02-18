<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { removeTotal, cartItems } from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	// Obtener url del servidor
	let serverUrl: string;
	let ordersCreated = false;
	let skipCreation = false;

	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error el solicitar Server Url');
		}
	}

	async function createOrders() {
		const items = $cartItems;
		const buyer = $page.data.user;

		console.log({ buyer });

		const buyerId = buyer?._id;
		const buyerName = buyer?.username;
		let buyerProfileImg = buyer?.profileImg;

		if (!items || items.length === 0) {
			toast.error('El carrito esta vacio');
			return;
		}

		if (buyerProfileImg == null || buyerProfileImg == undefined) {
			buyerProfileImg = '';
		}

		if (!buyer) {
			toast.error('No se encotro la informacion del comprador');
			return;
		}

		const maxAttempts = 3;

		try {
			await getServerUrl();
			console.log('Server Url:', serverUrl);

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
					} catch (error) {
						console.error(`Intento ${attemps + 1} fallido:`, error);
						attemps++;
						if (attemps >= maxAttempts) {
							throw new Error(`Error al crear la orden despues de ${maxAttempts} intentos`);
						}
					}
				}
			}

			toast.success('Todas las ordenes se han creado correctamente');

			// vaciar el carrito
			removeTotal();

      // Marcar que las ordenes ya fueron creadas
      localStorage.setItem('ordersCreated', 'true');

			// Recargar la pagina
			location.reload();
		} catch (error: any) {
			toast.error(`Error: ${error.message}`);
		}
	}

	onMount(async () => {
		if (localStorage.getItem('ordersCreated') === 'true') {
			skipCreation = true;
			console.log('Se detectó ordersCreated en localStorage, no se crearán órdenes de nuevo.');
		}

		await getServerUrl();
	});

	$: if ($page.data.user && !ordersCreated && !skipCreation) {
		ordersCreated = true;
		createOrders();
		invalidateAll();
	}

	console.log($cartItems);
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
