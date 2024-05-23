<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: [string];
		price: number;
		user: string;
	}

	import { addToCart } from '$lib/stores/cartStore';

	export let data: CardData;

	let profileImg = '';

	onMount(async () => {
		if (!data || !data?.user) {
			console.error(
				'No se ha proporcionado el objeto de datos necesario para obtener la imagen de perfil'
			);
			return;
		}

		try {
			const response = await fetch(`http://localhost:3000/users/getprofileimg/${data?.user}`);

			const userData = await response.json();
			console.log({ userData });

			profileImg = userData?.profileImg
		} catch (error: any) {
			console.error(`Error al obtener la imagen de perfil: ${error.message}`);
		}
	});

  let rating: number = 3.5

  const getStartColor = (rating: number) => {
    if (rating >= 5) {
      return 'text-yellow-600'
    } else if (rating >= 4.5) {
      return 'text-yellow-500'
    } else if (rating >= 3.5) {
      return 'text-yellow-400'
    } else if (rating >= 2.5) {
      return 'text-yellow-300'
    } else if (rating >= 1.5) {
      return 'text-yellow-200'
    } else {
      return 'text-yellow-100'
    }
  }
</script>

<a href={`/${data.username}/${data._id}`}>
	<div
		class="h-[420px] min-w-[250px] max-w-[300px] rounded-xl bg-[#202020] text-gray-200 shadow-md hover:bg-[#252525]"
	>
		<!-- Header -->
		<div class="flex w-full h-12 mt-1 items-center justify-between">
			<div class="flex items-center">
				{#if profileImg !== ''}
					<img class="h-7 w-7 object-cover ml-4 rounded-xl" src={profileImg} alt="logo" />
				{:else}
					<div class="flex justify-center items-center h-9 w-9 ml-2 rounded-xl">
						<iconify-icon icon="mdi:user" height="1.5rem" width="1.5rem"></iconify-icon>
					</div>
				{/if}
				<a href={data.username}>
					<h4 class="ml-2">{data.username}</h4>
				</a>
			</div>
			<div class="hidden"> <!-- oculto los simbolos para agregar funcionalidad posteriormente -->
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
			<img class="w-11/12 h-52 object-cover rounded-md" src={data.imgs[0]} alt="tiger" />
		</div>

		<!-- Social -->
		<div class="flex items-center justify-between w-full h-8 mt-1 mx-3">
			<div class="flex gap-2 items-center text-2xl text-center">
        <div class="flex gap-1 items-center justify-center bg-[#303030] px-1 rounded-lg">
          <iconify-icon 
            class={getStartColor(rating)} 
            icon="mdi:star" 
            height="1.5rem"
            width="1.5rem"
				></iconify-icon>
        <span class="text-sm font-medium">{rating}</span>
        </div>	
				<iconify-icon class="" icon="material-symbols-light:reviews" height="1.5rem" width="1.5rem"
				></iconify-icon>
				<iconify-icon class="" icon="bitcoin-icons:share-filled" height="1.5rem" width="1.5rem"
				></iconify-icon>
			</div>

			<div class="save hidden"> <!-- oculto los simbolos para agregar funcionalidad posteriormente -->
				<iconify-icon
					class="px-1 mr-4"
					icon="material-symbols:bookmark-outline"
					height="1.5rem"
					width="1.5rem"
				></iconify-icon>
			</div>
		</div>

		<!-- Info -->
		<div class="w-full h-[70px] mx-3">
			<div>
				<h3 class="m-1 text-xl">{data.productname}</h3>
				<h2 class="m-1 mt-1 text-lg font-semibold">${data.price}</h2>
			</div>
		</div>

		<!-- Commerce -->
		<div class="flex justify-evenly mx-2 mt-2 gap-1">	
			<button
				class="bg-[#404040] rounded max-w-[140px] min-w-[130px] h-8 text-gray-200 text-base cursor-pointer"
				on:click|preventDefault={() => addToCart(data)}
			>
				Add to Cart
			</button>
      <button
				class="bg-purple-800 rounded max-w-[140px] min-w-[130px] h-8 text-gray-200 text-base cursor-pointer z-10"
				on:click|preventDefault={() => {
					addToCart(data);
					goto('/cart');
				}}
			>
				Buy Now
			</button>
		</div>
	</div>
</a>
