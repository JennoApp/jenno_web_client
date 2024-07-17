import { createI18n } from "@inlang/paraglide-sveltekit"
import * as runtime from "$paraglide/runtime"

export const i18n = createI18n(runtime, {
  defaultLanguageTag: "en" 
});
