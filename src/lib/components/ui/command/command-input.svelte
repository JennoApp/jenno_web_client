<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv';
	import MagnifyingGlass from 'svelte-radix/MagnifyingGlass.svelte';
	import { cn } from '$lib/utils';

	type $$Props = CommandPrimitive.InputProps;

	let className: string | undefined | null = undefined;
	export { className as class };
	export let value: string = '';
</script>

<div class="flex items-center border-b" data-cmdk-input-wrapper="">
	<CommandPrimitive.Input
		class={cn(
			'flex h-full w-full bg-transparent text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...$$restProps}
		bind:value
	/>
	<div
		class="grid place-items-center text-2xl text-white w-16 h-full bg-[#202020] border border-[#222222] rounded-r-2xl"
	>
		<iconify-icon icon="material-symbols:search-rounded" height="1.5rem" width="1.5rem"
		></iconify-icon>
	</div>
</div>
