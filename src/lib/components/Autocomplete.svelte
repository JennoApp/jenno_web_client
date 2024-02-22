<script lang="ts">
	export let options: any[] = [];
	export let selectedIndex = -1;
	export let selectOption: any;

	function handleKeyDown(event: any) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (selectedIndex < options.length - 1) {
				selectedIndex += 1;
			}
		} else if (event.key === 'Arrowup') {
			event.preventDefault();
			if (selectedIndex > 0) {
				selectedIndex -= 1;
			}
		} else if (event.key === 'Enter' && selectedIndex !== -1) {
			selectOption(options[selectedIndex]);
		}
	}
</script>

<ul
	class="absolute top-[-10px] left-[350px] mt-1 w-[600px] bg-[#121212] border border-[#252525] rounded-xl shadow-lg z-50" 
  role="listbox"
	on:keydown={handleKeyDown}
	tabindex="0"
>
	{#each options as option, index}
		<li>
			<button
				class="w-full py-2 px-4 hover:bg-[#252525] hover:rounded-xl cursor-pointer {index === selectedIndex
					? 'bg-[#252525] rounded-xl'
					: ''}"
				on:click={() => selectOption(option)}
			>
				{option}
			</button>
		</li>
	{/each}
</ul>
