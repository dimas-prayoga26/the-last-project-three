<script setup lang="ts">
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import type { Shape } from '@/lib/shapes'

withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    intro?: string | null
    /** The four brand shapes drawn next to the title. */
    shapes?: [Shape, Shape, Shape, Shape]
    /** Bottom rule; off when the page opens with a SectionHeading, which brings its own. */
    rule?: boolean
  }>(),
  { eyebrow: undefined, intro: null, shapes: () => ['T', 'P-rot', 'L-rot', 'T-up'], rule: true },
)
</script>

<template>
  <header class="px-page pt-10 pb-10 md:pt-16 md:pb-14">
    <div class="grid grid-cols-4 items-end gap-unit" :class="{ 'border-b border-black pb-8 md:pb-10': rule }">
      <div class="col-span-4 flex min-w-0 flex-col gap-5 lg:col-span-3">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h1 class="text-[clamp(3rem,8vw,8.5rem)] leading-[0.95] font-normal break-words hyphens-auto">{{ title }}</h1>
        <p v-if="intro" class="max-w-2xl text-lg leading-snug text-grey-dark md:text-xl">{{ intro }}</p>
        <slot />
      </div>
      <div class="hidden grid-cols-2 gap-2 justify-self-end lg:grid lg:w-28 xl:w-36" aria-hidden="true">
        <ShapeGlyph v-for="shape in shapes" :key="shape" :shape="shape" />
      </div>
    </div>
  </header>
</template>
