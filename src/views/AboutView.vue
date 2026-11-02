<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/ui/PageHeader.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import { shapeAt } from '@/lib/shapes'
import { useSiteStore } from '@/stores/site'
import type { CommunityEvent, DesignerSummary, Paginated, ProjectSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const projects = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { per_page: 1 }))
const events = useAsyncData(() => apiGet<Paginated<CommunityEvent>>('/events', { per_page: 1 }))

const studio = computed(() => site.studio)
const facts = computed(() => [
  { label: t('about.designers'), value: designers.data.value?.data.length ?? null },
  { label: t('about.works'), value: projects.data.value?.meta.total ?? null },
  { label: t('about.disciplines'), value: site.navigation.length || null },
  { label: t('about.events'), value: events.data.value?.meta.total ?? null },
])

useHead({
  title: () => t('about.title'),
  meta: [{ name: 'description', content: () => studio.value?.intro ?? t('meta.description') }],
})
</script>

<template>
  <div>
    <PageHeader :eyebrow="t('nav.studio')" :title="t('about.title')" :intro="studio?.intro" />

    <!-- Bento: image, statement and two links -->
    <div class="grid grid-cols-1 gap-unit px-page sm:grid-cols-2 lg:grid-cols-4">
      <ShapeMedia
        :media="studio?.about.image"
        shape="T-up"
        alt="The Latest Project"
        eager
        sizes="(min-width: 1024px) 50vw, 100vw"
        class="aspect-square sm:col-span-2 lg:row-span-2"
      />
      <div class="flex min-h-64 flex-col justify-between gap-8 bg-black p-unit text-white sm:col-span-2 lg:p-8">
        <p class="text-sm text-white/70">The Latest Project</p>
        <p v-if="studio?.about.heading" class="text-[clamp(1.75rem,2.8vw,2.75rem)] leading-tight">{{ studio.about.heading }}</p>
      </div>
      <RouterLink :to="{ name: 'designers', params: { locale } }" class="group flex aspect-square flex-col justify-between bg-grey-tint p-unit">
        <ShapeGlyph shape="P" class="w-10 transition-transform duration-500 group-hover:rotate-90" />
        <span class="text-2xl leading-tight md:text-3xl">{{ t('about.meetDesigners') }}&nbsp;<span aria-hidden="true">→</span></span>
      </RouterLink>
      <RouterLink
        :to="{ name: 'contact', params: { locale } }"
        class="group flex aspect-square flex-col justify-between border border-black p-unit transition-colors hover:bg-black hover:text-white"
      >
        <ShapeGlyph shape="L" class="w-10 transition-transform duration-500 group-hover:-rotate-90" />
        <span class="text-2xl leading-tight md:text-3xl">{{ t('studio.contact') }}&nbsp;<span aria-hidden="true">→</span></span>
      </RouterLink>
    </div>

    <section v-if="studio?.about.body" class="grid grid-cols-1 gap-unit px-page pt-20 md:pt-28 lg:grid-cols-4">
      <p class="eyebrow self-start">{{ t('about.title') }}</p>
      <div class="prose-body text-lg lg:col-span-2 lg:text-xl">
        <p v-for="(paragraph, position) in paragraphs(studio.about.body)" :key="position">{{ paragraph }}</p>
      </div>
    </section>

    <section class="px-page pt-20 md:pt-28">
      <dl class="grid grid-cols-2 gap-unit lg:grid-cols-4">
        <div v-for="(fact, index) in facts" :key="fact.label" class="flex aspect-square flex-col-reverse justify-between bg-grey-tint p-unit">
          <dt class="text-sm text-grey-dark">{{ fact.label }}</dt>
          <dd class="flex items-start justify-between gap-4">
            <span class="text-[clamp(3rem,6vw,6rem)] leading-none tabular-nums">{{ fact.value ?? '–' }}</span>
            <ShapeGlyph :shape="shapeAt(index)" class="w-6 md:w-8" />
          </dd>
        </div>
      </dl>
    </section>

    <section v-if="site.navigation.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :title="t('about.whatWeDo')" />
      <ul class="grid grid-cols-1 gap-unit md:grid-cols-3">
        <li v-for="(discipline, index) in site.navigation" :key="discipline.key" class="flex flex-col gap-6 border border-black/15 p-unit">
          <div class="flex items-start justify-between gap-4">
            <span class="text-sm text-grey-dark tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
            <ShapeGlyph :shape="shapeAt(index + 4)" class="w-10" />
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-3xl">{{ t(`nav.${discipline.key}`) }}</h3>
            <p class="text-sm text-grey-dark">{{ t('about.categories', discipline.categories.length) }}</p>
          </div>
          <ul class="flex flex-wrap gap-2">
            <li v-for="category in discipline.categories" :key="category.id">
              <RouterLink :to="{ name: 'works', params: { locale, discipline: discipline.key, category: category.slug } }" class="chip">
                {{ category.name }}
              </RouterLink>
            </li>
          </ul>
          <RouterLink :to="{ name: 'works', params: { locale, discipline: discipline.key } }" class="link-underline mt-auto self-start text-sm">
            {{ t('works.allIn', { discipline: t(`nav.${discipline.key}`) }) }} <span aria-hidden="true">→</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
