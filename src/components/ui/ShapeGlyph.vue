<script setup lang="ts">
import { shapeStyle, type Shape } from '@/lib/shapes'

defineProps<{ shape: Shape }>()
</script>

<template>
  <!-- A solid brand shape in the current text colour (a graphic device, not content). -->
  <span
    aria-hidden="true"
    class="shape block bg-current"
    :class="shape === 'logomark' ? 'aspect-[3/1]' : 'aspect-square'"
    :style="shapeStyle(shape)"
  />
</template>
