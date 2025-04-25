import type { PageServerLoad, Actions } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'
import { fail } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionToken = cookies.get('session')

  return {
    sessionToken
  }
}


export const actions: Actions = {
  saveBankAccount: async ({ request, cookies, fetch }) => {
    const tokenJwt = cookies.get('session');
    if (!tokenJwt) {
      return fail(401, { error: 'Usuario no autenticado' });
    }

    // Extract form data
    const form = await request.formData();
    const bankType = form.get('bankType') as string;
    const accountType = form.get('accountType') as string;
    const accountNumber = form.get('accountNumber') as string;
    const name = form.get('name') as string;
    const legalIdType = form.get('legalIdType') as string;
    const legalId = form.get('legalId') as string;
    const accountId = form.get('accountId') as string | null;


    // Build payload
    const payload = {
      bankType,
      accountType: bankType === 'NEQUI' ? 'AHORROS' : accountType,
      accountNumber: accountNumber.trim(),
      name: name.trim(),
      legalIdType,
      legalId: legalId.trim()
    };

    // Determine method and URL
    const method = accountId ? 'PATCH' : 'POST';
    const url = accountId
      ? `${PRIVATE_SERVER_URL}/wallet/bankAccounts/update/${accountId}`
      : `${PRIVATE_SERVER_URL}/wallet/bankAccounts/create`;

    // Call backend
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenJwt}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Error calling API:', error);
      return fail(res.status, { error: 'No se pudo guardar la cuenta bancaria' });
    }

    return { success: true };
  },

  deleteBankAccount: async ({ request, cookies, fetch }) => {
    const tokenJwt = cookies.get('session');
    if (!tokenJwt) return fail(401, { error: 'Usuario no autenticado' });

    const form = await request.formData();
    const accountId = form.get('accountId') as string;
    if (!accountId) return fail(400, { error: 'accountId es requerido' });

    const res = await fetch(
      `${PRIVATE_SERVER_URL}/wallet/bankAccounts/delete/${accountId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenJwt}` }
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error('Error deleting account:', error);
      return fail(res.status, { error: 'No se pudo eliminar la cuenta bancaria' });
    }

    return { : true };
  }
}
