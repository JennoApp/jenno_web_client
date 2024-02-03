<script lang="ts">
	interface CardData {
		_id: string;
		username: string;
		productname: string;
		imgs: [string];
		price: number;
	}

	import { addToCart } from '$lib/stores/cartStore';

	export let data: CardData;
</script>

<a href={`/${data.username}/${data._id}`}>
	<div
		class="h-[420px] min-w-[250px] max-w-[300px] rounded-xl bg-[#202020] text-gray-200 shadow-md hover:bg-[#252525]"
	>
		<!-- Header -->
		<div class="flex w-full h-12 mt-1 items-center justify-between">
			<div class="flex items-center">
				{#if data.username === ''}
					<img class="h-9 w-9 object-cover ml-2 rounded-xl" src="" alt="logo" />
				{:else}
					<div class="flex justify-center items-center h-9 w-9 ml-2 rounded-xl">
						<iconify-icon icon="mdi:user" height="1.5rem" width="1.5rem"></iconify-icon>
					</div>
				{/if}
				<a href={data.username}>
					<h4 class="ml-1">{data.username}</h4>
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
		<div class="w-full h-[70px] mx-2">
			<div>
				<h3 class="m-1 text-xl">{data.productname}</h3>
				<h2 class="m-1 text-lg font-semibold">${data.price}</h2>
			</div>
		</div>

		<!-- Commerce -->
		<div class="flex justify-evenly mx-2">
			<button
				class="bg-[#404040] rounded max-w-[140px] min-w-[120px] h-8 text-gray-200 text-base cursor-pointer z-10"
				on:click|preventDefault={() => alert(data._id)}
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
