<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
  import { PRIVATE_SERVER_URL } from '$env/static/private'

	export let id: string;

  $: console.log({id})

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`${PRIVATE_SERVER_URL}/orders/status/${id}`, {
      method: 'PUT',
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status
      })
    })

    if (response.ok) {
      toast.success('Status Update!')
    }

    const data = await response.json()
    return data
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
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Actualizar Estado</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item on:click={() => {
            updateStatus(id, 'sending')
          }}>
						<iconify-icon
							icon="tabler:cube-send"
							height="1.1rem"
							width="1.1rem"
							class="text-gray-200 flex justify-center items-center"
						/>
						<span class="ml-3">Enviando</span>
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item on:click={() => {
            updateStatus(id, 'cancelled')
          }}>
						<iconify-icon
							icon="material-symbols:cancel"
							height="1.1rem"
							width="1.1rem"
							class="text-gray-200 flex justify-center items-center"
						/>
						<span class="ml-3">Cancelar Orden</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item on:click={() => {
            updateStatus(id, 'returned')
          }}>
						<iconify-icon
							icon="hugeicons:truck-return"
							height="1.1rem"
							width="1.1rem"
							class="text-gray-200 flex justify-center items-center"
						/>
						<span class="ml-3">Devolver</span>
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
