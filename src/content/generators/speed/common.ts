import { fmt, onRoundingBoundary, roundTo } from '../../format'
import { core, type GeneratorDef } from '../../generator'
import { buildNumericOptions, type Distractor } from '../../options'
import type { Rng } from '../../rng'
import type { Difficulty, Exhibit, Lang, McqItem, Query } from '../../types'

export interface SpeedSpec {
  prompt: string
  hint?: string
  query: Query
  value: number
  decimals: number
  distractors: Distractor[]
  format?: (v: number) => string
  steps: string[]
  shortcut: string
  /** True if the answer is exact (no rounding) – options may then differ by 1 unit. */
  exact: boolean
  unit?: string
  exhibits?: Exhibit[]
  targetSec?: number
  minGapRel?: number
  allowNegative?: boolean
}

export function numericMcq(
  def: GeneratorDef,
  seed: number,
  d: Difficulty,
  lang: Lang,
  rng: Rng,
  spec: SpeedSpec,
): McqItem | null {
  if (!spec.exact && onRoundingBoundary(spec.value, spec.decimals)) return null
  const format = spec.format ?? ((v: number) => fmt(v, lang, spec.decimals))
  const unit = 10 ** -spec.decimals
  const built = buildNumericOptions(rng, {
    value: spec.value,
    decimals: spec.decimals,
    format,
    distractors: spec.distractors,
    minGapRel: spec.minGapRel ?? (spec.exact ? 0 : 0.04),
    minGapAbs: spec.exact ? unit : 2 * unit,
    allowNegative: spec.allowNegative,
    exactOnly: spec.exact,
  })
  const correctText = format(roundTo(spec.value, spec.decimals))
  return {
    ...core(def, seed, d, lang, spec.targetSec),
    type: 'mcq',
    exhibits: spec.exhibits ?? [],
    prompt: spec.prompt,
    hint: spec.hint,
    query: spec.query,
    options: built.options,
    correct: built.correct,
    free: {
      answer: spec.value,
      tolerance: spec.exact ? 1e-9 : unit / 2 + 1e-9,
      decimals: spec.decimals,
      unit: spec.unit,
    },
    explanation: {
      steps: [...spec.steps, `Antwort: **${correctText}**`],
      distractors: built.notes,
      shortcut: spec.shortcut,
    },
  }
}

/** Number of decimals needed to show x exactly (max 4). */
export function decimalsOf(x: number): number {
  for (let d = 0; d <= 4; d++) if (Math.abs(roundTo(x, d) - x) < 1e-9) return d
  return 4
}

export function swapLastDigits(n: number): number | null {
  const s = String(Math.abs(Math.round(n)))
  if (s.length < 2 || s[s.length - 1] === s[s.length - 2]) return null
  const t = s.slice(0, -2) + s[s.length - 1] + s[s.length - 2]
  return Math.sign(n) * Number(t)
}
