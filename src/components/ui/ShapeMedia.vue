<script setup lang="ts">
import { computed } from 'vue'

import AppImage from '@/components/ui/AppImage.vue'
import { shapeStyle, type Shape } from '@/lib/shapes'
import type { Media } from '@/types/api'

const props = withDefaults(
  defineProps<{
    media: Media | null | undefined
    shape: Shape
    /**
     * "static" always shows the shape, "morph" turns the full image into the shape on hover,
     * "reveal" opens the shape up to the full image on hover. Hover needs a .group ancestor.
     */
    mode?: 'static' | 'morph' | 'reveal'
    alt?: string
    variant?: 'card' | 'full' | 'thumb'
    sizes?: string
    eager?: boolean
  }>(),
  { mode: 'static', alt: '', variant: 'full', sizes: '100vw', eager: false },
)

const MODE_CLASS = { static: 'shape', morph: 'shape-morph', reveal: 'shape-reveal' } as const

const modeClass = computed(() => MODE_CLASS[props.mode])
</script>

<template>
  <!-- Size it from outside: square shapes need a 1:1 box, the logomark a 3:1 box. -->
  <AppImage :media="media" :alt="alt" :variant="variant" :sizes="sizes" :eager="eager" :class="modeClass" :style="shapeStyle(shape)" />
</template>
