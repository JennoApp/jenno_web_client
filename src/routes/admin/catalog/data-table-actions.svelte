<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button/index';
	import { MoreHorizontal } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	export let id: string;

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Paypal Id');
		}
	}

	const deleteProduct = async (id: any) => {
		await getServerUrl();

		const response = await fetch(`${serverUrl}/products/${id}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			invalidateAll();
			toast.success('Producto Eliminado!');
		}
	};


  const updateVisibility = async (productId: string ,visibility: boolean) => {
    try {
      await getServerUrl()

      const response = await fetch(`${serverUrl}/products/updatevisibility/${productId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visibility: visibility
        })
      })

      if (response.ok) {
        toast.success('Visibilidad actualizada correctamente')

        goto(location.pathname)
      } else {
        toast.error('Error al actualizar visibilidad')
      }

    } catch (error) {
      console.error('Error en la solicitud:', error)
    }
  }
</script>

<!-- <DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative w-8 h-8 p-0 hover:bg-gray-300 dark:hover:bg-[#252525]">
			<MoreHorizontal class="w-4 h-4 dark:hover:gray-300" />
		</Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="z-50">
		<DropdownMenu.Group>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Visibilidad</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item on:click={() => {
            updateVisibility(id, true)
          }}>visible</DropdownMenu.Item>
					<DropdownMenu.Item on:click={() => {
            updateVisibility(id, false)
          }}>ocultar</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Item
				on:click={() => {
					goto(`/admin/catalog/addproduct?id=${id}`);
				}}
			>
				<iconify-icon
					icon="material-symbols:update"
					height="1.1rem"
					width="1.1rem"
					class="dark:text-gray-200 flex justify-center items-center"
				></iconify-icon>
				<span class="ml-3">Actualizar</span>
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="bg-red-500 bg-opacity-60 hover:bg-red-600"
				on:click={() => {
					deleteProduct(id);
				}}
			>
				<iconify-icon
					icon="material-symbols:delete"
					height="1.1rem"
					width="1.1rem"
					class="dark:text-gray-200 flex justify-center items-center"
				></iconify-icon>
				<span class="ml-3">Eliminar</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root> -->


<!-- DROPDOWN MODERNO -->
<DropdownMenu.Root>

  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="w-8 h-8 p-0 hover:bg-gray-300 dark:hover:bg-[#252525]"
      >
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content class="w-48 z-50">

    <DropdownMenu.Group>

      <!-- SUBMENU DE VISIBILIDAD -->
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>Visibilidad</DropdownMenu.SubTrigger>

        <DropdownMenu.SubContent>
          <DropdownMenu.Item onclick={() => updateVisibility(id, true)}>
            Visible
          </DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => updateVisibility(id, false)}>
            Ocultar
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>

      <!-- ACTUALIZAR -->
      <DropdownMenu.Item onclick={() => goto(`/admin/catalog/addproduct?id=${id}`)}>
        Actualizar
      </DropdownMenu.Item>

      <!-- ELIMINAR -->
      <DropdownMenu.Item
        class="bg-red-500 bg-opacity-60 hover:bg-red-600"
        onclick={deleteProduct}
      >
        Eliminar
      </DropdownMenu.Item>

    </DropdownMenu.Group>

  </DropdownMenu.Content>

</DropdownMenu.Root>
