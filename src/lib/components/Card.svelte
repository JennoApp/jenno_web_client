<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as m from '$paraglide/messages';
	import { getStartColor } from '$lib/utils/getstartcolor';

	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: [string];
		price: number;
		user: string;
		reviews: [];
	}

	import { addToCart } from '$lib/stores/cartStore';
	import { formatPrice } from '$lib/utils/formatprice';
	import { toast } from 'svelte-sonner';

	export let data: CardData;

	let profileImg = '';
	let openDialogreview = false;
	let userName = '';

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

	onMount(async () => {
		await getServerUrl();

		if (!data || !data?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			);
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/users/getprofileimg/${data?.user}`);

			const userData = await response.json();
			console.log({ userData });

			profileImg = userData?.profileImg;
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`);
		}
	});

	let rating: number = 3.5;

	const calculateStars = (reviews: any[]) => {
		if (!Array.isArray(reviews) || reviews.length === 0) {
			return 0;
		}

		const total = reviews.reduce((accum, review) => accum + (review.stars || 0), 0);

		return total / reviews.length;
	};

	$: totalStars = calculateStars(data?.reviews || []);
	$: console.log({ data: data?.reviews });

	async function getUserName(id: string) {
		try {
			await getServerUrl();
			const response = await fetch(`${serverUrl}/users/getusername/${id}`);

			if (response.ok) {
				const data = await response.json();
				userName = data.username;
			}
		} catch (error) {
			console.error('Error al cargar el nombre del usuario');
		}
	}

  $: getUserName(data.user)

	function handleOpenDialgoReview() {
		openDialogreview = true;
	}
</script>

<a href={`/${userName}/${data._id}`}>
	<div
		class="h-[380px] w-full rounded-xl bg-white dark:bg-[#202020] dark:text-gray-200 shadow-lg shadow-gray-300 dark:shadow-none hover:dark:bg-[#252525]"
	>
		<!-- Header -->
		<div class="flex w-full h-12 mt-1 items-center justify-between">
			<div class="flex items-center">
				{#if profileImg !== ''}
					<img class="h-7 w-7 object-cover ml-4 rounded-full" src={profileImg} alt="logo" />
				{:else}
					<div class="flex justify-center items-center h-9 w-9 ml-2 rounded-full">
						<iconify-icon class="text-[#707070]" icon="bxs:store" height="1.5rem" width="1.5rem"
						></iconify-icon>
					</div>
				{/if}
				{#if userName !== ''}
					<a href={`/${userName}`}>
						<h4 class="ml-2 font-medium">{userName}</h4>
					</a>
				{/if}
			</div>
			<div class="hidden">
				<!-- oculto los simbolos para agregar funcionalidad posteriormente -->
				<iconify-icon
					class="mr-1 cursor-pointer"
					icon="mdi:dots-vertical"
					height="1.5rem"
					width="1.5rem"
				></iconify-icon>
			</div>
		</div>

		<!-- Image -->
		<div class="flex justify-center">
			<img class="w-11/12 h-52 object-contain rounded-md" src={data.imgs[0]} alt="tiger" />
		</div>

		<!-- Social -->
		<div class="flex items-center justify-between w-full h-8 mt-1 mx-3">
			<div class="flex gap-2 items-center text-2xl text-center">
				<div
					class="flex gap-1 items-center justify-center bg-gray-200 dark:bg-[#303030] px-1 rounded-lg"
				>
					<iconify-icon
						class={getStartColor(totalStars)}
						icon="mdi:star"
						height="1.5rem"
						width="1.5rem"
					></iconify-icon>
					{#if totalStars !== 0}
						<span class="text-sm font-medium">{totalStars}</span>
					{/if}
				</div>
				<button class="flex items-center" on:click|preventDefault={() => handleOpenDialgoReview()}>
					<iconify-icon
						class="text-[#707070] dark:text-white"
						icon="material-symbols-light:reviews"
						height="1.5rem"
						width="1.5rem"
					></iconify-icon>
				</button>

				<button
					class="flex items-center"
					on:click|preventDefault={() => {
						const product_link = `https://www.jenno.com.co/${data.username}/${data._id}`;
						navigator.clipboard
							.writeText(product_link)
							.then(() => {
								toast.success('Enlace copiado al portapapeles');
							})
							.catch((err) => {
								toast.error('Error al copiar el enlace. Intentelo nuevamente');
							});
					}}
				>
					<iconify-icon
						class="text-[#707070] dark:text-white"
						icon="bitcoin-icons:share-filled"
						height="1.5rem"
						width="1.5rem"
					></iconify-icon>
				</button>
			</div>

			<div class="save hidden">
				<!-- oculto los simbolos para agregar funcionalidad posteriormente -->
				<iconify-icon
					class="px-1 mr-4"
					icon="material-symbols:bookmark-outline"
					height="1.5rem"
					width="1.5rem"
				></iconify-icon>
			</div>
		</div>

		<!-- Info -->
		<div class="w-full h-[70px] mx-3 mt-2">
			<div>
				<h3 class="m-1 text-xl">{data.productname}</h3>
				<h2 class="m-1 mt-1 text-lg font-semibold">{formatPrice(data.price, 'es-CO', 'COP')}</h2>
			</div>
		</div>
	</div>
</a>

<!-- Dialog Reviews -->
{#if openDialogreview}
	<Dialog.Root bind:open={openDialogreview}>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.product_page_reviews()}</Dialog.Title>
			</Dialog.Header>
			<div>
				{#if data?.reviews.length === 0}
					<div>
						<h2>No hay reseñas disponibles</h2>
					</div>
				{:else}
					<ScrollArea class="max-h-[600px] w-full">
						{#each data?.reviews as review}
							<div class="m-3">
								<div class="flex items-center justify-between">
									<div class="flex gap-2 items-center">
										{#if review.userProfileImg !== ''}
											<img
												src={review.userProfileImg}
												alt={review.userName}
												class="h-9 w-9 object-cover ml-1 rounded-full"
											/>
										{:else}
											<iconify-icon
												icon="mdi:user"
												height="1.5rem"
												width="1.5rem"
												class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full"
											/>
										{/if}
										<h3 class="text-base font-semibold">{review.userName}</h3>
									</div>

									<div class="flex">
										{#each Array(review.stars) as _, i}
											<iconify-icon
												icon="mdi:star"
												height="1.5rem"
												width="1.5rem"
												class="flex justify-center items-center h-9 w-9 {getStartColor(
													review.stars
												)}"
											/>
										{/each}
									</div>
								</div>
								<div class="m-3">
									<p>{review.review}</p>
								</div>
							</div>
						{/each}
					</ScrollArea>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
