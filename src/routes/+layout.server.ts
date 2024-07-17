import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, getClientAddress, depends }) => {
  depends('app:locale')

  let requestIp
  let locationData = {}

  try {
    requestIp = getClientAddress()
    console.log('Ip Address form client request: ', requestIp)
  } catch (error) {
    console.log('Error reading Ip')
  }

  return {
    user: locals.user,
    sessionExpired: locals.sessionExpired,
    clientAddress: requestIp,
    locationData: locationData,
    locale: locals.locale
  }
}
