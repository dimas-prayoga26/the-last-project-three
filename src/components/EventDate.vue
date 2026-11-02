<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { eventDateParts } from '@/lib/format'
import type { CommunityEvent } from '@/types/api'

const props = defineProps<{
  event: Pick<CommunityEvent, 'starts_at' | 'ends_at' | 'is_past'>
}>()

const { locale } = useI18n()

const parts = computed(() => eventDateParts(props.event.starts_at, props.event.ends_at, locale.value))
</script>

<template>
  <!-- Square date module: weekday on top, the day large, month and time below. -->
  <div class="flex aspect-square flex-col justify-between p-unit" :class="event.is_past ? 'bg-white outline outline-1 -outline-offset-1 outline-black/15' : 'bg-grey-tint'">
    <p class="text-sm">{{ parts.weekday }}</p>
    <p class="text-[clamp(3.5rem,7vw,6.5rem)] leading-none tabular-nums">{{ parts.day }}</p>
    <p class="flex flex-col text-sm">
      <span>{{ parts.month }} {{ parts.year }}</span>
      <span class="text-grey-dark tabular-nums">{{ parts.time }}</span>
    </p>
  </div>
</template>
