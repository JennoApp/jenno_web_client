<script lang="ts">
	interface Option {
		name: string;
		optionslist: string[];
	}

	interface Especification {
		title: string;
		content: string;
	}

	interface CardData {
		_id: string;
		username: string;
		productname: string;
		description: String;
		options: Option[];
		especifications: Especification[];
		imgs: string[];
		price: number;
		category: string;
		user: string;
	}

	import * as Dialog from '$lib/components/ui/dialog';
	import type { PageServerData } from './$types';
	import * as Carousel from '$lib/components/ui/carousel/index';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import { addToCart, decrementCartItem, getTotal, cartItems } from '$lib/stores/cartStore';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { formatPrice } from '$lib/utils/formatprice';
	import { getStartColor } from '$lib/utils/getstartcolor';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import RandomProducts from '$lib/components/Randomuserproducts.svelte';
	import { page } from '$app/stores';
	import * as m from '$paraglide/messages';
	import { toast } from 'svelte-sonner';

	export let data: PageServerData;
	let userInfo: any = $page.data.user;
	// let product: CardData
	$: product = data.product;

	$: console.log({ product: data.product });

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener Url del Servidor');
		}
	}

	/// Sync Corousels index
	let api: CarouselAPI;
	let indexCarousel = 0;
	function syncCarousel(index: number) {
		indexCarousel = index;
	}

	let profileImg = '';
	let openDialogreview = false;

	onMount(async () => {
		await getServerUrl();
		if (!product || !product?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			);
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/users/getprofileimg/${product?.user}`);

			const userData = await response.json();
			console.log({ userData });

			profileImg = userData?.profileImg;
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`);
		}
	});

	$: console.log($page.url.pathname);
	$: console.log(`/${product.username}/${product._id}`);

	// product
	let rating = 4.3;
	let quantity: number = 1;
	let selectedOptions: any[] = [];
	let userName = '';

	function handleAddToCart() {
		// Verificar si el usuario está en sesión
		if (!userInfo || !userInfo._id) {
			toast.error('Debes iniciar sesión para agregar al carrito.');
			return;
		}

		if (product.options.length > 0 && selectedOptions.length === 0) {
			toast.error('Selecciona una opcion antes de agregar al carrito.');
			return;
		}
		addToCart(product, selectedOptions, quantity);
	}

	function handleBuyNow() {
		// Verificar si el usuario está en sesión
		if (!userInfo || !userInfo._id) {
			toast.error('Debes iniciar sesión para agregar al carrito.');
			return;
		}

		if (product.options.length > 0 && selectedOptions.length === 0) {
			toast.error('Selecciona una opcion antes de agregar al carrito.');
			return;
		}
		addToCart(product, selectedOptions, quantity);
		goto('/cart');
	}

	function handleOptionChange(optionName: string, optionValue: string) {
		const optionIndex = selectedOptions.findIndex((opt) => opt.name === optionName);
		if (optionIndex !== -1) {
			selectedOptions = [
				...selectedOptions.slice(0, optionIndex),
				{ name: optionName, value: optionValue },
				...selectedOptions.slice(optionIndex + 1)
			];
		} else {
			selectedOptions = [...selectedOptions, { name: optionName, value: optionValue }];
		}
	}

	$: console.log($cartItems);
	$: console.log(selectedOptions);

	function handleOpenDialgoReview() {
		openDialogreview = true;
	}

	// calcular la calificacion

	const calculateStars = (reviews: any[]) => {
		if (!Array.isArray(reviews) || reviews.length === 0) {
			return 0;
		}

		const total = reviews.reduce((accum, review) => accum + (review.stars || 0), 0);

		return total / reviews.length;
	};

	$: totalStars = calculateStars(product.reviews || []);
	$: console.log({ totalStars });

	// get username
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

	$: getUserName(product.user);
</script>

