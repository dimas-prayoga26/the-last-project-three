<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import DesignerCard from '@/components/DesignerCard.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { shapeAt } from '@/lib/shapes'
import type { DesignerSummary, Resource } from '@/types/api'

const { t } = useI18n()

const { data, error, loading, reload } = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))

useHead({
  title: () => t('designers.title'),
  meta: [{ name: 'description', content: () => t('designers.intro') }],
})
</script>

<template>
  <div>
    <PageHeader :title="t('designers.title')" :intro="t('designers.intro')" :shapes="['L-rot', 'T', 'T-up', 'P']">
      <p v-if="data" class="text-sm text-grey-dark">{{ t('common.designers', data.data.length) }}</p>
    </PageHeader>

    <ErrorState v-if="error" @retry="reload" />
    <div v-else class="grid grid-cols-2 gap-x-unit gap-y-12 px-page md:grid-cols-3 lg:grid-cols-4">
      <DesignerCard v-for="(designer, index) in data?.data ?? []" :key="designer.id" v-reveal :designer="designer" :shape="shapeAt(index)" />
      <template v-if="loading && !data">
        <div v-for="index in 8" :key="index" class="flex flex-col gap-4" aria-hidden="true">
          <div class="aspect-square animate-pulse bg-grey-tint" />
          <div class="h-4 w-2/3 animate-pulse bg-grey-tint" />
        </div>
      </template>
    </div>
  </div>
</template>
