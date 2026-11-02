<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import EventDate from '@/components/EventDate.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import type { Shape } from '@/lib/shapes'
import type { CommunityEvent } from '@/types/api'

defineProps<{
  event: CommunityEvent
  shape: Shape
}>()

const { t, locale } = useI18n()
</script>

<template>
  <article class="group">
    <RouterLink :to="{ name: 'event', params: { locale, slug: event.slug } }" class="flex flex-col gap-4 focus-visible:outline-offset-4">
      <div class="grid grid-cols-2 gap-unit">
        <EventDate :event="event" />
        <ShapeMedia :media="event.cover" :shape="shape" mode="reveal" variant="card" sizes="(min-width: 1024px) 17vw, 50vw" class="aspect-square" />
      </div>
      <div class="flex flex-col gap-1 border-t border-black/15 pt-3">
        <p class="eyebrow">
          {{ t(`events.types.${event.type}`) }}<template v-if="event.city"> · {{ event.city }}</template>
        </p>
        <h3 class="text-xl leading-snug">{{ event.title }}</h3>
        <p v-if="event.summary" class="line-clamp-2 text-sm text-grey-dark">{{ event.summary }}</p>
      </div>
    </RouterLink>
  </article>
</template>
