import jwt from 'jsonwebtoken'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import Negotiator from 'negotiator'
import {
  defaultLocale,
  availableLocales,
  type AvailableLocale,
  isAvailableLocale
} from '$lib/i18n'
import { PRIVATE_SERVER_URL } from '$env/static/private'


// Session configuration
const sessionHandle: Handle = async ({ event, resolve }) => {
  // Obtenemos token de session de la cookies
  const session = event.cookies.get('session')

  if (session) {
    try {
      const decodedToken = jwt.verify(session, 'secretKey_crb331')

      if (decodedToken?.exp * 1000 < Date.now()) {
        event.cookies.delete('session', {
          path: '/'
        })
        event.locals.sessionExpired = true
        event.locals.isSession = false
      } else {
        const result = await fetch(`${PRIVATE_SERVER_URL}/users/${decodedToken.sub}`)
        const userData = await result.json()

        // asignar la informacion del usuario a event.locals
        event.locals.user = userData
        event.locals.isSession = true
      }

      event.locals.session = session
    } catch (error: any) {
      console.error("Error al verificar el token JWT:", error.message)

      event.cookies.set('session', '', { path: '/', maxAge: 0 })
      event.locals.isSession = false
    }
  }

  return resolve(event)
}


// Internacionalization locale configuration
const localization: Handle = async ({ event, resolve }) => {
  let locale: AvailableLocale = defaultLocale

  const langFromCookie = event.cookies.get('lang')

  if (isAvailableLocale(langFromCookie)) {
    locale = langFromCookie
  } else {
    const acceptedLanguageHeader = event.request.headers.get('accept-language')

    if (acceptedLanguageHeader) {
      locale = (new Negotiator({
        headers: {
          'accept-language': acceptedLanguageHeader
        }
      }).language(availableLocales as unknown as string[]) as AvailableLocale) || defaultLocale
    }
  }

  console.log('headers:', event.request.headers.get('accept-language'))
  console.log('user preferred but available locale: ', locale)

  // set locale in locals
  event.locals.locale = locale

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', locale)
  })
}


export const handle: Handle = sequence(sessionHandle, localization)
