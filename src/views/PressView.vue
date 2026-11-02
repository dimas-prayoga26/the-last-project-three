<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { apiGet } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { shapeAt } from '@/lib/shapes'
import type { Paginated, PressItem } from '@/types/api'

const { t, locale } = useI18n()

const items = ref<PressItem[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(true)
const failed = ref(false)

async function load(targetPage: number): Promise<void> {
  loading.value = true
  failed.value = false

  try {
    const response = await apiGet<Paginated<PressItem>>('/press', { page: targetPage, per_page: 12 })

    items.value = targetPage === 1 ? response.data : [...items.value, ...response.data]
    page.value = response.meta.current_page
    lastPage.value = response.meta.last_page
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

watch(locale, () => load(1), { immediate: true })

const isEmpty = computed(() => !loading.value && !failed.value && items.value.length === 0)

useHead({
  title: () => t('press.title'),
  meta: [{ name: 'description', content: () => t('press.intro') }],
})
</script>

<template>
  <div>
    <PageHeader :title="t('press.title')" :intro="t('press.intro')" :shapes="['P', 'T-left', 'T-right', 'L']" />

    <ErrorState v-if="failed && items.length === 0" @retry="load(1)" />
    <p v-else-if="isEmpty" class="px-page text-grey-dark">{{ t('press.empty') }}</p>

    <ol v-else class="flex flex-col px-page">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        v-reveal
        class="group grid grid-cols-[6rem_1fr] gap-x-unit gap-y-4 border-t border-black/15 py-unit sm:grid-cols-[10rem_1fr] lg:grid-cols-4"
      >
        <ShapeMedia :media="item.image" :shape="shapeAt(index)" mode="reveal" variant="thumb" class="aspect-square lg:w-2/3" />
        <div class="flex flex-col gap-2 lg:col-span-2">
          <p class="eyebrow">{{ item.publication }} · {{ formatDate(item.published_on, locale) }}</p>
          <h2 class="text-2xl leading-snug md:text-3xl">{{ item.title }}</h2>
          <p v-if="item.excerpt" class="max-w-[60ch] text-base text-grey-dark">{{ item.excerpt }}</p>
        </div>
        <div class="col-start-2 flex flex-wrap items-start gap-3 lg:col-start-4 lg:justify-end">
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" class="btn-outline py-2.5 text-sm">
            {{ t('press.readArticle') }} <span aria-hidden="true">↗</span>
          </a>
          <a v-if="item.document_url" :href="item.document_url" target="_blank" rel="noopener noreferrer" class="btn-outline py-2.5 text-sm">
            {{ t('press.downloadPdf') }} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </li>
    </ol>

    <p v-if="loading" class="px-page pt-12 text-sm text-grey-dark" aria-live="polite">{{ t('common.loading') }}</p>
    <div v-else-if="page < lastPage" class="flex justify-center pt-16">
      <button type="button" class="btn-outline" @click="load(page + 1)">{{ t('common.loadMore') }}</button>
    </div>
  </div>
</template>
