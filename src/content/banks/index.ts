/** Turns hand-written bank entries into items. */
import { CATEGORY_BY_ID } from '../categories'
import { refKey, type Difficulty, type Lang, type McqItem, type Txt } from '../types'
import { CRITICAL } from './critical'
import { CRITICAL_OPTIONS, CRITICAL_PROMPTS, TRAP_DE, VERBAL_INDEX, VERBAL_OPTIONS, type CriticalItem, type VerbalPassage, type VerbalStatement } from './types'
import { VERBAL } from './verbal'

export const BANK_VERSION = 1

const pick = (t: Txt, lang: Lang) => (lang === 'de' && t.de ? t.de : t.en)

const STATEMENTS = new Map<string, { p: VerbalPassage; s: VerbalStatement }>()
for (const p of VERBAL) for (const s of p.statements) STATEMENTS.set(s.id, { p, s })
const CRIT = new Map<string, CriticalItem>(CRITICAL.map((c) => [c.id, c]))

export const VERBAL_IDS = [...STATEMENTS.keys()]
export const CRITICAL_IDS = [...CRIT.keys()]

export function verbalDifficulty(id: string): Difficulty | null {
  return STATEMENTS.get(id)?.p.difficulty ?? null
}
export function criticalDifficulty(id: string): Difficulty | null {
  return CRIT.get(id)?.difficulty ?? null
}
export function verbalHasGerman(id: string): boolean {
  const e = STATEMENTS.get(id)
  return !!(e && e.p.text.de && e.s.text.de)
}

export function verbalItem(id: string, lang: Lang): McqItem | null {
  const e = STATEMENTS.get(id)
  if (!e) return null
  const { p, s } = e
  // Use German only if the whole passage + statement exist in German.
  const l: Lang = lang === 'de' && p.text.de && s.text.de && p.title.de ? 'de' : 'en'
  const ref = { kind: 'bank' as const, bank: 'verbal' as const, id, v: BANK_VERSION }
  const opts = VERBAL_OPTIONS[l]
  const correct = VERBAL_INDEX[s.answer]
  return {
    ref,
    key: refKey(ref),
    category: 'verbal',
    sub: `verbal.${s.trap}`,
    difficulty: p.difficulty,
    lang: l,
    targetSec: CATEGORY_BY_ID.verbal.targetSec[p.difficulty],
    calculator: 'never',
    exhibits: [{ kind: 'text', title: pick(p.title, l), body: pick(p.text, l) }],
    prompt: pick(s.text, l),
    hint: l === 'de' ? 'Beurteile die Aussage ausschließlich auf Basis des Textes.' : 'Judge the statement using only the information in the passage.',
    query: { family: 'verbal' },
    type: 'mcq',
    options: opts.map((text) => ({ text })),
    correct,
    explanation: {
      steps: [s.reason, `Antwort: **${VERBAL_OPTIONS.de[correct]}**`],
      shortcut: `${TRAP_DE[s.trap]} Wahr = der Text sagt es (auch umformuliert). Falsch = der Text sagt das Gegenteil. Nicht bestimmbar = der Text sagt dazu nichts Eindeutiges.`,
    },
  }
}

export function criticalItem(id: string, lang: Lang): McqItem | null {
  const c = CRIT.get(id)
  if (!c) return null
  const l: Lang = lang === 'de' && c.stimulus.de && c.proposition.de ? 'de' : 'en'
  const ref = { kind: 'bank' as const, bank: 'critical' as const, id, v: BANK_VERSION }
  const opts = CRITICAL_OPTIONS[c.type][l]
  const label: Record<CriticalItem['type'], { en: string; de: string }> = {
    inference: { en: 'Proposed inference', de: 'Vorgeschlagene Schlussfolgerung' },
    assumption: { en: 'Proposed assumption', de: 'Vorgeschlagene Annahme' },
    deduction: { en: 'Conclusion', de: 'Schlussfolgerung' },
    interpretation: { en: 'Conclusion', de: 'Schlussfolgerung' },
    evaluation: { en: 'Argument', de: 'Argument' },
  }
  return {
    ref,
    key: refKey(ref),
    category: 'critical',
    sub: `critical.${c.type}`,
    difficulty: c.difficulty,
    lang: l,
    targetSec: CATEGORY_BY_ID.critical.targetSec[c.difficulty],
    calculator: 'never',
    exhibits: [{ kind: 'text', body: pick(c.stimulus, l) }],
    prompt: `${label[c.type][l]}: ${pick(c.proposition, l)}`,
    hint: CRITICAL_PROMPTS[c.type][l],
    query: { family: 'critical', type: c.type },
    type: 'mcq',
    options: opts.map((text) => ({ text })),
    correct: c.answer,
    explanation: {
      steps: [c.reason, `Antwort: **${CRITICAL_OPTIONS[c.type].de[c.answer]}**`],
      shortcut: CRITICAL_SHORTCUT[c.type],
    },
  }
}

const CRITICAL_SHORTCUT: Record<CriticalItem['type'], string> = {
  inference: '„Wahr“ nur, wenn es zwingend aus dem Text folgt; „wahrscheinlich“, wenn der Text es nahelegt; „unzureichende Daten“, wenn der Text dazu schweigt. Allgemeinwissen nur als „common knowledge“ nutzen, nie für Fakten.',
  assumption: 'Eine Annahme ist das, was jemand stillschweigend voraussetzen MUSS, damit die Aussage Sinn ergibt. Test: Wenn das Gegenteil gälte, wäre die Aussage dann unsinnig? Dann ist die Annahme gemacht.',
  deduction: 'Nur die Prämissen zählen, nicht ob die Schlussfolgerung realistisch klingt. Gibt es ein Szenario, in dem alle Prämissen stimmen, die Schlussfolgerung aber nicht? Dann folgt sie nicht.',
  interpretation: 'Die Schlussfolgerung muss sich ohne vernünftigen Zweifel aus dem Text ergeben. Zu weit gehende Verallgemeinerungen oder neue Ursachen folgen nicht.',
  evaluation: 'Stark = wichtig UND direkt auf die Frage bezogen. Schwach = nebensächlich, emotional, zu allgemein oder nicht direkt relevant – auch wenn es inhaltlich stimmt.',
}
