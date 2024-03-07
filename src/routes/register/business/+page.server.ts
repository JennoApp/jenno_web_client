import type { Actions } from './$types'
import { z } from 'zod'

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
  // Legal Information
  name: z
   .string({ required_error: 'Name is required' })
   .min(1, { message: 'Name is required'})
   .max(64, { message: 'Name must be less than 64 characters'})
   .trim(),
  lastname: z
   .string({ required_error: 'Lastname is required' })
   .min(1, { message: 'Lastname is required'})
   .max(64, { message: 'Lastname must be less than 64 characters'})
   .trim(),
   taxid: z
   .string({ required_error: 'Tax id is required' })
   .min(1, { message: 'Tax id is required'})
   .max(64, { message: 'Tax id must be less than 64 characters'})
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

    try {
      const {businessname, email, name, lastname, taxid, password, verified_password} = registerBusinessSchema.parse(formData)

      console.log({ businessname, email, name, lastname, taxid, password, verified_password })

      if (verified_password !== password) {
        return {
          message: "Password and Confirm Password must match",
          success: false
        } 
      } else {
        // Crear Usuario Business
        const responseCreateUser = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username: businessname, email, password, accountType: 'Business' })
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