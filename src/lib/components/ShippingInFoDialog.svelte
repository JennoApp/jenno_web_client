<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'

  export let shippingInfo: any

  let open = false
  let userShippingInfo: any

  // Obtener url del servidor
  let serverUrl: string
  async function getServerUrl() {
    try {
      const response = await fetch(`/api/server`)
      const data = await response.json()

      serverUrl = data.server_url
    } catch (error) {
      console.error('Error al obtener la url del servidor', error)
    }
  }


  function openDialog() {
    open = true
  }

  async function getShippingInfo(id: string) {
    await getServerUrl()

    const response = await fetch(`${serverUrl}/users/shippingInfo/${id}`)
    const data = await response.json()
    userShippingInfo = data

    return data
  }

  $: getShippingInfo(shippingInfo.buyerId)
</script>

<button on:click={openDialog} class="hover:underline">
  Ver información de envío
</button>

<Dialog.Root bind:open>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Informacion de Envio</Dialog.Title>

      <div class="m-5">
        <div class="flex gap-2">
          <h3>Nombre o Razón Social:</h3>
          <p>{userShippingInfo?.shippingInfo?.completeName}</p>
        </div>

        <div class="flex gap-2">
          <h3>NIT / Documento de Identidad:</h3>
          <p>{userShippingInfo?.shippingInfo?.document}</p>
        </div>

        <div class="flex gap-2">
          <h3>Direccion:</h3>
          <p>{userShippingInfo?.shippingInfo?.address}</p>
        </div>

        <div class="flex gap-2">
          <h3>Ciudad:</h3>
          <h3>{userShippingInfo?.shippingInfo?.city}</h3>
        </div>

        <div class="flex gap-2">
          <h3>Estado:</h3>
          <h3>{userShippingInfo?.shippingInfo?.state}</h3>
        </div>

        <div class="flex gap-2">
          <h3>Pais:</h3>
          <h3>{userShippingInfo?.shippingInfo?.country}</h3>
        </div>

        <div class="flex gap-2">
          <h3>Telefono:</h3>
          <h3>{userShippingInfo?.shippingInfo?.phoneNumber}</h3>
        </div>

        <div class="flex gap-2">
          <h3>Codigo Postal:</h3>
          <h3>{userShippingInfo?.shippingInfo?.postalCode}</h3>
        </div>
      </div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
