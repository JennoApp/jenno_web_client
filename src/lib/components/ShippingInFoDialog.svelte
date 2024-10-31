<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import { PRIVATE_SERVER_URL } from '$env/static/private'

  export let shippingInfo: any

  let open = false
  let userShippingInfo: any

  function openDialog() {
    open = true
  }

  // $: console.log({id: shippingInfo.buyerId})

  async function getShippingInfo(id: string) {
    const response = await fetch(`${PRIVATE_SERVER_URL}/users/shippingInfo/${id}`)
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
