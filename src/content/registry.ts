import type { GeneratorDef } from './generator'
import { addSub, divide, multiply, squares } from './generators/speed/arith'
import { bigNumbers, equation, estimate, ruleOfThree, wordProblems } from './generators/speed/misc'
import { fractions, percent } from './generators/speed/percent'
import { sequence } from './generators/speed/sequence'
import { extremes, pctChange, percentagePoints, ratio, share, unitConversion } from './generators/numerical/templatesA'
import { averages, cagr, exchangeRates, indexValues, projection, statistics } from './generators/numerical/templatesB'
import { syllogism } from './generators/deductive/syllogism'
import { ordering, orderingTfc, seating } from './generators/deductive/puzzles'
import { rules } from './generators/deductive/rules'
import { flowchart } from './generators/diagrammatic/flow-gen'
import { digitChallenge, gridChallenge, switchChallenge } from './generators/aon/games'
import { barDrag, dragOrder, tableFill } from './generators/interactive/shl'
import { matrix, oddOneOut, series } from './generators/inductive/figures-gen'
import type { CategoryId, Difficulty, Item, ItemRef, Lang } from './types'

export const GENERATORS: GeneratorDef[] = [
  // B – Speed Math / Kopfrechnen
  addSub,
  multiply,
  divide,
  squares,
  percent,
  fractions,
  estimate,
  ruleOfThree,
  equation,
  wordProblems,
  bigNumbers,
  sequence,
  // A – Numerical Reasoning
  pctChange,
  percentagePoints,
  share,
  ratio,
  unitConversion,
  extremes,
  exchangeRates,
  averages,
  statistics,
  cagr,
  indexValues,
  projection,
  // D – Deductive Reasoning
  syllogism,
  ordering,
  seating,
  rules,
  orderingTfc,
  // C – Inductive
  series,
  matrix,
  oddOneOut,
  // G – Diagrammatic
  flowchart,
  // H – Aon games
  switchChallenge,
  digitChallenge,
  gridChallenge,
  // I – SHL interactive
  barDrag,
  dragOrder,
  tableFill,
]

const BY_ID = new Map(GENERATORS.map((g) => [g.id, g]))

export function getGenerator(id: string): GeneratorDef | undefined {
  return BY_ID.get(id)
}

export function generatorsFor(category: CategoryId): GeneratorDef[] {
  return GENERATORS.filter((g) => g.category === category)
}

export function generate(id: string, seed: number, d: Difficulty, lang: Lang): Item {
  const g = BY_ID.get(id)
  if (!g) throw new Error(`unknown generator ${id}`)
  return g.generate(seed >>> 0, d, lang)
}

/** Regenerates a stored item. Returns null for unknown generators. */
export function fromRef(ref: Extract<ItemRef, { kind: 'gen' }>, lang: Lang): { item: Item; outdated: boolean } | null {
  const g = BY_ID.get(ref.gen)
  if (!g) return null
  return { item: g.generate(ref.seed, ref.d, lang), outdated: g.version !== ref.v }
}
