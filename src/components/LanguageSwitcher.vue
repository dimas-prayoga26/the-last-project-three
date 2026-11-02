<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { SUPPORTED_LOCALES, type Locale } from '@/i18n'

withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })

const route = useRoute()
const { t, locale } = useI18n()

function localizedRoute(target: Locale) {
  return { name: route.name, params: { ...route.params, locale: target }, query: route.query, hash: route.hash }
}
</script>

<template>
  <nav :aria-label="t('language.label')" class="flex items-center gap-2 text-sm">
    <template v-for="(target, position) in SUPPORTED_LOCALES" :key="target">
      <span v-if="position > 0" aria-hidden="true" :class="tone === 'dark' ? 'text-grey-dark' : 'text-grey-light'">/</span>
      <RouterLink
        :to="localizedRoute(target)"
        :hreflang="target"
        :lang="target"
        :aria-current="target === locale ? 'true' : undefined"
        :class="
          target === locale
            ? tone === 'dark'
              ? 'text-white'
              : 'text-black'
            : tone === 'dark'
              ? 'text-grey-medium hover:text-white'
              : 'text-grey-medium hover:text-black'
        "
      >
        {{ t(`language.${target}`) }}
      </RouterLink>
    </template>
  </nav>
</template>
