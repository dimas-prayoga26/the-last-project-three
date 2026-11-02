import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

import { i18n, setLocale } from '@/i18n'
import { createAppRouter } from '@/router'

const stub = { default: { template: '<div />' } }
vi.mock('@/views/HomeView.vue', () => stub)
vi.mock('@/views/WorksView.vue', () => stub)
vi.mock('@/views/ProjectView.vue', () => stub)
vi.mock('@/views/DesignersView.vue', () => stub)
vi.mock('@/views/DesignerView.vue', () => stub)
vi.mock('@/views/PressView.vue', () => stub)
vi.mock('@/views/EventsView.vue', () => stub)
vi.mock('@/views/EventView.vue', () => stub)
vi.mock('@/views/AboutView.vue', () => stub)
vi.mock('@/views/ContactView.vue', () => stub)
vi.mock('@/views/FollowView.vue', () => stub)
vi.mock('@/views/NotFoundView.vue', () => stub)

describe('router', () => {
  beforeEach(() => {
    setLocale('en')
  })

  it('redirects the root path to the default locale', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/')

    expect(router.currentRoute.value.fullPath).toBe('/en')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('switches the i18n locale from the URL prefix', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/id')

    expect(i18n.global.locale.value).toBe('id')
  })

  it('prefixes paths without a locale with the default locale', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/designers')

    expect(router.currentRoute.value.fullPath).toBe('/en/designers')
    expect(router.currentRoute.value.name).toBe('designers')
  })

  it('matches a discipline listing with an optional category', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/id/architecture/urban-planning')

    expect(router.currentRoute.value.name).toBe('works')
    expect(router.currentRoute.value.params.discipline).toBe('architecture')
    expect(router.currentRoute.value.params.category).toBe('urban-planning')
  })

  it('matches the events listing and an event page', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/id/events')
    expect(router.currentRoute.value.name).toBe('events')

    await router.push('/en/events/joinery-workshop')
    expect(router.currentRoute.value.name).toBe('event')
    expect(router.currentRoute.value.params.slug).toBe('joinery-workshop')
  })

  it('sends the studio menu to the about page', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/en/studio')

    expect(router.currentRoute.value.fullPath).toBe('/en/studio/about')
  })

  it('shows the not found page for unknown paths inside a locale', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/id/gardening')

    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.params.locale).toBe('id')
  })
})
