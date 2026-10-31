import type { PublicItem } from '../types'

/** What a validator derived on its own from the public item. */
export type Solution =
  | { kind: 'mcq'; index: number }
  | { kind: 'numeric'; value: number }
  | { kind: 'order'; order: number[] }
  | { kind: 'digit'; solutions: number }
  | { kind: 'grid'; judgements: boolean[] }

export type Validation = { ok: true; solution: Solution } | { ok: false; reason: string }

export type Validator = (item: PublicItem) => Validation

export const fail = (reason: string): Validation => ({ ok: false, reason })
export const mcq = (index: number): Validation => ({ ok: true, solution: { kind: 'mcq', index } })

export function texts(item: PublicItem): string[] {
  if (item.type !== 'mcq') throw new Error('texts(): not an MCQ item')
  return item.options.map((o) => o.text)
}
