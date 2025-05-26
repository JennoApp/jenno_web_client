<script lang="ts">
  export let text: string;
  export let color: string = 'bg-gray-300'

</script>


<span class={`inline-flex items-center px-3 py-1 text-sm font-medium text-white rounded-md ${color}`}>
  {text}
</span>
