import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad =  async ({ url }) => {
	const hasFail = url.searchParams.get('fail') === '1';

	if (hasFail) {
		// Redirige a la misma página sin el parámetro 'fail'
		const params = new URLSearchParams(url.searchParams);
		params.delete('fail');

		const newUrl = '/cart/failure' + (params.toString() ? `?${params}` : '');

		throw redirect(307, newUrl);
	}
}
