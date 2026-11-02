<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import type { Shape } from '@/lib/shapes'
import type { DesignerSummary } from '@/types/api'

withDefaults(
  defineProps<{
    designer: DesignerSummary
    /** The portrait sits in this brand shape and opens up on hover. */
    shape: Shape
    sizes?: string
  }>(),
  { sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw' },
)

const { t, locale } = useI18n()
</script>

<template>
  <article class="group">
    <RouterLink :to="{ name: 'designer', params: { locale, slug: designer.slug } }" class="flex flex-col gap-4 focus-visible:outline-offset-4">
      <ShapeMedia :media="designer.photo" :shape="shape" mode="reveal" variant="card" :alt="designer.name" :sizes="sizes" class="aspect-square [&_img]:object-top" />
      <div class="flex flex-col gap-0.5 border-t border-black/15 pt-3">
        <div class="flex flex-col lg:flex-row lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-3">
          <h3 class="text-lg leading-snug">{{ designer.name }}</h3>
          <span v-if="designer.projects_count" class="shrink-0 text-xs text-grey-dark tabular-nums">{{ t('common.works', designer.projects_count) }}</span>
        </div>
        <p v-if="designer.title" class="text-sm text-grey-dark">{{ designer.title }}</p>
        <p v-if="designer.location" class="mt-1.5 text-xs text-grey-dark">{{ designer.location }}</p>
      </div>
    </RouterLink>
  </article>
</template>
