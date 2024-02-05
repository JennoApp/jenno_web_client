<script lang="ts">
	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: [string];
		price: number;
	}

	import type { PageServerData } from './$types';
	import * as Carousel from '$lib/components/ui/carousel/index';
	import * as Accordion from '$lib/components/ui/accordion';
	import { addToCart } from '$lib/stores/cartStore';
	import { goto } from '$app/navigation';

	export let data: PageServerData;
	const product: CardData = data.product;

	$: console.log({ product: data.product });

	/// Sync Corousels index
	let indexCarousel = 0;
	function syncCarousel(index: number) {
		indexCarousel = index;
	}
</script>

<div class="flex flex-row p-7">
	<div class="flex flex-col w-1/2">
		<div class="flex justify-center items-center">
			<Carousel.Root
				class="w-5/6"
				opts={{
					align: 'start',
					startIndex: indexCarousel
				}}
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
				<h1 class="text-3xl">{product.productname}</h1>
				<h2 class="mt-2">⭐⭐⭐⭐⭐</h2>
			</div>
			<a href={`/${product.username}`}>
				<div
					class="flex justify-between px-3 items-center min-w-40 max-w-56 h-full rounded-md dark:bg-[#202020] dark:hover:bg-[#252525]"
				>
					{#if product?.profileImg}
						<img
							class="w-14 h-14 object-cover rounded-full"
							src={product?.profileImg}
							alt={product?.username}
							height={20}
							width={20}
						/>
					{:else}
						<div class="flex justify-center items-center h-14 w-14 bg-[#151515] rounded-full">
							<iconify-icon icon="bxs:store" height="2rem" width="2rem" class="text-[#707070]" />
						</div>
					{/if}
					<h2 class="text-lg">@{product.username}</h2>
				</div>
			</a>
		</div>

		<h1 class="text-2xl">${product.price}</h1>

		<div class="h-56 w-full">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget erat ornare, aliquet
				mi eu, consectetur ipsum. Nam nec auctor sem. Fusce egestas placerat libero eget tempor.
				Donec eu vulputate mi. Vivamus commodo ornare ligula, ac posuere felis commodo id.
			</p>
		</div>

		<div class=" flex mt-5">
			<button
				on:click={() => {
					addToCart(product);
					goto('/cart');
				}}
				class="dark:bg-[#202020] border-none rounded w-1/2 h-12 dark:text-gray-200 text-base cursor-pointer hover:dark:bg-[#252525]"
				>Buy</button
			>
			<button
				on:click|preventDefault={() => {
					addToCart(product);
				}}
				class="dark:bg-[#202020] border-none rounded w-1/2 ml-3 h-12 dark:text-gray-200 text-base cursor-pointer hover:dark:bg-[#252525]"
				>Add to Cart</button
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
