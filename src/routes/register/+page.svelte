<script>
	import { goto } from "$app/navigation";
</script>


<div class="flex w-full h-screen">
	<div class="w-1/2 flex flex-col items-center">
		<button class="dark:bg-[#252525] hover:dark:bg-[#303030] h-20 w-10/12 mt-40 rounded-md" on:click={() => goto('/register/personal')}>
			<span class="text-xl font-medium">Personal</span>
		</button>
		<div class="w-10/12 h-96 bg-[#252525] mt-10 rounded-md">

		</div>
	</div>
	<div class="flex flex-col w-1/2 bg-[#252525] items-center">
		<button class="dark:bg-[#121212] hover:dark:bg-[#161616] h-20 w-10/12 mt-40 rounded-md" on:click={() => goto('/register/business')}>
			<span class="text-xl font-medium">Empresa</span>
		</button>
		<div class="w-10/12 h-96 bg-[#121212] mt-10 rounded-md">

		</div>
	</div>
</div>
