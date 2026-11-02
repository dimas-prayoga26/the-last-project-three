<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import type { Shape } from '@/lib/shapes'
import type { ProjectSummary } from '@/types/api'

const props = defineProps<{
  /** Works to cycle through, featured ones first. */
  projects: ProjectSummary[]
}>()

const INTERVAL_MS = 4500

/**
 * The four image tiles of the mosaic. The last one only shows on wide screens, where
 * CSS order moves the wide logomark tile after it (bottom right).
 */
const TILES: { shape: Shape; wide: boolean; desktopOnly: boolean }[] = [
  { shape: 'T', wide: false, desktopOnly: false },
  { shape: 'P-rot', wide: false, desktopOnly: false },
  { shape: 'logomark', wide: true, desktopOnly: false },
  { shape: 'L-rot', wide: false, desktopOnly: true },
]

const { t, locale } = useI18n()

/** Index into `projects` shown by each tile. */
const slots = ref<number[]>([])
const playing = ref(true)
let cursor = 0
let step = 0
let timer: number | undefined

const tiles = computed(() =>
  TILES.flatMap((tile, position) => {
    const project = props.projects[slots.value[position] ?? -1]

    return project ? [{ ...tile, project }] : []
  }),
)

function reset(): void {
  slots.value = TILES.map((_, position) => (props.projects.length ? position % props.projects.length : -1))
  cursor = TILES.length
  step = 0
}

/** Swaps one tile at a time, round the mosaic, to the next work that is not on screen yet. */
function advance(): void {
  const count = props.projects.length

  if (count <= TILES.length) {
    return
  }

  const tile = step % TILES.length
  let next = cursor % count

  while (slots.value.some((slot, position) => position !== tile && slot === next)) {
    cursor++
    next = cursor % count
  }

  slots.value = slots.value.map((slot, position) => (position === tile ? next : slot))
  cursor++
  step++
}

function restart(): void {
  window.clearInterval(timer)

  if (playing.value && props.projects.length > TILES.length) {
    timer = window.setInterval(advance, INTERVAL_MS)
  }
}

watch(() => props.projects, reset, { immediate: true })
watch([playing, () => props.projects], restart)

onMounted(() => {
  playing.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  restart()
})

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <section class="px-page pt-4 md:pt-6" :aria-label="t('home.nowShowing')">
    <div class="mosaic-frame">
      <div class="mosaic">
        <div class="mosaic-text flex flex-col justify-between gap-10 bg-black p-unit text-white lg:p-8">
          <p class="text-sm text-white/70">{{ t('home.kicker') }}</p>
          <h1 class="max-w-[22ch] text-[clamp(1.875rem,3.4vw,3.5rem)] leading-[1.05] font-normal">{{ t('home.tagline') }}</h1>
          <a href="#works" class="link-underline self-start text-sm">{{ t('home.exploreWorks') }} <span aria-hidden="true">↓</span></a>
        </div>

        <RouterLink
          v-for="tile in tiles"
          :key="tile.shape"
          :to="{ name: 'project', params: { locale, slug: tile.project.slug } }"
          :aria-label="tile.project.title"
          class="relative block"
          :class="[tile.wide ? 'mosaic-wide lg:order-1' : '', tile.desktopOnly ? 'hidden lg:block' : '']"
        >
          <Transition
            enter-active-class="transition-opacity duration-1000 ease-out"
            leave-active-class="transition-opacity duration-1000 ease-out"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <!-- The wrapper stacks the old and new image while they crossfade (AppImage itself is position: relative). -->
            <div :key="tile.project.id" class="absolute inset-0">
              <ShapeMedia
                :media="tile.project.cover"
                :shape="tile.shape"
                :variant="tile.wide ? 'full' : 'card'"
                :sizes="tile.wide ? '(min-width: 1024px) 75vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'"
                eager
                class="size-full"
              />
            </div>
          </Transition>
        </RouterLink>
      </div>
    </div>

    <div class="mt-4 flex items-start justify-between gap-unit text-sm">
      <ol class="grid flex-1 grid-cols-1 gap-x-unit gap-y-1 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">
        <li v-for="(tile, position) in tiles" :key="tile.shape" class="flex min-w-0 gap-2" :class="{ 'hidden lg:flex': tile.desktopOnly }">
          <span class="text-grey-dark tabular-nums">{{ String(position + 1).padStart(2, '0') }}</span>
          <RouterLink :to="{ name: 'project', params: { locale, slug: tile.project.slug } }" class="link-underline truncate">
            {{ tile.project.title }}
          </RouterLink>
        </li>
      </ol>
      <button
        v-if="projects.length > TILES.length"
        type="button"
        class="link-underline shrink-0 text-xs"
        :aria-label="playing ? t('a11y.pauseSlideshow') : t('a11y.playSlideshow')"
        @click="playing = !playing"
      >
        {{ playing ? '❙❙' : '▶' }}
      </button>
    </div>
  </section>
</template>
