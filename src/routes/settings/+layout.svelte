<script>
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	$: url = $page.url.pathname;
	const SettingsNavItems = [
		{
			title: 'Profile',
			href: '/settings/profile'
		},
		{
			title: 'Ajustes',
			href: '/settings/settings'
		},
		{
			title: 'Apariencia',
			href: '/settings/appearance'
		},
		{
			title: 'Terminos y condiciones',
			href: '/settings/legal'
		},
		{
			title: 'Acerca',
			href: '/settings/about'
		}
	];
</script>

<div class="flex w-full p-5">
	<!-- Settings Navigation -->
	<nav class="flex flex-col w-1/6 space-y-2">
		{#each SettingsNavItems as item}
			<a
				href={item.href}
				class={cn('py-1 px-3 rounded-sm', url === item.href ? 'dark:bg-[#202020]' : 'hover:underline')}
			>
				<span class="font-medium">{item.title}</span>
			</a>
		{/each}
	</nav>

	<div class="px-5 w-5/6">
		<slot />
	</div>
</div>
