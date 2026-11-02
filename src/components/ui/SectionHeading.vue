<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  title: string
  /** Running number such as "01", set in the first grid column. */
  index?: string
  intro?: string | null
  link?: RouteLocationRaw
  linkLabel?: string
  /** Heading level, for sections nested under another heading. */
  level?: 'h2' | 'h3'
}>()
</script>

<template>
  <div class="grid grid-cols-4 items-end gap-x-unit gap-y-4 border-t border-black pt-4">
    <span class="col-span-4 text-sm text-grey-dark tabular-nums sm:col-span-1">{{ index }}</span>
    <div class="col-span-4 flex flex-col gap-2 sm:col-span-3 lg:col-span-2">
      <component :is="level ?? 'h2'" class="text-[clamp(2rem,4vw,3.5rem)] leading-none font-normal">{{ title }}</component>
      <p v-if="intro" class="max-w-xl text-base text-grey-dark">{{ intro }}</p>
    </div>
    <div class="col-span-4 flex flex-wrap items-center gap-3 lg:col-span-1 lg:justify-self-end">
      <slot />
      <RouterLink v-if="link && linkLabel" :to="link" class="link-underline text-sm">
        {{ linkLabel }} <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </div>
</template>
