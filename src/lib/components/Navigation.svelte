<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { toast } from 'svelte-sonner';
	import Sidebar from './Sidebar.svelte';
	import {
		cartItems,
		addToCart,
		decrementCartItem,
		removeFromCart,
		getTotal
	} from '$lib/stores/cartStore';
	import { onDestroy } from 'svelte';
	import { setSearch, search } from '$lib/stores/searchStore';
	import Autocomplete from './Autocomplete.svelte';
	import { formatPrice } from '$lib/utils/formatprice';
	import { theme } from '$lib/stores/themeStore';
	import * as Dialog from '$lib/components/ui/dialog';
	import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';

	const rutasExcluidas = [
		'',
		'admin',
		'search',
		'personal',
		'settings',
		'explore',
		'following',
		'cart',
		'chat',
		'shopping',
		'forgotpassword',
		// languages
		'es'
	];

	let searchInputValue = '';
	let isActiveSearchInput = false;

	function activeSearchInput() {
		isActiveSearchInput = !isActiveSearchInput;
	}

	const handleSearch = () => {
		if (searchInputValue !== '') {
			if (!rutasExcluidas.includes($page.url.pathname.split('/')[1])) {
				setSearch(searchInputValue);
				dialogOpen = false;
				goto(`/${$page.url.pathname.split('/')[1]}/search`);
				searchInputValue = '';
			} else {
				setSearch(searchInputValue);
				console.log($search);
				dialogOpen = false;
				goto('/search');
				searchInputValue = '';
			}
		}
	};

	const handleGlobalSearch = () => {
		if (searchInputValue !== '') {
			setSearch(searchInputValue);
			dialogOpen = false;
			goto('/search');
			searchInputValue = '';
		}
	};

	/// Total reactivo basado en svelte/store
	let total = getTotal();

	const unsubscribe = cartItems.subscribe(() => {
		total = getTotal();
	});

	onDestroy(() => {
		unsubscribe();
	});
	///

	const paths = [
		'/login',
		'/register',
		'/register/personal',
		'/register/business',
		'/forgotpassword'
	];

	//verifica si la sesion de usuario esta activa
	$: userInfo = $page.data.user;

	$: sessionExpired = $page.data.sessionExpired;
	$: console.log({ sessionExpired });

	// Estado de sidebar, por defecto es true,
	// y funcion que actualiza este estado
	let isClose = true; // actualizar!! a svelte 5
	function handleIsClose() {
		isClose = !isClose;
	}

	$: console.log($page.url.pathname);
	$: console.log($page.data.user);

	// logout function
	const logout = async () => {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.ok) {
			invalidateAll();
			toast.success('Sesión Cerrada');

			// Redirige a la pagina principal si la ruta actual es "restringida"
			const restrictedPaths = ['/admin', '/settings', '/personal', '/cart', '/chat', '/shopping'];
			const currentPath = $page.url.pathname;

			if (restrictedPaths.some((path) => currentPath.startsWith(path))) {
				setTimeout(() => {
					goto('/');
				}, 100);
			}
		} else {
			toast.error('No se ha podido cerrar sesion');
		}
	};

	const autocompleteOptions = ['Opción 1', 'Opción 2', 'Opción 3'];
	let selectedIndex = -1;
	function selectOption(option: any) {
		alert(option);
	}

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}

	//////
	let isSearchOpen = false;

	const openSearh = () => {
		isSearchOpen = !isSearchOpen;
		alert(`search open: ${isSearchOpen}`);
	};

	let dialogOpen = false;
</script>

