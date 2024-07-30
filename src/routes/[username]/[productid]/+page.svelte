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
	import RandomProducts from '$lib/components/Randomuserproducts.svelte';
	import { page } from '$app/stores';
  import * as m from '$paraglide/messages'

	export let data: PageServerData;
  let product: CardData
	$: product = data.product

	$: console.log({ product: data.product });

	/// Sync Corousels index
	let api: CarouselAPI
	let indexCarousel = 0
	function syncCarousel(index: number) {
		indexCarousel = index
	}

	let profileImg = ''

	onMount(async () => {
		if (!product || !product?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			)
			return
		}

		try {
			const response = await fetch(`http://localhost:3000/users/getprofileimg/${product?.user}`)

			const userData = await response.json();
			console.log({ userData })

			profileImg = userData?.profileImg
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`)
		}
	})

  $: console.log($page.url.pathname)
  $: console.log(`/${product.username}/${product._id}`)


	// product
	let rating = 4.3;
	let quantity: number = 1;
  let selectedOptions: any[] = []

  function handleAddToCart() {
    addToCart(product, selectedOptions, quantity)
  }


  function handleOptionChange(optionName: string, optionValue: string) {
    const optionIndex = selectedOptions.findIndex(opt => opt.name === optionName)
    if (optionIndex !== -1) {
      selectedOptions[optionIndex].value = optionValue
    } else {
      selectedOptions.push({ name: optionName, value: optionValue });
    }
  }
  
  $: console.log($cartItems)
</script>


<svelte:head>
  <title>{product?.productname}</title>
  <meta name="description" content={`${product?.description}`}>
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

		<div class="flex gap-5 items-center">
			<div
				class="flex gap-1 items-center justify-center w-16 h-8 bg-gray-200 dark:bg-[#303030] px-1 mt-1 rounded-lg"
			>
				<iconify-icon class={getStartColor(rating)} icon="mdi:star" height="1.5rem" width="1.5rem"
				></iconify-icon>
				<span class="text-base font-semibold">{rating}</span>
			</div>

			<h3 class="dark:text-[#707070] font-semibold underline cursor-pointer">{m.product_page_reviews()}</h3>
		</div>

		<h1 class="text-2xl mt-1">{formatPrice(product?.price, 'es-CO', 'COP')}</h1>

		<!-- Product Description -->
		<div class="h-auto max-h-40 w-full mt-1">
			<p>{product.description}</p>
		</div>

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
									<Select.Item value={`${op}`} on:click={() => handleOptionChange(option.name, op)}>{op}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/if}
			{/each}
		{/if}

		<div class="flex flex-col gap-3">
			<div class="flex mt-5 gap-3">
				<div class="flex items-center justify-around w-2/5 border border-gray-300 dark:border-[#202020] rounded-md">
					<button
						on:click|preventDefault={() => {
							if (quantity > 1) {
								quantity--;
							}
						}}
						class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
					>
						<!-- Minus Icon -->
						<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
					<span class="mx-2 text-xl font-semibold">{quantity}</span>
					<button
						on:click|preventDefault={() => quantity++}
						class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
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
				on:click={() => {
					handleAddToCart()
					goto('/cart');
				}}
				class="bg-purple-600 dark:bg-purple-600 border-none rounded w-full h-12 text-white text-base cursor-pointer hover:bg-purple-700 hover:dark:bg-purple-700"
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

<div class="flex flex-col m-10 mt-14">
	<h2 class="text-xl font-bold">{m.product_page_more_products()}</h2>
</div>

<!-- Lista de productos del mismo vendedor -->
<RandomProducts user={product.user} />
