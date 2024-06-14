<script lang="ts">
	import { page } from '$app/stores';
  import { Progress } from '$lib/components/ui/progress'

	$: pathnameRoute = $page.url.pathname
	$: console.log({ pathnameRoute });
</script>

<div class="flex flex-col justify-center items-center">
	<div class="flex items-center justify-evenly gap-2 bg-gray-200 dark:bg-[#252525] w-full md:w-3/5 h-24 mt-3 px-3 rounded-t-md">
		<!-- step 1 -->
		<div class="flex flex-col items-center">
			<span class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>1</span
			>
			<h3>Shipping Info</h3>
		</div>
		<!-- step 2 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>2</span
			>
			<h3>Payment method</h3>
		</div>
		<!-- step 3 -->
		<div class="flex flex-col justify-center items-center">
			<span class="border border-[#121212] dark:border-white rounded-full p-1 w-10 h-10 text-center text-lg font-semibold"
				>3</span
			>
			<h3>Confirm order</h3>
		</div>
		
	</div>
  
  <div class="flex items-center px-14 bg-gray-200 dark:bg-[#252525] w-full md:w-3/5 h-10 rounded-b-md">
    {#if pathnameRoute === '/cart/paymentroute/shipping'}
     <Progress value={33.3}/>
     {:else if pathnameRoute === '/cart/paymentroute/payment'}
     <Progress value={66.6}/>
      {:else if pathnameRoute === '/cart/paymentroute/confirm'}
     <Progress value={100}/>
    {/if} 
  </div>
</div>

<slot />
