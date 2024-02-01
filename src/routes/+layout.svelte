<script>
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner'
</script>


<Toaster richColors />
<Navigation>
	<slot />
</Navigation>
