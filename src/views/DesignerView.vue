<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import DesignerCard from '@/components/DesignerCard.vue'
import GalleryGrid from '@/components/GalleryGrid.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import ProjectMeta from '@/components/ProjectMeta.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ShapeGlyph from '@/components/ui/ShapeGlyph.vue'
import ShapeMedia from '@/components/ui/ShapeMedia.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useDesignerGallery } from '@/composables/useDesignerGallery'
import { ApiError, apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import { shapeAt } from '@/lib/shapes'
import type { Designer, DesignerSummary, Discipline, Resource } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error, loading, reload } = useAsyncData(() => apiGet<Resource<Designer>>(`/designers/${slug.value}`), [slug])
const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const {
  discipline: galleryDiscipline,
  work: galleryWork,
  images: galleryImages,
  total: galleryTotal,
  allTotal: imagesTotal,
  page: galleryPage,
  lastPage: galleryLastPage,
  loading: galleryLoading,
  failed: galleryFailed,
  load: loadGallery,
} = useDesignerGallery(slug)

const designer = computed(() => data.value?.data ?? null)
const notFound = computed(() => error.value instanceof ApiError && error.value.status === 404)
const projects = computed(() => designer.value?.projects ?? [])
/** Each designer keeps the same shape on every visit. */
const shape = computed(() => shapeAt(designer.value?.id ?? 0))

/** Sent by the API; worked out from the works when it is missing. */
const disciplines = computed<Discipline[]>(() => {
  const fromApi = designer.value?.disciplines ?? []

  return fromApi.length ? fromApi : [...new Set(projects.value.map((project) => project.discipline))]
})

/** Up to three works: featured ones first, then the most recent. */
const signatureWorks = computed(() =>
  [...projects.value].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || (b.year ?? 0) - (a.year ?? 0)).slice(0, 3),
)

/* Gallery filters: the work list follows the chosen discipline. */
const workOptions = computed(() =>
  projects.value.filter((project) => galleryDiscipline.value === null || project.discipline === galleryDiscipline.value),
)

function setDiscipline(value: Discipline | null): void {
  if (galleryWork.value !== null && !projects.value.some((project) => project.slug === galleryWork.value && (value === null || project.discipline === value))) {
    galleryWork.value = null
  }

  galleryDiscipline.value = value
}

const lightboxIndex = ref<number | null>(null)

/** Loads the next page while the lightbox nears the last loaded image, so stepping on does not wrap early. */
watch(lightboxIndex, (index) => {
  if (index !== null && index >= galleryImages.value.length - 3 && galleryPage.value < galleryLastPage.value && !galleryLoading.value) {
    void loadGallery(galleryPage.value + 1)
  }
})

/** The work of the image open in the lightbox, for its caption. */
const lightboxWork = computed(() => (lightboxIndex.value === null ? null : (galleryImages.value[lightboxIndex.value]?.work ?? null)))

/** The next designers in the list, wrapping around. */
const moreDesigners = computed(() => {
  const all = designers.data.value?.data ?? []
  const position = all.findIndex((item) => item.slug === slug.value)

  return [...all.slice(position + 1), ...all.slice(0, Math.max(position, 0))].filter((item) => item.slug !== slug.value).slice(0, 4)
})

const contactLink = computed(() => ({
  name: 'contact',
  params: { locale: locale.value },
  query: { subject: t('designers.collaborateSubject', { name: designer.value?.name ?? '' }) },
}))

/** Running numbers of the sections that are shown. */
const sectionNumbers = computed(() => {
  const shown = [
    signatureWorks.value.length ? 'signature' : null,
    projects.value.length ? 'gallery' : null,
    projects.value.length ? 'works' : null,
    moreDesigners.value.length ? 'discover' : null,
  ].filter((key): key is string => key !== null)

  return Object.fromEntries(shown.map((key, position) => [key, String(position + 1).padStart(2, '0')]))
})

