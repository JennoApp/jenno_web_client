<script>
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Button } from '$lib/components/ui/button'
</script>

<div class="flex justify-between max-w-full h-20 px-5 m-5 py-6 flex-shrink">
  <h2 class="text-xl font-semibold">Catalogo</h2>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button class="dark:bg-[#202020] dark:text-gray-200 hover:dark:bg-[#252525]">Agregar</Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="bg-background mt-2 border border-[#222222]">
      <DropdownMenu.Item href="/admin/catalog/addproduct">
        Agregar Producto
      </DropdownMenu.Item>
      <DropdownMenu.Item disabled>Agregar Servicio</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>