<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import Sidebar from './Sidebar.svelte';
	import { cartItems, addToCart, decrementCartItem, removeFromCart, getTotal } from '$lib/stores/cartStore';
	import { onDestroy } from 'svelte'

	/// Total reactivo basado en svelte/store
	let total = getTotal()

	const unsubscribe = cartItems.subscribe(() => {
		total = getTotal()
	})

	onDestroy(() => {
		unsubscribe()
	})
	///

	const paths = ['/login', '/register'];

	//verifica si la sesion de usuario esta activa
	$: userInfo = $page.data.user;

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
				{#if userInfo}
					<div class="flex items-center gap-3">
						<div>
							<iconify-icon
								icon="mdi:message"
								height="1.3rem"
								width="1.3rem"
								class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
							/>
						</div>
						<HoverCard.Root openDelay={100}>
							<HoverCard.Trigger class="relative">
								<iconify-icon
									icon="mdi:cart"
									height="1.3rem"
									width="1.3rem"
									class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
								/>
								<span class="absolute top-[-0.2rem] right-[-0.2rem] dark:bg-gray-200 dark:text-black text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
									{$cartItems.length}
								</span>
							</HoverCard.Trigger>
							<HoverCard.Content class="flex flex-col gap-2 w-80">
								{#if $cartItems.length === 0}
									<div class="w-full flex justify-center">
										<h2>Agregar items al Carrito!</h2>
									</div>
								{:else}
									{#each $cartItems as cartItem}
										<div
											class="flex flex-row gap-3 items-center rounded-sm p-3 relative dark:bg-[#202020] hover:dark:bg-[#252525]"
										>
											<img
												class="w-12 h-12 object-cover rounded-sm mr-2"
												src={`${cartItem.imgs[0]}`}
												alt={`${cartItem.productname}`}
											/>
											<div class="flex">
												<div class="flex flex-col items-start">
													<h2 class="text-lg">{cartItem.productname}</h2>
													<p class="text-base text-white">${cartItem.price}</p>
												</div>

												<div class="flex w-full justify-center items-center mt-2">
													<button
														on:click|preventDefault={() => decrementCartItem(cartItem._id)}
														class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
													>
														<!-- Minus Icon -->
														<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"
														></iconify-icon>
													</button>
													<span class="mx-2">{cartItem.amount}</span>
													<button
														on:click|preventDefault={() => addToCart(cartItem)}
														class="rounded-sm text-white p-1 cursor-pointer hover:text-primary"
													>
														<!-- Plus Icon -->
														<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"
														></iconify-icon>
													</button>
												</div>
											</div>
											<button
												on:click|preventDefault={() => removeFromCart(cartItem._id)}
												class="absolute top-2 right-2 text-white hover:text-primary cursor-pointer"
											>
												<!-- Close Icon -->
												<iconify-icon icon="ic:round-close" height="1.5rem" width="1.5rem"
												></iconify-icon>
											</button>
										</div>
									{/each}
									<div class="flex justify-end">
										<h2>Total: {total.toFixed(0)}</h2>
									</div>
								{/if}
							</HoverCard.Content>
						</HoverCard.Root>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<iconify-icon
									icon="mdi:user"
									height="1.5rem"
									width="1.5rem"
									class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
								/>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item>
									{#if userInfo.profileImg !== ''}
										<img
											src={userInfo.profileImg}
											alt={userInfo.username}
											class="h-9 w-9 object-cover ml-1 rounded-full"
										/>
									{:else}
										<iconify-icon
											icon="mdi:user"
											height="1.5rem"
											width="1.5rem"
											class="flex justify-center items-center text-gray-200 h-14 w-14 ml-1 bg-background rounded-full"
										/>
									{/if}
									<div class="flex flex-col justify-center ml-2">
										<h2 class="text-base text-gray-200 font-semibold">{userInfo?.username}</h2>
										<h3 class="text-sm text-[#707070]">{userInfo?.accountType}</h3>
										<h3 class="text-sm text-[#707070]">{userInfo?.email}</h3>
									</div>
								</DropdownMenu.Item>
								<DropdownMenu.Separator class="bg-[#303030]" />
								<DropdownMenu.Group>
									{#if userInfo.accountType === 'business'}
										<DropdownMenu.Item href="/admin/dashboard">
											<span>Administrador</span>
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Item>
										<span>Ajustes</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<span>Cerrar Sesion</span>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{:else}
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
				{/if}
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
