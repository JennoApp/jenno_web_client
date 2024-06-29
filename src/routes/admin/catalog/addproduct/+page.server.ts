// import type { Actions } from './$types'
import { supabase } from '$lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

/*
const createProductSchema = z.object({
  productname: z
    .string({ required_error: 'product name is required' })
    .min(1, { message: 'product name is required' })
    .max(64, { message: 'product name must be less than 64 characters' })
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, { message: 'Description is required' })
    .max(240, { message: 'product name must be less than 240 characters' })
    .trim(),
  price: z
    .number({ required_error: 'Price is required' })
    .min(1, { message: 'Price is required' })
    .max(64, { message: 'Price must be less than 64 numbers' }),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .min(1, { message: 'Quantity is required' })
    .max(32, { message: 'Quantity must be less than 32 numbers' }),
  SKU: z
    .string({ required_error: 'SKU is required' })
    .min(1, { message: 'SKU is required' })
    .max(32, { message: 'SKU must be less than 32 characters' })
    .optional()
    .transform(e => e === "" ? undefined : e),
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, { message: 'Category is required' })
    .max(32, { message: 'Category must be less than 32 characters' })
    .trim(),
  weight: z
    .number({ required_error: 'Weight is required' })
    .min(1, { message: 'Weight is required' })
    .max(64, { message: 'Weight must be less than 64 numbers' })
    .optional(),
  length: z
    .number({ required_error: 'Length is required' })
    .min(1, { message: 'Lngth is required' })
    .max(64, { message: 'Length must be less than 64 numbers' })
    .optional(),
  width: z
    .number({ required_error: 'Width is required' })
    .min(1, { message: 'Width is required' })
    .max(64, { message: 'Width must be less than 64 numbers' })
    .optional(),
  height: z
    .number({ required_error: 'Heigth is required' })
    .min(1, { message: 'Heigth is required' })
    .max(64, { message: 'Heigth must be less than 64 numbers' })
    .optional(),
  status: z
    .enum(['in_stock', 'sold_out', 'on_sale', 'active', 'paused', 'inactive'])
})

const fileSchema = z
  .instanceof(File)
  .refine((file: any) => {
    return !file || file.size <= 1024 * 1024 * 3
  }, 'File size must be less than 3MB')
  .refine((file: any) => {
    return ['image/png'].includes(file?.type)
  }, 'File must be a PNG')

const filesSchema = z.object({ files: z.array(fileSchema) }) 
*/

export const actions: Actions = {
  addProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const uploadedFiles = formData.getAll('files') as File[]

    // // Validar los archivos
    // try {
    //   filesSchema.parse(uploadedFiles);
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     console.error("Validation error:", error.errors);
    //     // Manejar errores de validación, por ejemplo, devolviendo una respuesta con errores
    //     return {
    //       success: false,
    //       status: 400,
    //       errors: error.errors
    //     };
    //   }
    // }


    // Convertir formData a un objeto
    // const formDataObj = Object.fromEntries(formData)
    const tokenJwt = cookies.get('session')

    // let productData: any
    // try {
    //   productData = createProductSchema.parse(formDataObj); 
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     console.error("Validation error:", error.errors);
    //     // Manejar errores de validación de los datos del producto
    //     return {
    //       success: false,
    //       status: 400,
    //       errors: error.errors
    //     };
    //   }
    // }


    

    // const { productname, description, category, price, quantity, SKU, weight, height, length, width, status } = formData

    const imagesUrls: string[] = []

    const uploadPromises = uploadedFiles.map(async (file: any) => {
      const { data, error } = await supabase.storage.from('products').upload(uuidv4(), file)
      if (error) {
        console.log({ supabaseError: error })
      } else {
        console.log("imagen subida")
        const publicUrl = supabase.storage.from('products').getPublicUrl(data.path)
        console.log(publicUrl)
        imagesUrls.push(publicUrl.data.publicUrl)
      }
    })

    await Promise.all(uploadPromises)
    console.log({ imagesUrls })



    const productname = formData?.get('productname')
    const description = formData.get('description')
    const price = formData.get('price')
    const quantity = formData.get('quantity')
    const SKU = formData.get('SKU')
    const category = formData.get('category')
    const weight = formData.get('weight')
    const length = formData.get('length')
    const width = formData.get('width')
    const height = formData.get('height')
    const status = formData.get('status')
    // const visibility = formData.get('visibility')

    // Extraer las opciones
    const optionsItems = []
    for (let i = 0; i < 2; i++) {
      const optionname = formData.get(`optionname${i}`)
      const options = formData.get(`options${i}`)
      if (optionname && options) {
        optionsItems.push({
          name: optionname.toString(),
          optionslist: options.toString().split(',').map(option => option.trim())
        })
      }
    }

    // Extraer las especificaciones
    const especificationsItems = [];
    for (let i = 0; i < 10; i++) { // Asumiendo un máximo de 10 especificaciones
      const title = formData.get(`especificationtitle${i}`);
      const content = formData.get(`especificationcontent${i}`);
      if (title && content) {
        especificationsItems.push({
          title: title.toString(),
          content: content.toString() 
        });
      }
    }


    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenJwt}` // autorizaicion jwt token
        },
        body: JSON.stringify({
          productname,
          imgs: imagesUrls,
          price,
          quantity,
          SKU,
          description,
          category,
          weight,
          length,
          width,
          height,
          status,
          // visibility
          options: optionsItems,
          especifications: especificationsItems
        })
      })

      // const result = await response.json()

      if (response.status === 401) {
        console.log("el producto no se ha podido crear")
        return {
          success: false,
          status: response.status
        }
      }

      return {
        success: true,
        status: response.status
      }

    } catch (error: any) {
      // const { fieldErrors: errors } = error?.flatten()
      console.log({ error })
      return {
        success: false,
        status: 500,
        errors: error.message
      };
    }
  }
}
