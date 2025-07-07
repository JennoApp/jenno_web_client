<script>
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import * as m from '$paraglide/messages';

	$: user = $page.data.user;
	$: url = $page.url.pathname;

	$: console.log({ user: user });

	$: SettingsNavItems = [
		{
			title: `${m.settings_menu_profile()}`,
			href: '/settings/profile'
		},
		...(user?.accountType === 'personal'
			? [
					{
						title: `${m.settings_menu_shipping()}`,
						href: '/settings/shipping'
					}
				]
			: []),
		...(user?.accountType === 'business'
			? [
					{
						title: `Configuracion de envios `,
						href: '/settings/business'
					}
				]
			: []),
		{
			title: `${m.settings_menu_appearance()}`,
			href: '/settings/appearance'
		}
	];

	///
	let isSmallView = false;
</script>

<div class="flex w-full p-5">
	<!-- Settings Navigation -->
	<div class={`md:w-1/6 ${isSmallView ? 'hidden md:block' : 'w-full'}`}>
		<nav class={`flex flex-col  space-y-2 `}>
			{#each SettingsNavItems as item}
				<button
					on:click|preventDefault={() => {
						goto(item.href);
						isSmallView = !isSmallView;
					}}
					class={cn(
						'py-1 px-3 rounded-sm',
						url === item.href ? 'dark:bg-[#202020]' : 'hover:underline'
					)}
				>
					<span class="font-medium">{item.title}</span>
				</button>
			{/each}
		</nav>
	</div>
	<div class={`px-5 md:w-5/6 ${isSmallView ? 'w-full' : 'hidden md:block'}`}>
		<button
			on:click={() => {
				isSmallView = !isSmallView;
			}}
		>
			<!-- Close Icon -->
			<iconify-icon icon="ion:arrow-back" height="1.5rem" width="1.5rem"></iconify-icon>
		</button>
		<slot />
	</div>
</div>
