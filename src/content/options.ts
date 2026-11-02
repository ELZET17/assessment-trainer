/**
 * Builds 5 numeric answer options from the correct value plus distractors
 * that model realistic mistakes. Enforces quality rule 3: after rounding to
 * the displayed precision, options are far enough apart that rounding can
 * never make two options correct.
 */
import { fmt, roundTo } from './format'
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

const PLACE: Record<number, string> = { [-3]: 'Tausendstel', [-2]: 'Hundertstel', [-1]: 'Zehntel', 0: 'Einer', 1: 'Zehner', 2: 'Hunderter', 3: 'Tausender', 4: 'Zehntausender', 5: 'Hunderttausender' }
const GENERIC_WHY = new Set(['Rechenfehler.', 'Rechenfehler im letzten Schritt.', 'Flüchtigkeitsfehler in einer Stelle.', 'Überschlagsfehler.', 'Um eins verrechnet.'])

/**
 * Concrete, checkable description of a near-miss distractor (Gate 4: "Rechenfehler"
 * alone teaches nothing). Describes only what is certain: direction and size of the gap.
 */
export function describeSlip(v: number, c: number, format: (x: number) => string, decimals: number): string {
  const dir = v > c ? 'zu hoch' : 'zu niedrig'
  const both = `${format(v)} statt ${format(c)}`
  const near = (x: number, y: number) => Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(y))
  if (c !== 0) {
    const r = v / c
    for (const k of [1, 2, 3]) if (near(r, 10 ** k) || near(r, 10 ** -k)) return `Um den Faktor ${fmt(10 ** k, 'de', 0)} ${dir} (${both}) – Komma bzw. Nullen verschoben.`
    if (near(r, 2)) return `Doppelt so groß wie richtig (${both}) – ein Faktor 2 zu viel.`
    if (near(r, 0.5)) return `Nur halb so groß wie richtig (${both}) – ein Faktor 2 fehlt.`
  }
  const d = roundTo(Math.abs(v - c), decimals)
  const p = Math.floor(Math.log10(d) + 1e-9)
  const m = d / 10 ** p
  // Percentages differ by percentage points, not by "5".
  const isPct = format(0).includes('%')
  const gapText = `${fmt(d, 'de', Math.max(0, -p))}${isPct ? (d === 1 ? ' Prozentpunkt' : ' Prozentpunkte') : ''}`
  if (Math.abs(m - Math.round(m)) < 1e-6 && Math.round(m) <= 5 && PLACE[p]) return isPct ? `Um ${gapText} ${dir} (${both}) – Flüchtigkeitsfehler.` : `Um ${gapText} ${dir} (${both}) – Flüchtigkeitsfehler in der ${PLACE[p]}stelle.`
  if (c !== 0) return `Um rund ${Math.round(Math.abs(v / c - 1) * 100)} % ${dir} (${both}) – typisch für zu grobes Überschlagen oder einen Fehler in einem Zwischenschritt.`
  return `${dir.charAt(0).toUpperCase()}${dir.slice(1)} (${both}).`
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
      why: 'Überschlagsfehler.',
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
    .map(({ c, i }) => {
      let why = c.why
      if (c.tag === 'slip' || c.tag === 'estimate-slip') {
        const concrete = describeSlip(c.value, correct, spec.format, spec.decimals)
        why = GENERIC_WHY.has(why) ? concrete : `${why.replace(/\.$/, '')}: ${concrete.charAt(0).toLowerCase()}${concrete.slice(1)}`
      }
      return `**${String.fromCharCode(65 + i)}** (${spec.format(c.value)}): ${why}`
    })
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
