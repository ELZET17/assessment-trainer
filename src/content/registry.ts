import type { GeneratorDef } from './generator'
import { addSub, divide, multiply, squares } from './generators/speed/arith'
import { bigNumbers, equation, estimate, ruleOfThree, wordProblems } from './generators/speed/misc'
import { fractions, percent } from './generators/speed/percent'
import { sequence } from './generators/speed/sequence'
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
