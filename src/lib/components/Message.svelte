<script lang="ts">
  
  export let own: boolean

</script>


<div class={own ? "flex flex-col mb-3": "flex flex-col items-end mb-3"}>
  <div class="flex">
    <img src="https://img.freepik.com/foto-gratis/retrato-hermoso-mujer-joven-posicion-pared-gris_231208-10760.jpg?size=626&ext=jpg&ga=GA1.1.1488620777.1712534400&semt=sph" alt="" class="w-8 h-8 rounded-full object-cover mr-3">
    <p class={"p-2 rounded-3xl bg-[#202020] max-w-72"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tincidunt volutpat ante, quis cursus magna interdum feugiat. Vivamus a sodales dolor, in tincidunt nisl. Fusce libero felis, maximus sit amet massa ut, blandit porttitor diam. Proin aliquam libero eros, nec aliquet tellus fermentum ac. </p>
  </div>
  <div class="text-sm mt-2">
    1 hour ago
  </div>
</div>
