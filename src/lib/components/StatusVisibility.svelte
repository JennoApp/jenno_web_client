<script>
  export let status = true
</script>

<div class="flex ml-4 items-center">
  {#if status}
    <iconify-icon icon="material-symbols:check" width="24" height="24"></iconify-icon>
  {:else}
    <iconify-icon icon="basil:cross-solid" width="35" height="35"></iconify-icon> 
  {/if}
</div>
