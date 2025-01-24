<script>
	import { goto } from '$app/navigation';
</script>

<div class="flex flex-col lg:flex-row w-full h-screen">
	<!-- Personal -->
	<div class="lg:w-1/2 h-1/2 lg:h-full dark:bg-[#161616] flex justify-center items-center">
		<div
			class="flex flex-col items-center justify-center dark:bg-[#161616] w-10/12 lg:h-3/5 rounded-md"
		>
			<button
				class="bg-gray-200 dark:dark:bg-[#252525] hover:bg-gray-300 dark:hover:dark:bg-[#272727] h-20 w-10/12 rounded-md"
				on:click={() => goto('/register/personal')}
			>
				<span class="text-xl font-medium">Personal</span>
			</button>
			<div class="w-10/12 h-56 bg-gray-200 dark:bg-[#252525] mt-2 rounded-md">
				<ul class="list-disc pl-5 m-5">
					<li class="dark:text-white">Compra productos y servicios.</li>
					<li class="dark:text-white">Guarda y comparte tus productos favoritos.</li>
					<li class="dark:text-white">
						Interactua con otros usuarios y descubre nuevas tendencias.
					</li>
				</ul>
			</div>
		</div>
	</div>
	<!-- business -->
	<div class="flex lg:w-1/2 h-1/2 lg:h-full dark:bg-[#161616] justify-center items-center">
		<div
			class="flex flex-col items-center justify-center dark:bg-[#161616] w-10/12 lg:h-3/5 rounded-md"
		>
			<button
				class="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 hover:dark:bg-[#272727] h-20 w-10/12 rounded-md"
				on:click={() => goto('/register/business')}
			>
				<span class="text-xl font-medium">Empresa</span>
			</button>
			<div class="w-10/12 h-56 bg-gray-200 dark:bg-[#252525] mt-2 rounded-md overflow-y-auto">
				<ul class="list-disc pl-5 m-5">
					<li class="dark:text-white">Administra tu tienda y productos fácilmente.</li>
					<li class="dark:text-white">Inicia y gestiona tus ventas en línea.</li>
					<li class="dark:text-white">Promociona tus productos y llega a más clientes.</li>
				</ul>
				<div class="flex gap-3 border border-gray-400 dark:border-[#161616] m-5 p-1 rounded-md">
					<div class="text-yellow-500">
						<iconify-icon icon="ic:round-warning" height="1.5rem" width="1.5rem"></iconify-icon>
					</div>
					<div>
						<p>
							Se requiere información legal de la empresa para la creación de la cuenta. Asegúrate
							de tener la documentación necesaria disponible antes de continuar.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
