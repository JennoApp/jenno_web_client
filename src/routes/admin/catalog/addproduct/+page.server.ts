import type { Actions } from './$types'
import { uploadFile } from '$lib/s3'
import { env } from '$env/dynamic/private'

export const actions: Actions = {
  saveProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const uploadedFiles = formData.getAll('files') as File[]
    const existingImagesUrls = formData.get('imagesUrls') ? JSON.parse(formData.get('imagesUrls') as string) : []

    const tokenJwt = cookies.get('session')

    const imagesUrls: string[] = []
    const countryList: string[] = []

    if (existingImagesUrls && existingImagesUrls.length > 0) {
      imagesUrls.push(...existingImagesUrls)
    } else {
      const uploadPromises = uploadedFiles.map(async (file: any) => {   
        // Subida de Imagenes con AWS S3
          const {result, publicUrl } = await uploadFile(file, "product")
          console.log("Imagen subida a S3")
         
          // Guardar URL publica de la imagen subida
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
    const country = formData.get('country')

    if (country) {
      countryList.push(country as string)
    }

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
          countryList,
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
