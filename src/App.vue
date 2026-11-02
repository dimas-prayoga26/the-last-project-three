<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { initSmoothScroll } from '@/composables/useSmoothScroll'
import { isLocale } from '@/i18n'
import { useSiteStore } from '@/stores/site'

const appName = import.meta.env.VITE_APP_NAME
const { t, locale } = useI18n()
const site = useSiteStore()

watch(
  locale,
  (value) => {
    if (isLocale(value)) {
      void site.load(value)
    }
  },
  { immediate: true },
)

onMounted(initSmoothScroll)

useHead({
  titleTemplate: (title) => (title ? `${title} — ${appName}` : appName),
  htmlAttrs: { lang: locale },
  meta: [{ name: 'description', content: () => t('meta.description') }],
})
</script>

<template>
  <a href="#content" class="sr-only z-[70] bg-black px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
    {{ t('a11y.skipToContent') }}
  </a>
  <AppHeader />
  <main id="content" class="min-h-svh pt-18">
    <RouterView v-slot="{ Component, route: viewRoute }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="viewRoute.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
