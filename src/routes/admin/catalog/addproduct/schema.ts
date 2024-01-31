import { z } from 'zod'

export const formSchema = z.object({
  productname: z.string().min(2).max(30),
  imgs: z.array(z.string()),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  quantity: z.number(), 
  SKU: z.string(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  status: z.enum(['in_stock', 'sold_out', 'on_sale', 'active', 'paused', 'inactive'], {
    required_error: "You need select a status type."
  }),
  visibility: z.boolean()
})

export type FormSchema = typeof formSchema
