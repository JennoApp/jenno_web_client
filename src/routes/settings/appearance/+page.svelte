<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import * as Select from '$lib/components/ui/select';
  import { availableLanguageTags } from '$paraglide/runtime'
  import { page } from '$app/stores'
  import { i18n } from '$lib/i18n'

	function setTheme(newTheme: string) {
		theme.set(newTheme);
	}

  $: currentPathWithoutLanguge = i18n.route($page.url.pathname)
</script>


<div class="flex gap-3 items-center m-10 w-1/2">
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

{#each availableLanguageTags as lang}
  <a href={currentPathWithoutLanguge} hreflang={lang}>Change language to {lang} </a>
  <br>
{/each}
