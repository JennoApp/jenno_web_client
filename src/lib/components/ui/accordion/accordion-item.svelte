<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = AccordionPrimitive.ItemProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
	export let value: $$Props["value"];
</script>

<AccordionPrimitive.Item {value} class={cn("border-b border-[#202020]", className)} {...$$restProps}>
	<slot />
</AccordionPrimitive.Item>
