import type { Actions } from './$types'
import { z } from 'zod'
import { PRIVATE_SERVER_URL } from '$env/static/private'

const registerBusinessSchema = z.object({
  businessname: z
    .string({ required_error: 'Username is required' })
    .min(1, { message: 'Username is required' })
    .max(64, { message: 'Username must be less than 64 characters' })
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .max(64, { message: 'Email must be less than 64 characters' })
    .email({ message: 'Email nust be a valid email address' }),
  country: z
    .string()
    .max(64, { message: 'El país debe tener menos de 64 caracteres' })
    .optional()
    .default('Colombia'),
  // Legal Information
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .max(64, { message: 'Name must be less than 64 characters' })
    .trim(),
  lastname: z
    .string({ required_error: 'Lastname is required' })
    .min(1, { message: 'Lastname is required' })
    .max(64, { message: 'Lastname must be less than 64 characters' })
    .trim(),
  taxid: z
    .string({ required_error: 'Tax id is required' })
    .min(1, { message: 'Tax id is required' })
    .max(64, { message: 'Tax id must be less than 64 characters' })
    .trim(),
  /////////////////////////
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(32, { message: 'Password must be less than 32 characters' })
    .trim(),
  verified_password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(32, { message: 'Password must be less than 32 characters' })
    .trim(),
  currency: z
    .string({ required_error: 'Currency code is required' })
    .trim()
}).superRefine(({ password, verified_password }, ctx) => {
  if (verified_password !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password and Confirm Password must match',
      path: ['password']
    })
    ctx.addIssue({
      code: 'custom',
      message: 'Password and Confirm Password must match',
      path: ['verified_password']
    })
  }
})


export const actions: Actions = {
  business: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData())

    if (!formData.country || formData?.country.trim() === '') {
      formData.country = 'Colombia';
    }

    try {
      const {
        businessname,
        email,
        country,
        name,
        lastname,
        taxid,
        password,
        verified_password,
        currency
      } = registerBusinessSchema.parse(formData)

      const displayname = businessname.trim()
      const username = displayname.toLowerCase().replace(/\s+/g, '')

      if (verified_password !== password) {
        return {
          message: "Password and Confirm Password must match",
          success: false
        }
      } else {
        // Crear Usuario Business
        const responseCreateUser = await fetch(`${PRIVATE_SERVER_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            displayname,
            email,
            country,
            name,
            lastname,
            taxid,
            password,
            accountType: 'business',
            currency
          })
        })

        const resultCreateUser = await responseCreateUser.json()
        if (resultCreateUser.status === 401) {
          console.error("Error creando usuario business:", resultCreateUser)
          return {
            success: false,
            message: resultCreateUser.message || 'Error creando usuario business'
          }
        }

        // Logear Usuario
        const responseLoginUser = await fetch(`${PRIVATE_SERVER_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        })

        const resultLogin = await responseLoginUser.json()
        if (resultLogin.status === 401) {
          console.log("Error logeando usuario business:", resultLogin)
          return {
            success: false
          }
        }

        cookies.set('session', resultLogin.acces_token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: false,
          path: '/',
          maxAge: 60 * 60 * 24 * 45 // aproximadamente mes y medio
        })

        return {
          success: true
        }
      }
    } catch (err: any) {
      const { fieldErrors: errors } = err?.flatten()
      const { password, verified_password, ...rest } = formData

      return {
        data: rest,
        errors,
        success: false
      }
    }
  }
}