{#if !paths.includes($page.url.pathname)}
	<!-- Navbar -->
	<nav class="fixed z-50 w-full">
		<div class="flex items-center justify-between bg-[#f7f7f7] dark:bg-[#121212] h-14 px-4 md:px-7">
			<!-- Left -->
			<div class="flex items-center">
				<div class="hidden md:block lg:block">
					<button
						class="flex justify-center items-center dark:text-white text-xl mr-6"
						on:click={handleIsClose}
					>
						<iconify-icon icon="ion:menu" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				</div>

				<button on:click|preventDefault={() => goto('/')}>
					<div class="relative flex gap-1">
						<div class="flex">
							<!-- Logo  -->
							<h1 class="text-xl font-extrabold dark:text-gray-200">J</h1>
							{#if $location_data !== undefined}
								<span
									class="absolute top-5 right-[-23px] dark:text-gray-200 font-bold h-5 w-5 text-sm flex items-center justify-center"
									>{$location_data?.data[0]?.country_module?.global?.alpha2}</span
								>
							{/if}
							<span
								class="absolute top-2 text-gray-500 h-5 w-5 text-sm flex items-center justify-center {$location_data !==
								undefined
									? 'right-[-50px]'
									: 'right-[-30px]'}">beta</span
							>
						</div>
					</div>
				</button>
			</div>

			<!-- Center (hidden in small screens) -->
			<div class="hidden md:block">
				<div class="flex w-full max-w-sm md:max-w-md lg:max-w-xl h-10 relative cursor-pointer">
					<form on:submit|preventDefault={handleSearch} class="flex md:w-[600px] h-10">
						{#if !rutasExcluidas.includes($page.url.pathname.split('/')[1])}
							<div
								class="flex items-center rounded-l-2xl h-10 px-2 dark:text-white font-medium bg-gray-200 dark:bg-[#202020] cursor-default"
							>
								{$page.url.pathname.split('/')[1]}
							</div>
						{/if}
						<input
							id="searchInput"
							class="flex-grow h-10 text-base dark:text-gray-200 px-2 bg-gray-100 dark:bg-[#121212] outline-none border border-gray-200 dark:border-[#222222] {!rutasExcluidas.includes(
								$page.url.pathname.split('/')[1]
							)
								? ''
								: 'border-r-0 rounded-l-2xl'}"
							type="text"
							placeholder={m.navbar_input_search()}
							name="search"
							autocomplete="off"
							bind:value={searchInputValue}
						/>
						<div
							class="grid place-items-center text-2xl dark:text-white w-16 h-full bg-gray-200 dark:bg-[#202020] border border-gray-200 dark:border-[#222222] rounded-r-2xl"
						>
							<iconify-icon icon="material-symbols:search-rounded" height="1.5rem" width="1.5rem"
							></iconify-icon>
						</div>
					</form>

					{#if !rutasExcluidas.includes($page.url.pathname.split('/')[1]) && searchInputValue.length > 1}
						<button on:click={() => handleGlobalSearch()}>
							<div
								class="absolute top-10 left-0 mt-2 w-full bg-white dark:bg-[#202020] shadow-lg rounded-md p-2"
							>
								<p class="text-gray-700 dark:text-gray-200 cursor-pointer">
									Realizar búsqueda global
								</p>
							</div>
						</button>
					{/if}
				</div>
			</div>

			<!-- Right -->
			<div class="flex items-center gap-3">
				<!-- Search Icon for small screens -->
				<div class="md:hidden">
					<Dialog.Root bind:open={dialogOpen}>
						<Dialog.Trigger>
							<button
								class="flex justify-center items-center h-9 w-9 bg-gray-200 dark:bg-[#202020] rounded-full dark:text-gray-200 text-xl"
							>
								<iconify-icon icon="material-symbols:search-rounded" height="1.5rem" width="1.5rem"
								></iconify-icon>
							</button>
						</Dialog.Trigger>
						<Dialog.Content class="top-10 w-full m-0 px-0 py-1">
							<form on:submit|preventDefault={handleSearch} class="flex w-full">
								{#if !rutasExcluidas.includes($page.url.pathname.split('/')[1])}
									<div
										class="flex items-center rounded-l-2xl h-10 px-2 dark:text-white font-medium bg-gray-200 dark:bg-[#202020] cursor-default"
									>
										{$page.url.pathname.split('/')[1]}
									</div>
								{/if}
								<input
									id="searchInput"
									class="flex-grow h-10 text-base dark:text-gray-200 px-2 bg-gray-100 dark:bg-[#121212] outline-none border border-gray-200 dark:border-[#222222] {!rutasExcluidas.includes(
										$page.url.pathname.split('/')[1]
									)
										? ''
										: 'border-r-0 rounded-l-2xl'}"
									type="text"
									placeholder={m.navbar_input_search()}
									name="search"
									autocomplete="off"
									bind:value={searchInputValue}
								/>
								<div
									class="grid place-items-center text-2xl dark:text-white w-16 h-full bg-gray-200 dark:bg-[#202020] border border-gray-200 dark:border-[#222222] rounded-r-2xl"
								>
									<iconify-icon
										icon="material-symbols:search-rounded"
										height="1.5rem"
										width="1.5rem"
									></iconify-icon>
								</div>
							</form>

							{#if !rutasExcluidas.includes($page.url.pathname.split('/')[1]) && searchInputValue.length > 1}
								<button on:click={() => handleGlobalSearch()}>
									<div
										class="absolute top-10 left-0 mt-2 w-full bg-white dark:bg-[#202020] shadow-lg rounded-md p-2"
									>
										<p class="text-gray-700 dark:text-gray-200 cursor-pointer">
											Realizar búsqueda global
										</p>
									</div>
								</button>
							{/if}
						</Dialog.Content>
					</Dialog.Root>
				</div>

				{#if userInfo}
					<div class="flex items-center gap-3">
						<div>
							<a href="/chat">
								<iconify-icon
									icon="mdi:message"
									height="1.3rem"
									width="1.3rem"
									class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#202020] rounded-full hover:bg-gray-300 dark:hover:bg-[#252525]"
								/>
							</a>
						</div>
						<HoverCard.Root openDelay={100}>
							<HoverCard.Trigger href="/cart" class="relative">
								<iconify-icon
									icon="mdi:cart"
									height="1.3rem"
									width="1.3rem"
									class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#202020] rounded-full hover:bg-gray-300 dark:hover:bg-[#252525]"
								/>

								{#if $cartItems.length !== 0}
									<span
										class="absolute top-[-0.2rem] right-[-0.2rem] bg-slate-400 dark:bg-gray-200 text-black dark:text-black text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
									>
										{$cartItems.length}
									</span>
								{/if}
							</HoverCard.Trigger>
							<HoverCard.Content class="flex flex-col gap-2 w-80">
								{#if $cartItems.length === 0}
									<div class="w-full flex justify-center">
										<h2>{m.navbar_cart_additems()}</h2>
									</div>
								{:else}
									{#each $cartItems as cartItem}
										<div
											class="flex flex-row gap-3 items-center rounded-sm p-3 relative bg-gray-200 dark:bg-[#202020] hover:dark:bg-[#252525]"
										>
											<img
												class="w-12 h-12 object-cover rounded-sm mr-2"
												src={`${cartItem.imgs[0]}`}
												alt={`${cartItem.productname}`}
											/>
											<div class="flex">
												<div class="flex flex-col items-start">
													<h2 class="text-lg">{cartItem.productname}</h2>
													<p class="text-base dark:text-white">${cartItem.price}</p>
													<div class="flex gap-1">
														<h3>{cartItem.selectedOptions[0].name}:</h3>
														<p>{cartItem.selectedOptions[0].value}</p>
													</div>
												</div>

												<div class="flex w-full justify-center items-center mt-2">
													<button
														on:click|preventDefault={() =>
															decrementCartItem(cartItem._id, cartItem.selectedOptions)}
														class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
													>
														<!-- Minus Icon -->
														<iconify-icon icon="ic:round-minus" height="1.5rem" width="1.5rem"
														></iconify-icon>
													</button>
													<span class="mx-2 text-black dark:text-white font-medium"
														>{cartItem.amount}</span
													>
													<button
														on:click|preventDefault={() =>
															addToCart(cartItem, cartItem.selectedOptions)}
														class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary"
													>
														<!-- Plus Icon -->
														<iconify-icon icon="ic:round-plus" height="1.5rem" width="1.5rem"
														></iconify-icon>
													</button>
												</div>
											</div>
											<button
												on:click|preventDefault={() =>
													removeFromCart(cartItem._id, cartItem.selectedOptions)}
												class="absolute top-2 right-2 dark:text-white hover:text-primary cursor-pointer"
											>
												<!-- Close Icon -->
												<iconify-icon icon="ic:round-close" height="1.5rem" width="1.5rem"
												></iconify-icon>
											</button>
										</div>
									{/each}
									<div class="flex justify-between">
										<a href="/cart" class="hover:underline">{m.navbar_cart_go_to_cart()}</a>
										<h2>Subtotal: {formatPrice(total, 'es-CO', 'COP')}</h2>
									</div>
								{/if}
							</HoverCard.Content>
						</HoverCard.Root>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
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
										class="text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-[#202020] rounded-full hover:bg-[#252525]"
									/>
								{/if}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item
									href={userInfo.accountType === 'personal'
										? `/personal/${userInfo?._id}`
										: `/${userInfo.username}`}
								>
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
										<h2 class="text-base dark:text-gray-200 font-semibold">{userInfo?.username}</h2>
										<h3 class="text-sm dark:text-[#707070]">{userInfo?.accountType}</h3>
										<h3 class="text-sm dark:text-[#707070]">{userInfo?.email}</h3>
									</div>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Group>
									{#if userInfo.accountType === 'business'}
										<DropdownMenu.Item href="/admin/dashboard">
											<span>{m.navbar_user_admin()}</span>
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Item href="/shopping">
										<span>{m.navbar_user_shopping()}</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item href="/settings/profile">
										<span>{m.navbar_user_settings()}</span>
									</DropdownMenu.Item>

									<DropdownMenu.Sub>
										<DropdownMenu.SubTrigger>{m.navbar_user_theme()}</DropdownMenu.SubTrigger>
										<DropdownMenu.SubContent>
											<DropdownMenu.Item on:click={() => setTheme('light')}
												>{m.nabvar_user_theme_light()}</DropdownMenu.Item
											>
											<DropdownMenu.Item on:click={() => setTheme('dark')}
												>{m.nabvar_user_theme_dark()}</DropdownMenu.Item
											>
											<DropdownMenu.Item on:click={() => setTheme('system')}
												>{m.nabvar_user_theme_system()}</DropdownMenu.Item
											>
										</DropdownMenu.SubContent>
									</DropdownMenu.Sub>

									<DropdownMenu.Item on:click={() => logout()}>
										<span>{m.navbar_user_logout()}</span>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{:else}
					<div>
						<button
							class="bg-[#202020] text-gray-200 w-28 h-10 px-2 md:mr-5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#303030]"
							on:click={() => goto('/login')}
						>
							Login
						</button>
						<button
							class="bg-[#202020] text-gray-200 w-28 h-10 px-2 md:mr-5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#303030]"
							on:click={() => goto('/register')}
						>
							Register
						</button>
					</div>
				{/if}
			</div>
		</div>
	</nav>

	<div class="flex justify-center relative top-[50px]">
		<div class="hidden md:block lg:block">
			<Sidebar closeMenu={isClose} />
		</div>

		<main
			class={!isClose
				? 'relative top-0 md:left-20 w-full md:w-[calc(100%-208px)] px-3'
				: 'relative top-0 md:left-7 w-full md:w-[calc(100%-80px)] px-3'}
		>
			<slot />
		</main>

		<!-- {#if isActiveSearchInput}
			{#if autocompleteOptions.length > 0}
				<Autocomplete options={autocompleteOptions} {selectedIndex} {selectOption} />
			{/if}
		{/if} -->
	</div>
{:else}
	<slot />
{/if}
