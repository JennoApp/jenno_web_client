import type { Actions } from './$types'
import { PRIVATE_SERVER_URL } from '$env/static/private'

export const actions: Actions = {
  login: async ({ cookies, request }) => {
    const data = await request.formData()
    const email = data.get('email')
    const password = data.get('password')
    const response = await fetch(`${PRIVATE_SERVER_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()
    console.log({ result })

    if (result.statusCode === 401) {
      console.log("Credenciales incorrectas")
      return {
        success: false
      }
    }

    cookies.set('session', result.acces_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 45
    })

    return {
      success: true
    }
  }
}
