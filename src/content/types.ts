/**
 * Item model shared by generators, validators, banks and the UI.
 *
 * Key rule: everything a validator may look at lives in `PublicItem`
 * (stimulus, prompt, structured query, options). The answer key lives only
 * in the full `Item` and is stripped before validation (see `toPublic`).
 */
import type { Panel } from './generators/inductive/figure'
import type { FlowSpec } from './generators/diagrammatic/flow'
import type { SwitchSpec } from './generators/aon/switchTypes'
import type { DigitEquation } from './generators/aon/digitTypes'
import type { GridRound } from './generators/aon/gridTypes'

export type Lang = 'en' | 'de'
/** Bilingual text (banks, academy). DE is optional; EN is the fallback. */
export interface Txt {
  en: string
  de?: string
}
export type Difficulty = 1 | 2 | 3

export type CategoryId =
  | 'numerical'
  | 'speed'
  | 'inductive'
  | 'deductive'
  | 'verbal'
  | 'critical'
  | 'diagrammatic'
  | 'aon'
  | 'interactive'

export type ItemRef =
  | { kind: 'gen'; gen: string; v: number; seed: number; d: Difficulty }
  | { kind: 'bank'; bank: 'verbal' | 'critical'; id: string; v: number }

export function refKey(ref: ItemRef): string {
  return ref.kind === 'gen'
    ? `g:${ref.gen}@${ref.v}:${ref.d}:${ref.seed >>> 0}`
    : `b:${ref.bank}:${ref.id}@${ref.v}`
}

export function parseRefKey(key: string): ItemRef | null {
  let m = /^g:([a-z0-9.-]+)@(\d+):([123]):(\d+)$/.exec(key)
  if (m) return { kind: 'gen', gen: m[1], v: Number(m[2]), d: Number(m[3]) as Difficulty, seed: Number(m[4]) }
  m = /^b:(verbal|critical):([A-Za-z0-9-]+)@(\d+)$/.exec(key)
  if (m) return { kind: 'bank', bank: m[1] as 'verbal' | 'critical', id: m[2], v: Number(m[3]) }
  return null
}

// ---------------------------------------------------------------- exhibits

export interface TableExhibit {
  kind: 'table'
  title: string
  unitNote?: string
  /** Column headers (without the row-label column). */
  header: string[]
  rowHeader?: string
  rows: { label: string; cells: (number | null)[] }[]
  /** Decimals per column (same length as header). */
  decimals: number[]
  /** Suffix per column, e.g. '%' (same length as header). */
  suffix?: string[]
  footnote?: string
}

export interface Series {
  name: string
  values: number[]
}

export interface BarExhibit {
  kind: 'bar'
  title: string
  unitNote?: string
  categories: string[]
  series: Series[]
  stacked?: boolean
  decimals: number
  suffix?: string
  /** Show the stack total above stacked bars. */
  showTotals?: boolean
}

export interface LineExhibit {
  kind: 'line'
  title: string
  unitNote?: string
  categories: string[]
  series: Series[]
  decimals: number
  suffix?: string
}

export interface PieExhibit {
  kind: 'pie'
  title: string
  unitNote?: string
  slices: { label: string; value: number }[]
  decimals: number
  suffix: string
}

export interface ComboExhibit {
  kind: 'combo'
  title: string
  categories: string[]
  bars: Series
  barUnit: string
  barDecimals: number
  line: Series
  lineUnit: string
  lineDecimals: number
  lineSuffix?: string
}

export interface TextExhibit {
  kind: 'text'
  title?: string
  body: string
}

export interface FiguresExhibit {
  kind: 'figures'
  layout: 'series' | 'matrix' | 'odd'
  /** `null` marks the missing panel ("?"). */
  panels: (Panel | null)[]
}

export interface FlowExhibit {
  kind: 'flow'
  flow: FlowSpec
}

export interface SwitchExhibit {
  kind: 'switch'
  spec: SwitchSpec
}

