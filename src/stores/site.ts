import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Locale } from '@/i18n'
import { apiGet } from '@/lib/api'
import type { Category, Discipline, NavigationDiscipline, Resource, Studio } from '@/types/api'

/**
 * Site-wide content used by the header and footer: the work menus and the studio profile.
 * Loaded once per locale.
 */
export const useSiteStore = defineStore('site', () => {
  const navigation = ref<NavigationDiscipline[]>([])
  const studio = ref<Studio | null>(null)
  const loadedLocale = ref<Locale | null>(null)

  async function load(locale: Locale): Promise<void> {
    if (loadedLocale.value === locale) {
      return
    }

    loadedLocale.value = locale

    try {
      const [navigationResponse, studioResponse] = await Promise.all([
        apiGet<Resource<NavigationDiscipline[]>>('/navigation'),
        apiGet<Resource<Studio>>('/studio'),
      ])

      navigation.value = navigationResponse.data
      studio.value = studioResponse.data
    } catch {
      // The header and footer still render their static links; try again on the next locale change.
      loadedLocale.value = null
    }
  }

  const categoriesFor = computed(
    () =>
      (discipline: Discipline): Category[] =>
        navigation.value.find((item) => item.key === discipline)?.categories ?? [],
  )

  return { navigation, studio, load, categoriesFor }
})
