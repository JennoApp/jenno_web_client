<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Sidebar from './Sidebar.svelte';

	const paths = ['/login', '/register'];

	//verifica si la sesion de usuario esta activa

	// Estado de sidebar, por defecto es true,
	// y funcion que actualiza este estado
	let isClose = true; // actualizar!! a svelte 5
	function handleIsClose() {
		isClose = !isClose;
	}
</script>

{#if !paths.includes($page.url.pathname)}
	<!-- Navbar -->
	<nav class="fixed z-50 w-full">
		<div class="flex items-center justify-between bg-white dark:bg-[#121212] w-full h-14 px-7">
			<!-- Left -->
			<div class="flex items-center">
				<button
					class="flex justify-center items-center text-white text-xl mr-6"
					on:click={handleIsClose}
				>
					<iconify-icon icon="ion:menu" height="1.5rem" width="1.5rem"></iconify-icon>
				</button>

				<a href="/">
					<div class="relative flex gap-1">
						<div class="flex">
							<h1 class="text-xl font-bold text-gray-100">YouShop</h1>
							<span
								class="absolute top-4 right-[-25px] text-gray-600 h-5 w-5 text-sm flex items-center justify-center"
								>beta</span
							>
						</div>
					</div>
				</a>
			</div>

			<!-- Center -->
			<div>
				<div class="flex w-[600px] h-10 relative cursor-pointer">
					<input
						id="searchInput"
						class="flex items-center w-full h-full text-base text-gray-200 px-2 bg-[#121212] outline-none border border-[#222222] border-r-0 rounded-l-2xl"
						type="text"
						placeholder="Search"
						name="search"
						autoComplete="off"
					/>
					<div
						class="grid place-items-center text-2xl text-white w-16 h-full bg-[#202020] border border-[#222222] rounded-r-2xl"
					>
						<iconify-icon icon="material-symbols:search-rounded" height="1.5rem" width="1.5rem"
						></iconify-icon>
					</div>
				</div>
			</div>

			<!-- Right -->
			<div>
				<div>
					<button
						class="bg-[#202020] text-gray-200 w-28 h-10 px-2 mr-5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#303030]"
						on:click={() => goto('/login')}
					>
						Login
					</button>
					<button
						class="bg-[#202020] text-gray-200 w-28 h-10 px-2 mr-5 rounded-md text-sm font-semibold cursor-pointer"
						on:click={() => goto('/register')}
					>
						Register
					</button>
				</div>
			</div>
		</div>
	</nav>

	<div class="flex relative top-16 left-0">
		<Sidebar closeMenu={isClose} />
		<main
			class={!isClose
				? 'relative top-0 left-52 w-[calc(100%-208px)] bg-bkg'
				: 'relative top-0 left-20 w-[calc(100%-80px)] bg-bkg'}
		>
			<slot />
		</main>
	</div>
{:else}
	<slot />
{/if}
