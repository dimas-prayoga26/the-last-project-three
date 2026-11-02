<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ProjectGrid from '@/components/ProjectGrid.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { DISCIPLINES } from '@/composables/useMainMenu'
import { apiGet } from '@/lib/api'
import { useSiteStore } from '@/stores/site'
import type { Discipline, Paginated, ProjectSummary } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const PER_PAGE = 24
const DENSITY_KEY = 'tlp-works-columns'

const { t, locale } = useI18n()
const route = useRoute()
const site = useSiteStore()

const discipline = computed(() => route.params.discipline as Discipline)
const categorySlug = computed(() => (typeof route.params.category === 'string' ? route.params.category : null))
const categories = computed(() => site.categoriesFor(discipline.value))
const category = computed(() => categories.value.find((item) => item.slug === categorySlug.value) ?? null)
const unknownCategory = computed(() => categorySlug.value !== null && categories.value.length > 0 && category.value === null)

const projects = ref<ProjectSummary[]>([])
const total = ref(0)
const page = ref(1)
const lastPage = ref(1)
const loading = ref(true)
const failed = ref(false)
let latestRequest = 0

async function load(targetPage: number): Promise<void> {
  const request = ++latestRequest
  loading.value = true
  failed.value = false

  try {
    const response = await apiGet<Paginated<ProjectSummary>>('/projects', {
      discipline: discipline.value,
      category: categorySlug.value,
      page: targetPage,
      per_page: PER_PAGE,
    })

    if (request !== latestRequest) {
      return
    }

    projects.value = targetPage === 1 ? response.data : [...projects.value, ...response.data]
    total.value = response.meta.total
    page.value = response.meta.current_page
    lastPage.value = response.meta.last_page
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

watch([discipline, categorySlug, locale], () => load(1), { immediate: true })

/** Grid density, remembered per browser. */
function storedColumns(): 3 | 4 {
  try {
    return window.localStorage.getItem(DENSITY_KEY) === '3' ? 3 : 4
  } catch {
    return 4
  }
}

const columns = ref<3 | 4>(storedColumns())

watch(columns, (value) => {
  try {
    window.localStorage.setItem(DENSITY_KEY, String(value))
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
})

const title = computed(() => t(`nav.${discipline.value}`))

useHead({
  title: () => (category.value ? `${category.value.name} — ${title.value}` : title.value),
})
</script>

<template>
  <NotFoundView v-if="unknownCategory" />
  <div v-else>
    <PageHeader :eyebrow="category ? title : t('works.eyebrow')" :title="category?.name ?? title" :intro="t('works.intro')">
      <nav :aria-label="t('works.eyebrow')" class="flex flex-wrap gap-x-6 gap-y-2 text-lg">
        <RouterLink
          v-for="item in DISCIPLINES"
          :key="item"
          :to="{ name: 'works', params: { locale, discipline: item } }"
          class="menu-link"
          :class="item === discipline ? 'is-active' : 'text-grey-dark'"
          :aria-current="item === discipline ? 'page' : undefined"
        >
          {{ t(`nav.${item}`) }}
        </RouterLink>
      </nav>
    </PageHeader>

    <!-- Sticky filter bar: categories, result count and grid density -->
    <div class="sticky top-14 z-30 border-b border-black/10 bg-white/95 backdrop-blur-sm">
      <div class="flex items-center gap-unit px-page py-3">
        <nav v-if="categories.length" :aria-label="title" class="no-scrollbar -my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
          <RouterLink
            :to="{ name: 'works', params: { locale, discipline } }"
            class="chip"
            :aria-current="categorySlug === null ? 'page' : undefined"
          >
            {{ t('common.all') }}
          </RouterLink>
          <RouterLink
            v-for="item in categories"
            :key="item.id"
            :to="{ name: 'works', params: { locale, discipline, category: item.slug } }"
            class="chip"
            :aria-current="item.slug === categorySlug ? 'page' : undefined"
          >
            {{ item.name }}
          </RouterLink>
        </nav>
        <div v-else class="flex-1" />

        <p class="hidden shrink-0 text-sm text-grey-dark sm:block" aria-live="polite">{{ loading && !total ? '' : t('common.works', total) }}</p>

        <div class="hidden shrink-0 items-center gap-2 lg:flex" role="group" :aria-label="t('works.density')">
          <button
            v-for="option in [3, 4] as const"
            :key="option"
            type="button"
            class="chip w-10 justify-center px-0"
            :aria-pressed="columns === option"
            :aria-label="t('works.columns', { count: option })"
            @click="columns = option"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <ErrorState v-if="failed && projects.length === 0" @retry="load(1)" />
    <div v-else class="flex flex-col gap-16 px-page pt-10 md:pt-14">
      <ProjectGrid :projects="projects" :loading="loading" :placeholders="projects.length ? columns : columns * 2" :columns="columns" />
      <p v-if="!loading && projects.length === 0" class="text-center text-grey-dark">{{ t('works.empty') }}</p>
      <div v-if="page < lastPage" class="flex justify-center">
        <button type="button" class="btn-outline" :disabled="loading" @click="load(page + 1)">
          {{ loading ? t('common.loading') : t('common.loadMore') }}
        </button>
      </div>
    </div>
  </div>
</template>
