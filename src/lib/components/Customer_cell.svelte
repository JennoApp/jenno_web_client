<script lang="ts">
	export let data
</script>

{#if data.buyerProfileImg}
	<a href="/personal/{data.buyerId}">
		<div class="flex gap-2 items-center">
			<img class="h-10 w-10 rounded-full" src="{data.buyerProfileImg}" alt="{data.buyerName}" />
			<h3>{data.buyerName}</h3>
		</div>
	</a>
{:else}
	<a href="/personal/{data.buyerId}">
		<div class="flex gap-2 items-center">
			<iconify-icon
				icon="mdi:user"
				height="1.5rem"
				width="1.5rem"
				class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
			></iconify-icon>
			<h3>{data.buyerName}</h3>
		</div>
	</a>
{/if}
