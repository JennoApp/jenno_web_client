<script>
	import { goto } from "$app/navigation";
</script>


<div class="flex w-full h-screen">
	<div class="w-1/2 flex justify-center items-center">
		<button class="bg-[#252525] h-20 w-40 rounded-md" on:click={() => goto('/register/personal')}>
			<span class="text-lg font-medium">Personal</span>
		</button>
	</div>
	<div class="w-1/2 bg-[#252525] flex justify-center items-center">
		<button class="bg-[#121212] h-20 w-40 rounded-md" on:click={() => goto('/register/business')}>
			<span class="text-lg font-medium">Empresa</span>
		</button>
	</div>
</div>
