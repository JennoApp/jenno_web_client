import jwt from 'jsonwebtoken'

export async function handle({ event, resolve }) {
  // Obtenemos token de session de la cookies
  const session = event.cookies.get('session')

  const decodedToken = jwt.decode(session)

  // Obtenemos la informacion de la base de datos
  if (decodedToken !== null) {
    const result = await fetch(`http://localhost:3000/users/${decodedToken.sub}`)
    const userData = await result.json()
    console.log({ userData })

    event.locals.user = userData
  }

  return resolve(event)
}
