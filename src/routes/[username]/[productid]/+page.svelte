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
	import {addToCart} from '$lib/stores/cartStore'

	export let data: PageServerData;
	const product: CardData = data.product;

	$: console.log({ product: data.product });

</script>

<div class="flex flex-row p-7">
	<div class="flex flex-col w-1/2">
		<div class="flex justify-center items-center">
			<Carousel.Root
				class="w-5/6"
				opts={{
					align: 'start'
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
			<Carousel.Root class="w-full max-w-sm">
				<Carousel.Content class="-ml-1">
					{#each product.imgs as image, i (i)}
						<Carousel.Item class="pl-1 md:basis-1/2 lg:basis-1/3">
							<div class="flex justify-center">
								<img class="w-11/12 h-24 object-cover rounded-md" src={image} alt={`${i}`} />
							</div>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
			</Carousel.Root>
		</div>
	</div>

	<div class="flex flex-col justify-between w-1/2 px-7">
		<div>
			<h1 class="text-3xl">{product.productname}</h1>
			<h1>⭐⭐⭐⭐⭐</h1>
			<h1 class="text-2xl mt-7">${product.price}</h1>
		</div>

		<div class="h-56 w-full"></div>

		<div class=" flex mt-5">
			<button
				on:click={(e) => {
					e.preventDefault();
					alert('Buy button');
				}}
				class="dark:bg-[#202020] border-none rounded w-1/2 h-12 dark:text-gray-200 text-base cursor-pointer hover:dark:bg-[#252525]"
				>Buy</button
			>
			<button
				on:click|preventDefault={() => {
					addToCart(product)
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
			<Accordion.Trigger>Is it accessible?</Accordion.Trigger>
			<Accordion.Content>Yes. It adheres to the WAI-ARIA design pattern.</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>Is it styled?</Accordion.Trigger>
			<Accordion.Content>
				Yes. It comes with default styles that matches the other components' aesthetic.
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-3">
			<Accordion.Trigger>Is it animated?</Accordion.Trigger>
			<Accordion.Content>
				Yes. It's animated by default, but you can disable it if you prefer.
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
