/**
 * Builds 5 numeric answer options from the correct value plus distractors
 * that model realistic mistakes. Enforces quality rule 3: after rounding to
 * the displayed precision, options are far enough apart that rounding can
 * never make two options correct.
 */
import { roundTo } from './format'
import type { McqOption } from './types'
import type { Rng } from './rng'

export interface Distractor {
  value: number
  /** Short error-model id, e.g. 'wrong-base'. */
  tag: string
  /** German explanation of the mistake (without the value). */
  why: string
}

export interface NumericOptionSpec {
  value: number
  decimals: number
  format: (v: number) => string
  /** Candidates in order of realism; the first valid ones are used. */
  distractors: Distractor[]
  /** Minimum relative gap between any two options (default 4 %). */
  minGapRel?: number
  /** Minimum absolute gap (default 2 display units). Exact integer answers may use 1 unit. */
  minGapAbs?: number
  /** Allow negative option values (default: only if the answer is negative). */
  allowNegative?: boolean
  /** Exact answers: reject distractors that would need rounding to be displayed. */
  exactOnly?: boolean
  count?: number
}

export interface BuiltOptions {
  options: McqOption[]
  correct: number
  notes: string[]
}

export function minGap(value: number, decimals: number, rel: number): number {
  return Math.max(2 * 10 ** -decimals, rel * Math.abs(value))
}

/** Generic near-miss errors used when the error models run out. */
function fallbackDistractors(value: number, decimals: number, rng: Rng): Distractor[] {
  const out: Distractor[] = []
  const unit = 10 ** -decimals
  const factors = rng.shuffle([0.9, 1.1, 0.8, 1.2, 0.75, 1.25, 1.5, 0.5, 2])
  for (const f of factors) {
    out.push({
      value: value * f,
      tag: 'estimate-slip',
      why: `Überschlags- oder Rechenfehler (um etwa ${Math.round(Math.abs(1 - f) * 100)} % daneben).`,
    })
  }
  out.push({ value: value + 10 * unit, tag: 'slip', why: 'Flüchtigkeitsfehler in einer Stelle.' })
  out.push({ value: value - 10 * unit, tag: 'slip', why: 'Flüchtigkeitsfehler in einer Stelle.' })
  // Small answers: neighbouring values are the realistic slips.
  for (const k of [2, 3, 1, 4, 5, 6]) {
    out.push({ value: value + k * unit, tag: 'slip', why: 'Rechenfehler im letzten Schritt.' })
    out.push({ value: value - k * unit, tag: 'slip', why: 'Rechenfehler im letzten Schritt.' })
  }
  return out
}

export function buildNumericOptions(rng: Rng, spec: NumericOptionSpec): BuiltOptions {
  const count = spec.count ?? 5
  const rel = spec.minGapRel ?? 0.04
  const correct = roundTo(spec.value, spec.decimals)
  const gap = Math.max(spec.minGapAbs ?? 2 * 10 ** -spec.decimals, rel * Math.abs(correct)) - 1e-9
  const allowNeg = spec.allowNegative ?? correct < 0
  const chosen: { value: number; tag: string; why: string }[] = [{ value: correct, tag: 'correct', why: '' }]
  // Options are shown in ascending order, so the correct answer's position is
  // its rank. Aim for a uniformly random rank (no "it's usually C" pattern).
  const target = rng.int(0, count - 1)
  const quota = { below: target, above: count - 1 - target }
  const accept = (d: Distractor, strict: boolean) => {
    if (chosen.length >= count) return
    const v = roundTo(d.value, spec.decimals)
    if (!Number.isFinite(v)) return
    if (spec.exactOnly && Math.abs(v - d.value) > 1e-9 * Math.max(1, Math.abs(v))) return
    if (!allowNeg && v < 0) return
    if (v === 0 && correct !== 0 && Math.abs(correct) > 1) return
    if (chosen.some((c) => Math.abs(c.value - v) < gap)) return
    if (chosen.some((c) => spec.format(c.value) === spec.format(v))) return
    const side = v < correct ? 'below' : 'above'
    if (strict && quota[side] <= 0) return
    quota[side]--
    chosen.push({ value: v, tag: d.tag, why: d.why })
  }
  const fallback = fallbackDistractors(correct, spec.decimals, rng)
  for (const d of spec.distractors) accept(d, true)
  // Keep at least two realistic error models even if that breaks the target rank.
  for (const d of spec.distractors) if (chosen.length < 3) accept(d, false)
  for (const d of fallback) accept(d, true)
  for (const d of [...spec.distractors, ...fallback]) accept(d, false)
  if (chosen.length < count) throw new Error('buildNumericOptions: not enough distinct options')
  // Classic test layout: ascending order of values (like SHL/Aon numeric options).
  const ordered = chosen.slice().sort((a, b) => a.value - b.value)
  const options: McqOption[] = ordered.map((c) => ({ text: spec.format(c.value), tag: c.tag }))
  const correctIdx = ordered.findIndex((c) => c.tag === 'correct')
  const notes = ordered
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.tag !== 'correct')
    .map(({ c, i }) => `**${String.fromCharCode(65 + i)}** (${spec.format(c.value)}): ${c.why}`)
  return { options, correct: correctIdx, notes }
}

/** Options for label questions ("Which region …?"): correct label + distractor labels. */
export function buildLabelOptions(
  rng: Rng,
  correct: string,
  distractors: { label: string; why: string }[],
  count = 5,
): BuiltOptions {
  const seen = new Set([correct])
  const pool: { label: string; why: string; tag: string }[] = [{ label: correct, why: '', tag: 'correct' }]
  for (const d of distractors) {
    if (pool.length >= count) break
    if (seen.has(d.label)) continue
    seen.add(d.label)
    pool.push({ ...d, tag: 'distractor' })
  }
  if (pool.length < count) throw new Error('buildLabelOptions: not enough labels')
  const shuffled = rng.shuffle(pool)
  return {
    options: shuffled.map((p) => ({ text: p.label, tag: p.tag })),
    correct: shuffled.findIndex((p) => p.tag === 'correct'),
    notes: shuffled
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.tag !== 'correct')
      .map(({ p, i }) => `**${String.fromCharCode(65 + i)}** (${p.label}): ${p.why}`),
  }
}
