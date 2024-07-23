<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import * as Select from '$lib/components/ui/select';
  import * as m from '$paraglide/messages'

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}

</script>


<div class="flex gap-3 items-center m-10 w-1/2">
	<h3 class="font-medium">{m.settings_appearance_theme()}:</h3>
	<Select.Root>
		<Select.Trigger>
			<Select.Value placeholder={m.settings_appearance_theme()} />
		</Select.Trigger>
		<Select.Content >
			<Select.Item on:click={() => setTheme('light')} value="light">{m.settings_appearance_theme_light()}</Select.Item>
			<Select.Item on:click={() => setTheme('dark')} value="dark">{m.settings_appearance_theme_dark()}</Select.Item>
			<Select.Item on:click={() => setTheme('system')} value="system">{m.settings_appearance_theme_system()}</Select.Item>
		</Select.Content>
	</Select.Root>
</div>

