import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BACKEND_URL = 'http://localhost:4000'; // cambia si es prod

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const { items, buyer } = await request.json();

		if (!items || !buyer) {
			return json({ error: 'items y buyer son requeridos' }, { status: 400 });
		}

		const response = await fetch(`${BACKEND_URL}/payments/mercadopago/preference`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				items,
				buyer
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return json(
				{ error: data?.error || 'Error creando preferencia' },
				{ status: response.status }
			);
		}

		return json(data);
	} catch (error) {
		console.error('MercadoPago preference error:', error);

		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};
