<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { lockScroll } from '@/composables/useSmoothScroll'
import type { Media } from '@/types/api'

const props = defineProps<{
  images: Media[]
  title: string
  /** Total number of images when only some of them are loaded yet (paginated galleries). */
  total?: number
}>()

/** Index of the open image, or null when closed. */
const index = defineModel<number | null>({ default: null })

const { t } = useI18n()
const dialog = ref<HTMLElement | null>(null)
let returnFocusTo: HTMLElement | null = null

const current = computed(() => (index.value === null ? null : (props.images[index.value] ?? null)))

function close(): void {
  index.value = null
}

function step(direction: 1 | -1): void {
  if (index.value === null || props.images.length === 0) {
    return
  }

  index.value = (index.value + direction + props.images.length) % props.images.length
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    close()
  } else if (event.key === 'ArrowRight') {
    step(1)
  } else if (event.key === 'ArrowLeft') {
    step(-1)
  }
}

watch(
  () => index.value !== null,
  async (isOpen) => {
    lockScroll('lightbox', isOpen)

    if (isOpen) {
      returnFocusTo = document.activeElement as HTMLElement | null
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      dialog.value?.focus()
    } else {
      window.removeEventListener('keydown', onKeydown)
      returnFocusTo?.focus()
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  lockScroll('lightbox', false)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="current && index !== null"
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        class="fixed inset-0 z-[60] flex flex-col bg-black text-white outline-none"
      >
        <div class="flex items-center justify-between gap-unit px-unit py-4 text-small">
          <p aria-live="polite">{{ t('a11y.imageCount', { current: index + 1, total: total ?? images.length }) }}</p>
          <button type="button" class="link-underline" @click="close">{{ t('a11y.close') }}</button>
        </div>

        <div class="relative flex min-h-0 flex-1 items-center justify-center px-unit pb-unit">
          <img
            :key="current.id"
            :src="current.url"
            :alt="current.alt ?? title"
            class="max-h-full max-w-full object-contain"
          />
          <button
            v-if="images.length > 1"
            type="button"
            class="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
            :aria-label="t('a11y.previous')"
            @click="step(-1)"
          />
          <button
            v-if="images.length > 1"
            type="button"
            class="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
            :aria-label="t('a11y.next')"
            @click="step(1)"
          />
        </div>

        <!-- Optional caption for the open image, e.g. the work it belongs to. -->
        <div v-if="$slots.caption" class="flex flex-wrap items-center justify-between gap-x-unit gap-y-2 px-unit pb-4 text-small">
          <slot name="caption" :index="index" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
