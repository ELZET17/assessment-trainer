/** Digit Challenge: fill the slots with digits 1–9, each at most once. */
export type DigitToken = { t: 'slot' } | { t: 'op'; op: '+' | '-' | '*' } | { t: 'num'; v: number }

export interface DigitEquation {
  lhs: DigitToken[]
  rhs: DigitToken[]
}
