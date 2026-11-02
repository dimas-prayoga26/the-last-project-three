<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppImage from '@/components/ui/AppImage.vue'
import { aspectRatioOf } from '@/lib/media'
import type { GalleryImage } from '@/types/api'

defineProps<{ images: GalleryImage[] }>()
defineEmits<{ open: [index: number] }>()

const { t } = useI18n()

/** Width / height for the justified layout (4:3 when the size is unknown). */
function ratioOf(image: GalleryImage): number {
  return image.width && image.height ? image.width / image.height : 4 / 3
}
</script>

<template>
  <!-- Unmasked on purpose: the gallery shows each photograph whole, in its own proportions. -->
  <ul class="justified">
    <li v-for="(image, index) in images" :key="image.id" class="justified-item" :style="{ '--a': ratioOf(image) }">
      <button
        type="button"
        class="group relative block w-full cursor-zoom-in overflow-hidden"
        :aria-label="`${t('a11y.openImage', { number: index + 1 })}: ${image.work.title}`"
        @click="$emit('open', index)"
      >
        <AppImage
          :media="image"
          :alt="image.alt ?? image.work.title"
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          class="w-full [&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]"
          :style="{ aspectRatio: aspectRatioOf(image) }"
        />
        <span
          class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/60 to-transparent p-3 pt-10 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <span class="truncate">{{ image.work.title }}</span>
          <span v-if="image.work.year" class="shrink-0 tabular-nums">{{ image.work.year }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>
