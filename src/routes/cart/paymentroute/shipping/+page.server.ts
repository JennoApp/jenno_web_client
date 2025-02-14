import type { Actions } from './$types.js'
import { z } from 'zod'
import { PRIVATE_SERVER_URL } from '$env/static/private'

const shippingSchema = z.object({
  completeName: z
    .string({ required_error: "Complete name is required" })
    .min(1, { message: "Complete name is required" })
    .max(64, { message: "Complete name must be less than 64 characters" })
    .trim(),
  document: z
    .string({ required_error: "Document or NIT is required" })
    .min(1, { message: "Document or NIT is required" })
    .max(32, { message: "Document or NIT must be less than 32 characters" })
    .trim(),
  country: z
    .string({ required_error: "Country is required" })
    .min(1, { message: "Country is required" })
    .max(32, { message: "Country must be less than 32 characters" })
    .trim(),
  address: z
    .string({ required_error: "Adress is required"})
    .min(1, { message: "Addres is required"})
    .max(64, { message: "Address must be less than 64 characters"})
    .trim(),
  state: z
    .string({ required_error: "State is required"})
    .min(1, { message: "State is required"})
    .max(64, { message: "State must be less than 64 characters"})
    .trim(),
  city: z
    .string({ required_error: "City is required"})
    .min(1, { message: "City is required"})
    .max(64, { message: "City must be less than 64 characters"})
    .trim(),
  phoneNumber: z
    .string({ required_error: "Phone number is required"})
    .min(1, { message: "Phone number is required"})
    .max(64, { message: "Phone number must be less than 64 characters"})
    .trim(),
  postalCode: z
    .string({ required_error: "Phone number is required"})
    .min(1, { message: "Phone number is required"})
    .max(64, { message: "Phone number must be less than 64 characters"})
    .trim(),
})

export const actions: Actions = {
  shipping: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData())

    try {
      const { completeName, document, address, country, state, city, postalCode, phoneNumber } = shippingSchema.parse(formData)

      console.log({ completeName, document, address, country, state, city, postalCode, phoneNumber })

      // Obtener la información actual del usuario
      const currentShippingInfo = locals?.user?.shippingInfo

      // Si la información no ha cambiado, evitar la llamada al servidor
      if (
        currentShippingInfo &&
        completeName === currentShippingInfo.completeName &&
        document === currentShippingInfo.document &&
        address === currentShippingInfo.address &&
        country === currentShippingInfo.country &&
        state === currentShippingInfo.state &&
        city === currentShippingInfo.city &&
        postalCode === currentShippingInfo.postalCode &&
        phoneNumber === currentShippingInfo.phoneNumber
      ) {
        console.log("No se detectaron cambios en la información de envío")
        return {
          success: true
        }
      }

      // Si hay cambios, hacer la actualización
      const responseUpdateShippinginfo = await fetch(`${PRIVATE_SERVER_URL}/users/shipping/${locals?.user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completeName, document, address, country, state, city, postalCode, phoneNumber })
      })

      const result = await responseUpdateShippinginfo.json()
      console.log({result})

      if (result.statusCode === 401) {
        console.log("informacion de envio incorrecta")
        return {
          success: false
        }
      }

      return {
        success: true
      }

    } catch (err: any) {
      const { fieldErrors: errors } = err?.flatten()

      return {
        errors,
        success: false
      }
    }


  }
}
