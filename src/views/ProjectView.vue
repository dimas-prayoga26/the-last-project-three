<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ProjectGrid from '@/components/ProjectGrid.vue'
import AppImage from '@/components/ui/AppImage.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ApiError, apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import { aspectRatioOf } from '@/lib/media'
import { shapeAt } from '@/lib/shapes'
import type { Media, ProjectResponse } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error, loading, reload } = useAsyncData(
  () => apiGet<ProjectResponse>(`/projects/${slug.value}`),
  [slug],
)

const project = computed(() => data.value?.data ?? null)
const notFound = computed(() => error.value instanceof ApiError && error.value.status === 404)
const lightboxIndex = ref<number | null>(null)

/** Cover first, then the gallery: the order of the image column and the lightbox. */
const images = computed<Media[]>(() => {
  if (!project.value) {
    return []
  }

  return [...(project.value.cover ? [project.value.cover] : []), ...project.value.gallery]
})

const facts = computed(() => {
  if (!project.value) {
    return []
  }

  return [
    {
      label: t('project.category'),
      value: `${t(`nav.${project.value.discipline}`)}, ${project.value.category.name}`,
    },
    { label: t('project.location'), value: project.value.location },
    { label: t('project.year'), value: project.value.year?.toString() ?? null },
    { label: t('project.area'), value: project.value.area },
    { label: t('project.client'), value: project.value.client },
    { label: t('project.photography'), value: project.value.photographer },
  ].filter((fact) => fact.value)
})

const neighbours = computed(() =>
  (['previous', 'next'] as const).flatMap((key, position) => {
    const neighbour = data.value?.[key]

    return neighbour
      ? [{ key, label: t(`project.${key}`), project: neighbour, shape: shapeAt(position * 3 + 2) }]
      : []
  }),
)

const relatedTitle = computed(() => {
  const designers = project.value?.designers ?? []

  return designers.length === 1 && designers[0]
    ? t('project.moreBy', { name: designers[0].name })
    : t('project.related')
})

useHead({
  title: () => project.value?.title ?? '',
  meta: [
    { name: 'description', content: () => project.value?.summary ?? t('meta.description') },
    { property: 'og:title', content: () => project.value?.title ?? '' },
    {
      property: 'og:image',
      content: () => project.value?.cover?.url ?? '/brand/tlp-og-default-1200x630.png',
    },
  ],
})
</script>

