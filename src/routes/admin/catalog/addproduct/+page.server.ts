import type { Actions } from './$types'

export const actions: Actions = {
  addProduct: async ({ request }) => {
    const formData = await request.formData()
    const uploadedFile = formData?.getAll('files')
    console.log({uploadedFile})
   
    /*
        const productname = form.data.productname
        const description = form.data.description
        const price = form.data.price
        const quantity = form.data.quantity
        const SKU = form.data.SKU
        const category = form.data.category
        const weight = form.data.weight
        const length = form.data.length
        const width = form.data.width
        const height = form.data.height
        const status = form.data.status
        const visibility = form.data.visibility
    
        console.log({
          productname, description, price,
          quantity, SKU, category, weight, length, width, height, status, visibility
        })
    */
    return {
      success: true
    }
  }
}