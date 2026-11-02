<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import { DISCIPLINES } from '@/composables/useMainMenu'
import { SQUARE_SHAPES } from '@/lib/shapes'
import { useSiteStore } from '@/stores/site'

const { t, locale } = useI18n()
const site = useSiteStore()
const year = new Date().getFullYear()

const collectiveLinks = [
  { name: 'designers', label: 'nav.designers' },
  { name: 'events', label: 'nav.events' },
  { name: 'press', label: 'nav.press' },
  { name: 'about', label: 'studio.about' },
  { name: 'contact', label: 'studio.contact' },
] as const
</script>

<template>
  <footer class="mt-24 bg-grey-tint px-page pt-14 pb-8 md:mt-32 md:pt-20">
    <div class="grid grid-cols-2 gap-x-unit gap-y-12 lg:grid-cols-4">
      <div class="col-span-2 flex flex-col gap-6 lg:col-span-1">
        <img src="/brand/tlp-logo-primary-black.svg" alt="The Latest Project" width="120" height="40" class="h-10 w-30" />
        <p v-if="site.studio?.intro" class="max-w-xs text-sm text-grey-dark">{{ site.studio.intro }}</p>
      </div>

      <nav :aria-label="t('a11y.footerNavigation')" class="col-span-2 grid grid-cols-2 gap-x-unit lg:col-span-2">
        <div class="flex flex-col gap-4">
          <h2 class="eyebrow text-black">{{ t('footer.works') }}</h2>
          <ul class="flex flex-col gap-1.5 text-lg">
            <li v-for="discipline in DISCIPLINES" :key="discipline">
              <RouterLink :to="{ name: 'works', params: { locale, discipline } }" class="link-underline">{{ t(`nav.${discipline}`) }}</RouterLink>
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="eyebrow text-black">{{ t('footer.collective') }}</h2>
          <ul class="flex flex-col gap-1.5 text-lg">
            <li v-for="link in collectiveLinks" :key="link.name">
              <RouterLink :to="{ name: link.name, params: { locale } }" class="link-underline">{{ t(link.label) }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="col-span-2 flex flex-col gap-4 lg:col-span-1">
        <h2 class="eyebrow text-black">
          <RouterLink :to="{ name: 'follow', params: { locale } }" class="link-underline">{{ t('footer.follow') }}</RouterLink>
        </h2>
        <SocialLinks v-if="site.studio?.socials.length" :links="site.studio.socials" class="text-lg" />
        <div class="mt-2 flex flex-col gap-1 text-sm text-grey-dark">
          <a v-if="site.studio?.contact.email" :href="`mailto:${site.studio.contact.email}`" class="link-underline self-start">
            {{ site.studio.contact.email }}
          </a>
          <a v-if="site.studio?.contact.phone" :href="`tel:${site.studio.contact.phone.replace(/\s+/g, '')}`" class="link-underline self-start">
            {{ site.studio.contact.phone }}
          </a>
        </div>
      </div>
    </div>

    <!-- The brand shapes as a quiet white strip on the tint panel. -->
    <div class="mt-16 grid grid-cols-4 gap-unit text-white md:mt-20 md:grid-cols-8" aria-hidden="true">
      <ShapeGlyph v-for="(shape, index) in SQUARE_SHAPES" :key="shape" :shape="shape" :class="{ 'hidden md:block': index >= 4 }" />
    </div>

    <div class="mt-8 flex flex-col gap-4 text-xs text-grey-dark sm:flex-row sm:items-center sm:justify-between">
      <p>© {{ year }} The Latest Project. {{ t('footer.rights') }}</p>
      <LanguageSwitcher />
    </div>
  </footer>
</template>
