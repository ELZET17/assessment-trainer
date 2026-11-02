/**
 * Gate 2 harness: generates N items per generator × difficulty, strips the
 * answer key and lets the independent validator solve them.
 */
import type { GeneratorDef } from '../../src/content/generator'
import { deriveSeed } from '../../src/content/rng'
import { toPublic, type Difficulty, type Item, type Lang } from '../../src/content/types'
import { validate } from '../../src/content/validators'
import type { Solution } from '../../src/content/validators/result'
import { digitValid } from '../../src/content/validators/aon'

export const ITEMS_PER_LEVEL = Number(process.env.GATE_ITEMS ?? 2000)

export interface Failure {
  gen: string
  d: Difficulty
  seed: number
  reason: string
}

function agrees(item: Item, sol: Solution): string | null {
  switch (item.type) {
    case 'mcq':
      if (sol.kind !== 'mcq') return 'validator returned non-mcq solution'
      return sol.index === item.correct ? null : `key ${item.correct} vs validator ${sol.index}`
    case 'numeric':
    case 'bar':
    case 'tablefill':
      if (sol.kind !== 'numeric') return 'validator returned non-numeric solution'
      return Math.abs(sol.value - item.answer) <= ('tolerance' in item ? item.tolerance : 1e-9) + 1e-9
        ? null
        : `key ${item.answer} vs validator ${sol.value}`
    case 'order':
      if (sol.kind !== 'order') return 'validator returned non-order solution'
      return sol.order.join(',') === item.correctOrder.join(',') ? null : `key ${item.correctOrder} vs validator ${sol.order}`
    case 'digit':
      if (sol.kind !== 'digit') return 'validator returned non-digit solution'
      return sol.solutions >= 1 ? null : 'no solution exists'
    case 'grid': {
      if (sol.kind !== 'grid') return 'validator returned non-grid solution'
      const key = item.round.judgements.map((j) => j.answer)
      return sol.judgements.join(',') === key.join(',') ? null : `judgements ${key} vs ${sol.judgements}`
    }
  }
}

/** Structural checks that do not need a solver. */
function structural(item: Item): string | null {
  if (!item.prompt.trim()) return 'empty prompt'
  if (item.explanation.steps.length === 0) return 'no explanation steps'
  if (item.type === 'mcq') {
    if (item.options.length < 2) return 'too few options'
    const t = item.options.map((o) => o.text + JSON.stringify(o.panel ?? null))
    if (new Set(t).size !== t.length) return 'duplicate options'
    if (item.correct < 0 || item.correct >= item.options.length) return 'correct index out of range'
  }
  if (item.type === 'digit' && !digitValid(item.equation, item.sample)) return 'sample digit solution invalid'
  if (item.type === 'order' && new Set(item.correctOrder).size !== item.entries.length) return 'order key is not a permutation'
  return null
}

/** Generates one item and checks it against the independent validator; null = fine. */
export function checkOne(g: GeneratorDef, d: Difficulty, seed: number, lang: Lang = 'en'): string | null {
  let item: Item
  try {
    item = g.generate(seed, d, lang)
  } catch (e) {
    return `generator crashed: ${(e as Error).message}`
  }
  const s = structural(item)
  if (s) return s
  const v = validate(toPublic(item))
  if (!v.ok) return v.reason
  return agrees(item, v.solution)
}

export function runGenerator(g: GeneratorDef, d: Difficulty, n = ITEMS_PER_LEVEL, lang: Lang = 'en'): Failure[] {
  const failures: Failure[] = []
  for (let i = 0; i < n; i++) {
    const seed = deriveSeed(0xc0ffee, g.id, d, i)
    const reason = checkOne(g, d, seed, lang)
    if (reason) failures.push({ gen: g.id, d, seed, reason })
    if (failures.length > 20) break
  }
  return failures
}
