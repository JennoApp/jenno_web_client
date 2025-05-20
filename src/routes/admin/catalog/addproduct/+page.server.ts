import type { Actions } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const actions: Actions = {
  saveProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const uploadedFiles = formData.getAll('files') as File[]
    const tokenJwt = cookies.get('session')
    let productId = formData?.get('productId') as string
    let imagesUrls = productId
      ? JSON.parse(formData.get('imagesUrls') as string || '[]')
      : []

    // Obtener y procesar el país
    const receivedCountries = (formData.get('country') as string || '').split(',').map(country => country.trim());

    // Verificar y agregar "Colombia" si no está presente
    if (!receivedCountries.includes('Colombia')) {
      receivedCountries.unshift('Colombia'); // Agregar "Colombia" al inicio
    }

    // Configurar la lista final de países
    const country = receivedCountries.length > 0 ? receivedCountries : ['Colombia'];

    const additionalInfo = formData.get('additionalInfo') as string;

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
      status: formData.get('status') || 'in_stock',
      visibility: formData.get('visibility') === 'true',
      country,
      options: [] as any[],
      especifications: [] as any[],
      additionalInfo
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
      // Crear o actualizar el producto
      let response;
      if (!productId) {
        // Crear un producto nuevo
        response = await fetch(`${PRIVATE_SERVER_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenJwt}`
          },
          body: JSON.stringify(productData)
        })

        if (!response.ok) {
          const errorResponse = await response.json()
          console.error('Error al crear el producto:', errorResponse)
          return {
            success: false,
            status: response.status,
            errors: errorResponse,
          }
        }

        const product = await response.json()
        console.log( { product } )

        productId = product.productId
        console.log("productId asignado:", productId)
      } else {
        // Actualizar un producto existente
        response = await fetch(`${PRIVATE_SERVER_URL}/products`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenJwt}`
          },
          body: JSON.stringify({
            productId,
            ...productData
          })
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error al actualizar el producto:', errorResponse);
          return {
            success: false,
            status: response.status,
            errors: errorResponse,
          };
        }
      }

      // Esperar a que productId tenga un valor válido
      const waitForProductId = async () => {
        const maxRetries = 5;
        const retryDelay = 500; // en milisegundos
        let retries = 0;

        while (!productId && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retries++;
        }

        if (!productId) {
          throw new Error("No se pudo obtener un productId válido.");
        }
      };

      await waitForProductId();


      // Subir imagenes si hay archivos seleccionados
      if (uploadedFiles.length > 0) {
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
          const errorResponse = await imageResponse.json()
          throw new Error(errorResponse.message || 'Error al subir las imágenes')
        }

        const imageResult = await imageResponse.json()
        productData.imgs = imageResult.images
      }

      return {
        success: true,
        status: 201,
        product: productData
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
