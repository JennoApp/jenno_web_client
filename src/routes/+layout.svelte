<script lang="ts">
	import '../app.css';
	import 'iconify-icon';
	import Navigation from '$lib/components/Navigation.svelte';
	import { Toaster } from 'svelte-sonner';
	import { setupTheme } from '$lib/theme';
	import {
		addIpAddress,
		addLocationData,
		ip_address,
		location_data
	} from '$lib/stores/ipaddressStore';
	import { onMount, setContext } from 'svelte';
	import { setLanguageTag } from '$paraglide/runtime';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { io, type Socket } from 'socket.io-client';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	const SOCKET_CONTEXT = 'socket';

	// Crear e inicializar el contexto dentro del ciclo de vida del componente
	let socket: Socket | null = null;

	const socketContext = {
		socket: null as Socket | null
	};

	setContext(SOCKET_CONTEXT, socketContext);

	async function initializeSocket(userId: string) {
		try {
			const response = await fetch('/api/socketurl');
			const { socket_url } = await response.json();

			socket = io(socket_url, {
				transports: ['websocket'],
				autoConnect: false,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				withCredentials: true
			});

			socket.on('connect', () => {
				console.log('Conectado con ID de sesión:', socket!.id);

				// Agregar usuario al backend
				if (userId) {
					socket?.emit('addUser', userId);
				}
			});

			socket.on('disconnect', (reason) => {
				console.error('Desconectado:', reason);
			});

			socket.on('connect_error', (error) => {
				console.error('Error de conexión:', error.message);
			});

			console.log('Socket inicializado');
			socket.connect();

			socketContext.socket = socket;
		} catch (error) {
			console.error('Error al inicializar el socket:', error);
		}
	}

	onMount(async () => {
		await initializeSocket($page.data?.user?._id);

		injectAnalytics();
	});

	// Establecer el contexto del socket
	// setContext(SOCKET_CONTEXT, socket);

	let locationAccessKey: string;
	async function getLocationAccessKey() {
		try {
			const response = await fetch(`/api/location`);
			const data = await response.json();

			locationAccessKey = data.accessKey;
		} catch (error) {
			console.error('Error al solicitar el location access key');
		}
	}

	$: {
		setupTheme();
	}

	export let data;

	$: setLanguageTag(data.locale);

	// current language
	// $: console.log(data.serverLang);

	let storedIp: string | null = null;
	let storedLocationData: any | null = null;

	// Recuperar los datos del store
	$: {
		ip_address.subscribe((value) => {
			storedIp = value;
		});

		location_data.subscribe((value) => {
			storedLocationData = value;
		});
	}

	// const storedIp = $ip_address
	// let storedLocationData = $location_data

	// $: {
	// 	addIpAddress(data.clientAddress as string);
	// 	// addLocationData(data.locationData as Object);
	// }

	const getLocationData = async (ip: string, access_key: string) => {
		try {
			const response = await fetch(
				`https://api.positionstack.com/v1/reverse?access_key=${access_key}&query=${ip}&country_module=1&limit=1`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch location data: ${response.status}`);
			}
			const data = await response.json();
			addLocationData(data);

			return data;
		} catch (error) {
			console.log('Error to get location data');
		}
	};

	onMount(async () => {
		if (!storedLocationData || storedIp !== data.clientAddress) {
			addIpAddress(data.clientAddress as string);

			await getLocationAccessKey();
			if (locationAccessKey) {
				await getLocationData(data.clientAddress as string, locationAccessKey);
			}
		} else {
			console.log('Using stored location data', storedLocationData);
		}

		invalidateAll();
	});

	// onMount(() => {
	// 	if ($location_data) {
	// 		if ($location_data.data[0].country_module.flag === 'co') {
	// 			setLanguageTag('es');
	// 			goto('/es');
	// 		}
	// 	}
	// });
</script>

<svelte:head>
	<title>Jenno - Crea y comparte tu tienda online</title>
	<meta
		name="description"
		content="Crea tu propia tienda en línea con Jenno y compártela fácilmente en redes sociales. Vende tus productos de forma sencilla y segura."
	/>

	<script>
		// Immediately set the theme based on localStorage before the page renders
		(function () {
			const theme = localStorage.getItem('theme') || 'system';
			if (
				theme === 'dark' ||
				(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		})();
	</script>

	<!-- Open graph (Facebook, WhatsApp)-->
  <meta property="og:title" content="Jenno - Crea y comparte tu tienda online" />
  <meta
		property="og:description"
		content="Crea tu propia tienda en línea con Jenno y compártela fácilmente en redes sociales. Vende tus productos de forma sencilla y segura."
	/>
	<meta property="og:type" content="website" />
  <meta property="og:site_name" content="Jenno" />
	<meta property="og:url" content={$page.url.href} />
  <meta property="og:image" content="https://jenno-aws-bucket.s3.us-east-2.amazonaws.com/opengraph/oplogo.jpg" />
  <meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Previsualización de una tienda en Jenno" />

  <!-- Twitter Cards (Mejora la compatibilidad en Twitter) -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Jenno - Crea y comparte tu tienda online" />
	<meta
		name="twitter:description"
		content="Crea tu propia tienda en línea con Jenno y compártela fácilmente en redes sociales. Vende tus productos de forma sencilla y segura."
	/>
	<meta name="twitter:image" content="https://jenno-aws-bucket.s3.us-east-2.amazonaws.com/opengraph/oplogo.jpg" />
	<meta name="twitter:image:alt" content="Previsualización de una tienda en Jenno" />
</svelte:head>

<Toaster richColors theme="dark" duration={3000} />
<Navigation>
	<slot />
</Navigation>
