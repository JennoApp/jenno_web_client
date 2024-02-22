import {writable} from 'svelte/store'

export let search = writable("")

export function setSearch(param: string) {
  search.set(param)
  return
}

