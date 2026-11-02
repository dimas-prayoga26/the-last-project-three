import type { Directive } from 'vue'

let observer: IntersectionObserver | null = null

function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer?.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )

  return observer
}

/**
 * Fades an element up once when it scrolls into view (see .reveal in main.css).
 * Does nothing when the visitor prefers reduced motion or IntersectionObserver is missing.
 */
export const vReveal: Directive<HTMLElement> = {
  mounted(element) {
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    element.classList.add('reveal')
    sharedObserver().observe(element)
  },
  unmounted(element) {
    observer?.unobserve(element)
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
  }
}
