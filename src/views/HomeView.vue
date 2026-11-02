<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import DesignerCard from '@/components/DesignerCard.vue'
import DisciplineMarquee from '@/components/DisciplineMarquee.vue'
import EventCard from '@/components/EventCard.vue'
import HeroMosaic from '@/components/HeroMosaic.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { DISCIPLINES } from '@/composables/useMainMenu'
import { apiGet } from '@/lib/api'
import { shapeAt } from '@/lib/shapes'
import { useSiteStore } from '@/stores/site'
import type { CommunityEvent, DesignerSummary, Discipline, Paginated, ProjectSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const featured = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { featured: true, per_page: 8 }))
const latest = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { per_page: 8 }))
const events = useAsyncData(() => apiGet<Paginated<CommunityEvent>>('/events', { per_page: 3 }))
const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))

/** Featured works first, then the latest ones, without duplicates. */
const mosaicProjects = computed(() => {
  const seen = new Set<number>()

  return [...(featured.data.value?.data ?? []), ...(latest.data.value?.data ?? [])].filter(
    (project) => project.cover && !seen.has(project.id) && seen.add(project.id),
  )
})

/* Filterable works: "all" or one discipline, fetched again on every switch. */
const filter = ref<Discipline | 'all'>('all')
const works = useAsyncData(
  () => apiGet<Paginated<ProjectSummary>>('/projects', { discipline: filter.value === 'all' ? null : filter.value, per_page: 8 }),
  [filter],
)

/* Designers carousel. */
const carousel = ref<HTMLElement | null>(null)

function scrollDesigners(direction: 1 | -1): void {
  carousel.value?.scrollBy({ left: direction * carousel.value.clientWidth * 0.75, behavior: 'smooth' })
}

const stats = computed(() => [
  { label: t('about.designers'), value: designers.data.value?.data.length ?? null, shape: 'T' as const },
  { label: t('about.works'), value: latest.data.value?.meta.total ?? null, shape: 'P-rot' as const },
  { label: t('about.disciplines'), value: site.navigation.length || null, shape: 'L-rot' as const },
  { label: t('about.events'), value: events.data.value?.meta.total ?? null, shape: 'T-up' as const },
])

useHead({ title: '' })
</script>

<template>
  <div>
    <HeroMosaic v-if="mosaicProjects.length" :projects="mosaicProjects" />
    <div v-else-if="featured.loading.value" class="px-page pt-4 md:pt-6" aria-hidden="true">
      <div class="h-[70svh] animate-pulse bg-grey-tint" />
    </div>

    <div class="mt-16 md:mt-24">
      <DisciplineMarquee />
    </div>

    <!-- Works, filterable by discipline -->
    <section id="works" class="flex scroll-mt-24 flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <div class="flex flex-col gap-6">
        <SectionHeading index="01" :title="t('home.works')" :intro="t('home.worksIntro')" />
        <div class="grid grid-cols-4 gap-unit">
          <div class="col-span-4 flex flex-wrap gap-2 sm:col-span-3 sm:col-start-2" role="group" :aria-label="t('home.filterLabel')">
            <button
              v-for="option in ['all', ...DISCIPLINES] as const"
              :key="option"
              type="button"
              class="chip"
              :aria-pressed="filter === option"
              @click="filter = option"
            >
              {{ option === 'all' ? t('common.all') : t(`nav.${option}`) }}
            </button>
          </div>
        </div>
      </div>

      <div class="transition-opacity duration-300" :class="{ 'opacity-40': works.loading.value && works.data.value }" :aria-busy="works.loading.value">
        <ProjectGrid :projects="works.data.value?.data ?? []" :loading="works.loading.value && !works.data.value" :placeholders="8" />
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <template v-if="filter === 'all'">
          <RouterLink v-for="discipline in DISCIPLINES" :key="discipline" :to="{ name: 'works', params: { locale, discipline } }" class="btn-outline">
            {{ t(`nav.${discipline}`) }} <span aria-hidden="true">→</span>
          </RouterLink>
        </template>
        <RouterLink v-else :to="{ name: 'works', params: { locale, discipline: filter } }" class="btn-primary">
          {{ t('works.allIn', { discipline: t(`nav.${filter}`) }) }} <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <!-- Upcoming events -->
    <section v-if="events.data.value?.data.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading index="02" :title="t('home.upcomingEvents')" :link="{ name: 'events', params: { locale } }" :link-label="t('home.allEvents')" />
      <div class="grid grid-cols-1 gap-x-unit gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <EventCard v-for="(event, index) in events.data.value.data" :key="event.id" v-reveal :event="event" :shape="shapeAt(index + 3)" />
      </div>
    </section>

    <!-- Designers carousel -->
    <section v-if="designers.data.value?.data.length" class="flex flex-col gap-10 pt-20 md:gap-14 md:pt-28">
      <div class="px-page">
        <SectionHeading
          :index="events.data.value?.data.length ? '03' : '02'"
          :title="t('home.designers')"
          :intro="t('home.designersIntro')"
          :link="{ name: 'designers', params: { locale } }"
          :link-label="t('home.allDesigners')"
        >
          <button type="button" class="icon-button" :aria-label="t('a11y.previous')" @click="scrollDesigners(-1)">←</button>
          <button type="button" class="icon-button" :aria-label="t('a11y.next')" @click="scrollDesigners(1)">→</button>
        </SectionHeading>
      </div>

      <div
        ref="carousel"
        class="no-scrollbar flex snap-x snap-mandatory scroll-px-(--spacing-page) gap-unit overflow-x-auto px-page"
        tabindex="0"
        :aria-label="t('a11y.scrollDesigners')"
      >
        <DesignerCard
          v-for="(designer, index) in designers.data.value.data"
          :key="designer.id"
          :designer="designer"
          :shape="shapeAt(index + 1)"
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 70vw"
          class="w-[70vw] shrink-0 snap-start sm:w-[40vw] lg:w-[calc((100vw-2*var(--spacing-page)-3*var(--tlp-unit))/4.4)]"
        />
      </div>
    </section>

    <!-- The collective in numbers -->
    <section class="mt-20 bg-grey-tint px-page py-16 md:mt-28 md:py-24">
      <div class="grid grid-cols-1 gap-unit lg:grid-cols-4">
        <div class="flex flex-col justify-between gap-8 lg:col-span-2 lg:pr-12">
          <div class="flex flex-col gap-6">
            <p class="eyebrow">{{ t('home.collective') }}</p>
            <p class="text-[clamp(1.75rem,3vw,2.75rem)] leading-tight">{{ site.studio?.about.heading ?? t('meta.description') }}</p>
          </div>
          <RouterLink :to="{ name: 'about', params: { locale } }" class="btn-primary self-start">
            {{ t('home.aboutLink') }} <span aria-hidden="true">→</span>
          </RouterLink>
        </div>

        <dl class="grid grid-cols-2 gap-unit lg:col-span-2">
          <div v-for="stat in stats" :key="stat.label" class="flex aspect-square flex-col-reverse justify-between bg-white p-unit">
            <dt class="text-sm text-grey-dark">{{ stat.label }}</dt>
            <dd class="flex items-start justify-between gap-4">
              <span class="text-[clamp(3rem,6vw,5.5rem)] leading-none tabular-nums">{{ stat.value ?? '–' }}</span>
              <ShapeGlyph :shape="stat.shape" class="w-6 md:w-8" />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>
