import type { Actions } from './$types'

export const actions: Actions = {
  addProduct: async ({ request }) => {
    const formData = await request.formData()

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
      
    return {
      success: true
    }
  }
}