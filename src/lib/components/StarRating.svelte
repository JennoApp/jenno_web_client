<script>
  export let rating = 0; // número entre 0 y 5
  const maxStars = 5;

  // Crear un arreglo con 5 elementos para iterar
  let stars = Array.from({ length: maxStars });
</script>

<style>
  .star-container {
    position: relative;
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    color: #d1d5db; /* gris claro */
  }

  .star-full {
    position: absolute;
    top: 0;
    left: 0;
    color: #facc15; /* amarillo */
    overflow: hidden;
  }
</style>

<div class="flex gap-1 items-center">
  {#each stars as _, i}
    <div class="star-container">
      <iconify-icon icon="mdi:star" width="1.5rem" height="1.5rem" />
      <div
        class="star-full"
        style="width: {Math.min(Math.max(rating - i, 0), 1) * 100}%"
      >
        <iconify-icon icon="mdi:star" width="1.5rem" height="1.5rem" />
      </div>
    </div>
  {/each}
</div>
