<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import EventCard from '@/components/EventCard.vue'
import EventDate from '@/components/EventDate.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ApiError, apiGet } from '@/lib/api'
import { eventDateParts, paragraphs } from '@/lib/format'
import { shapeAt } from '@/lib/shapes'
import type { CommunityEvent, Paginated, Resource } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error, loading, reload } = useAsyncData(() => apiGet<Resource<CommunityEvent>>(`/events/${slug.value}`), [slug])
const upcoming = useAsyncData(() => apiGet<Paginated<CommunityEvent>>('/events', { per_page: 4 }))

const event = computed(() => data.value?.data ?? null)
const notFound = computed(() => error.value instanceof ApiError && error.value.status === 404)
const more = computed(() => (upcoming.data.value?.data ?? []).filter((item) => item.id !== event.value?.id).slice(0, 3))

const facts = computed(() => {
  if (!event.value) {
    return []
  }

  const parts = eventDateParts(event.value.starts_at, event.value.ends_at, locale.value)

  return [
    { label: t('events.date'), value: `${parts.weekday}, ${parts.date}` },
    { label: t('events.time'), value: parts.time },
    { label: t('events.venue'), value: event.value.venue },
    { label: t('events.city'), value: event.value.city },
    { label: t('events.type'), value: t(`events.types.${event.value.type}`) },
  ].filter((fact) => fact.value)
})

useHead({
  title: () => event.value?.title ?? '',
  meta: [
    { name: 'description', content: () => event.value?.summary ?? t('events.intro') },
    { property: 'og:title', content: () => event.value?.title ?? '' },
    { property: 'og:image', content: () => event.value?.cover?.url ?? '/brand/tlp-og-default-1200x630.png' },
  ],
})
</script>

<template>
  <NotFoundView v-if="notFound" />
  <ErrorState v-else-if="error" @retry="reload" />

  <div v-else-if="loading && !event" class="flex flex-col gap-unit px-page pt-10" aria-busy="true">
    <div class="h-16 w-2/3 animate-pulse bg-grey-tint" />
    <div class="aspect-[3/1] animate-pulse bg-grey-tint" />
  </div>

  <article v-else-if="event">
    <header class="grid grid-cols-2 items-end gap-unit px-page pt-8 md:pt-12 lg:grid-cols-4">
      <EventDate :event="event" />
      <div class="col-span-2 flex flex-col gap-5 lg:col-span-3">
        <RouterLink :to="{ name: 'events', params: { locale } }" class="eyebrow link-underline self-start">{{ t('events.back') }}</RouterLink>
        <h1 class="text-[clamp(2.75rem,6vw,6rem)] leading-none font-normal">{{ event.title }}</h1>
        <p v-if="event.summary" class="max-w-2xl text-xl leading-snug text-grey-dark">{{ event.summary }}</p>
      </div>
    </header>

    <!-- The cover inside the brand logomark (3:1). -->
    <div class="px-page pt-unit">
      <ShapeMedia :media="event.cover" shape="logomark" :alt="event.title" eager sizes="100vw" class="aspect-[3/1]" />
    </div>

    <div class="grid grid-cols-1 gap-x-unit gap-y-12 px-page pt-14 md:pt-20 lg:grid-cols-4">
      <aside class="flex flex-col gap-6">
        <dl class="flex flex-col border-t border-black">
          <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-1 border-b border-black/15 py-3">
            <dt class="text-xs text-grey-dark">{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
        <p v-if="event.is_past" class="bg-grey-tint p-unit text-sm">{{ t('events.ended') }}</p>
        <a v-else-if="event.registration_url" :href="event.registration_url" target="_blank" rel="noopener noreferrer" class="btn-primary self-start">
          {{ t('events.register') }} <span aria-hidden="true">↗</span>
        </a>
      </aside>

      <div v-if="event.description" class="prose-body text-lg lg:col-span-2 lg:text-xl">
        <p v-for="(paragraph, position) in paragraphs(event.description)" :key="position">{{ paragraph }}</p>
      </div>
    </div>

    <section v-if="more.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :title="t('events.more')" :link="{ name: 'events', params: { locale } }" :link-label="t('home.allEvents')" />
      <div class="grid grid-cols-1 gap-x-unit gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <EventCard v-for="(item, index) in more" :key="item.id" :event="item" :shape="shapeAt(index + 2)" />
      </div>
    </section>
  </article>
</template>
