<script lang="ts">
  export let url: string | null = null
  export let iconType: 'profileImg' | 'product' = 'profileImg'
</script>

<div class="w-14 h-14 flex justify-center items-center">
  {#if url}
    <img class="object-cover rounded-md w-full h-full" src={url} alt="img">
  {:else if iconType === 'profileImg'}
    <iconify-icon
      icon="mdi:user"
      height="1.5rem"
      width="1.5rem"
      class="text-gray-200 bg-[#202020] rounded-full hover:bg-[#252525]"
    />
  {:else if iconType === 'product'}
    <iconify-icon
      icon="mdi:package-variant-closed"
      height="1.5rem"
      width="1.5rem"
      class="text-gray-200 bg-[#202020] rounded-md hover:bg-[#252525]"
    />
  {/if}
</div>
