<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
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
	import { getContext, onDestroy } from 'svelte';
	import { setSearch, search } from '$lib/stores/searchStore';
	import Autocomplete from './Autocomplete.svelte';
	import { formatPrice } from '$lib/utils/formatprice';
	import { theme } from '$lib/stores/themeStore';
	import * as Dialog from '$lib/components/ui/dialog';
	// import { location_data } from '$lib/stores/ipaddressStore';
	import * as m from '$paraglide/messages';
	import { unreadConversationsCount } from '$lib/stores/conversationsStore';
	import { derived, get } from 'svelte/store';
	import { currentChat } from '$lib/stores/messagesStore';
	import {
		fetchNotifications,
		fetchUnreadNotificationsCount,
		notifications,
		totalPages,
		unreadNotificationsCount,
		markNotificationsAsRead
	} from '$lib/stores/notificationsStore';

	let { children } = $props();

	const { socket }: { socket: any } = getContext('socket');
	// $inspect('socket', socket);

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
		'resetpassword',
		// languages
		'es'
	];

	let searchInputValue = $state('');
	let isActiveSearchInput = $state(false);

	// Estado local que sincroniza con el store del carrito
	let localCartItems = $state<any[]>([]);
	let localTotal = $state(0);

	// Sincronizar el carrito local con el store
	$effect(() => {
		localCartItems = [...$cartItems];
		localTotal = getTotal();
	});

	function activeSearchInput() {
		isActiveSearchInput = !isActiveSearchInput;
	}

	// Obtener url del servidor
	let serverUrl = $state<string>('');
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al obtener el Url del servidor');
		}
	}

	async function getUserId(username: string) {
		await getServerUrl();

		const response = await fetch(`${serverUrl}/users/getUserId/${username}`);
		if (!response.ok) {
			throw new Error('Error al obtener el Id del usuario');
		}

		const { id } = await response.json();
		return id;
	}

	const handleSearch = async () => {
		if (searchInputValue.trim() !== '') {
			try {
				const username = page.url.pathname.split('/')[1];

				if (!rutasExcluidas.includes(username)) {
					const userId = await getUserId(username);

					const queryParams = new URLSearchParams({
						query: searchInputValue,
						id: userId
					}).toString();

					setSearch(searchInputValue);
					dialogOpen = false;
					goto(`/${username}/search?${queryParams}`);
					searchInputValue = '';
				} else {
					setSearch(searchInputValue);
					dialogOpen = false;
					goto(`/search`);
					searchInputValue = '';
				}
			} catch (error) {
				console.error('Error al obtener el ID del usuario:', error);
			}
		}
	};

	const handleGlobalSearch = () => {
		if (searchInputValue.trim() !== '') {
			setSearch(searchInputValue);

			const queryParams = new URLSearchParams({
				query: searchInputValue.trim()
			}).toString();

			dialogOpen = false;
			goto(`/search?${queryParams}`);
			searchInputValue = '';
		}
	};

	/// Total reactivo basado en svelte/store
	// let total = $state(getTotal());

	// const unsubscribe = cartItems.subscribe(() => {
	// 	total = getTotal();
	// });

	// onDestroy(() => {
	// 	unsubscribe();
	// });
	///
	// Total derivado del store
	const total = derived(cartItems, ($ci) =>
		$ci.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.amount || 0), 0)
	);

	// reemplazo de imagen cuando falla la carga
	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.onerror = null; // evitar loop
		img.src = '/images/placeholder.png'; // pon aquí tu placeholder real
	}

	// Helpers para acciones que necesitan parámetros estructurados
	function onAdd(cartItem) {
		// Si tu addToCart admite different signature; aquí asumimos (product, selectedOptions, amount?, selectedVariant?)
		addToCart(cartItem, cartItem.selectedOptions ?? [], 1, cartItem.selectedVariant ?? null);
	}

	function onIncrement(cartItem) {
		const maxStock = cartItem.selectedVariant?.quantity ?? cartItem.quantity;
		if (!isMaxed(cartItem._id, maxStock, cartItem.selectedOptions, cartItem.selectedVariant)) {
			addToCart(cartItem, cartItem.selectedOptions ?? [], 1, cartItem.selectedVariant ?? null);
		}
	}

	function onDecrement(cartItem) {
		decrementCartItem(
			cartItem._id,
			cartItem.selectedOptions ?? [],
			cartItem.selectedVariant ?? null
		);
	}

	function onRemove(cartItem) {
		removeFromCart(cartItem._id, cartItem.selectedOptions ?? [], cartItem.selectedVariant ?? null);
	}

	const paths = [
		'/login',
		'/register',
		'/register/personal',
		'/register/business',
		'/forgotpassword',
		'/resetpassword'
	];

	//verifica si la sesion de usuario esta activa
	let userInfo: any = $derived(page.data.user);

	let sessionExpired = $derived(page.data.sessionExpired);
	$inspect('sessionExpired', sessionExpired);

	// Estado de sidebar, por defecto es true,
	// y funcion que actualiza este estado
	let isClose = $state(true);
	function handleIsClose() {
		isClose = !isClose;
	}

	$inspect('pathname:', page.url.pathname);
	$inspect('user:', page.data.user);

	// logout function
	const logout = async () => {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.ok) {
			// invalidateAll();
			toast.success('Sesión Cerrada');

			// Redirige a la pagina principal si la ruta actual es "restringida"
			const restrictedPaths = ['/admin', '/settings', '/personal', '/cart', '/chat', '/shopping'];
			const currentPath = page.url.pathname;

			if (restrictedPaths.some((path) => currentPath.startsWith(path))) {
				setTimeout(() => {
					goto('/', { replaceState: true }).then(() => {
						location.reload();
					});
				}, 100);
			} else {
				location.reload();
			}
		} else {
			toast.error('No se ha podido cerrar sesion');
		}
	};

	const autocompleteOptions = ['Opción 1', 'Opción 2', 'Opción 3'];
	let selectedIndex = $state(-1);
	function selectOption(option: any) {
		alert(option);
	}

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}

	//////
	let isSearchOpen = $state(false);

	const openSearh = () => {
		isSearchOpen = !isSearchOpen;
		alert(`search open: ${isSearchOpen}`);
	};

	let dialogOpen = $state(false);

	// Obtener el numero de conversaciones no leidas
	async function getUnreadConversations(userId: string) {
		try {
			await getServerUrl();

			const response = await fetch(`${serverUrl}/chat/conversations/unread/${userId}`);

			if (response.ok) {
				const data = await response.json();
				unreadConversationsCount.set(data.unreadConversations);
			}
		} catch (error) {
			console.error('Error al obtener el numero de Conversaciones no leidos');
		}
	}

	async function getConversationAndNotificationData(userId: any) {
		await getServerUrl();
		if (userId) {
			getUnreadConversations(userId);

			// Cargar notificaciones
			fetchNotifications(serverUrl, userId);
			fetchUnreadNotificationsCount(serverUrl, userId);
		}
	}

	$effect(() => {
		if (page.data.user) {
			getConversationAndNotificationData(page.data.user._id);
		}
	});

	let currentPage = $state(1);

	// Funcion para cargar mas notificaciones
	function loadMoreNotifications() {
		if (currentPage < $totalPages) {
			currentPage++;
			fetchNotifications(serverUrl, page.data.user._id, currentPage);
		}
	}

	async function markNotifications() {
		console.log('markNotifications ejecutada');
		await getServerUrl();

		try {
			const response = await fetch(
				`${serverUrl}/users/notifications/markasread/${page.data.user._id}`,
				{
					method: 'POST'
				}
			);
			if (!response.ok) {
				throw new Error('Error al marcar las notificaciones como leidas.');
			}
			unreadNotificationsCount.set(0);
		} catch (error) {
			console.error('Error al marcar las notificaciones no leídas:', error);
		}
	}

	// Actualizar informacion en tiempo real
	socket?.on('getMessage', (data: any) => {
		// Verificar si los datos son válidos
		if (!data || !data.conversationId || !data._id) {
			console.warn('Datos de mensaje inválidos recibidos:', data);
			return;
		}

		const { conversationId, sender } = data;
		const currentChatValue = get(currentChat);
		const unreadCountValue = get(unreadConversationsCount);

		// Incrementar el contador de conversaciones no leídas
		if (currentChatValue?._id !== conversationId) {
			unreadConversationsCount.set(unreadCountValue + 1);
		}
	});

	let isDarkMode = $state(false);
	// Actualizar isDarkMode solo en el cliente
	$effect(() => {
		if (typeof window !== 'undefined') {
			if ($theme === 'system') {
				isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
			} else {
				isDarkMode = $theme === 'dark';
			}
		}
	});

	// Estado para saber si la imagen no se pudo cargar
	let failedToLoad = $state(false);

	// function handleImageError() {
	// 	failedToLoad = true;
	// }

	// Función para verificar catidad maxima de un producto en el carrito
	// globalmente
	function isMaxed(
		productId: string,
		maxStock: number,
		selectedOptions: any[] = [],
		selectedVariant?: any
	): boolean {
		if (!maxStock || maxStock <= 0) return true;

		const items = get(cartItems);

		const normalizeOptions = (opts: any[] = []) =>
			[...opts]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((o) => ({ name: o.name, value: o.value }));

		const selectedOptionsKey = JSON.stringify(normalizeOptions(selectedOptions));

		const totalAmount = items
			.filter((item) => {
				if (item._id !== productId) return false;

				const itemOptionsKey = JSON.stringify(normalizeOptions(item.selectedOptions));

				if (itemOptionsKey !== selectedOptionsKey) return false;

				const variantKey1 = item.selectedVariant
					? item.selectedVariant.sku ||
						item.selectedVariant._id ||
						JSON.stringify(item.selectedVariant.options || [])
					: 'no-variant';

				const variantKey2 = selectedVariant
					? selectedVariant.sku ||
						selectedVariant._id ||
						JSON.stringify(selectedVariant.options || [])
					: 'no-variant';

				return variantKey1 === variantKey2;
			})
			.reduce((sum, item) => sum + item.amount, 0);

		return totalAmount >= maxStock;
	}
