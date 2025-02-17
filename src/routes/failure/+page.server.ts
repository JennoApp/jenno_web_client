import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  // Redirección a la página principal con código 307 (redirección temporal)
  throw redirect(307, '/?mpreturn=1');
};
