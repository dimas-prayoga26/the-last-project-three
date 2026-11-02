<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import MenuOverlay from '@/components/layout/MenuOverlay.vue'

const { t, locale } = useI18n()
const route = useRoute()

const menuOpen = ref(false)
const compact = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

function onScroll(): void {
  compact.value = window.scrollY > 24
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 border-b bg-white/95 backdrop-blur-sm transition-[height,border-color] duration-300"
    :class="compact ? 'h-14 border-black/10' : 'h-18 border-transparent'"
  >
    <div class="flex h-full items-center justify-between gap-unit px-page">
      <RouterLink :to="{ name: 'home', params: { locale } }" :aria-label="t('a11y.home')">
        <img
          src="/brand/tlp-logo-primary-black.svg"
          alt=""
          width="120"
          height="40"
          class="transition-[width,height] duration-300"
          :class="compact ? 'h-8 w-24' : 'h-10 w-30'"
        />
      </RouterLink>

      <div class="flex items-center gap-6">
        <LanguageSwitcher class="hidden sm:flex" />
        <button
          ref="menuButton"
          type="button"
          class="group flex items-center gap-3 text-[0.9375rem]"
          :aria-label="t('a11y.openMenu')"
          aria-haspopup="dialog"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <span>{{ t('nav.menu') }}</span>
          <!-- Four modules of the brand grid; two of them shrink on hover. -->
          <span class="grid size-5 grid-cols-2 gap-[3px]" aria-hidden="true">
            <span class="bg-black transition-transform duration-300" />
            <span class="bg-black transition-transform duration-300 group-hover:scale-50" />
            <span class="bg-black transition-transform duration-300 group-hover:scale-50" />
            <span class="bg-black transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  </header>

  <MenuOverlay v-model:open="menuOpen" @closed="menuButton?.focus()" />
</template>
