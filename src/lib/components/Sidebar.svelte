<script lang="ts">
	import { page } from '$app/stores';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let closeMenu = true;

	let currentPath = '/';
	$: currentPath = $page.url.pathname.split('/').filter(Boolean).pop() || '/';
	$: console.log({ currentPath });

	function setBgColor(path: string, currentPath: string): string {
		return path === currentPath ? 'bg-[#252525]' : '';
	}
</script>

<nav
	class={!closeMenu
		? 'bg-white dark:bg-[#121212] fixed top-14 left-0 w-52 h-[calc(100vh-56px)] z-50'
		: 'bg-white dark:bg-[#121212] fixed top-14 left-0 w-20 h-[calc(100vh-56px)] z-50'}
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
							icon="lucide:home"
							height="1.3rem"
							width="1.3rem"
							class={!closeMenu
								? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
								: 'text-[#707070] text-xl group-hover:text-[#fff]'}
						/>
						<span
							class={!closeMenu
								? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]'
								: 'hidden'}>Inicio</span
						>
					</a>
				</Tooltip.Trigger>
				{#if closeMenu}
					<Tooltip.Content>
						<h3>Home</h3>
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
								? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
								: 'text-[#707070] text-xl group-hover:text-[#fff]'}
						/>
						<span
							class={!closeMenu
								? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]'
								: 'hidden'}>Explorar</span
						>
					</a>
				</Tooltip.Trigger>
				{#if closeMenu}
					<Tooltip.Content>
						<h3>Explore</h3>
					</Tooltip.Content>
				{/if}
			</Tooltip.Root>

			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						href="/subscriptions"
						class={!closeMenu
							? `group text h-10 w-44 mt-2 px-4 list-none flex items-center rounded-xl hover:bg-txt ${setBgColor('subscriptions', currentPath)}`
							: `group text h-10 w-12 mt-2 px-4 list-none flex items-center justify-center rounded-xl hover:bg-txt ${setBgColor('subscriptions', currentPath)}`}
					>
						<iconify-icon
							icon="eos-icons:product-subscriptions"
							height="1.3rem"
							width="1.3rem"
							class={!closeMenu
								? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
								: 'text-[#707070] text-xl group-hover:text-[#fff]'}
						/>
						<span
							class={!closeMenu
								? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]'
								: 'hidden'}>Subscripción</span
						>
					</a>
				</Tooltip.Trigger>
				{#if closeMenu}
					<Tooltip.Content>
						<h3>Subscriptions</h3>
					</Tooltip.Content>
				{/if}
			</Tooltip.Root>
		</ul>
	</div>
</nav>
