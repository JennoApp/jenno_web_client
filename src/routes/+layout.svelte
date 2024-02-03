<script>
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner'
</script>


<Toaster richColors theme="dark"/>
<Navigation>
	<slot />
</Navigation>
