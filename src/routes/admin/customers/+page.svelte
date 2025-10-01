<script lang="ts">
	import type { PageServerData } from './$types';
	import * as Table from '$lib/components/ui/table';
	import { page } from '$app/state';
	import * as m from '$paraglide/messages';
	import { goto, invalidateAll } from '$app/navigation';
	import { formatPrice } from '$lib/utils/formatprice';
	import { format } from 'timeago.js';
	import Options from '$lib/components/Options.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { Input } from '$lib/components/ui/input';
  import Image from '$lib/components/Image.svelte'
  import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
  } from '@tanstack/table-core'
  import { createRawSnippet } from 'svelte'
  import {
    FlexRender,
    createSvelteTable,
    renderSnippet
  } from '$lib/components/ui/data-table/index'


	let { data }: { data: PageServerData } = $props()

	const currentPage = $state(data.meta?.page ?? 1)
  const followerList = $state(data.followers ?? [])


	function changePage(newPage: number) {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', newPage.toString());
		invalidateAll();
	}


   // Estados de tabla
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 })
  let sorting = $state<SortingState>([])
  let columnFilters = $state<ColumnFiltersState>([])
  let columnVisibility = $state<VisibilityState>({})

  // Tipo
  type Follower = {
    _id: string
    username: string
    email: string
    accountType: string
    profileImg: string
    createdAt?: string
  }

  // Definición de columnas
  const columns: ColumnDef<Follower>[] = [
    {
      accessorKey: 'profileImg',
      header: m.shopping_tableheader_image(),
      cell: ({ row }) => {
        const imgSnippet = createRawSnippet<[string]>((getUrl) => {
          const url = getUrl()
          return {
            render: () =>
              `<div class="flex items-center">
                <img src="${url}" alt="profile" class="w-8 h-8 rounded-full object-cover"/>
              </div>`
          }
        })
        return renderSnippet(imgSnippet, row.getValue('profileImg'))
      }
    },
    {
      accessorKey: 'username',
      header: 'Name',
      cell: ({ row }) => row.getValue('username')
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email')
    },
    {
      accessorKey: 'accountType',
      header: 'Account Type',
      cell: ({ row }) => row.getValue('accountType')
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => {
        const dateSnippet = createRawSnippet<[string]>((getDate) => {
          const dateValue = getDate()
          return {
            render: () =>
              `<div class="text-sm text-muted-foreground">${format(
                dateValue
              )}</div>`
          }
        })
        return renderSnippet(dateSnippet, row.getValue('createdAt'))
      }
    }
  ]

  // Crear la tabla
  const table = createSvelteTable({
    get data() {
      return followerList
    },
    columns,
    state: {
      get pagination() {
        return pagination
      },
      get sorting() {
        return sorting
      },
      get columnVisibility() {
        return columnVisibility
      },
      get columnFilters() {
        return columnFilters
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      pagination =
        typeof updater === 'function' ? updater(pagination) : updater
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onColumnFiltersChange: (updater) => {
      columnFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility =
        typeof updater === 'function' ? updater(columnVisibility) : updater
    }
  })

  $inspect({ table })

</script>

{#if followerList?.length !== 0}
	{#if data.sucess === false}
		<h1>Error al hacer la solicitud</h1>
	{:else}
    <!-- Filtro -->
     <!--
		<div class="flex items-center justify-between mx-10 mt-5">
			<Input
				class="max-w-sm placeholder:text-[#707070]"
				placeholder="Filter names..."
				type="text"
        bind:value={{
    get: () => table.getColumn('username')?.getFilterValue() ?? '',
    set: (val) => table.getColumn('username')?.setFilterValue(val)
  }}
			/>
		</div>
     -->

    <!-- Tabla -->
		<div class="rounded-md border mx-10 my-5">
      <Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>

				<Table.Body>
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender
										content={cell.column.columnDef.cell}
										context={cell.getContext()}
									/>
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center">
								No hay seguidores registrados.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

    <!-- Paginacion -->
		<div class="flex justify-between mx-10 mb-5">
			<div class="">
				<h3 class="text-sm dark:text-[#707070]">
					items: {followerList.length} - pages: {pagination.pageIndex + 1}
				</h3>
			</div>
			<div class="flex items-center justify-end space-x-4">
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!table.getCanPreviousPage()}
					onclick={(e: any) => {
            e.preventDefault()
            table.previousPage()
          }}
				>
					Anterior
				</Button>
				<Button
					class="border-gray-400 dark:border-[#252525]"
					variant="outline"
					size="sm"
					disabled={!table.getCanNextPage()}
					onclick={(e: any) => {
            e.preventDefault()
            table.nextPage()
          }}
				>
					Siguiente
				</Button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="f7:person-3-fill" height="5rem" width="5rem" class="text-[#707070] mb-4" ></iconify-icon>

		<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_customers_nocustomers_title()}</h1>
		<p class="text-lg text-[#707070]">{m.admin_customers_nocustomers_p()}</p>
	</div>
{/if}
