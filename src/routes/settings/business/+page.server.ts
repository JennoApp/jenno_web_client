import type { Actions, PageServerLoad } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'
import { z } from 'zod'

// Schema de validación para pickupAddress y transportadoras
const businessShippingSchema = z.object({
  contactName: z.string().min(1, 'Nombre de contacto requerido').max(64),
  phoneNumber: z.string().min(1, 'Teléfono requerido').max(64),
  country: z.string().min(1, 'País requerido').max(32),
  state: z.string().min(1, 'Departamento requerido').max(64),
  city: z.string().min(1, 'Ciudad requerida').max(64),
  postalCode: z.string().min(1, 'Código postal requerido').max(64),
  address: z.string().min(1, 'Dirección requerida').max(128),
  // carriersAllowed: z.string()
})

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData())

    try {
      const parsed = businessShippingSchema.parse(formData)

      // Transformar JSON a array de objetos
      // let carriersAllowed;
      // try {
      //   carriersAllowed = JSON.parse(parsed.carriersAllowed);
      //   if (!Array.isArray(carriersAllowed)) {
      //     throw new Error('Formato inválido en carriersAllowed');
      //   }
      // } catch (e) {
      //   return {
      //     success: false,
      //     errors: {
      //       carriersAllowed: ['Error al interpretar la lista de transportadoras seleccionadas']
      //     }
      //   };
      // }

      const { contactName, phoneNumber, country, state, city, postalCode, address } = parsed

      const body = {
        pickupAddress: { contactName, phoneNumber, country, state, city, postalCode, address },
        // carriersAllowed
      }

      const res = await fetch(`${PRIVATE_SERVER_URL}/users/shipping-settings/${locals.user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await res.json()

      if (!res.ok || result?.statusCode === 401) {
        console.error('Error al guardar configuraciones de envío')
        return { success: false }
      }

      return { success: true }

    } catch (err: any) {
      const { fieldErrors: errors } = err?.flatten?.() || {}
      return { success: false, errors }
    }
  }
}

// Cargar transportadoras disponibles
export const load: PageServerLoad = async ({ fetch, locals }) => {
  const res = await fetch(`${PRIVATE_SERVER_URL}/shipping/envia/carriers`)
  const { data } = await res.json()

  return {
    user: locals.user,
    availableCarriers: data
  }
}