</script>

{#if !paths.includes(page.url.pathname)}
	<!-- Navbar -->
	<nav class="fixed z-50 w-full">
		<div class="flex items-center justify-between bg-[#f7f7f7] dark:bg-[#121212] h-14 px-4 md:px-7">
			<!-- Left -->
			<div class="flex items-center">
				<div class="hidden md:block lg:block">
					<button
						class="flex justify-center items-center text-gray-500 dark:text-white text-xl mr-6"
						onclick={(e) => {
							e.preventDefault();
							handleIsClose();
						}}
						aria-label="Toggle Sidebar"
					>
						<iconify-icon icon="ion:menu" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				</div>

				<button
					onclick={(e) => {
						e.preventDefault();
						goto('/');
					}}
				>
					<div class="relative flex gap-1">
						<div class="flex">
							<!-- Logo  -->
							{#if $theme === 'dark' || isDarkMode}
								<img class="h-6 object-cover" src="/logo-dark.png" alt="logo" />
							{:else}
								<img class="h-6 object-cover" src="/logo-light.png" alt="logo" />
							{/if}

							<!-- {#if $location_data?.data[0]?.country_module?.global?.alpha2}
								<span
									class="absolute top-5 right-[-23px] dark:text-gray-200 font-bold h-5 w-5 text-sm flex items-center justify-center"
									>{$location_data?.data[0]?.country_module?.global?.alpha2}</span
								>
							{/if} -->

							<!-- Icono de Colombia (ubicacion) -->
							<iconify-icon icon="twemoji:flag-colombia" height="1.5rem" width="1.5rem" class="ml-2"
							></iconify-icon>
						</div>
					</div>
				</button>
			</div>

			<!-- Center (hidden in small screens) -->
			<div class="hidden md:block">
				<div class="flex w-full max-w-sm md:max-w-md lg:max-w-xl h-10 relative cursor-pointer">
					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleSearch();
						}}
						class="flex md:w-[600px] h-10"
					>
						{#if !rutasExcluidas.includes(page.url.pathname.split('/')[1])}
							<div
								class="flex items-center rounded-l-2xl h-10 px-2 dark:text-white font-medium bg-gray-200 dark:bg-[#202020] cursor-default"
							>
								{page.url.pathname.split('/')[1]}
							</div>
						{/if}
						<input
							id="searchInput"
							class="flex-grow h-10 text-base dark:text-gray-200 px-2 bg-gray-100 dark:bg-[#121212] outline-none border border-gray-200 dark:border-[#222222] {!rutasExcluidas.includes(
								page.url.pathname.split('/')[1]
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

					{#if !rutasExcluidas.includes(page.url.pathname.split('/')[1]) && searchInputValue.length > 1}
						<button
							onclick={(e) => {
								e.preventDefault();
								handleGlobalSearch();
							}}
						>
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
								aria-label="Open Search Dialog"
							>
								<iconify-icon icon="material-symbols:search-rounded" height="1.5rem" width="1.5rem"
								></iconify-icon>
							</button>
						</Dialog.Trigger>
						<Dialog.Content class="top-10 w-full m-0 px-0 py-1">
							<form
								onsubmit={(e) => {
									e.preventDefault();
									handleSearch();
								}}
								class="flex w-full"
							>
								{#if !rutasExcluidas.includes(page.url.pathname.split('/')[1])}
									<div
										class="flex items-center rounded-l-2xl h-10 px-2 dark:text-white font-medium bg-gray-200 dark:bg-[#202020] cursor-default"
									>
										{page.url.pathname.split('/')[1]}
									</div>
								{/if}
								<input
									id="searchInput"
									class="flex-grow h-10 text-base dark:text-gray-200 px-2 bg-gray-100 dark:bg-[#121212] outline-none border border-gray-200 dark:border-[#222222] {!rutasExcluidas.includes(
										page.url.pathname.split('/')[1]
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

							{#if !rutasExcluidas.includes(page.url.pathname.split('/')[1]) && searchInputValue.length > 1}
								<button
									onclick={(e) => {
										e.preventDefault();
										handleGlobalSearch();
									}}
								>
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
						<HoverCard.Root openDelay={100}>
							<HoverCard.Trigger class="relative">
								<button
									onclick={(e) => {
										e.preventDefault();
										markNotifications();
									}}
								>
									<iconify-icon
										icon="mdi:bell"
										height="1.3rem"
										width="1.3rem"
										class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#202020] rounded-full hover:bg-gray-300 dark:hover:bg-[#252525]"
									></iconify-icon>

									{#if $unreadNotificationsCount !== 0}
										<span
											class="absolute top-[-0.2rem] right-[-0.2rem] bg-slate-400 dark:bg-gray-200 text-black dark:text-black text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
										>
											{$unreadNotificationsCount}
										</span>
									{/if}
								</button>
							</HoverCard.Trigger>
							<HoverCard.Content
								class="w-80 flex flex-col gap-2 bg-gray-100 dark:bg-[#202020] border-gray-200 dark:border-[#303030]"
							>
								{#if $notifications}
									<div class="w-full flex justify-center py-4">
										<h2>No hay notificaciones</h2>
									</div>
								{:else}
									<div
										class="flex flex-col space-y-2 max-h-[66vh] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
									>
										<!-- Lista de notificaciones -->
										{#each $notifications as notification}
											<div class="bg-gray-200 dark:bg-[#202020] p-3 rounded-md">
												<p class="text-sm font-medium dark:text-gray-200">
													{notification?.message}
												</p>
												<p class="text-xs text-gray-500">
													{new Date(notification?.createdAt).toLocaleString()}
												</p>
											</div>
										{/each}

										<!-- Botón para cargar más -->
										{#if currentPage < $totalPages}
											<button
												class="text-blue-400 hover:text-blue-300 font-medium text-sm hover:underline transition"
												onclick={(e) => {
													e.preventDefault();
													loadMoreNotifications();
												}}
											>
												Cargar más
											</button>
										{/if}
									</div>
								{/if}
							</HoverCard.Content>
						</HoverCard.Root>

						<div class="relative">
							<a href="/chat">
								<iconify-icon
									icon="mdi:conversation"
									height="1.3rem"
									width="1.3rem"
									class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#202020] rounded-full hover:bg-gray-300 dark:hover:bg-[#252525]"
								></iconify-icon>

								{#if $unreadConversationsCount !== 0}
									<span
										class="absolute top-[-0.2rem] right-[-0.2rem] bg-slate-400 dark:bg-gray-200 text-black dark:text-black text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
									>
										{$unreadConversationsCount}
									</span>
								{/if}
							</a>
						</div>

						<HoverCard.Root openDelay={100}>
							<HoverCard.Trigger href="/cart" class="relative">
								<iconify-icon
									icon="mdi:cart"
									height="1.3rem"
									width="1.3rem"
									class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#202020] rounded-full hover:bg-gray-300 dark:hover:bg-[#252525]"
								>
								</iconify-icon>
								{#if $cartItems.length !== 0}
									<span
										class="absolute top-[-0.2rem] right-[-0.2rem] bg-slate-400 dark:bg-gray-200 text-black text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
									>
										{$cartItems.length}
									</span>
								{/if}
							</HoverCard.Trigger>

							<HoverCard.Content
								class="flex flex-col gap-2 w-80 bg-gray-100 dark:bg-[#202020] border-gray-200 dark:border-[#303030]"
							>
								{#if $cartItems.length === 0}
									<div class="w-full flex justify-center py-4">
										<h2>{m.navbar_cart_additems()}</h2>
									</div>
								{:else}
									<div
										class="flex flex-col space-y-2 max-h-[66vh] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full
               [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300
               dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
									>
										{#each $cartItems as cartItem (cartItem._id + (cartItem.selectedOptions ? JSON.stringify(cartItem.selectedOptions) : '') + (cartItem.selectedVariant ? JSON.stringify(cartItem.selectedVariant) : ''))}
											<div
												class="flex flex-col gap-2 rounded-sm p-3 relative bg-gray-200 dark:bg-[#252525] hover:dark:bg-[#303030] transition-colors"
											>
												<!-- eliminar -->
												<button
													aria-label="Eliminar producto del carrito"
													onclick={() => onRemove(cartItem)}
													class="absolute top-2 right-2 dark:text-white hover:text-red-500 cursor-pointer transition-colors"
												>
													<iconify-icon icon="ic:round-close" height="1.5rem" width="1.5rem">
													</iconify-icon>
												</button>

												<div class="flex flex-row gap-3 items-start pr-6">
													<!-- imagen / fallback -->
													{#if cartItem.imgs?.[0]}
														<img
															class="w-16 h-16 object-cover rounded-sm flex-shrink-0"
															src={cartItem.imgs[0]}
															alt={cartItem.productname}
															onerror={handleImageError}
														/>
													{:else}
														<div class="flex-shrink-0">
															<iconify-icon
																icon="mdi:package-variant-closed"
																height="3rem"
																width="3rem"
																class="text-gray-400 dark:text-gray-600"
															>
															</iconify-icon>
														</div>
													{/if}

													<div class="flex-1 min-w-0">
														<h2 class="text-base font-semibold truncate">{cartItem.productname}</h2>
														<p class="text-sm font-medium dark:text-white mt-1">
															{formatPrice(cartItem.price, 'es-CO', 'COP')}
														</p>

														<!-- Opciones simples -->
														{#if cartItem.selectedOptions?.length}
															<div
																class="mt-2 p-2 rounded-md bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700"
															>
																<div
																	class="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1"
																>
																	Opciones:
																</div>
																<div class="flex flex-wrap gap-1">
																	{#each cartItem.selectedOptions as opt}
																		<span
																			class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40"
																		>
																			<strong>{opt.name}:</strong>
																			{opt.value}
																		</span>
																	{/each}
																</div>
															</div>
														{/if}

														<!-- Variante seleccionada -->
														{#if cartItem.selectedVariant}
															<div
																class="mt-2 p-2 rounded-md bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700"
															>
																<div
																	class="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1"
																>
																	Opciones:
																</div>

																<div class="flex flex-wrap gap-1">
																	<!-- Opciones (Talla, Material, etc.) -->
																	{#if cartItem.selectedVariant.options?.length}
																		{#each cartItem.selectedVariant.options as opt}
																			<span
																				class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40"
																			>
																				<strong>{opt.name}:</strong>
																				{opt.value}
																			</span>
																		{/each}
																	{/if}

																	<!-- Color (desde meta) -->
																	{#if cartItem.selectedVariant.meta?.color}
																		<span
																			class="px-2 py-0.5 text-xs rounded-md bg-blue-200 dark:bg-blue-900/40"
																		>
																			<strong>Color:</strong>
																			{cartItem.selectedVariant.meta.color}
																		</span>
																	{/if}
																</div>
															</div>
														{/if}
													</div>
												</div>

												<!-- controles -->
												<div class="flex justify-between items-center mt-2">
													<div class="flex items-center gap-2">
														<button
															aria-label="Disminuir cantidad"
															onclick={() => onDecrement(cartItem)}
															class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary hover:bg-gray-300 dark:hover:bg-[#303030] transition-colors"
														>
															<iconify-icon icon="ic:round-minus" height="1.3rem" width="1.3rem">
															</iconify-icon>
														</button>

														<span
															class="mx-2 text-black dark:text-white font-medium min-w-[1.5rem] text-center"
															>{cartItem.amount}</span
														>

														<button
															aria-label="Aumentar cantidad"
															onclick={() => onIncrement(cartItem)}
															disabled={isMaxed(
																cartItem._id,
																cartItem.selectedVariant?.quantity ?? cartItem.quantity,
																cartItem.selectedOptions,
																cartItem.selectedVariant
															)}
															class="rounded-sm dark:text-white p-1 cursor-pointer hover:text-primary hover:bg-gray-300 dark:hover:bg-[#303030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														>
															<iconify-icon icon="ic:round-plus" height="1.3rem" width="1.3rem">
															</iconify-icon>
														</button>
													</div>

													<div class="text-sm font-semibold">
														{formatPrice(
															(cartItem.price || 0) * (cartItem.amount || 0),
															'es-CO',
															'COP'
														)}
													</div>
												</div>
											</div>
										{/each}
									</div>

									<div
										class="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-700"
									>
										<a href="/cart" class="text-sm font-medium hover:underline"
											>{m.navbar_cart_go_to_cart()}</a
										>
										<h2 class="font-semibold">Subtotal: {formatPrice($total, 'es-CO', 'COP')}</h2>
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
									></iconify-icon>
								{/if}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="bg-gray-100 dark:bg-[#202020] dark:hover:bg-[#252525] rounded-md shadow-md border-none"
							>
								<DropdownMenu.Item
									onclick={() =>
										userInfo.accountType === 'personal'
											? goto(`/personal/${userInfo?._id}`)
											: goto(`/${userInfo.username}`)}
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
										></iconify-icon>
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
										<DropdownMenu.Item onclick={() => goto('/admin/dashboard')}>
											<span>{m.navbar_user_admin()}</span>
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Item onclick={() => goto('/shopping')}>
										<span>{m.navbar_user_shopping()}</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/settings/profile')}>
										<span>{m.navbar_user_settings()}</span>
									</DropdownMenu.Item>

									<DropdownMenu.Sub>
										<DropdownMenu.SubTrigger>{m.navbar_user_theme()}</DropdownMenu.SubTrigger>
										<DropdownMenu.SubContent
											class="bg-gray-100 dark:bg-[#202020] dark:hover:bg-[#252525] rounded-md shadow-md border-none"
										>
											<DropdownMenu.Item onclick={() => setTheme('light')}
												>{m.nabvar_user_theme_light()}</DropdownMenu.Item
											>
											<DropdownMenu.Item onclick={() => setTheme('dark')}
												>{m.nabvar_user_theme_dark()}</DropdownMenu.Item
											>
											<DropdownMenu.Item onclick={() => setTheme('system')}
												>{m.nabvar_user_theme_system()}</DropdownMenu.Item
											>
										</DropdownMenu.SubContent>
									</DropdownMenu.Sub>

									<DropdownMenu.Item onclick={() => logout()}>
										<span>{m.navbar_user_logout()}</span>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{:else}
					<div class="flex justify-center items-center space-x-2">
						<button
							class="bg-gray-200 dark:bg-[#202020] dark:text-gray-200 w-24 sm:w-28 h-10 px-2 md:mr-5 rounded-md text-sm font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-[#303030]"
							onclick={(e) => {
								e.preventDefault();
								goto('/login');
							}}
						>
							{m.navbar_button_login()}
						</button>
						<button
							class="bg-gray-200 dark:bg-[#202020] dark:text-gray-200 w-24 sm:w-28 h-10 px-2 md:mr-5 rounded-md text-sm font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-[#303030]"
							onclick={(e) => {
								e.preventDefault();
								goto('/register');
							}}
						>
							{m.navbar_button_register()}
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
			{@render children()}
		</main>

		<!-- {#if isActiveSearchInput}
			{#if autocompleteOptions.length > 0}
				<Autocomplete options={autocompleteOptions} {selectedIndex} {selectOption} />
			{/if}
		{/if} -->
	</div>
{:else}
	{@render children()}
{/if}
