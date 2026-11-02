<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import EventCard from '@/components/EventCard.vue'
import EventDate from '@/components/EventDate.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { shapeAt } from '@/lib/shapes'
import type { CommunityEvent, Paginated } from '@/types/api'

const { t, locale } = useI18n()

const upcoming = useAsyncData(() => apiGet<Paginated<CommunityEvent>>('/events', { when: 'upcoming', per_page: 24 }))

/* Past events load page by page. */
const past = ref<CommunityEvent[]>([])
const pastPage = ref(1)
const pastLastPage = ref(1)
const pastLoading = ref(true)

async function loadPast(targetPage: number): Promise<void> {
  pastLoading.value = true

  try {
    const response = await apiGet<Paginated<CommunityEvent>>('/events', { when: 'past', page: targetPage, per_page: 8 })

    past.value = targetPage === 1 ? response.data : [...past.value, ...response.data]
    pastPage.value = response.meta.current_page
    pastLastPage.value = response.meta.last_page
  } catch {
    // The past events are secondary: keep what is already shown.
  } finally {
    pastLoading.value = false
  }
}

watch(locale, () => loadPast(1), { immediate: true })

useHead({
  title: () => t('events.title'),
  meta: [{ name: 'description', content: () => t('events.intro') }],
})
</script>

<template>
  <div>
    <PageHeader :title="t('events.title')" :intro="t('events.intro')" :shapes="['T-up', 'L', 'P', 'T-left']" :rule="false" />

    <section class="flex flex-col gap-10 px-page md:gap-14">
      <SectionHeading index="01" :title="t('events.upcoming')" :intro="upcoming.data.value ? t('common.events', upcoming.data.value.meta.total) : null" />

      <ErrorState v-if="upcoming.error.value" @retry="upcoming.reload" />
      <div v-else-if="upcoming.loading.value && !upcoming.data.value" class="grid grid-cols-2 gap-unit lg:grid-cols-4" aria-hidden="true">
        <div class="aspect-square animate-pulse bg-grey-tint" />
        <div class="aspect-square animate-pulse bg-grey-tint" />
      </div>
      <p v-else-if="!upcoming.data.value?.data.length" class="max-w-xl text-lg text-grey-dark">{{ t('events.noUpcoming') }}</p>

      <ol v-else class="flex flex-col gap-unit">
        <li v-for="(event, index) in upcoming.data.value.data" :key="event.id" v-reveal>
          <article class="group grid grid-cols-2 gap-unit border-t border-black/15 pt-unit lg:grid-cols-4">
            <EventDate :event="event" />
            <ShapeMedia :media="event.cover" :shape="shapeAt(index * 3)" mode="reveal" variant="card" sizes="(min-width: 1024px) 25vw, 50vw" class="aspect-square" />
            <div class="col-span-2 flex flex-col gap-4">
              <p class="eyebrow">
                {{ t(`events.types.${event.type}`) }}<template v-if="event.venue || event.city"> · {{ [event.venue, event.city].filter(Boolean).join(', ') }}</template>
              </p>
              <h3 class="text-[clamp(2rem,3.5vw,3.25rem)] leading-tight">
                <RouterLink :to="{ name: 'event', params: { locale, slug: event.slug } }" class="link-underline">{{ event.title }}</RouterLink>
              </h3>
              <p v-if="event.summary" class="max-w-xl text-lg text-grey-dark">{{ event.summary }}</p>
              <div class="mt-auto flex flex-wrap gap-3 pt-2">
                <RouterLink :to="{ name: 'event', params: { locale, slug: event.slug } }" class="btn-outline">
                  {{ t('events.details') }} <span aria-hidden="true">→</span>
                </RouterLink>
                <a v-if="event.registration_url" :href="event.registration_url" target="_blank" rel="noopener noreferrer" class="btn-primary">
                  {{ t('events.register') }} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        </li>
      </ol>
    </section>

    <section v-if="past.length || pastLoading" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading index="02" :title="t('events.past')" />
      <div class="grid grid-cols-1 gap-x-unit gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <EventCard v-for="(event, index) in past" :key="event.id" v-reveal :event="event" :shape="shapeAt(index + 1)" />
      </div>
      <p v-if="pastLoading" class="text-sm text-grey-dark" aria-live="polite">{{ t('common.loading') }}</p>
      <div v-else-if="pastPage < pastLastPage" class="flex justify-center">
        <button type="button" class="btn-outline" @click="loadPast(pastPage + 1)">{{ t('common.loadMore') }}</button>
      </div>
    </section>
  </div>
</template>
