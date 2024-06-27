import type { Actions } from './$types'
import { z } from 'zod'

const registerPersonalSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(1, { message: 'Username is required' })
    .max(64, { message: 'Username must be less than 64 characters' })
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .max(64, { message: 'Email must be less than 64 characters' })
    .email({ message: 'Email must be a valid email address' }),
  country: z
    .string({ required_error: 'Country is required' })
    .min(1, { message: 'Country is required' })
    .max(64, { message: 'Country must be less than 64 characters' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(32, { message: 'Password must be less than 32 characters' })
    .trim(),
  verified_password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(32, { message: 'Password must be less than 32 characters' })
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
  personal: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData())

    try {
      const { username, email, country, password, verified_password } = registerPersonalSchema.parse(formData)

      console.log({ username, email, country, password, verified_password })

      if (verified_password !== password) {
        return {
          message: "Password and Confirm Password must match",
          success: false
        }
      } else {
        // Crear Usuario Personal
        const responseCreateUser = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, email, country, password, accountType: 'personal' })
        })

        const result = await responseCreateUser.json()
        console.log({ result })

        if (result.statusCode === 401) {
          console.log("Credemciales inconrrectas")
          return {
            success: false
          }
        }

        // Logear Usuario
        const responseLoginUser = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        })

        const resultLogin = await responseLoginUser.json()
        console.log({ resultLogin })

        if (resultLogin.statusCode === 401) {
          console.log("Credenciales incorrectas")
          return {
            success: false
          }
        }

        cookies.set('session', resultLogin.acces_token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: false,
          path: '/',
          maxAge: 60 * 60 * 24 * 45
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
