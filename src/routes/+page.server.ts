import { z } from 'zod'
import type { PageServerLoad, Actions } from './$types'
import { availableLocales, type AvailableLocale } from '$lib/i18n'


const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 30 * 12
const LanguageSchema = z
  .string()
  .refine((val) => availableLocales.includes(val as AvailableLocale), {
    message: 'Not an available local'
  })

export const load: PageServerLoad = async ({ fetch, url }) => {
  const country = url.searchParams.get('country') || ''
  const limit: number = 20
  
  const response = await fetch(`http://localhost:3000/products?page=${1}&limit=${limit}&country=${country}`)

  if (!response.ok) {
    return {
      status: response.status,
      error: new Error(response.statusText)
    }
  }

  
  const { data, meta } = await response.json()

  return {
    products: data,
    meta
  }
}

export const actions: Actions = {
  setLang: async ({ request, cookies }) => {
    const formData = await request.formData()
    const lang = LanguageSchema.parse(formData.get('lang'))

    cookies.set('lang', lang, {
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS
    })

    return { lang }
  }
}
