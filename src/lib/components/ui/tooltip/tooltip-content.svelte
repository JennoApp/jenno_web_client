<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '$lib/utils';

	type $$Props = TooltipPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export let sideOffset: $$Props['sideOffset'] = 2;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = {
		y: 8,
		duration: 100
	};
	export { className as class };
</script>

<TooltipPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	side="right"
	class={cn(
		'z-50 overflow-hidden rounded-md bg-[#252525] px-3 py-1.5 text-sm text-popover-foreground shadow-md',
		className
	)}
	{...$$restProps}
>
	<slot />
</TooltipPrimitive.Content>
