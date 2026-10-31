/** Grid Challenge: remember dot positions in a 4×4 grid between distractor judgements. */
export type GridJudgement =
  | { kind: 'symmetry'; size: number; cells: number[]; answer?: boolean }
  | { kind: 'rotation'; size: number; a: number[]; b: number[]; answer?: boolean }

export interface GridRound {
  /** Dot cells (0..15) in the order they are shown. */
  dots: number[]
  /** judgements[i] is shown after dots[i]. */
  judgements: GridJudgement[]
}
