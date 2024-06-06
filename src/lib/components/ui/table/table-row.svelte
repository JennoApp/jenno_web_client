<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLTableRowElement> & {
		"data-state"?: unknown;
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<tr
	class={cn(
		"border-b border-gray-300 dark:border-[#303030] transition-colors hover:bg-gray-200 dark:hover:bg-[#252525] data-[state=selected]:bg-muted",
		className
	)}
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</tr>
