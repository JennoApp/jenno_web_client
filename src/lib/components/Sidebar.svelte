<script lang="ts">
	import { page } from '$app/stores'
	import * as Tooltip from '$lib/components/ui/tooltip'
  import { toast } from 'svelte-sonner'
  import * as m from '$paraglide/messages'
	import { languageTag } from '$paraglide/runtime';

	export let closeMenu = true

	let currentPath = '/';
	$: currentPath = $page.url.pathname.split('/').filter(Boolean).pop() || '/'

	function setBgColor(path: string, currentPath: string): string {
		return path === currentPath ? 'bg-gray-200 dark:bg-[#252525]' : ''
	}

	$: pathName = $page.url.pathname

	const paths = [
		'/admin/dashboard',
		'/admin/sales',
		'/admin/catalog',
		'/admin/catalog/addproduct',
		'/admin/customers',
		'/admin/marketing'
	]

</script>

{#if paths.includes(pathName)}
	<nav
		class={!closeMenu
			? 'fixed top-14 left-0 w-52 h-[calc(100vh-56px)] z-50'
			: 'fixed top-14 left-0 w-20 h-[calc(100vh-56px)] z-50'}
	>
		<div
			class={!closeMenu ? 'flex flex-col justify-between items-center mx-3' : 'flex flex-col mx-4'}
		>
			<ul>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/admin/dashboard"
							class={!closeMenu
								? `group text h-10 w-44 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('dashboard', currentPath)}`
								: `group text h-10 w-12 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('dashboard', currentPath)}`}
						>
							<iconify-icon
								icon="bxs:dashboard"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>Dashboard</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>Dashboard</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/admin/sales"
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('sales', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('sales', currentPath)}`}
						>
							<iconify-icon
								icon="mdi:cash"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>Sales</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>Sales</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/admin/catalog"
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('catalog', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('catalog', currentPath)}`}
						>
							<iconify-icon
								icon="solar:box-bold"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>Catalog</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>Catalog</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/admin/customers"
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('customers', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('customers', currentPath)}`}
						>
							<iconify-icon
								icon="f7:person-3-fill"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>Customers</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>Customers</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger class="disabled:opacity-75">
						<a
							href="/admin/marketing"
              on:click={() => toast.warning("Esta pagina esta en construcción")}
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('marketing', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('marketing', currentPath)}`}
						>
							<iconify-icon
								icon="nimbus:marketing"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>Marketing</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>Marketing</h3>
							<div class="flex gap-2 mt-1">
								<iconify-icon
									icon="material-symbols:warning"
									height="1.3rem"
									width="1.3rem"
									class='text-yellow-300 text-xl group-hover:text-[#fff]'
								/>
								<h2>En construccion</h2>
							</div>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>
			</ul>
		</div>
	</nav>
{:else}
	<nav
		class={!closeMenu
			? 'fixed top-14 left-0 w-52 h-[calc(100vh-56px)] z-50'
			: 'fixed top-14 left-0 w-20 h-[calc(100vh-56px)] z-50'}
	>
		<div
			class={!closeMenu ? 'flex flex-col justify-between items-center mx-3' : 'flex flex-col mx-4'}
		>
			<ul>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/"
							class={!closeMenu
								? `group text h-10 w-44 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('/', currentPath)}`
								: `group text h-10 w-12 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('/', currentPath)}`}
						>
							<iconify-icon
								icon="fluent:home-24-filled"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black  dark:group-hover:text-[#fff]'
									: 'hidden'}>{m.sidebar_home()}</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>{m.sidebar_home()}</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/explore"
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('explore', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('explore', currentPath)}`}
						>
							<iconify-icon
								icon="material-symbols-light:explore"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>{m.sidebar_explore()}</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>{m.sidebar_explore()}</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>

				<Tooltip.Root>
					<Tooltip.Trigger>
						<a
							href="/following"
							class={!closeMenu
								? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('following', currentPath)}`
								: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('following', currentPath)}`}
						>
							<iconify-icon
								icon="eos-icons:product-subscriptions"
								height="1.3rem"
								width="1.3rem"
								class={!closeMenu
									? 'text-[#707070] text-xl ml-[2px] group-hover:text-black dark:group-hover:text-[#fff]'
									: 'text-[#707070] text-xl group-hover:text-black dark:group-hover:text-[#fff]'}
							/>
							<span
								class={!closeMenu
									? 'text-[#707070] text-base ml-3 group-hover:text-black dark:group-hover:text-[#fff]'
									: 'hidden'}>{m.sidebar_following()}</span
							>
						</a>
					</Tooltip.Trigger>
					{#if closeMenu}
						<Tooltip.Content>
							<h3>{m.sidebar_following()}</h3>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>
			</ul>
		</div>
	</nav>
{/if}
