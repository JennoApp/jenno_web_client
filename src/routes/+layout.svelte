<script>
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte'  
	import socket from '$lib/socket/index';
  import { setupTheme } from '$lib/theme'

  /*onMount(() => {
    socket.on("connect", () => {
      console.log("Successful connect to socket")
    })
  })*/

  $: {
    setupTheme()
  }
</script>


<svelte:head>
  <script>
    // Immediately set the theme based on localStorage before the page renders
    (function() {
      const theme = localStorage.getItem('theme') || 'system';
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>
</svelte:head>


<ParaglideJS i18n={i18n}>
	<Toaster richColors theme="dark" duration={3000} />
	<Navigation>
		<slot />
	</Navigation>
</ParaglideJS>

