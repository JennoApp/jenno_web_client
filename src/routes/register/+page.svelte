<script>
	import { goto } from '$app/navigation';
</script>

<div class="flex w-full h-screen">
	<!-- Personal -->
	<div class="w-1/2 bg-[#161616] flex justify-center items-center">
		<div class="flex flex-col items-center justify-center bg-[#252525] w-10/12 h-2/5 rounded-md">
			<button
				class="dark:bg-[#161616] hover:dark:bg-[#181818] h-20 w-10/12 rounded-md"
				on:click={() => goto('/register/personal')}
			>
				<span class="text-xl font-medium">Personal</span>
			</button>
			<div class="w-10/12 h-48 bg-[#161616] mt-2 rounded-md">
				<ul class="list-disc pl-5 m-5">
					<li class="text-white">Compra productos y servicios.</li>
					<li class="text-white">Guarda y comparte tus productos favoritos.</li>
					<li class="text-white">Interactua con otros usuarios y descubre nuevas tendencias.</li>
				</ul>
			</div>
		</div>
	</div>
	<!-- business -->
	<div class="flex w-1/2 bg-[#252525] justify-center items-center">
		<div class="flex flex-col items-center justify-center bg-[#161616] w-10/12 h-2/5 rounded-md">
			<button
				class="dark:bg-[#252525] hover:dark:bg-[#272727] h-20 w-10/12 rounded-md"
				on:click={() => goto('/register/business')}
			>
				<span class="text-xl font-medium">Empresa</span>
			</button>
			<div class="w-10/12 h-48 bg-[#252525] mt-2 rounded-md">
				<ul class="list-disc pl-5 m-5">
					<li class="text-white">Administra tu tienda y productos fácilmente.</li>
					<li class="text-white">Inicia y gestiona tus ventas en línea.</li>
					<li class="text-white">Promociona tus productos y llega a más clientes.</li>
					<li class="text-yellow-500">
						Aviso: Se requiere información legal de la empresa para la creación de la cuenta.
						Asegúrate de tener la documentación necesaria disponible antes de continuar.
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>
