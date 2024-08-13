<script lang="ts">
  export let status: string
</script>


{#if status == 'pending'}
  <div class="flex items-center justify-center bg-yellow-600 h-6 px-4 rounded-full"><span class="text-sm font-medium">{status}</span></div>
{:else if status == 'sending'}
  <div class="flex items-center justify-center bg-blue-600 h-6 px-4 rounded-full"><span class="text-sm font-medium">{status}</span></div>
{:else if status == 'completed'}
  <div class="flex items-center justify-center bg-green-600 h-6 px-4 rounded-full"><span class="text-sm font-medium">{status}</span></div>
{:else if status == 'cancelled'}
  <div class="flex items-center justify-center bg-red-600 h-6 px-4 rounded-full"><span class="text-sm font-medium">{status}</span></div>
{:else if status == 'returned'}
  <div class="flex items-center justify-center bg-purple-600 h-6 px-4 rounded-full"><span class="text-sm font-medium">{status}</span></div>
{/if}
