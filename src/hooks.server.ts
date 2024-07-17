import jwt from 'jsonwebtoken'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { i18n } from '$lib/i18n'
// import Negotiator from 'negotiator'

const langhandle = i18n.handle()

const sessionHandle: Handle = (async ({ event, resolve }) => {
  // Obtenemos token de session de la cookies
  const session = event.cookies.get('session')

  if (session) {
    try {
      const decodedToken = jwt.verify(session, 'secretKey_crb331')
      console.log({decodedToken})

      if (decodedToken?.exp * 1000 < Date.now()) {
        event.cookies.delete('session', {
          path: '/'
        })
        event.locals.sessionExpired = true
        event.locals.isSession = false
      } else {
        const result = await fetch(`http://localhost:3000/users/${decodedToken.sub}`)
        const userData = await result.json()
        console.log({ userData })

        // asignar la informacion del usuario a event.locals
        event.locals.user = userData
        event.locals.isSession = true
      }

      event.locals.session = session
    } catch (error: any) {
      console.log("Error al verificar el token JWT:", error.message)

      event.cookies.set('session', '', { path: '/',maxAge: 0 })
      event.locals.isSession = false
    }
  }

  return resolve(event)
}) satisfies Handle


// // internacionalization locale configuration
// const availableLocales = ['en', 'es']
// const defaultLocale = 'en'
// const localization: Handle = async ({ event, resolve }) => {
//   const acceptedLangs = event.request.headers.get('accept-language')

//   let locale = defaultLocale  
//   if (acceptedLangs) {
//     locale = new Negotiator({
//       headers: {
//         'accept-language': acceptedLangs
//       }
//     }).language(availableLocales) || defaultLocale 
//   }

//   console.log('headers:', event.request.headers.get('accept-language'))
//   console.log('user preferred but available locale: ', locale)

//   return resolve(event, {
//     transformPageChunk: ({ html }) => html.replace('%lang%', locale)
//   })
// }


export const handle = sequence(langhandle, sessionHandle)
