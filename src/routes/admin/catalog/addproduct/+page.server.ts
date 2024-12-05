import type { Actions } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const actions: Actions = {
  saveProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const uploadedFiles = formData.getAll('files') as File[]
    const tokenJwt = cookies.get('session')
    let productId = formData?.get('productId') as string | undefined
    let imagesUrls: string[] = []
    const country: string[] = ['Colombia']


    // Extraer datos generales del producto
    const productData = {
      productname: formData.get('productname'),
      description: formData.get('description'),
      imgs: imagesUrls,
      price: formData.get('price'),
      quantity: formData.get('quantity'),
      SKU: formData.get('SKU'),
      category: formData.get('category'),
      shippingfee: formData.get('shippingfee'),
      weight: formData.get('weight'),
      dimensions: {
        length: formData.get('length'),
        width: formData.get('width'),
        height: formData.get('height'),
      },
      status: formData.get('status'),
      visibility: formData.get('visibility'),
      country: country.concat(formData.get('country') as string || []),
      options: [] as any[],
      especifications: [] as any[]
    };

    // Extraer las opciones
    for (let i = 0; i < 2; i++) {
      const optionname = formData.get(`optionname${i}`)
      const options = formData.get(`options${i}`)
      if (optionname && options) {
        productData.options.push({
          name: optionname.toString(),
          optionslist: options.toString().split(',').map(option => option.trim())
        })
      }
    }

    // Extraer las especificaciones
    for (let i = 0; i < 10; i++) { // Asumiendo un máximo de 10 especificaciones
      const title = formData.get(`especificationtitle${i}`);
      const content = formData.get(`especificationcontent${i}`);
      if (title && content) {
        productData.especifications.push({
          title: title.toString(),
          content: content.toString()
        });
      }
    }

    try {
      // Si no hay "productId" crea un nuevo product
      if (!productId) {
        const createProductResponse = await fetch(`${PRIVATE_SERVER_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenJwt}`
          },
          body: JSON.stringify(productData)
        })
        if (!createProductResponse.ok) {
          const errorResponse = await createProductResponse.json()
          console.error('Error del servidor:', errorResponse)
          return {
            success: false,
            status: createProductResponse.status,
            errors: errorResponse
          }
        }

        const createdProduct = await createProductResponse.json()

        productId = createdProduct?._id
      } else {
        // Si existe un productId, obtener el producto existente para mantener sus imágenes actuales
        const existingProductResponse = await fetch(`${PRIVATE_SERVER_URL}/products/${productId}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${tokenJwt}`
          }
        });

        if (!existingProductResponse.ok) {
          console.error(await existingProductResponse.text());
          throw new Error('Error al obtener el producto existente');
        }

        const existingProduct = await existingProductResponse.json();
        imagesUrls = existingProduct.imgs || [];
        productData.imgs = imagesUrls

        // Si ya existe un productId, se actualiza el producto
        const updateResponse = await fetch(`${PRIVATE_SERVER_URL}/products/${productId}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenJwt}`
          },
          body: JSON.stringify(productData)
        });

        if (!updateResponse.ok) {
          const errorResponse = await updateResponse.json();
          console.error('Error al actualizar el producto:', errorResponse);
          return { success: false, status: updateResponse.status, errors: errorResponse };
        }
      }

      // subir nuevas imagenes solo si hay archivos seleccionados
      // tambien si se esta creando un nuevo producto el backend
      // actualiza el producto para incluir las imagenes
      if (uploadedFiles && uploadedFiles.length > 0) {
        const imageFormData = new FormData()
        uploadedFiles.forEach(file => {
          imageFormData.append('files', file)
        })

        const imageResponse = await fetch(`${PRIVATE_SERVER_URL}/products/upload-images/${productId}`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${tokenJwt}`
          },
          body: imageFormData
        })

        if (!imageResponse.ok) {
          throw new Error('Error al subir las imágenes')
        }

        const imageResult = await imageResponse.json()
        imagesUrls = imageResult.images
      } else {
        console.warn("No files to upload")
      }

      return {
        success: true,
        status: 200,
        images: imagesUrls
      }

    } catch (error: any) {
      console.error("Error inesperado:", error)
      return {
        success: false,
        status: 500,
        errors: error.message
      };
    }
  }
}
