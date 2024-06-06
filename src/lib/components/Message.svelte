<script lang="ts">
  import {format} from 'timeago.js'
  
  export let own: boolean
  export let message: any

</script>


<div class={own ? "flex flex-col items-end mb-3": "flex flex-col mb-3"}>
  <div class="flex">
    <img src="https://img.freepik.com/foto-gratis/retrato-hermoso-mujer-joven-posicion-pared-gris_231208-10760.jpg?size=626&ext=jpg&ga=GA1.1.1488620777.1712534400&semt=sph" alt="" class="w-8 h-8 rounded-full object-cover mr-3">
    <p class={"p-2 rounded-3xl bg-gray-200 dark:bg-[#202020] max-w-72"}>{message.text}</p>
  </div>
  <div class="text-sm mt-2">
    {format(message.createdAt)}
  </div>
</div>
