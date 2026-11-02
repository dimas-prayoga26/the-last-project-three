<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ProjectMeta from '@/components/ProjectMeta.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import type { Shape } from '@/lib/shapes'
import type { ProjectSummary } from '@/types/api'

withDefaults(
  defineProps<{
    project: ProjectSummary
    /** The brand shape the cover turns into on hover. */
    shape: Shape
    /** Position in the list, shown as "01". */
    index?: number
    sizes?: string
  }>(),
  { index: undefined, sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw' },
)

const { locale } = useI18n()
</script>

<template>
  <article class="group">
    <RouterLink :to="{ name: 'project', params: { locale, slug: project.slug } }" class="flex flex-col gap-4 focus-visible:outline-offset-4">
      <ShapeMedia :media="project.cover" :shape="shape" mode="morph" variant="card" :alt="project.title" :sizes="sizes" class="aspect-card" />

      <div class="flex gap-3 border-t border-black/15 pt-3">
        <span v-if="index !== undefined" class="w-6 shrink-0 pt-1 text-xs text-grey-dark tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="flex min-w-0 flex-col">
          <h3 class="text-lg leading-snug">{{ project.title }}</h3>
          <p v-if="project.designers.length" class="text-sm text-grey-dark">
            {{ project.designers.map((designer) => designer.name).join(', ') }}
          </p>
          <ProjectMeta :project="project" class="mt-2 text-xs text-grey-dark" />
        </div>
      </div>
    </RouterLink>
  </article>
</template>
