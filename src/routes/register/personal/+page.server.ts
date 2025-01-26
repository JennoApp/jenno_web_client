import type { Actions } from './$types'
import { z } from 'zod'
import { PRIVATE_SERVER_URL } from '$env/static/private'

const registerPersonalSchema = z
  .object({
    username: z
      .string({ required_error: 'El nombre de usuario es obligatorio' })
      .min(1, { message: 'El nombre de usuario es obligatorio' })
      .max(64, { message: 'El nombre de usuario debe tener menos de 64 caracteres' })
      .trim(),
    email: z
      .string({ required_error: 'El correo electrónico es obligatorio' })
      .min(1, { message: 'El correo electrónico es obligatorio' })
      .max(64, { message: 'El correo electrónico debe tener menos de 64 caracteres' })
      .email({ message: 'Debe ser una dirección de correo válida' }),
    country: z
      .string()
      .max(64, { message: 'El país debe tener menos de 64 caracteres' })
      .optional()
      .default('Colombia'),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
      .max(32, { message: 'La contraseña debe tener menos de 32 caracteres' })
      .trim(),
    verified_password: z
      .string({ required_error: 'La confirmación de la contraseña es obligatoria' })
      .min(6, { message: 'La confirmación de la contraseña debe tener al menos 6 caracteres' })
      .max(32, { message: 'La confirmación de la contraseña debe tener menos de 32 caracteres' })
      .trim(),
  })
  .superRefine(({ password, verified_password }, ctx) => {
    if (password !== verified_password) {
      ctx.addIssue({
        code: 'custom',
        message: 'La contraseña y la confirmación deben coincidir',
        path: ['password'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'La contraseña y la confirmación deben coincidir',
        path: ['verified_password'],
      });
    }
  });

export const actions: Actions = {
  personal: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData())

    try {
      // Validar Formulario
      const { username, email, country, password } = registerPersonalSchema.parse(formData)

      console.log({ username, email, country, password })


      // Crear Usuario Personal
      const responseCreateUser = await fetch(`${PRIVATE_SERVER_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, country, password, accountType: 'personal' })
      })

      const result = await responseCreateUser.json()
      console.log({ result })

      if (result.statusCode === 401) {
        console.log("Credenciales incorrectas")
        return {
          message: 'Hubo un problema al crear la cuenta. Por favor, intente de nuevo.',
          success: false
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
      console.log({ resultLogin })

      if (resultLogin.statusCode === 401) {
        console.log("Credenciales incorrectas")
        return {
          message: 'El correo electrónico o la contraseña son incorrectos.',
          success: false
        }
      }

      // Establecer Cookie de Sesión
      cookies.set('session', resultLogin.acces_token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 45 // 45 dias
      })

      return {
        success: true,
        message: 'Registro y login completados con éxito.',
      }
    } catch (err: any) {
      const { fieldErrors: errors } = err?.flatten()
      const { password, verified_password, ...rest } = formData

      return {
        data: rest,
        errors,
        success: false,
        message: 'Hubo errores en el formulario. Por favor, revise los campos.',
      }
    }
  }
}
