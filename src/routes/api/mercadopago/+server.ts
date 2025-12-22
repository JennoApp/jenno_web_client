import { PRIVATE_MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { RequestHandler } from '@sveltejs/kit';

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
	accessToken: PRIVATE_MERCADOPAGO_ACCESS_TOKEN
});

const preference = new Preference(client);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const externalReference = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		const preferenceBody = {
			external_reference: externalReference,

			items: body.items.map((item: any) => ({
				id: item.id,
				title: item.title,
				description: item.description || item.title,
				quantity: Number(item.quantity),
				currency_id: 'COP',
				unit_price: Math.round(Number(item.unit_price))
			})),

			payer: {
				email: body.email,
				first_name: body.first_name,
				last_name: body.last_name,
				identification: {
				    type: body.documentType ?? 'CC',
					number: body.document
				}
			},

			back_urls: {
				success: 'https://www.jenno.com.co/cart/success',
				failure: 'https://www.jenno.com.co/cart/failure',
				pending: 'https://www.jenno.com.co/cart/pending'
			},

			auto_return: 'approved',

			payment_methods: {
				excluded_payment_types: [
					{
						id: 'ticket'
					}
				],
				// included_payment_methods: [
				// 	{
				// 		id: 'bank_transfer'
				// 	},
				// 	{
				// 		id: 'credit_card'
				// 	},
				// 	{
				// 		id: 'debit_card'
				// 	}
				// ]
			}
		};

		const response = await preference.create({
			body: preferenceBody
		});

		return new Response(
			JSON.stringify({
				init_point: response.init_point,
				external_reference: externalReference
			}),
			{ status: 200 }
		);
	} catch (error: any) {
		console.error('Error creando preferencia Mercado Pago:', error);
		return new Response(
			JSON.stringify({
				error: error.message
			}),
			{
				status: 500
			}
		);
	}
};
