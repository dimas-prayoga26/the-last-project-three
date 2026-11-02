import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

import { i18n } from '@/i18n'
import { apiGet } from '@/lib/api'
import type { Discipline, GalleryImage, Paginated } from '@/types/api'

const PER_PAGE = 24

export interface DesignerGallery {
  /** Active filters (null: everything). */
  discipline: Ref<Discipline | null>
  work: Ref<string | null>
  images: ShallowRef<GalleryImage[]>
  /** Number of images matching the filters. */
  total: Ref<number>
  /** Number of images without filters, for the designer's facts. */
  allTotal: Ref<number | null>
  page: Ref<number>
  lastPage: Ref<number>
  loading: Ref<boolean>
  failed: Ref<boolean>
  load: (targetPage: number) => Promise<void>
}

/**
 * Every image of a designer's works (/designers/{slug}/gallery), page by page.
 * Loads again from page 1 when the designer, a filter or the language changes;
 * responses that arrive after a newer request started are ignored.
 */
export function useDesignerGallery(slug: Ref<string>): DesignerGallery {
  const discipline = ref<Discipline | null>(null)
  const work = ref<string | null>(null)
  const images = shallowRef<GalleryImage[]>([])
  const total = ref(0)
  const allTotal = ref<number | null>(null)
  const page = ref(1)
  const lastPage = ref(1)
  const loading = ref(true)
  const failed = ref(false)
  let latestRequest = 0

  async function load(targetPage: number): Promise<void> {
    const request = ++latestRequest
    const unfiltered = discipline.value === null && work.value === null
    loading.value = true
    failed.value = false

    try {
      const response = await apiGet<Paginated<GalleryImage>>(`/designers/${slug.value}/gallery`, {
        discipline: discipline.value,
        work: work.value,
        page: targetPage,
        per_page: PER_PAGE,
      })

      if (request !== latestRequest) {
        return
      }

      images.value = targetPage === 1 ? response.data : [...images.value, ...response.data]
      total.value = response.meta.total
      page.value = response.meta.current_page
      lastPage.value = response.meta.last_page

      if (unfiltered) {
        allTotal.value = response.meta.total
      }
    } catch {
      if (request === latestRequest) {
        failed.value = true
      }
    } finally {
      if (request === latestRequest) {
        loading.value = false
      }
    }
  }

  // Declared first so a new designer starts unfiltered before the load below runs.
  watch(slug, () => {
    discipline.value = null
    work.value = null
    allTotal.value = null
  })

  watch([slug, discipline, work, () => i18n.global.locale.value], () => load(1), { immediate: true })

  return { discipline, work, images, total, allTotal, page, lastPage, loading, failed, load }
}