export type Exhibit =
  | TableExhibit
  | BarExhibit
  | LineExhibit
  | PieExhibit
  | ComboExhibit
  | TextExhibit
  | FiguresExhibit
  | FlowExhibit
  | SwitchExhibit

// ------------------------------------------------------------- explanation

export interface Explanation {
  /** Step-by-step solution in German, with the item's actual numbers. `**x**` = bold. */
  steps: string[]
  /** Why the wrong options are wrong (German). */
  distractors?: string[]
  /** The time-saving trick (German). */
  shortcut?: string
}

// ------------------------------------------------------------------ items

export interface McqOption {
  text: string
  panel?: Panel
  /** Error model behind a distractor (for explanations and analytics). */
  tag?: string
}

/** Structured, machine-readable form of the question; validators read this. */
export type Query = { family: string } & Record<string, unknown>

interface ItemCore {
  ref: ItemRef
  key: string
  category: CategoryId
  sub: string
  difficulty: Difficulty
  lang: Lang
  /** Target time per item in the real test (seconds). */
  targetSec: number
  exhibits: Exhibit[]
  prompt: string
  /** Extra line under the prompt, e.g. rounding instructions. */
  hint?: string
  query?: Query
  calculator: 'allowed' | 'never'
}

export interface McqItem extends ItemCore {
  type: 'mcq'
  options: McqOption[]
  correct: number
  /** Optional free-text answer (Speed Math training). */
  free?: { answer: number; tolerance: number; decimals: number; unit?: string }
  explanation: Explanation
}

export interface NumericItem extends ItemCore {
  type: 'numeric'
  answer: number
  tolerance: number
  decimals: number
  unit?: string
  explanation: Explanation
}

export interface BarDragItem extends ItemCore {
  type: 'bar'
  chart: { categories: string[]; values: (number | null)[]; target: number; min: number; max: number; step: number; unit: string; decimals: number }
  answer: number
  explanation: Explanation
}

export interface OrderItem extends ItemCore {
  type: 'order'
  entries: string[]
  /** Indices into `entries`, in the correct order. */
  correctOrder: number[]
  explanation: Explanation
}

export interface TableFillItem extends ItemCore {
  type: 'tablefill'
  table: TableExhibit
  blank: { row: number; col: number }
  answer: number
  tolerance: number
  decimals: number
  explanation: Explanation
}

export interface DigitItem extends ItemCore {
  type: 'digit'
  equation: DigitEquation
  /** One valid solution (any valid solution is accepted). */
  sample: number[]
  explanation: Explanation
}

export interface GridItem extends ItemCore {
  type: 'grid'
  round: GridRound
  explanation: Explanation
}

export type Item = McqItem | NumericItem | BarDragItem | OrderItem | TableFillItem | DigitItem | GridItem
export type ItemType = Item['type']

// ------------------------------------------------------------------ answers

export type Answer =
  | { type: 'mcq'; choice: number }
  | { type: 'numeric'; value: number }
  | { type: 'order'; order: number[] }
  | { type: 'digit'; digits: number[] }
  | { type: 'grid'; positions: number[]; judgements: (boolean | null)[] }

// ----------------------------------------------------------- public items

type KeyFields = 'correct' | 'answer' | 'correctOrder' | 'sample' | 'explanation' | 'free'
type StripKey<T> = T extends unknown ? Omit<T, Extract<keyof T, KeyFields>> : never
/** Item without answer key and explanation – the only thing validators see. */
export type PublicItem = StripKey<Item>

export function toPublic(item: Item): PublicItem {
  const copy: Record<string, unknown> = structuredClone(item) as unknown as Record<string, unknown>
  for (const k of ['correct', 'answer', 'correctOrder', 'sample', 'explanation', 'free']) delete copy[k]
  if (item.type === 'grid') {
    // The grid round carries its own judgement keys; validators recompute them.
    const round = copy.round as GridRound
    copy.round = { ...round, judgements: round.judgements.map((j) => ({ ...j, answer: undefined })) }
  }
  return copy as unknown as PublicItem
}
