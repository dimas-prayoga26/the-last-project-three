import { describe, expect, it } from 'vitest'

import { buildGalleryRows, srcsetOf } from '@/lib/media'
import type { Media } from '@/types/api'

function image(id: number, width: number, height: number): Media {
  return { id, url: `large-${id}.webp`, original: `${id}.jpg`, card: null, thumb: `thumb-${id}.webp`, width, height, alt: null }
}

describe('buildGalleryRows', () => {
  it('gives landscape images a full row and puts the portraits between them side by side', () => {
    const rows = buildGalleryRows([image(1, 1600, 900), image(2, 800, 1000), image(3, 900, 900), image(4, 2000, 1000)])

    expect(rows.map((row) => [row.kind, row.items.map((item) => item.media.id)])).toEqual([
      ['full', [1]],
      ['pair', [2, 3]],
      ['full', [4]],
    ])
  })

  it('keeps a lone portrait in its place as a single row', () => {
    const rows = buildGalleryRows([image(1, 800, 1000), image(2, 1600, 900)])

    expect(rows.map((row) => row.kind)).toEqual(['single', 'full'])
    expect(rows[0]?.items[0]?.media.id).toBe(1)
  })

  it('groups portraits in threes and avoids a single leftover', () => {
    const portraits = (count: number) => Array.from({ length: count }, (_, position) => image(position + 1, 800, 1000))

    expect(buildGalleryRows(portraits(5)).map((row) => row.kind)).toEqual(['triple', 'pair'])
    expect(buildGalleryRows(portraits(4)).map((row) => row.kind)).toEqual(['pair', 'pair'])
    expect(buildGalleryRows(portraits(7)).map((row) => row.kind)).toEqual(['triple', 'pair', 'pair'])
  })

  it('numbers images after the cover for the lightbox', () => {
    const rows = buildGalleryRows([image(1, 1600, 900)], 1)

    expect(rows[0]?.items[0]?.index).toBe(1)
  })
})

describe('srcsetOf', () => {
  it('describes the real widths of the thumb and large conversions', () => {
    expect(srcsetOf(image(1, 3000, 1500))).toBe('thumb-1.webp 640w, large-1.webp 2000w')
    expect(srcsetOf(image(2, 800, 1000))).toBe('thumb-2.webp 512w, large-2.webp 800w')
  })
})
