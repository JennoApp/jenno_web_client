<script lang="ts">
  export let text: string;
  export let color: string = 'bg-gray-500'

</script>


<span class={`text.white text-xs font-semibold px-2 py-1 ${color} rounded-md`}>
  {text}
</span>