<svelte:head>
	<title>{data.product?.productname} - Comprar en Jenno</title>
	<meta
		name="description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>

	<!-- Open Graph (Facebook, WhatsApp, etc.) -->
	<meta property="og:title" content="{data.product?.productname} - Comprar en Jenno" />
	<meta
		property="og:description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>
	<meta property="og:type" content="product" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={data.product?.imgs[0]} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Imagen del producto {data.product?.productname}" />
	<meta property="product:brand" content={data.product?.username || 'Marca desconocida'} />
	<meta property="product:category" content={data.product?.category || 'Otros'} />
	<meta property="product:price:amount" content={data.product?.price} />
	<meta property="product:price:currency" content="COP" />
	<meta
		property="product:availability"
		content={data.product?.status === 'in_stock' ? 'in stock' : 'out of stock'}
	/>

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{data.product?.productname} - Comprar en Jenno" />
	<meta
		name="twitter:description"
		content={data.product?.description ||
			'Encuentra los mejores productos en Jenno. Compra fácil y seguro.'}
	/>
	<meta name="twitter:image" content={data.product?.imgs[0]} />
	<meta name="twitter:image:alt" content="Imagen del producto {data.product?.productname}" />
</svelte:head>

<div class="flex flex-col md:flex-row gap-5 md:gap-3 p-7">
	<div class="flex flex-col w-full md:w-1/2">
		<div class="flex justify-center items-center">
			<Carousel.Root
				class="w-5/6"
				opts={{
					align: 'start',
					startIndex: indexCarousel
				}}
				bind:api
			>
				<Carousel.Content>
					{#each product.imgs as image, i}
						<Carousel.Item>
							<div class="flex justify-center">
								<img class="w-11/12 h-96 object-contain rounded-md" src={image} alt={`${i}`} />
							</div>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
				<Carousel.Previous />
				<Carousel.Next />
			</Carousel.Root>
		</div>

		<div class="flex justify-center items-center mt-5">
			<Carousel.Root id="carousel2" class="w-full max-w-sm">
				<Carousel.Content class="-ml-1">
					{#each product.imgs as image, i (i)}
						<Carousel.Item class="basis-1/3">
							<div class="flex justify-center">
								<button class="pl-1 w-11/12 h-24" on:click|preventDefault={() => syncCarousel(i)}>
									<img
										class="w-full h-24 object-cover rounded-md {i !== indexCarousel
											? 'grayscale'
											: 'border-2 border-[#404040]'}"
										src={image}
										alt={`${i}`}
									/>
								</button>
							</div>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
			</Carousel.Root>
		</div>
	</div>

	<div class="flex flex-col justify-between w-full md:w-1/2 ml-2">
		<div class="flex justify-between">
			<div class="mr-5">
				<h1 class="text-3xl">{product?.productname}</h1>
				<h2 class="text-base font-medium text-[#707070]">
					{product?.category.charAt(0).toUpperCase() + product?.category.slice(1)}
				</h2>

				<div class="flex gap-5 items-center mt-1">
					<div
						class="flex gap-1 items-center justify-center w-16 h-8 bg-gray-200 dark:bg-[#303030] px-1 mt-1 rounded-lg"
					>
						<iconify-icon
							class={getStartColor(totalStars)}
							icon="mdi:star"
							height="1.5rem"
							width="1.5rem"
						></iconify-icon>
						{#if totalStars !== 0}
							<span class="text-base font-semibold">{totalStars}</span>
						{/if}
					</div>

					<button on:click|preventDefault={() => handleOpenDialgoReview()}>
						<h3 class="dark:text-[#707070] font-semibold underline cursor-pointer">
							{m.product_page_reviews()}
						</h3>
					</button>
				</div>
			</div>

			<a href={`/${userName}`}>
				<div
					class="flex flex-col items-center justify-center p-1 gap-2 min-w-40 max-w-56 h-full rounded-md dark:bg-[#202020] dark:hover:bg-[#252525]"
				>
					{#if profileImg}
						<img
							class="w-14 h-14 object-cover rounded-full"
							src={profileImg}
							alt={product?.username}
							height={20}
							width={20}
						/>
					{:else}
						<div class="flex justify-center items-center h-14 w-14 bg-[#151515] rounded-full">
							<iconify-icon icon="bxs:store" height="2rem" width="2rem" class="text-[#707070]" />
						</div>
					{/if}
					<h2 class="text-lg font-semibold">{userName}</h2>
				</div>
			</a>
		</div>

		<h1 class="text-2xl mt-1">{formatPrice(product?.price, 'es-CO', 'COP')}</h1>

		<!-- Product Description -->
		<ScrollArea class="h-auto max-h-[200px] w-full mt-1 rounded-md border p-4 text-left border-none" orientation="vertical">
			<p>{product.description}</p>
		</ScrollArea>


		<!-- Product Options -->
		{#if product?.options}
			{#each product.options as option}
				{#if option?.optionslist}
					<div class="flex gap-5 mt-5">
						<h3 class="text-lg font-medium">{option.name}:</h3>
						<Select.Root>
							<Select.Trigger class="w-[180px]">
								<Select.Value placeholder={`Select ${option.name}`} />
							</Select.Trigger>
							<Select.Content>
								{#each option.optionslist as op}
									<Select.Item value={`${op}`} on:click={() => handleOptionChange(option.name, op)}
										>{op}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/if}
			{/each}
		{/if}

		<div class="flex flex-col gap-3">
			<div class="flex mt-5 gap-3">
				<div
					class="flex items-center justify-around w-2/5 border border-gray-300 dark:border-[#202020] rounded-md"
				>
					<button
						on:click|preventDefault={() => {
							if (quantity > 1) {
								quantity--;
							}
						}}
						class="flex flex-col justify-center items-center rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
					>
						<!-- Minus Icon -->
						<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
					<input
						type="number"
						bind:value={quantity}
						min="1"
						class="mx-2 text-xl font-semibold text-center w-16 bg-transparent outline-none appearance-none"
						on:blur={(e) => {
							if (e?.target?.value < 1) {
								quantity = 1;
							}
						}}
					/>
					<!-- <span class="mx-2 text-xl font-semibold">{quantity}</span> -->
					<button
						on:click|preventDefault={() => quantity++}
						class="flex flex-col justify-center items-center rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
					>
						<!-- Plus Icon -->
						<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				</div>
				<button
					on:click|preventDefault={() => handleAddToCart()}
					class="dark:bg-[#202020] border-none rounded w-3/5 h-12 bg-gray-200 dark:text-gray-200 text-black text-base cursor-pointer hover:bg-gray-300 dark:hover:bg-[#252525]"
					>{m.card_button_addtocart()}</button
				>
			</div>
			<button
				on:click={() => handleBuyNow()}
				class="bg-gray-200 dark:bg-gray-200 border-none rounded w-full h-12 text-[#202020] text-base cursor-pointer hover:bg-gray-300 dark:hover:bg-[#202020] dark:hover:text-white"
				>{m.card_button_buynow()}</button
			>
		</div>
	</div>
</div>

{#if product.especifications.length !== 0}
	<div class="flex flex-col m-10 mt-14">
		<h2 class="text-xl font-bold">{m.product_page_specifications()}</h2>

		<Table.Root class="mt-7 overflow-x-auto">
			<Table.Header class="bg-gray-200 dark:bg-[#202020] h-14">
				<Table.Row>
					{#each product.especifications as especification}
						<Table.Head>{especification.title}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row class="h-14 bg-none hover:bg-none font-base">
					{#each product.especifications as especification}
						<Table.Cell>{especification.content}</Table.Cell>
					{/each}
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<!-- Informacion Adicional -->
{#if product.additionalInfo}
  <div class="flex flex-col m-10 mt-14">
    <h2 class="text-xl font-bold mb-6">Información Adicional</h2>

    <div
      class="prose prose-lg max-w-none dark:prose-invert space-y-4
             prose-p:leading-relaxed prose-p:mb-4
             prose-ul:list-disc prose-ul:pl-6
             prose-ol:list-disc prose-ol:pl-6
             prose-li:mb-2 prose-img:rounded-lg prose-img:max-w-[400px] prose-img:mx-auto prose-img:my-4"
    >
      {@html product.additionalInfo}
    </div>
  </div>
{/if}


<div class="flex flex-col m-10 mt-10">
	<h2 class="text-xl font-bold">{m.product_page_more_products()}</h2>
</div>

<!-- Lista de productos del mismo vendedor -->
<RandomProducts user={product.user} />

<Dialog.Root bind:open={openDialogreview}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.product_page_reviews()}</Dialog.Title>
		</Dialog.Header>
		<div>
			{#if product?.reviews.length === 0}
				<div>
					<h2>No hay reseñas disponibles</h2>
				</div>
			{:else}
				<ScrollArea class="max-h-[600px] w-full">
					{#each product?.reviews as review}
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
											class="flex justify-center items-center h-9 w-9 {getStartColor(review.stars)}"
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
