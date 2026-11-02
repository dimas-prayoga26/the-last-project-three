<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useMainMenu } from '@/composables/useMainMenu'
import { lockScroll } from '@/composables/useSmoothScroll'
import { apiGet } from '@/lib/api'
import { shapeAt } from '@/lib/shapes'
import { useSiteStore } from '@/stores/site'
import type { CommunityEvent, DesignerSummary, Media, Paginated, PressItem, Resource } from '@/types/api'

const isOpen = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ closed: [] }>()

const { t, locale } = useI18n()
const site = useSiteStore()
const menu = useMainMenu()

const expandedKey = ref<string | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

/** Images for the items without one of their own, fetched the first time the menu opens. */
const extraPreviews = shallowRef<Record<string, Media | null>>({})
let extrasRequested = false

async function loadExtraPreviews(): Promise<void> {
  if (extrasRequested) {
    return
  }

  extrasRequested = true

  const [designers, events, press] = await Promise.allSettled([
    apiGet<Resource<DesignerSummary[]>>('/designers'),
    apiGet<Paginated<CommunityEvent>>('/events', { per_page: 1 }),
    apiGet<Paginated<PressItem>>('/press', { per_page: 1 }),
  ])

  extraPreviews.value = {
    designers: designers.status === 'fulfilled' ? (designers.value.data.find((designer) => designer.photo)?.photo ?? null) : null,
    events: events.status === 'fulfilled' ? (events.value.data[0]?.cover ?? null) : null,
    press: press.status === 'fulfilled' ? (press.value.data[0]?.image ?? null) : null,
  }
}

interface Preview {
  key: string
  label: string
  media: Media | null
  position: number
}

/** Every item and sub-item in menu order, so each one gets its own shape. */
const previews = computed<Preview[]>(() =>
  menu.value
    .flatMap((item) => [
      { key: item.key, label: item.label, media: item.preview ?? extraPreviews.value[item.key] ?? site.studio?.about.image ?? null },
      ...item.children.map((child) => ({ key: child.key, label: child.label, media: child.preview })),
    ])
    .map((preview, position) => ({ ...preview, position })),
)

const hoveredKey = ref<string | null>(null)
const preview = computed(() => previews.value.find((item) => item.key === hoveredKey.value) ?? previews.value[0] ?? null)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

watch(isOpen, async (value) => {
  lockScroll('menu', value)

  if (value) {
    void loadExtraPreviews()
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
    expandedKey.value = null
    hoveredKey.value = null
    emit('closed')
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  lockScroll('menu', false)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-500 ease-[cubic-bezier(.76,0,.24,1)]"
      leave-active-class="transition duration-300 ease-in"
      enter-from-class="opacity-0 [clip-path:inset(0_0_100%_0)]"
      enter-to-class="opacity-100 [clip-path:inset(0)]"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        role="dialog"
        aria-modal="true"
        :aria-label="t('a11y.mainNavigation')"
        data-lenis-prevent
        class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white"
      >
        <div class="flex h-18 shrink-0 items-center justify-between px-page">
          <RouterLink :to="{ name: 'home', params: { locale } }" :aria-label="t('a11y.home')" @click="isOpen = false">
            <img src="/brand/tlp-logo-primary-black.svg" alt="" width="120" height="40" class="h-10 w-30" />
          </RouterLink>
          <button ref="closeButton" type="button" class="group flex items-center gap-3 text-[0.9375rem]" @click="isOpen = false">
            {{ t('a11y.close') }}
            <span class="relative size-5" aria-hidden="true">
              <span class="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 rotate-45 bg-black transition-transform group-hover:rotate-135" />
              <span class="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 -rotate-45 bg-black transition-transform group-hover:rotate-45" />
            </span>
          </button>
        </div>

        <div class="grid flex-1 grid-cols-1 gap-unit px-page pt-4 pb-8 lg:grid-cols-2">
          <nav :aria-label="t('a11y.mainNavigation')">
            <ol class="flex flex-col border-t border-black">
              <li v-for="(item, index) in menu" :key="item.key" class="border-b border-black/15">
                <div class="flex items-center justify-between gap-4" @mouseenter="hoveredKey = item.key">
                  <RouterLink
                    :to="item.to"
                    class="flex min-w-0 items-baseline gap-4 py-2.5 text-[clamp(2rem,4.6vw,3.5rem)] leading-tight transition-colors hover:text-grey-dark"
                    :class="{ 'text-grey-dark': item.active }"
                    :aria-current="item.active ? 'page' : undefined"
                    @focus="hoveredKey = item.key"
                    @click="isOpen = false"
                  >
                    <span class="w-7 shrink-0 text-sm text-grey-dark tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                    <span class="truncate">{{ item.label }}</span>
                  </RouterLink>
                  <button
                    v-if="item.children.length"
                    type="button"
                    class="icon-button size-10 shrink-0"
                    :aria-expanded="expandedKey === item.key"
                    :aria-controls="`menu-${item.key}`"
                    :aria-label="t('a11y.showCategories', { discipline: item.label })"
                    @click="expandedKey = expandedKey === item.key ? null : item.key"
                  >
                    <span aria-hidden="true" class="transition-transform duration-300" :class="{ 'rotate-45': expandedKey === item.key }">+</span>
                  </button>
                </div>

                <ul v-if="expandedKey === item.key" :id="`menu-${item.key}`" class="flex flex-wrap gap-2 pb-5 pl-11">
                  <li v-for="child in item.children" :key="child.key">
                    <RouterLink
                      :to="child.to"
                      class="chip"
                      @mouseenter="hoveredKey = child.key"
                      @focus="hoveredKey = child.key"
                      @click="isOpen = false"
                    >
                      {{ child.label }}
                    </RouterLink>
                  </li>
                </ul>
              </li>
            </ol>
          </nav>

          <!-- Preview of the hovered item inside a brand shape that changes with it. -->
          <div class="sticky top-0 hidden h-[calc(100svh-6.5rem)] flex-col bg-grey-tint p-unit lg:flex" aria-hidden="true">
            <div class="flex items-baseline justify-between text-sm text-grey-dark">
              <span class="tabular-nums">{{ String((preview?.position ?? 0) + 1).padStart(2, '0') }}</span>
              <span>{{ preview?.label }}</span>
            </div>
            <div class="relative m-auto aspect-square w-full max-w-[min(100%,calc(100svh-12rem))]">
              <Transition
                enter-active-class="transition-opacity duration-500"
                leave-active-class="transition-opacity duration-300"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
              >
                <div v-if="preview" :key="preview.key" class="absolute inset-0">
                  <ShapeMedia :media="preview.media" :shape="shapeAt(preview.position)" variant="card" sizes="40vw" class="size-full" />
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 border-t border-black/15 px-page py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <SocialLinks v-if="site.studio?.socials.length" :links="site.studio.socials" class="flex-row! flex-wrap gap-x-6" />
          <div class="flex items-center gap-6">
            <a v-if="site.studio?.contact.email" :href="`mailto:${site.studio.contact.email}`" class="link-underline">{{ site.studio.contact.email }}</a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
