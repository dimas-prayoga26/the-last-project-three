<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import { SQUARE_SHAPES } from '@/lib/shapes'

const { t, locale } = useI18n()

useHead({
  title: () => t('notFound.title'),
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <section class="grid min-h-[70svh] grid-cols-1 items-center gap-unit px-page py-16 lg:grid-cols-2">
    <div class="flex flex-col items-start gap-6">
      <p class="eyebrow">404</p>
      <h1 class="text-[clamp(3rem,8vw,7rem)] leading-none font-normal">{{ t('notFound.title') }}</h1>
      <p class="text-lg text-grey-dark">{{ t('notFound.text') }}</p>
      <RouterLink :to="{ name: 'home', params: { locale } }" class="btn-primary">← {{ t('notFound.backHome') }}</RouterLink>
    </div>
    <!-- The brand shapes, one module out of place. -->
    <div class="grid grid-cols-4 gap-unit text-black" aria-hidden="true">
      <ShapeGlyph
        v-for="(shape, index) in SQUARE_SHAPES"
        :key="shape"
        :shape="shape"
        :class="{ 'translate-x-1/3 rotate-12 text-grey-light': index === 5 }"
      />
    </div>
  </section>
</template>
