<script>
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte'  
	import socket from '$lib/socket/index';

  onMount(() => {
    socket.on("connect", () => {
      console.log("Successful connect to socket")
    })
  })

</script>

<ParaglideJS i18n={i18n}>
	<Toaster richColors theme="dark" duration={3000} />
	<Navigation>
		<slot />
	</Navigation>
</ParaglideJS>

