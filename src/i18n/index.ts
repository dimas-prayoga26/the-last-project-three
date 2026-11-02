import { createI18n } from 'vue-i18n'

import en from './locales/en'
import id from './locales/id'

export const SUPPORTED_LOCALES = ['en', 'id'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, id },
})

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale
}
