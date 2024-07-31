import type { Actions } from './$types'
import { supabase } from '$lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { uploadFile } from '$lib/s3'
import { env } from '$env/dynamic/private'

export const actions: Actions = {
  saveProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const uploadedFiles = formData.getAll('files') as File[]
    const existingImagesUrls = formData.get('imagesUrls') ? JSON.parse(formData.get('imagesUrls') as string) : []

    const tokenJwt = cookies.get('session')

    const imagesUrls: string[] = []

    if (existingImagesUrls && existingImagesUrls.length > 0) {
      imagesUrls.push(...existingImagesUrls)
    } else {
      const uploadPromises = uploadedFiles.map(async (file: any) => {
        // const { data, error } = await supabase.storage.from('products').upload(uuidv4(), file)
        // if (error) {
        //   console.log({ supabaseError: error })
        // } else {
        //   console.log("imagen subida")
        //   const publicUrl = supabase.storage.from('products').getPublicUrl(data.path)
        //   console.log(publicUrl)
        //   imagesUrls.push(publicUrl.data.publicUrl)
        // }
        
        // Subida de Imagenes con AWS S3
          const result = await uploadFile(file)
          console.log("Imagen subida a S3")
          const publicUrl = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${file.name}`
          console.log({
            result,
            publicUrl
          })
          imagesUrls.push(publicUrl)
      })

      await Promise.all(uploadPromises)
      console.log({ imagesUrls })
    }


    const productId = formData?.get('productId')
    const productname = formData?.get('productname')
    const description = formData.get('description')
    const price = formData.get('price')
    const quantity = formData.get('quantity')
    const SKU = formData.get('SKU')
    const category = formData.get('category')
    const shippingfee = formData.get('shippingfee')
    const weight = formData.get('weight')
    const length = formData.get('length')
    const width = formData.get('width')
    const height = formData.get('height')
    const status = formData.get('status')
    const visibility = formData.get('visibility')

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
          productId,
          productname,
          imgs: imagesUrls,
          price,
          quantity,
          SKU,
          description,
          category,
          weight,
          shippingfee,
          dimensions: {
            length,
            width,
            height
          },
          status,
          visibility,
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
