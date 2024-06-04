<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import * as Select from '$lib/components/ui/select';

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}
</script>


<div class="flex gap-3 items-center m-10 mt-20 w-1/2">
	<h3 class="font-medium">Tema:</h3>
	<Select.Root>
		<Select.Trigger>
			<Select.Value placeholder="Tema" />
		</Select.Trigger>
		<Select.Content >
			<Select.Item on:click={() => setTheme('light')} value="light">Claro</Select.Item>
			<Select.Item on:click={() => setTheme('dark')} value="dark">Oscuro</Select.Item>
			<Select.Item on:click={() => setTheme('system')} value="system">Sistema</Select.Item>
		</Select.Content>
	</Select.Root>
</div>
