import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, type RouteLocationRaw } from 'vue-router'

import { useSiteStore } from '@/stores/site'
import type { Discipline, Media } from '@/types/api'

export interface MenuChild {
  key: string
  label: string
  to: RouteLocationRaw
  preview: Media | null
}

export interface MenuItem {
  key: string
  label: string
  to: RouteLocationRaw
  children: MenuChild[]
  active: boolean
  /** Image shown next to the menu while the item is hovered (null: the overlay picks one). */
  preview: Media | null
}

export const DISCIPLINES: Discipline[] = ['architecture', 'interior', 'design']
const STUDIO_PAGES = ['about', 'contact', 'follow'] as const

/**
 * The full-screen menu: the three disciplines with their categories, Designers, Events, Press and Studio.
 */
export function useMainMenu(): ComputedRef<MenuItem[]> {
  const { t, locale } = useI18n()
  const route = useRoute()
  const site = useSiteStore()

  return computed(() => {
    const disciplineItems = DISCIPLINES.map((discipline): MenuItem => {
      const children = site.categoriesFor(discipline).map((category) => ({
        key: `${discipline}-${category.slug}`,
        label: category.name,
        to: { name: 'works', params: { locale: locale.value, discipline, category: category.slug } },
        preview: category.preview ?? null,
      }))

      return {
        key: discipline,
        label: t(`nav.${discipline}`),
        to: { name: 'works', params: { locale: locale.value, discipline } },
        active: route.name === 'works' && route.params.discipline === discipline,
        children,
        preview: children.find((child) => child.preview)?.preview ?? null,
      }
    })

    const page = (key: 'designers' | 'events' | 'press', routeNames: string[]): MenuItem => ({
      key,
      label: t(`nav.${key}`),
      to: { name: key, params: { locale: locale.value } },
      active: routeNames.includes(String(route.name)),
      children: [],
      preview: null,
    })

    const studioItem: MenuItem = {
      key: 'studio',
      label: t('nav.studio'),
      to: { name: 'about', params: { locale: locale.value } },
      active: (STUDIO_PAGES as readonly unknown[]).includes(route.name),
      children: STUDIO_PAGES.map((studioPage) => ({
        key: `studio-${studioPage}`,
        label: t(`studio.${studioPage}`),
        to: { name: studioPage, params: { locale: locale.value } },
        preview: site.studio?.about.image ?? null,
      })),
      preview: site.studio?.about.image ?? null,
    }

    return [
      ...disciplineItems,
      page('designers', ['designers', 'designer']),
      page('events', ['events', 'event']),
      page('press', ['press']),
      studioItem,
    ]
  })
}
