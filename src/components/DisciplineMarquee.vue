<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import { DISCIPLINES } from '@/composables/useMainMenu'
import { shapeAt } from '@/lib/shapes'

const { t, locale } = useI18n()

/** The disciplines twice per copy, so one copy is always wider than the screen. */
const items = [...DISCIPLINES, ...DISCIPLINES]
</script>

<template>
  <!-- Two identical copies scroll by half the track width for a seamless loop; it pauses on hover and for reduced motion. -->
  <div class="marquee overflow-hidden border-y border-black py-4 md:py-6">
    <div class="marquee-track flex w-max">
      <ul v-for="copy in 2" :key="copy" class="flex shrink-0 items-center" :aria-hidden="copy === 2 ? 'true' : undefined">
        <li v-for="(discipline, index) in items" :key="`${copy}-${index}`" class="flex items-center">
          <RouterLink
            :to="{ name: 'works', params: { locale, discipline } }"
            :tabindex="copy === 2 || index >= DISCIPLINES.length ? -1 : undefined"
            class="px-6 text-[clamp(2.5rem,6vw,5.5rem)] leading-none transition-colors hover:text-grey-medium md:px-10"
          >
            {{ t(`nav.${discipline}`) }}
          </RouterLink>
          <ShapeGlyph :shape="shapeAt(index)" class="w-7 md:w-12" />
        </li>
      </ul>
    </div>
  </div>
</template>
