<script lang="ts">
	let { data } = $props();

	$inspect(data);
</script>

<a
	href={`/${data.username}`}
	class="cursor-pointer rounded-xl border border-gray-200 dark:border-[#222222]
       bg-white dark:bg-[#121212]
       hover:shadow-md
       transition-shadow duration-75 ease-out
       flex flex-col overflow-hidden
       focus:outline-none"
>
	<!-- Banner -->
	<div class="h-24 bg-gray-200 dark:bg-[#1f1f1f] relative">
		{#if data.banner}
			<img src={data.banner} alt="Banner de tienda" class="w-full h-full object-cover" />
		{/if}
	</div>

	<!-- Avatar -->
	<div class="flex justify-center -mt-10 relative z-10">
		{#if data.profileImg !== ""}
			<img
				src={data.profileImg}
				alt="Profile"
				class="w-20 h-20 rounded-full border-4 border-white dark:border-[#121212] object-cover"
			/>
		{:else}
			<div
				class="w-20 h-20 rounded-full border-4 border-white dark:border-[#121212]
				       bg-gray-200 dark:bg-[#1f1f1f]
				       flex items-center justify-center"
			>
				<iconify-icon
					icon="mdi:account-circle"
					height="5rem" width="5rem"
					class="text-gray-400 dark:text-gray-500"
				></iconify-icon>
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="px-4 pb-4 pt-2 text-center">
		<h3 class="font-semibold text-base dark:text-white truncate">
			{data.storeName || data.username}
		</h3>

		<p class="text-sm text-gray-500 dark:text-gray-400 truncate">
			@{data.username}
		</p>

		{#if data.description}
			<p class="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
				{data.description}
			</p>
		{/if}

		<!-- CTA visual -->
		<div
			class="mt-4 w-full py-2 text-sm font-medium rounded-lg
			       bg-black dark:bg-white text-white dark:text-black
			       hover:opacity-90 transition"
		>
			Ver tienda
		</div>
	</div>
</a>
