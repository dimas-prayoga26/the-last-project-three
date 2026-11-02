import type { Media } from '@/types/api'

/** Pixel limits of the API's image conversions (see the Laravel models). */
const THUMB_MAX = 640
const LARGE_MAX = 2000
const CARD_WIDTH = 800

export type Orientation = 'landscape' | 'portrait'

export function orientationOf(media: Media): Orientation {
  if (!media.width || !media.height) {
    return 'landscape'
  }

  // Square-ish images read better paired, like portraits.
  return media.width / media.height >= 1.2 ? 'landscape' : 'portrait'
}

export function aspectRatioOf(media: Media, fallback = '4 / 3'): string {
  return media.width && media.height ? `${media.width} / ${media.height}` : fallback
}

function scaledWidth(media: Media, max: number): number {
  if (!media.width || !media.height) {
    return max
  }

  const scale = Math.min(1, max / Math.max(media.width, media.height))

  return Math.round(media.width * scale)
}

/** srcset for the uncropped versions (thumb + large). */
export function srcsetOf(media: Media): string {
  return [
    media.thumb ? `${media.thumb} ${scaledWidth(media, THUMB_MAX)}w` : null,
    `${media.url} ${scaledWidth(media, LARGE_MAX)}w`,
  ]
    .filter(Boolean)
    .join(', ')
}

/** srcset for the 4:5 card crop. */
export function cardSrcsetOf(media: Media): string | undefined {
  return media.card ? `${media.card} ${CARD_WIDTH}w` : undefined
}

export interface GalleryItem {
  media: Media
  /** Position in the full image list (used by the lightbox). */
  index: number
}

export interface GalleryRow {
  kind: 'full' | 'triple' | 'pair' | 'single'
  items: GalleryItem[]
}

/** Splits a run of portrait images into rows of three, using pairs so no row is left with one image when possible. */
function portraitRows(items: GalleryItem[]): GalleryRow[] {
  const rows: GalleryRow[] = []
  let rest = items

  while (rest.length > 0) {
    const size = rest.length === 1 ? 1 : rest.length === 2 || rest.length === 4 ? 2 : 3

    rows.push({ kind: size === 3 ? 'triple' : size === 2 ? 'pair' : 'single', items: rest.slice(0, size) })
    rest = rest.slice(size)
  }

  return rows
}

/**
 * Lays out a project gallery in its original order: each landscape image gets a
 * full-width row, and the portrait images between them share rows of three or two.
 */
export function buildGalleryRows(gallery: Media[], indexOffset = 0): GalleryRow[] {
  const rows: GalleryRow[] = []
  let portraits: GalleryItem[] = []

  gallery.forEach((media, position) => {
    const item = { media, index: position + indexOffset }

    if (orientationOf(media) === 'landscape') {
      rows.push(...portraitRows(portraits), { kind: 'full', items: [item] })
      portraits = []
    } else {
      portraits.push(item)
    }
  })

  rows.push(...portraitRows(portraits))

  return rows
}
