/** Switch Challenge: a row of symbols passes through operators (4-digit codes). */
export type SwitchSymbol = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'cross'

export interface SwitchSpec {
  input: SwitchSymbol[]
  /** Codes in order; null = the operator to find. Code c: output[i] = input[c[i] - 1]. */
  switches: (number[] | null)[]
  output: SwitchSymbol[]
}
