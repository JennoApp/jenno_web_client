// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { AvailableLanguageTag } from '$paraglide/runtime'
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      paraglide: ParaglideLocals<AvailableLanguageTag>
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
