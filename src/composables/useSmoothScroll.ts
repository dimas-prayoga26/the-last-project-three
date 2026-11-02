import Lenis from 'lenis'

let lenis: Lenis | null = null
const locks = new Set<string>()

/**
 * Smooth (inertia) scrolling on desktop, like the reference sites. Skipped when
 * the visitor prefers reduced motion; touch devices keep native scrolling.
 */
export function initSmoothScroll(): void {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  lenis = new Lenis({ autoRaf: true, lerp: 0.1 })
}

/**
 * Stops page scrolling while a dialog (mobile menu, lightbox) is open.
 * Each dialog passes its own key so one closing does not unlock another.
 */
export function lockScroll(key: string, locked: boolean): void {
  if (locked) {
    locks.add(key)
  } else {
    locks.delete(key)
  }

  const isLocked = locks.size > 0
  document.documentElement.classList.toggle('overflow-hidden', isLocked)

  if (isLocked) {
    lenis?.stop()
  } else {
    lenis?.start()
  }
}

/**
 * Lets the router jump to a new scroll position without an in-flight smooth
 * scroll pulling the page back.
 */
export function resetSmoothScroll(): void {
  if (lenis && locks.size === 0) {
    lenis.stop()
    requestAnimationFrame(() => lenis?.start())
  }
}
