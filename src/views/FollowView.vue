<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SocialLinks from '@/components/SocialLinks.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { platformLabel, socialHandle } from '@/lib/format'
import { shapeAt } from '@/lib/shapes'
import { useSiteStore } from '@/stores/site'
import type { DesignerSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const designersWithSocials = computed(() => (designers.data.value?.data ?? []).filter((designer) => designer.socials.length > 0))

useHead({
  title: () => t('follow.title'),
  meta: [{ name: 'description', content: () => t('follow.intro') }],
})
</script>

<template>
  <div>
    <PageHeader :eyebrow="t('nav.studio')" :title="t('follow.title')" :intro="t('follow.intro')" :shapes="['P-rot', 'T-up', 'T', 'L-rot']" />

    <div class="flex flex-col gap-20 px-page md:gap-28">
      <ul v-if="site.studio?.socials.length" class="grid grid-cols-1 gap-unit sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(link, index) in site.studio.socials" :key="link.url">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex aspect-square flex-col justify-between bg-grey-tint p-unit transition-colors hover:bg-black hover:text-white"
          >
            <span class="flex items-start justify-between">
              <ShapeGlyph :shape="shapeAt(index)" class="w-10" />
              <span aria-hidden="true" class="text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
            </span>
            <span class="flex flex-col gap-1">
              <span class="text-3xl md:text-4xl">{{ platformLabel(link.platform) }}</span>
              <span class="text-sm opacity-70">{{ socialHandle(link) }}</span>
            </span>
          </a>
        </li>
      </ul>

      <section v-if="designersWithSocials.length" class="flex flex-col gap-10">
        <SectionHeading :title="t('follow.designers')" />
        <ul class="grid grid-cols-1 gap-x-unit gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="designer in designersWithSocials" :key="designer.id" class="flex flex-col gap-2 border-t border-black/15 pt-3">
            <RouterLink :to="{ name: 'designer', params: { locale, slug: designer.slug } }" class="link-underline self-start text-lg">
              {{ designer.name }}
            </RouterLink>
            <SocialLinks :links="designer.socials" display="handle" class="text-sm" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
