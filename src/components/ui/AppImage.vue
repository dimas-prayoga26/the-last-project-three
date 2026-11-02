<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { cardSrcsetOf, srcsetOf } from '@/lib/media'
import type { Media } from '@/types/api'

const props = withDefaults(
  defineProps<{
    media: Media | null | undefined
    alt?: string
    /** "card" uses the 4:5 crop, "full" the uncropped versions, "thumb" only the small one. */
    variant?: 'card' | 'full' | 'thumb'
    sizes?: string
    eager?: boolean
    fit?: 'cover' | 'contain'
  }>(),
  { alt: '', variant: 'full', sizes: '100vw', eager: false, fit: 'cover' },
)

const image = ref<HTMLImageElement | null>(null)
const loaded = ref(false)

const src = computed(() => {
  if (!props.media) {
    return null
  }

  if (props.variant === 'card') {
    return props.media.card ?? props.media.url
  }

  return props.variant === 'thumb' ? (props.media.thumb ?? props.media.url) : props.media.url
})

const srcset = computed(() => {
  if (!props.media || props.variant === 'thumb') {
    return undefined
  }

  return props.variant === 'card' ? cardSrcsetOf(props.media) : srcsetOf(props.media)
})

const dimensions = computed(() =>
  props.variant === 'card'
    ? { width: 800, height: 1000 }
    : { width: props.media?.width ?? undefined, height: props.media?.height ?? undefined },
)

watch(src, () => {
  loaded.value = false
})

onMounted(() => {
  // Cached images can finish before the load listener is attached.
  if (image.value?.complete && image.value.naturalWidth > 0) {
    loaded.value = true
  }
})
</script>

<template>
  <div class="relative overflow-hidden bg-grey-tint">
    <img
      v-if="src"
      ref="image"
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="media?.alt ?? alt"
      :width="dimensions.width"
      :height="dimensions.height"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      class="size-full transition-[opacity,transform] duration-700 ease-out"
      :class="[fit === 'cover' ? 'object-cover' : 'object-contain', loaded ? 'opacity-100' : 'opacity-0']"
      @load="loaded = true"
    />
  </div>
</template>
