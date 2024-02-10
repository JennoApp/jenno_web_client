import jwt from 'jsonwebtoken'
import { i18n } from '$lib/i18n'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

export const reroute = i18n.reroute()

const langHandle = i18n.handle()

const sessionHandle = (async ({ event, resolve }) => {
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
      } else {
        const result = await fetch(`http://localhost:3000/users/${decodedToken.sub}`)
        const userData = await result.json()
        console.log({ userData })

        // asignar la informacion del usuario a event.locals
        event.locals.user = userData
      }

      event.locals.session = session
    } catch (error: any) {
      console.log("Error al verificar el token JWT:", error.message)

      event.cookies.set('session', '', { path: '/',maxAge: 0 })
    }
  }

  return resolve(event)
}) satisfies Handle

export const handle = sequence(langHandle, sessionHandle)