import type { Actions } from './$types'
import { supabase } from '$lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export const actions: Actions = {
  uploadProfileImg: async ({ request, cookies }) => {
    try {
      const formData = await request.formData()
      const tokenJwt = cookies.get('session')

      const uploadProfileImg = formData?.get('profile')
      console.log({uploadProfileImg})

      // Verificar que se haya proporcionado un archivo
      if (!uploadProfileImg || !(uploadProfileImg instanceof File)) {
        throw new Error('No se proporcionó ninguna imagen de perfil.');
      }

      const { data, error } = await supabase.storage.from('profileImg').upload(uuidv4(), uploadProfileImg)

      if (error) {
        console.error("Error al cargar la imagen: ", error.message)
        return {
          success: false,
          message: 'Error al cargar la imagen'
        }
      }

      
      const publicUrl = supabase.storage.from('profileImg').getPublicUrl(data.path)

      // Actualiza la imagen de perfil en el usuario
      const updateResponse = await fetch(`http://localhost:3000/users/updateProfileImg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenJwt}`
        },
        body: JSON.stringify({ profileImg: publicUrl.data.publicUrl })
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
  }
}