<template>
  <NotFoundView v-if="notFound" />
  <ErrorState v-else-if="error" @retry="reload" />

  <div
    v-else-if="loading && !project"
    class="grid grid-cols-1 gap-unit px-page pt-10 lg:grid-cols-12"
    aria-busy="true"
  >
    <div class="flex flex-col gap-4 lg:col-span-5">
      <div class="h-4 w-1/3 animate-pulse bg-grey-tint" />
      <div class="h-16 w-4/5 animate-pulse bg-grey-tint" />
    </div>
    <div class="aspect-[4/3] animate-pulse bg-grey-tint lg:col-span-7" />
  </div>

  <article v-else-if="project">
    <div class="grid grid-cols-1 gap-x-unit gap-y-12 px-page pt-8 md:pt-12 lg:grid-cols-12">
      <!-- Info panel: sticky next to the images on wide screens (kept short; the long text sits with the images) -->
      <header class="flex flex-col gap-8 lg:sticky lg:top-20 lg:col-span-5 lg:self-start lg:pr-6">
        <nav :aria-label="t('works.eyebrow')" class="flex flex-wrap items-center gap-2 text-sm">
          <RouterLink
            :to="{ name: 'works', params: { locale, discipline: project.discipline } }"
            class="chip"
          >
            {{ t(`nav.${project.discipline}`) }}
          </RouterLink>
          <RouterLink
            :to="{
              name: 'works',
              params: { locale, discipline: project.discipline, category: project.category.slug },
            }"
            class="chip"
          >
            {{ project.category.name }}
          </RouterLink>
        </nav>

        <div class="flex flex-col gap-4">
          <h1 class="text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[1.02] font-normal">
            {{ project.title }}
          </h1>
          <p v-if="project.summary" class="text-xl leading-snug text-grey-dark">
            {{ project.summary }}
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-x-unit border-t border-black">
          <div
            v-for="fact in facts"
            :key="fact.label"
            class="flex flex-col gap-1 border-b border-black/15 py-3"
          >
            <dt class="text-xs text-grey-dark">{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>

        <div v-if="project.designers.length" class="flex flex-col gap-3">
          <h2 class="eyebrow">{{ t('project.designers') }}</h2>
          <ul class="flex flex-col gap-3">
            <li v-for="(designer, index) in project.designers" :key="designer.id">
              <RouterLink
                :to="{ name: 'designer', params: { locale, slug: designer.slug } }"
                class="group flex items-center gap-4"
              >
                <ShapeMedia
                  :media="designer.photo"
                  :shape="shapeAt(index)"
                  mode="reveal"
                  variant="thumb"
                  class="aspect-square w-14 shrink-0 [&_img]:object-top"
                />
                <span class="flex flex-col">
                  <span class="link-underline self-start text-lg">{{ designer.name }}</span>
                  <span v-if="designer.title" class="text-sm text-grey-dark">{{
                    designer.title
                  }}</span>
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </header>

      <!-- Images -->
      <section :aria-label="t('project.images')" class="flex flex-col gap-unit lg:col-span-7">
        <template v-for="(media, index) in images" :key="media.id">
          <figure v-reveal class="flex flex-col gap-2">
            <button
              type="button"
              class="group block cursor-zoom-in overflow-hidden"
              :aria-label="t('a11y.openImage', { number: index + 1 })"
              @click="lightboxIndex = index"
            >
              <AppImage
                :media="media"
                :alt="project.title"
                :eager="index === 0"
                sizes="(min-width: 1024px) 58vw, 100vw"
                class="[&_img]:duration-1000 [&_img]:group-hover:scale-[1.015]"
                :style="{ aspectRatio: aspectRatioOf(media) }"
              />
            </button>
            <figcaption class="flex justify-between text-xs text-grey-dark tabular-nums">
              <span
                >{{ String(index + 1).padStart(2, '0') }} /
                {{ String(images.length).padStart(2, '0') }}</span
              >
              <span v-if="index === 0 && project.location">{{ project.location }}</span>
            </figcaption>
          </figure>

          <!-- The description follows the first image. -->
          <div
            v-if="index === 0 && project.description"
            class="prose-body max-w-[62ch] py-10 text-lg md:py-14"
          >
            <p v-for="(paragraph, position) in paragraphs(project.description)" :key="position">
              {{ paragraph }}
            </p>
          </div>
        </template>
      </section>
    </div>

    <!-- Index: every image as a numbered thumbnail -->
    <section v-if="images.length > 1" class="mt-20 flex flex-col gap-8 bg-grey-tint px-page py-14 md:mt-28">
      <SectionHeading :title="t('project.index')" :intro="t('designers.images', images.length)" />
      <ol class="grid grid-cols-4 gap-unit sm:grid-cols-6 lg:grid-cols-10">
        <li v-for="(media, index) in images" :key="media.id">
          <button
            type="button"
            class="group flex w-full flex-col gap-1.5 text-left"
            :aria-label="t('a11y.openImage', { number: index + 1 })"
            @click="lightboxIndex = index"
          >
            <AppImage :media="media" variant="thumb" alt="" class="aspect-square [&_img]:group-hover:opacity-80" />
            <span class="text-xs text-grey-dark tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </li>
      </ol>
    </section>

    <!-- Previous / next as shape thumbnails -->
    <nav
      v-if="neighbours.length"
      :aria-label="t('works.eyebrow')"
      class="mt-20 grid grid-cols-1 gap-unit px-page sm:grid-cols-2 md:mt-28"
    >
      <RouterLink
        v-for="item in neighbours"
        :key="item.key"
        :to="{ name: 'project', params: { locale, slug: item.project.slug } }"
        class="group flex items-center gap-unit bg-grey-tint p-unit"
        :class="{ 'sm:col-start-2 sm:flex-row-reverse sm:text-right': item.key === 'next' }"
      >
        <ShapeMedia
          :media="item.project.cover"
          :shape="item.shape"
          mode="reveal"
          variant="thumb"
          class="aspect-square w-24 shrink-0 md:w-36"
        />
        <span class="flex min-w-0 flex-col gap-1">
          <span class="text-sm text-grey-dark">
            <template v-if="item.key === 'previous'">← </template>{{ item.label
            }}<template v-if="item.key === 'next'"> →</template>
          </span>
          <span class="text-xl leading-snug md:text-2xl">{{ item.project.title }}</span>
        </span>
      </RouterLink>
    </nav>

    <section
      v-if="data?.related.length"
      class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28"
    >
      <SectionHeading :title="relatedTitle" />
      <ProjectGrid :projects="data.related" :numbered="false" />
    </section>

    <ImageLightbox v-model="lightboxIndex" :images="images" :title="project.title" />
  </article>
</template>
