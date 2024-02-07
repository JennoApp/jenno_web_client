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
			<div>
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
		<div class="flex flex-row justify-between w-full h-8 mt-2 mx-2">
			<div class="flex text-2xl">
				<iconify-icon class="px-1" icon="mdi:star-outline" height="1.5rem" width="1.5rem"
				></iconify-icon>
				<iconify-icon class="px-1" icon="ic:outline-reviews" height="1.5rem" width="1.5rem"
				></iconify-icon>
				<iconify-icon class="px-1" icon="material-symbols:share" height="1.5rem" width="1.5rem"
				></iconify-icon>
			</div>

			<div class="save">
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
				<h2 class="m-1 text-lg font-semibold">${data.price}</h2>
			</div>
		</div>

		<!-- Commerce -->
		<div class="flex justify-evenly mx-2">
			<button
				class="bg-[#404040] rounded max-w-[140px] min-w-[120px] h-8 text-gray-200 text-base cursor-pointer z-10"
				on:click|preventDefault={() => {
					addToCart(data);
					goto('/cart');
				}}
			>
				Buy
			</button>
			<button
				class="bg-[#404040] rounded max-w-[140px] min-w-[120px] h-8 text-gray-200 text-base cursor-pointer"
				on:click|preventDefault={() => addToCart(data)}
			>
				Add to Cart
			</button>
		</div>
	</div>
</a>
