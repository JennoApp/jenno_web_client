<script>
	export let options;
</script>

{#if options}
	<div class="flex gap-1">
		<span>{options?.name}:</span>
		<span>{options?.value}</span>
	</div>
{:else}
	<iconify-icon class="text-center" icon="basil:cross-solid" width="35" height="35"></iconify-icon>
{/if}
