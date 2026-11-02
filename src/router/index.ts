import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

import { resetSmoothScroll } from '@/composables/useSmoothScroll'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isLocale, setLocale } from '@/i18n'

const localePattern = SUPPORTED_LOCALES.join('|')

export function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({
    history,
    routes: [
      { path: '/', redirect: `/${DEFAULT_LOCALE}` },
      {
        path: `/:locale(${localePattern})`,
        children: [
          { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
          {
            path: ':discipline(architecture|interior|design)/:category?',
            name: 'works',
            component: () => import('@/views/WorksView.vue'),
          },
          { path: 'works/:slug', name: 'project', component: () => import('@/views/ProjectView.vue') },
          { path: 'designers', name: 'designers', component: () => import('@/views/DesignersView.vue') },
          { path: 'designers/:slug', name: 'designer', component: () => import('@/views/DesignerView.vue') },
          { path: 'press', name: 'press', component: () => import('@/views/PressView.vue') },
          { path: 'events', name: 'events', component: () => import('@/views/EventsView.vue') },
          { path: 'events/:slug', name: 'event', component: () => import('@/views/EventView.vue') },
          { path: 'studio', redirect: (to) => ({ name: 'about', params: to.params }) },
          { path: 'studio/about', name: 'about', component: () => import('@/views/AboutView.vue') },
          { path: 'studio/contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
          { path: 'studio/follow', name: 'follow', component: () => import('@/views/FollowView.vue') },
          {
            path: ':pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/NotFoundView.vue'),
          },
        ],
      },
      // Paths without a locale prefix fall back to the default locale.
      { path: '/:pathMatch(.*)*', redirect: (to) => `/${DEFAULT_LOCALE}${to.path}` },
    ],
    scrollBehavior(to, from, savedPosition) {
      // Switching categories or languages keeps the visitor where they are.
      const sameWorksListing =
        to.name === 'works' && from.name === 'works' && to.params.discipline === from.params.discipline

      if (!savedPosition && (sameWorksListing || (to.name === from.name && to.params.locale !== from.params.locale))) {
        return false
      }

      const target = savedPosition ?? (to.hash ? { el: to.hash } : { top: 0 })

      // Wait for the old page to fade out (see the page transition in App.vue).
      return new Promise((resolve) => {
        window.setTimeout(() => {
          resetSmoothScroll()
          resolve(target)
        }, 350)
      })
    },
  })

  router.beforeEach((to) => {
    if (isLocale(to.params.locale)) {
      setLocale(to.params.locale)
    }
  })

  return router
}

export default createAppRouter()
