<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel/index';
  import * as Accordion from '$lib/components/ui/accordion';
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
					<Carousel.Item>
						<div class="flex justify-center">
							<img
								class="w-11/12 h-96 object-cover rounded-md"
								src="https://kinsta.com/wp-content/uploads/2020/08/tiger-jpg.jpg"
								alt="tiger"
							/>
						</div>
					</Carousel.Item>
					<Carousel.Item>
						<div class="flex justify-center">
							<img
								class="w-11/12 h-96 object-cover rounded-md"
								src="https://kinsta.com/wp-content/uploads/2020/08/tiger-jpg.jpg"
								alt="tiger"
							/>
						</div>
					</Carousel.Item>
					<Carousel.Item>
						<div class="flex justify-center">
							<img
								class="w-11/12 h-96 object-cover rounded-md"
								src="https://kinsta.com/wp-content/uploads/2020/08/tiger-jpg.jpg"
								alt="tiger"
							/>
						</div>
					</Carousel.Item>
				</Carousel.Content>
				<Carousel.Previous />
				<Carousel.Next />
			</Carousel.Root>
		</div>

		<div class="flex justify-center items-center mt-5">
			<Carousel.Root class="w-full max-w-sm">
				<Carousel.Content class="-ml-1">
					{#each Array(5) as _, i (i)}
						<Carousel.Item class="pl-1 md:basis-1/2 lg:basis-1/3">
							<div class="p-1">
								<Card.Root>
									<Card.Content
										class="rounded-xl flex aspect-square items-center justify-center p-6"
									>
										<span class="text-2xl font-semibold">{i + 1}</span>
									</Card.Content>
								</Card.Root>
							</div>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
			</Carousel.Root>
		</div>
	</div>

	<div class="flex flex-col justify-between w-1/2 px-7">
		<div>
			<h1 class="text-3xl">Nombre del producto</h1>
			<h1>⭐⭐⭐⭐⭐</h1>
			<h1 class="text-2xl mt-7">$100.00</h1>
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
				on:click={(e) => {
					e.preventDefault();
					alert('add to cart button');
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
