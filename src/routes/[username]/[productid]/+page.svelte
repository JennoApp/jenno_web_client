<script lang="ts">
	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: [string];
		price: number;
		category: string;
		user: string;
	}

	import type { PageServerData } from './$types';
	import * as Carousel from '$lib/components/ui/carousel/index';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import * as Accordion from '$lib/components/ui/accordion';
	import { addToCart, decrementCartItem, getTotal, cartItems } from '$lib/stores/cartStore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { formatPrice } from '$lib/utils/formatprice';
	import { getStartColor } from '$lib/utils/getstartcolor';
	import * as Select from '$lib/components/ui/select';

	export let data: PageServerData;
	const product: CardData = data.product;

	$: console.log({ product: data.product });

	/// Sync Corousels index
	let api: CarouselAPI;
	let indexCarousel = 0;
	function syncCarousel(index: number) {
		indexCarousel = index;
	}

	let profileImg = '';

	onMount(async () => {
		if (!product || !product?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			);
			return;
		}

		try {
			const response = await fetch(`http://localhost:3000/users/getprofileimg/${product?.user}`);

			const userData = await response.json();
			console.log({ userData });

			profileImg = userData?.profileImg;
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`);
		}
	});

	// product
	let rating = 4.3;
	let quantity: number = 1;
</script>

<div class="flex flex-row gap-3 p-7">
	<div class="flex flex-col w-1/2">
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
								<img class="w-11/12 h-96 object-cover rounded-md" src={image} alt={`${i}`} />
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
						<Carousel.Item class="md:basis-1/2 lg:basis-1/3">
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

	<div class="flex flex-col justify-between w-1/2 ml-2">
		<div class="flex justify-between">
			<div>
				<h1 class="text-3xl">{product?.productname}</h1>
				<h2 class="text-base font-medium text-[#707070]">
					{product?.category.charAt(0).toUpperCase() + product?.category.slice(1)}
				</h2>
			</div>

			<a href={`/${product.username}`}>
				<div
					class="flex justify-evenly px-3 items-center gap-2 min-w-40 max-w-56 h-full rounded-md dark:bg-[#202020] dark:hover:bg-[#252525]"
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
					<h2 class="text-lg font-semibold">{product?.username}</h2>
				</div>
			</a>
		</div>

		<div class="flex gap-1 items-center justify-center w-16 h-8 bg-[#303030] px-1 mt-1 rounded-lg">
			<iconify-icon class={getStartColor(rating)} icon="mdi:star" height="1.5rem" width="1.5rem"
			></iconify-icon>
			<span class="text-base font-semibold">{rating}</span>
		</div>

		<h1 class="text-2xl mt-1">{formatPrice(product?.price, 'es-CO', 'COP')}</h1>

		<!-- Product Description -->
		<div class="h-auto max-h-40 w-full mt-1">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget erat ornare, aliquet
				mi eu, consectetur ipsum. Nam nec auctor sem. Fusce egestas placerat libero eget tempor.
				Donec eu vulputate mi. Vivamus commodo ornare ligula, ac posuere felis commodo id.
			</p>
		</div>

		<!-- Product Options -->
		<div class="flex gap-5 mt-5">
			<h3 class="text-lg font-medium">Color:</h3>
			<Select.Root>
				<Select.Trigger class="w-[180px]">
					<Select.Value placeholder="Select a color" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="light">Light</Select.Item>
					<Select.Item value="dark">Dark</Select.Item>
					<Select.Item value="system">System</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex mt-5 gap-3">
				<div class="flex items-center justify-around w-2/5 border border-[#202020] rounded-md">
					<button
						on:click|preventDefault={() => {
							if (quantity > 1) {
								quantity--;
							}
						}}
						class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
					>
						<!-- Minus Icon -->
						<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
					<span class="mx-2 text-xl font-semibold">{quantity}</span>
					<button
						on:click|preventDefault={() => quantity++}
						class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
					>
						<!-- Plus Icon -->
						<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				</div>
				<button
					on:click|preventDefault={() => {
						addToCart(product);
					}}
					class="dark:bg-[#202020] border-none rounded w-3/5 h-12 dark:text-gray-200 text-base cursor-pointer hover:dark:bg-[#252525]"
					>Add to Cart</button
				>
			</div>
			<button
				on:click={() => {
					addToCart(product);
					goto('/cart');
				}}
				class="dark:bg-purple-900 border-none rounded w-full h-12 dark:text-gray-200 text-base cursor-pointer hover:dark:bg-purple-800"
				>Buy Now</button
			>
		</div>
	</div>
</div>

<div class="flex justify-center">
	<Accordion.Root class="w-full sm:max-w-[70%]">
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Especificaciones</Accordion.Trigger>
			<Accordion.Content>Yes. It adheres to the WAI-ARIA design pattern.</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>Caracteristicas</Accordion.Trigger>
			<Accordion.Content>
				Yes. It comes with default styles that matches the other components' aesthetic.
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
