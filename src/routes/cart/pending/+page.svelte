<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	export let data: { external: string };

	let external = data?.external ?? '';
	let paymentStatus: string | null = null;
	let orderIds: string[] = [];
	let loading = false;
	let message = '';
	let errorMsg = '';
	let intervalId: ReturnType<typeof setInterval> | null = null;
	const POLL_INTERVAL_MS = 8000; // tiempo entre polls
	const MAX_POLLS = 225; // 225 * 8s = 30 minutos (ajusta si quieres)
	let polls = 0;
	let autoRedirectAfterMs = 2000; // tiempo antes de redirigir al detectar approved (opcional)

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	function stopPolling() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	async function checkStatus() {
		await getServerUrl();

		if (!external) {
			errorMsg = 'Referencia de pago no encontrada.';
			paymentStatus = null;
			loading = false;
			stopPolling();
			return;
		}

		try {
			loading = true;
			errorMsg = '';

			const res = await fetch(`${serverUrl}/payments/status/${encodeURIComponent(external)}`, {
				headers: {
					Accept: 'application/json'
				}
			});

			if (!res.ok) {
				// si 404 -> no encontrado, deja mensaje y para polling
				if (res.status === 404) {
					errorMsg = 'Pago no encontrado (aún no procesado).';
				} else {
					errorMsg = `Error consultando estado (HTTP ${res.status}).`;
				}
				loading = false;
				polls++;
				if (polls >= MAX_POLLS) stopPolling();
				return;
			}

			const payload = await res.json();
			// Tu getStatus devuelve el documento de payment (con .status y .orderIds)
			const status = payload?.status ?? payload?.payment?.status ?? null;
			const orders =
				payload?.orderIds ??
				payload?.orderIds ??
				payload?.orderIds ??
				payload?.orderIds ??
				payload?.orderIds ??
				[];

			paymentStatus = status;
			orderIds = Array.isArray(orders) ? orders : orders ? [orders] : [];

			if (paymentStatus === 'approved') {
				message = 'Pago confirmado. Redirigiendo...';
				stopPolling();
				// redirigir a la orden si existe
				if (orderIds.length > 0) {
					// Espera un momento para que el usuario vea el mensaje
					setTimeout(() => {
						// ajustar ruta de la orden si tu front usa otra
						window.location.href = `/orders/${orderIds[0]}`;
					}, autoRedirectAfterMs);
				}
			} else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
				message = 'Pago en proceso. Estamos verificando el estado...';
			} else if (
				paymentStatus === 'rejected' ||
				paymentStatus === 'rejected_by_issuer' ||
				paymentStatus === 'cancelled'
			) {
				message = 'El pago fue rechazado o cancelado. Intenta con otro método.';
				stopPolling();
			} else {
				// otros estados
				message = `Estado: ${paymentStatus ?? 'desconocido'}`;
			}

			loading = false;
			polls++;
			if (polls >= MAX_POLLS) {
				stopPolling();
				message =
					'Tiempo de verificación agotado. Si tu pago se procesa más tarde, te notificaremos por correo.';
			}
		} catch (err) {
			console.error('Error checkStatus:', err);
			errorMsg = 'Error consultando el estado del pago.';
			loading = false;
			polls++;
			if (polls >= MAX_POLLS) stopPolling();
		}
	}

	function manualCheck() {
		checkStatus();
	}

	onMount(() => {
		// hacer un primer check inmediato
		checkStatus();

		// luego iniciar intervalo
		intervalId = setInterval(() => {
			checkStatus();
		}, POLL_INTERVAL_MS);
	});

	onDestroy(() => {
		stopPolling();
	});
</script>

<div class="container">
	<div class="card">
		<h2>Confirmación de pago</h2>

		{#if !external}
			<p class="muted">
				No se recibió referencia del pago. Si llegaste aquí por error, vuelve al inicio.
			</p>
			<div style="margin-top:1rem;">
				<a href="/" class="btn-ghost">Volver al inicio</a>
			</div>
		{:else}
			<p class="muted">Referencia: <strong>{external}</strong></p>

			<div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;">
				<div>
					{#if loading}
						<div class="spinner" aria-hidden="true"></div>
					{:else if paymentStatus === 'approved'}
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
							><path
								d="M20 6L9 17l-5-5"
								stroke="#16a34a"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/></svg
						>
					{:else if paymentStatus === 'pending' || paymentStatus === 'in_process'}
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
							><circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2" /></svg
						>
					{:else if paymentStatus === 'rejected'}
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
							><path
								d="M18 6L6 18M6 6l12 12"
								stroke="#ef4444"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/></svg
						>
					{:else}
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
							><circle cx="12" cy="12" r="10" stroke="#6b7280" stroke-width="2" /></svg
						>
					{/if}
				</div>

				<div>
					<h3>
						{#if paymentStatus === 'approved'}
							Pago confirmado
						{:else if paymentStatus === 'pending' || paymentStatus === 'in_process'}
							Pago en proceso
						{:else if paymentStatus === 'rejected' || paymentStatus === 'cancelled'}
							Pago rechazado / cancelado
						{:else}
							Esperando confirmación
						{/if}
					</h3>
					<p class="muted" style="margin-top:0.25rem;">
						{#if message}{message}{:else}Tu pago está siendo procesado. Por favor espera.{/if}
					</p>

					{#if errorMsg}
						<p style="color:#b91c1c;margin-top:0.5rem;">{errorMsg}</p>
					{/if}

					<div style="margin-top:1rem; display:flex; gap:0.5rem;">
						<button class="btn" on:click={manualCheck}>Comprobar ahora</button>
						<a class="btn-ghost" href="/">Volver a la tienda</a>
						{#if paymentStatus === 'approved' && orderIds.length > 0}
							<a class="btn" href={`/orders/${orderIds[0]}`}>Ver orden</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 720px;
		margin: 0 auto;
		padding: 2rem;
	}
	.card {
		background: var(--surface, #fff);
		padding: 1.25rem;
		border-radius: 12px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
	}
	.muted {
		color: #6b7280;
	} /* tailwind-gray-500 */
	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.08);
		border-top-color: rgba(0, 0, 0, 0.6);
		border-radius: 999px;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: #111;
		color: white;
		cursor: pointer;
	}
	.btn-ghost {
		background: transparent;
		border: 1px solid #e5e7eb;
		color: #111;
	}
</style>
