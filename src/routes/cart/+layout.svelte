<script lang="ts">
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index';
  import { page } from '$app/stores';

  $: pathnameRoutes = $page.url.pathname.split('/').splice(1);
	$: console.log({ pathnameRoutes });
</script>

<!-- Step progress -->
<Breadcrumb.Root class="mt-1 mx-5">
	<Breadcrumb.List>
		{#each pathnameRoutes as path}
			<Breadcrumb.Item>
				<Breadcrumb.Link href={`/${path}`}>{path}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>

<slot />