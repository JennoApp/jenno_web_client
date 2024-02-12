<script>
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { i18n } from '$lib/i18n';
</script>

<ParaglideJS i18n={i18n}>
	<Toaster richColors theme="dark" duration={3000} />
	<Navigation>
		<slot />
	</Navigation>
</ParaglideJS>
