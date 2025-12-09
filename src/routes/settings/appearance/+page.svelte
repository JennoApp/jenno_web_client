<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$paraglide/messages';

	const themes = [
		{ value: 'light', label: m.settings_appearance_theme_light() },
		{ value: 'dark', label: m.settings_appearance_theme_dark() },
		{ value: 'system', label: m.settings_appearance_theme_system() }
	];

	let value = $state('system');

	theme.subscribe((v) => (value = v));

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}

	const triggerContent = $derived(
		themes.find((t) => t.value === value)?.label ?? m.settings_appearance_theme()
	);
</script>

<div class="flex gap-3 items-center m-10 w-1/2">
	<h3 class="font-medium">{m.settings_appearance_theme()}:</h3>
	<Select.Root type="single" bind:value>
		<Select.Trigger class="w-[180px]">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.Label>{m.settings_appearance_theme()}</Select.Label>

				{#each themes as t (t.value)}
					<Select.Item onclick={() => setTheme(t.value)} value={t.value} label={t.label}>
						{t.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
