<script lang="ts">
  import { toast } from 'svelte-sonner'

  let email: string = ''

  async function handleForm() {
    console.log({email})
    try {
      const response = await fetch(`http://localhost:3000/users/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      }) 

      if (response.ok) {
        toast.success('Correo enviado exitosamente')
      } else {
        toast.error('Error al enviar el correo. Intente nuevamente!')
      }
    } catch(error) {
      console.log(error)
    } 
  }

</script>


<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">Recuperar Contraseña</h1>

	<!-- Form -->
	<form on:submit|preventDefault={() => {
    handleForm()
  }} method="POST" class="flex-col gap-2 min-w-xs w-96 mx-auto">
		<!-- Email Input -->
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium">Email</label>
			<input bind:value={email} type="email" name="email" class="h-8 border rounded-md text-black font-semibold px-2" />
		</div>

		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
			>Continuar</button
		>
	</form>

</div>
