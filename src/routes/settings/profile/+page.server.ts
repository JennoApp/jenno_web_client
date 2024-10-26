import type { Actions } from './$types'


export const actions: Actions = {
  uploadProfileImg: async ({ request, cookies }) => {
    try {
      const formData = await request.formData()
      const tokenJwt = cookies.get('session')

      const uploadProfileImg = formData?.get('profile')
      console.log({ uploadProfileImg })

      // Verificar que se haya proporcionado un archivo
      if (!uploadProfileImg || !(uploadProfileImg instanceof File)) {
        throw new Error('No se proporcionó ninguna imagen de perfil.');
      } 

      // Crear un nuevo FormData para enviar el archivo
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadProfileImg);

      // Actualiza la imagen de perfil en el usuario
      const updateResponse = await fetch(`http://localhost:3000/users/updateProfileImg`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenJwt}`
        },
        body: formDataToSend
      })

      if (!updateResponse.ok) {
        console.error("Error al actualizar la imagen de perfil")
        return {
          success: false,
          message: 'Error al actualizar la imagen de perfil'
        }
      }

      return {
        success: true,
        message: 'Imagen de perfil actualizada correctamente'
      }
    } catch (error) {
      console.error("Error en la carga y actualizaciopn de la imagen de perfil", error)
      return {
        success: false,
        message: 'Error en la carga y actualizacion de la imagen de perfil'
      }
    }
  },

  uploadUserInfo: async ({ request, cookies }) => {
    const formData = await request.formData()
    const tokenJwt = cookies.get('session')

    // info
    const username = formData.get("username")
    const email = formData.get('email')
    const bio = formData.get('bio')
    const country = formData.get('country')

    // Legal business info
    const legalName = formData.get('legal_name')
    const legalLastName = formData.get('legal_lastname')
    const taxID = formData.get('taxid')

    console.log({ username, email, bio, country, legalName, legalLastName, taxID })

    try {
      // Actualiza infomacion del usuario
      const updateResponse = await fetch(`http://localhost:3000/users/updateuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenJwt}`
        },
        body: JSON.stringify({
          username: username,
          email: email,
          bio: bio,
          country: country,
          legalname: legalName,
          legallastname: legalLastName,
          taxid: taxID
        })
      })

      if (!updateResponse.ok) {
        console.error("Error al actualizar la informacion de perfil")
        return {
          success: false,
          message: 'Error al actualizar la informacion de perfil'
        }
      }

      return {
        success: true,
        message: 'Informacion de perfil actualizada correctamente'
      }

    } catch (err) {
      console.log(err)
    }
  }
}

