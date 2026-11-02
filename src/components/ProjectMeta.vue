<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ProjectSummary } from '@/types/api'

const props = defineProps<{
  project: Pick<ProjectSummary, 'discipline' | 'category' | 'year'>
}>()

const { t } = useI18n()

/** "Architecture | Commercial | 2024" */
const parts = computed(() =>
  [t(`nav.${props.project.discipline}`), props.project.category.name, props.project.year?.toString()].filter(Boolean),
)
</script>

<template>
  <p>
    <template v-for="(part, position) in parts" :key="position">
      <span v-if="position > 0" class="mx-2" aria-hidden="true">|</span>{{ part }}
    </template>
  </p>
</template>
