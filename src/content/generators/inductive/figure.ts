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
}
