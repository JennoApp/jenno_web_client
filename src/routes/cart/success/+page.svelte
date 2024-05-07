<script>
  import { onMount } from 'svelte'
  import { goto, invalidateAll } from '$app/navigation'
  import { removeTotal, cartItems } from '$lib/stores/cartStore'
  // import { page } from '$app/stores'


  onMount(() => {
    invalidateAll()
  })

  $: {
    console.log($cartItems)
  }

  
</script>

<div class="flex justify-center w-full h-[calc(100vh-56px)]">
  <div class="w-1/2 h-56 mt-40 bg-[#202020] rounded-lg">
    <h1 class="mt-2 text-3xl font-semibold text-center">Pago Exitoso</h1>
    <p class="p-5 text-center mt-2 font-medium">¡Gracias por tu compra! Tu pago se ha procesado correctamente</p>

    <div class="text-center mt-14">
      <button class="dark:bg-[#303030] w-44 h-10 rounded-lg hover:dark:bg-[#353535]" on:click={() => goto('/')}>Volver a la tienda</button>
    </div>

  </div> 
</div>
