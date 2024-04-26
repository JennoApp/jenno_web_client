<script lang="ts">
	import { page } from '$app/stores';

	$: pathnameRoutes = $page.url.pathname.split('/').splice(1);
	$: console.log({ pathnameRoutes });
</script>

<div class="flex justify-center">
	<div class="flex items-center justify-between gap-2 bg-red-500 w-3/5 h-32 mt-3 px-3 rounded-md">
		<!-- step 1 -->
		<div class="flex flex-col items-center">
			<span class="border border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
		<!-- step 2 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
		<!-- step 3 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
		<!-- step 4 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
		<!-- step 5 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
	</div>
</div>

<slot />
