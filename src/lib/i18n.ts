// import { createI18n } from "@inlang/paraglide-sveltekit"
// import * as runtime from "$paraglide/runtime"

// export const i18n = createI18n(runtime);

export const availableLocales = ["en", "es"] as const
export type AvailableLocale = (typeof availableLocales)[number]

export const labeledLanguages: {locale: AvailableLocale; label: string}[] = [
  {locale: 'en', label: "English"},
  {locale: "es", label: "Spanish"}
]

export const isAvailableLocale = (lang: unknown): lang is AvailableLocale =>
  typeof lang === 'string' && availableLocales.includes(lang as AvailableLocale)

export const defaultLocale = availableLocales[0]
