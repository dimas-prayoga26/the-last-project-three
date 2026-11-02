<script setup lang="ts">
import { platformLabel, socialHandle } from '@/lib/format'
import type { SocialLink } from '@/types/api'

withDefaults(
  defineProps<{
    links: SocialLink[]
    /** "label" shows the platform name, "handle" adds the account handle. */
    display?: 'label' | 'handle'
  }>(),
  { display: 'label' },
)
</script>

<template>
  <ul class="flex flex-col gap-1">
    <li v-for="link in links" :key="link.url">
      <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-underline">
        {{ platformLabel(link.platform) }}
        <span v-if="display === 'handle'" class="ml-1 text-grey-dark">{{ socialHandle(link) }}</span>
        <span aria-hidden="true" class="ml-1">↗</span>
      </a>
    </li>
  </ul>
</template>
