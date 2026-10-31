import { fmt, onRoundingBoundary, pct, roundTo } from '../../format'
import { core, tr, type GeneratorDef } from '../../generator'
import { buildNumericOptions, type Distractor } from '../../options'
import type { Rng } from '../../rng'
import type { Difficulty, Exhibit, Lang, McqItem, McqOption, Query } from '../../types'

export const CANNOT_SAY = { en: 'Cannot say', de: 'Nicht bestimmbar' }

export function roundingHint(lang: Lang, dp: number): string {
  if (dp === 0) return tr(lang, 'Round to the nearest whole number.', 'Auf eine ganze Zahl runden.')
  if (dp === 1) return tr(lang, 'Round to one decimal place.', 'Auf eine Nachkommastelle runden.')
  return tr(lang, `Round to ${dp} decimal places.`, `Auf ${dp} Nachkommastellen runden.`)
}

export interface NumSpec {
  exhibits: Exhibit[]
  prompt: string
  query: Query
  /** Correct value; null if the correct answer is "Cannot say". */
  value: number | null
  decimals: number
  format?: (v: number) => string
  distractors: Distractor[]
  steps: string[]
  shortcut: string
  /** Add "Cannot say" as last option (as distractor or as the answer). */
  cannotSay?: boolean
  hint?: string
  minGapRel?: number
}

/** Returns null (→ retry with the next candidate) if the answer sits on a rounding boundary. */
export function numMcq(def: GeneratorDef, seed: number, d: Difficulty, lang: Lang, rng: Rng, s: NumSpec): McqItem | null {
  if (s.value !== null && (onRoundingBoundary(s.value, s.decimals) || !Number.isFinite(s.value))) return null
  const format = s.format ?? ((v: number) => fmt(v, lang, s.decimals))
  const cs = lang === 'de' ? CANNOT_SAY.de : CANNOT_SAY.en
  let options: McqOption[]
  let correct: number
  let notes: string[]
  if (s.value === null) {
    // Answer is "Cannot say": use the first distractor as anchor for the numeric options.
    const [anchor, ...rest] = s.distractors
    const built = buildNumericOptions(rng, {
      value: anchor.value,
      decimals: s.decimals,
      format,
      distractors: rest,
      minGapRel: s.minGapRel ?? 0.04,
      count: 4,
    })
    options = [...built.options.map((o) => ({ ...o, tag: o.tag === 'correct' ? anchor.tag : o.tag })), { text: cs, tag: 'correct' }]
    correct = 4
    const whys = [anchor, ...rest]
    notes = options.slice(0, 4).map((o, i) => {
      const w = whys.find((x) => format(roundTo(x.value, s.decimals)) === o.text)
      return `**${String.fromCharCode(65 + i)}** (${o.text}): ${w?.why ?? 'Mit einer Annahme gerechnet, die der Text nicht hergibt.'}`
    })
  } else {
    const built = buildNumericOptions(rng, {
      value: s.value,
      decimals: s.decimals,
      format,
      distractors: s.distractors,
      minGapRel: s.minGapRel ?? 0.04,
      count: s.cannotSay ? 4 : 5,
    })
    options = built.options
    correct = built.correct
    notes = built.notes
    if (s.cannotSay) {
      options = [...options, { text: cs, tag: 'cannot-say' }]
      notes = [...notes, `**E** (${cs}): Die nötigen Daten stehen in den Exhibits – die Frage ist beantwortbar.`]
    }
  }
  const answerText = s.value === null ? cs : format(roundTo(s.value, s.decimals))
  return {
    ...core(def, seed, d, lang),
    type: 'mcq',
    exhibits: s.exhibits,
    prompt: s.prompt,
    hint: s.hint === '' ? undefined : (s.hint ?? roundingHint(lang, s.decimals)),
    query: s.query,
    options,
    correct,
    explanation: { steps: [...s.steps, `Antwort: **${answerText}**`], distractors: notes, shortcut: s.shortcut },
  }
}

export const F = (lang: Lang) => (x: number, k: number) => fmt(x, lang, k)
export const P = (lang: Lang) => (x: number, k: number) => pct(x, lang, k)

/** "increase"/"decrease" wording. */
export function dirWord(lang: Lang, up: boolean, de: 'verb' | 'noun' = 'verb'): string {
  if (lang === 'en') return up ? 'increase' : 'decrease'
  return de === 'verb' ? (up ? 'gestiegen' : 'gesunken') : up ? 'Anstieg' : 'Rückgang'
}
