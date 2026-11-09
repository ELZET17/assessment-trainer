/** Figure model for inductive items. Panels are rendered as SVG by src/ui/figures. */

export type Shape = 'circle' | 'square' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'lshape' | 'cross' | 'diamond'
export type Fill = 'empty' | 'solid' | 'striped' | 'dotted'
export type Size = 0 | 1 | 2

export interface FigEl {
  shape: Shape
  /** Cell in a 3×3 grid (0 = top-left, 4 = centre, 8 = bottom-right). */
  cell: number
  size: Size
  fill: Fill
  /** Rotation in 45° steps (0..7), clockwise. */
  rot: number
  /** Mirrored horizontally (only visible for chiral shapes like the L-shape). */
  mirror?: boolean
}

export interface Panel {
  els: FigEl[]
  /** Line segments drawn in the panel (ids 0..7: 4 edges + 2 diagonals + 2 midlines). */
  lines?: number[]
  /** Number of small tick marks drawn in a strip along the bottom edge (counter rules). */
  ticks?: number
}

/** Outer ring of the 3×3 grid in clockwise order, starting top-left. */
export const RING = [0, 1, 2, 5, 8, 7, 6, 3]
/** Shapes whose rotation is visible (all 8 orientations distinct). */
export const ROTATING: Shape[] = ['arrow', 'lshape']
export const STATIC_SHAPES: Shape[] = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'star', 'cross', 'diamond']
export const SIDES: Record<Shape, number> = { circle: 0, triangle: 3, square: 4, diamond: 4, pentagon: 5, hexagon: 6, star: 10, arrow: 7, lshape: 6, cross: 12 }

/**
 * Fixed placement of n identical elements (dice-like), used by counting rules.
 * Shared rendering convention – not an answer key: solver and generator both
 * place n elements in exactly these cells.
 */
export const PACK: number[][] = [
  [],
  [4],
  [3, 5],
  [3, 4, 5],
  [0, 2, 6, 8],
  [0, 2, 4, 6, 8],
  [0, 1, 2, 6, 7, 8],
  [0, 1, 2, 4, 6, 7, 8],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
]
