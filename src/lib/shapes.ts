/**
 * The brand shapes (guidelines, shape pages) used as image masks. Their polygons
 * live in brand-tokens.v2.css as --tlp-clip-*; the square shapes need a 1:1 box,
 * the logomark a 3:1 box.
 */
export const SQUARE_SHAPES = ['T', 'P-rot', 'L-rot', 'T-up', 'P', 'L', 'T-left', 'T-right'] as const

export type Shape = (typeof SQUARE_SHAPES)[number] | 'logomark'

/**
 * Each brand polygon with its notches pushed out to the edges: a full rectangle
 * with the same vertices, so clip-path can animate between the two.
 */
const OPENED: Record<Shape, string> = {
  logomark:
    'polygon(0 0, 62.5% 0, 62.5% 0, 66.667% 0, 66.667% 0, 100% 0, 100% 100%, 91.667% 100%, 91.667% 100%, 33.333% 100%, 33.333% 100%, 25% 100%, 25% 100%, 8.333% 100%, 8.333% 100%, 0 100%)',
  T: 'polygon(0 0, 100% 0, 100% 100%, 75% 100%, 75% 100%, 25% 100%, 25% 100%, 0 100%)',
  'T-right': 'polygon(0 0, 100% 0, 100% 25%, 100% 25%, 100% 75%, 100% 75%, 100% 100%, 0 100%)',
  'T-up': 'polygon(25% 0, 75% 0, 75% 0, 100% 0, 100% 100%, 0 100%, 0 0, 25% 0)',
  'T-left': 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 75%, 0 75%, 0 25%, 0 25%)',
  L: 'polygon(0 0, 100% 0, 100% 25%, 100% 25%, 100% 100%, 0 100%)',
  'L-rot': 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 75%, 0 75%)',
  P: 'polygon(0 0, 100% 0, 100% 100%, 75% 100%, 75% 100%, 0 100%)',
  'P-rot': 'polygon(25% 0, 100% 0, 100% 100%, 0 100%, 0 0, 25% 0)',
}

/** The square shape for a position in a list, cycling through all of them. */
export function shapeAt(index: number): Shape {
  return SQUARE_SHAPES[((index % SQUARE_SHAPES.length) + SQUARE_SHAPES.length) % SQUARE_SHAPES.length] ?? 'T'
}

/** CSS variables read by the .shape, .shape-morph and .shape-reveal classes (main.css). */
export function shapeStyle(shape: Shape): Record<string, string> {
  return {
    '--shape-clip': `var(--tlp-clip-${shape})`,
    '--shape-full': OPENED[shape],
  }
}
