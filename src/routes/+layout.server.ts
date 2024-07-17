import { languageTag } from '$paraglide/runtime.js'

export async function load({ locals, getClientAddress, fetch, depends }) {
  depends("paraglide:lang")

  let preferredLanguage = 'en' // Default language

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
    serverLang: `The language on the server is: ${languageTag()}` 
  }
}