useHead({
  title: () => designer.value?.name ?? '',
  meta: [
    { name: 'description', content: () => designer.value?.headline ?? designer.value?.bio ?? t('designers.intro') },
    { property: 'og:image', content: () => designer.value?.photo?.url ?? '/brand/tlp-og-default-1200x630.png' },
  ],
})
</script>

<template>
  <NotFoundView v-if="notFound" />
  <ErrorState v-else-if="error" @retry="reload" />

  <div v-else-if="loading && !designer" class="grid grid-cols-1 gap-unit px-page pt-10 lg:grid-cols-4" aria-busy="true">
    <div class="aspect-square animate-pulse bg-grey-tint lg:col-span-2" />
    <div class="flex flex-col justify-end gap-4 lg:col-span-2">
      <div class="h-20 w-3/4 animate-pulse bg-grey-tint" />
      <div class="h-6 w-1/2 animate-pulse bg-grey-tint" />
    </div>
  </div>

  <div v-else-if="designer">
    <nav :aria-label="t('designers.breadcrumb')" class="px-page pt-8 md:pt-10">
      <ol class="flex flex-wrap items-center gap-2 text-sm text-grey-dark">
        <li>
          <RouterLink :to="{ name: 'designers', params: { locale } }" class="link-underline">{{ t('designers.title') }}</RouterLink>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" class="text-black">{{ designer.name }}</li>
      </ol>
    </nav>

    <!-- Hero: portrait in the designer's brand shape, name and headline -->
    <header class="grid grid-cols-1 items-end gap-x-unit gap-y-8 px-page pt-6 lg:grid-cols-4">
      <ShapeMedia
        :media="designer.photo"
        :shape="shape"
        :alt="designer.name"
        variant="card"
        eager
        sizes="(min-width: 1024px) 50vw, 100vw"
        class="aspect-square [&_img]:object-top lg:col-span-2"
      />
      <div class="flex flex-col gap-6 lg:col-span-2 lg:pb-2">
        <p v-if="designer.title || designer.location" class="eyebrow">{{ [designer.title, designer.location].filter(Boolean).join(' · ') }}</p>
        <h1 class="text-[clamp(3rem,7vw,7rem)] leading-[0.95] font-normal break-words">{{ designer.name }}</h1>
        <p v-if="designer.headline" class="max-w-xl text-[clamp(1.25rem,2vw,1.75rem)] leading-snug text-grey-dark">{{ designer.headline }}</p>
        <div class="flex flex-wrap gap-3 pt-2">
          <a v-if="projects.length" href="#gallery" class="btn-primary">{{ t('designers.gallery') }} <span aria-hidden="true">↓</span></a>
          <RouterLink :to="contactLink" class="btn-outline">{{ t('designers.collaborateButton') }} <span aria-hidden="true">→</span></RouterLink>
        </div>
      </div>
    </header>

    <!-- Bio and facts -->
    <section class="grid grid-cols-1 gap-x-unit gap-y-10 px-page pt-16 md:pt-24 lg:grid-cols-4" :aria-label="t('designers.about')">
      <p class="eyebrow self-start">{{ t('designers.about') }}</p>
      <div class="prose-body text-lg lg:col-span-2 lg:text-xl">
        <p v-for="(paragraph, position) in paragraphs(designer.bio)" :key="position">{{ paragraph }}</p>
      </div>
      <dl class="flex flex-col border-t border-black lg:col-start-4">
        <div v-if="designer.location" class="flex justify-between gap-4 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.location') }}</dt>
          <dd class="text-right">{{ designer.location }}</dd>
        </div>
        <div v-if="disciplines.length" class="flex justify-between gap-4 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.disciplines') }}</dt>
          <dd class="text-right">{{ disciplines.map((item) => t(`nav.${item}`)).join(', ') }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.worksCount') }}</dt>
          <dd class="tabular-nums">{{ projects.length }}</dd>
        </div>
        <div v-if="imagesTotal !== null" class="flex justify-between gap-4 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.imagesCount') }}</dt>
          <dd class="tabular-nums">{{ imagesTotal }}</dd>
        </div>
        <div v-if="designer.email" class="flex flex-col gap-1 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.email') }}</dt>
          <dd class="[overflow-wrap:anywhere]"><a :href="`mailto:${designer.email}`" class="link-underline">{{ designer.email }}</a></dd>
        </div>
        <div v-if="designer.socials.length" class="flex flex-col gap-1 border-b border-black/15 py-3">
          <dt class="text-sm text-grey-dark">{{ t('designers.social') }}</dt>
          <dd><SocialLinks :links="designer.socials" /></dd>
        </div>
      </dl>
    </section>

    <!-- Signature works -->
    <section v-if="signatureWorks.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :index="sectionNumbers.signature" :title="t('designers.signature')" />
      <ol class="grid grid-cols-1 gap-x-unit gap-y-12 sm:grid-cols-3">
        <li v-for="(work, index) in signatureWorks" :key="work.id" v-reveal>
          <RouterLink :to="{ name: 'project', params: { locale, slug: work.slug } }" class="group flex flex-col gap-4">
            <ShapeMedia
              :media="work.cover"
              :shape="shapeAt(index * 2 + 1)"
              mode="reveal"
              variant="card"
              :alt="work.title"
              sizes="(min-width: 640px) 33vw, 100vw"
              class="aspect-square"
            />
            <div class="flex items-baseline justify-between gap-4 border-t border-black/15 pt-3">
              <h3 class="text-2xl leading-tight">{{ work.title }}</h3>
              <span v-if="work.year" class="text-sm text-grey-dark tabular-nums">{{ work.year }}</span>
            </div>
            <ProjectMeta :project="work" class="-mt-2 text-xs text-grey-dark" />
          </RouterLink>
        </li>
      </ol>
    </section>

    <!-- Statement -->
    <section v-if="designer.statement" class="mt-20 bg-grey-tint px-page py-16 md:mt-28 md:py-24" :aria-label="t('designers.statement')">
      <div class="grid grid-cols-1 gap-x-unit gap-y-8 lg:grid-cols-4">
        <div class="flex items-start justify-between lg:flex-col lg:justify-start lg:gap-8">
          <p class="eyebrow">{{ t('designers.statement') }}</p>
          <ShapeGlyph :shape="shape" class="w-10 lg:w-16" />
        </div>
        <blockquote class="flex flex-col gap-6 lg:col-span-3">
          <p class="text-[clamp(1.75rem,3.6vw,3.25rem)] leading-tight">“{{ designer.statement }}”</p>
          <footer class="text-sm text-grey-dark">— {{ designer.name }}</footer>
        </blockquote>
      </div>
    </section>

    <!-- Gallery: every image of every work -->
    <section v-if="projects.length" id="gallery" class="flex scroll-mt-24 flex-col gap-8 px-page pt-20 md:gap-10 md:pt-28">
      <SectionHeading :index="sectionNumbers.gallery" :title="t('designers.gallery')" :intro="t('designers.galleryIntro', { name: designer.name })" />

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('designers.filterDiscipline')">
          <button type="button" class="chip" :aria-pressed="galleryDiscipline === null" @click="setDiscipline(null)">{{ t('common.all') }}</button>
          <button
            v-for="item in disciplines"
            :key="item"
            type="button"
            class="chip"
            :aria-pressed="galleryDiscipline === item"
            @click="setDiscipline(item)"
          >
            {{ t(`nav.${item}`) }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label for="gallery-work" class="text-sm text-grey-dark">{{ t('designers.filterWork') }}</label>
          <select id="gallery-work" v-model="galleryWork" class="h-10 max-w-64 border border-black/20 bg-white px-3 text-sm outline-none focus:border-black">
            <option :value="null">{{ t('designers.everyWork') }}</option>
            <option v-for="work in workOptions" :key="work.id" :value="work.slug">{{ work.title }}</option>
          </select>
          <p class="text-sm text-grey-dark tabular-nums" aria-live="polite">{{ galleryLoading && !galleryImages.length ? '' : t('designers.images', galleryTotal) }}</p>
        </div>
      </div>

      <ErrorState v-if="galleryFailed && !galleryImages.length" @retry="loadGallery(1)" />
      <p v-else-if="!galleryLoading && !galleryImages.length" class="text-grey-dark">{{ t('designers.noImages') }}</p>
      <ul v-else-if="galleryLoading && !galleryImages.length" class="justified" aria-hidden="true">
        <li v-for="(ratio, index) in [1.5, 0.8, 1.33, 1, 1.5, 0.75]" :key="index" class="justified-item" :style="{ '--a': ratio }">
          <div class="animate-pulse bg-grey-tint" :style="{ aspectRatio: ratio }" />
        </li>
      </ul>
      <GalleryGrid
        v-else
        :images="galleryImages"
        class="transition-opacity duration-300"
        :class="{ 'opacity-40': galleryLoading && galleryPage === 1 }"
        @open="lightboxIndex = $event"
      />

      <div v-if="galleryPage < galleryLastPage" class="flex justify-center pt-4">
        <button type="button" class="btn-outline" :disabled="galleryLoading" @click="loadGallery(galleryPage + 1)">
          {{ galleryLoading ? t('common.loading') : t('common.loadMore') }}
        </button>
      </div>
    </section>

    <!-- All works -->
    <section v-if="projects.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :index="sectionNumbers.works" :title="t('designers.allWorks')" :intro="t('common.works', projects.length)" />
      <ProjectGrid :projects="projects" />
    </section>
    <p v-else class="px-page pt-16 text-grey-dark">{{ t('designers.noWorks') }}</p>

    <!-- Discover more designers -->
    <section v-if="moreDesigners.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading
        :index="sectionNumbers.discover"
        :title="t('designers.discover')"
        :link="{ name: 'designers', params: { locale } }"
        :link-label="t('home.allDesigners')"
      />
      <div class="grid grid-cols-2 gap-x-unit gap-y-12 lg:grid-cols-4">
        <DesignerCard v-for="(item, index) in moreDesigners" :key="item.id" v-reveal :designer="item" :shape="shapeAt(index + 2)" />
      </div>
    </section>

    <!-- Closing call to action -->
    <section class="mt-20 bg-black px-page py-16 text-white md:mt-28 md:py-24">
      <div class="grid grid-cols-1 items-end gap-10 lg:grid-cols-4">
        <div class="flex flex-col gap-5 lg:col-span-3">
          <h2 class="text-[clamp(2.5rem,6vw,6rem)] leading-none font-normal">{{ t('designers.collaborate', { name: designer.name }) }}</h2>
          <p class="max-w-xl text-lg text-white/75">{{ t('designers.collaborateText', { name: designer.name }) }}</p>
        </div>
        <RouterLink
          :to="contactLink"
          class="inline-flex items-center justify-center gap-3 self-start bg-white px-6 py-3.5 text-base text-black transition-colors hover:bg-grey-light lg:self-end lg:justify-self-end"
        >
          {{ t('designers.collaborateButton') }} <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <ImageLightbox v-model="lightboxIndex" :images="galleryImages" :total="galleryTotal" :title="designer.name">
      <template #caption>
        <template v-if="lightboxWork">
          <p>
            {{ lightboxWork.title }}<template v-if="lightboxWork.year"> — {{ lightboxWork.year }}</template>
          </p>
          <RouterLink :to="{ name: 'project', params: { locale, slug: lightboxWork.slug } }" class="link-underline">
            {{ t('designers.viewWork') }} <span aria-hidden="true">→</span>
          </RouterLink>
        </template>
      </template>
    </ImageLightbox>
  </div>
</template>
