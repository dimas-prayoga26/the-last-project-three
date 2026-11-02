<script setup lang="ts">
import { computed } from 'vue'

import ProjectCard from '@/components/ProjectCard.vue'
import { shapeAt } from '@/lib/shapes'
import type { ProjectSummary } from '@/types/api'

const props = withDefaults(
  defineProps<{
    projects: ProjectSummary[]
    loading?: boolean
    /** Number of skeleton cards shown while loading. */
    placeholders?: number
    columns?: 3 | 4
    /** Show running numbers ("01") on the cards. */
    numbered?: boolean
  }>(),
  { loading: false, placeholders: 4, columns: 4, numbered: true },
)

const gridClass = computed(() => (props.columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'))
const sizes = computed(() =>
  props.columns === 4 ? '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
)
</script>

<template>
  <div class="grid grid-cols-1 gap-x-unit gap-y-12 sm:grid-cols-2" :class="gridClass">
    <ProjectCard
      v-for="(project, index) in projects"
      :key="project.id"
      v-reveal
      :project="project"
      :shape="shapeAt(index)"
      :index="numbered ? index : undefined"
      :sizes="sizes"
    />
    <template v-if="loading">
      <div v-for="index in placeholders" :key="`placeholder-${index}`" class="flex flex-col gap-4" aria-hidden="true">
        <div class="aspect-card animate-pulse bg-grey-tint" />
        <div class="h-4 w-2/3 animate-pulse bg-grey-tint" />
        <div class="h-3 w-1/3 animate-pulse bg-grey-tint" />
      </div>
    </template>
  </div>
</template>
