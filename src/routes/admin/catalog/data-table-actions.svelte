<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal } from 'lucide-svelte';
  import { goto, invalidateAll } from '$app/navigation'
  import { toast } from 'svelte-sonner'

	export let id: string;

   // Obtener url del servidor
  let serverUrl: string
  async function getServerUrl() {
    try {
      const response = await fetch(`/api/server`)
      const data = await response.json()

      serverUrl = data.server_url 
    } catch (error) {
      console.error('Error al solicitar Paypal Id')
    }
  }

  $: getServerUrl()

  const deleteProduct = async (id: any) => {
    const response = await fetch(`${serverUrl}/products/${id}`, {
      method: 'DELETE'
    })

    if(response.ok) {
      invalidateAll() 
      toast.success('Producto Eliminado!')
    } 
  }
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative w-8 h-8 p-0">
			<MoreHorizontal class="w-4 h-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<!-- <DropdownMenu.Item
				on:click={() => {
					navigator.clipboard.writeText(id);
				}}
			>
				Copy payment ID
			</DropdownMenu.Item> -->
			<DropdownMenu.Item on:click={() => {
        goto(`/admin/catalog/addproduct?id=${id}`)
      }}>
        <iconify-icon
					icon="material-symbols:update"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				/>
				<span class="ml-3">Actualizar</span>
      </DropdownMenu.Item>
			<DropdownMenu.Item 
        class="bg-red-500 bg-opacity-60"
        on:click={() => {
          deleteProduct(id)
        }}
      >
				<iconify-icon
					icon="material-symbols:delete"
					height="1.1rem"
					width="1.1rem"
					class="text-gray-200 flex justify-center items-center"
				/>
				<span class="ml-3">Eliminar</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<!-- <DropdownMenu.Separator />
		<DropdownMenu.Item>View customer</DropdownMenu.Item>
		<DropdownMenu.Item>View payment details</DropdownMenu.Item> -->
	</DropdownMenu.Content>
</DropdownMenu.Root>
