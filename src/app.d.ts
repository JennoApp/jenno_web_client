// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// import type { AvailableLanguageTag } from '$paraglide/runtime'
// import type { ParaglideLocals } from '@inlang/paraglide-sveltekit'
import type { AvailableLocale } from '$lib/i18n'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
    //   paraglide: ParaglideLocals<AvailableLanguageTag>
      locale: AvailableLocale
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

    interface Window {
      MercadoPago: any
    }
	}
}

export {}
