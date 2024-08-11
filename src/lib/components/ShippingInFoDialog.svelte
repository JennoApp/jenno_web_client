<script lang="ts">
  export let openDialog = false

  function handleOpenDialog() {
    openDialog = true
  }
</script>

<button on:click={() => alert("hola")}>
  Open Dialog
</button>
