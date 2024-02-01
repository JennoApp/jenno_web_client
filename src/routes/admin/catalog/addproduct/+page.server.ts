import type { Actions } from './$types'

export const actions: Actions = {
  addProduct: async ({ request, cookies, fetch }) => {
    const formData = await request.formData()
    const tokenJwt = cookies.get('session')

    const uploadedFile = formData?.getAll('files')
    console.log({ uploadedFile })

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
    const visibility = formData.get('visibility')

    console.log({
      productname, description, price,
      quantity, SKU, category, weight, length, width, height, status, visibility
    })

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenJwt}`
        },
        body: JSON.stringify({
          productname,
          price,
          quantity,
          SKU,
          description,
          category,
          weight,
          status,
          visibility
        })
      })

      const result = await response.json()

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

    } catch (error) {
      console.log({error})
    }
  }
}