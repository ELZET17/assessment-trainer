import type { Difficulty, Txt } from '../types'

/** Typical traps in True/False/Cannot Say items (trained explicitly). */
export type VerbalTrap =
  | 'prior-knowledge'
  | 'some-all'
  | 'causation'
  | 'temporal'
  | 'paraphrase'
  | 'negation'
  | 'comparison'
  | 'quantity'
  | 'none'

export interface VerbalStatement {
  /** Unique within the bank, e.g. "v07-3". */
  id: string
  text: Txt
  answer: 'T' | 'F' | 'C'
  /** German justification citing the relevant sentence of the passage. */
  reason: string
  trap: VerbalTrap
}

export interface VerbalPassage {
  id: string
  topic: string
  difficulty: Difficulty
  title: Txt
  text: Txt
  statements: VerbalStatement[]
}

export type CriticalType = 'inference' | 'assumption' | 'deduction' | 'interpretation' | 'evaluation'

export interface CriticalItem {
  id: string
  type: CriticalType
  difficulty: Difficulty
  /** Passage, statement, premises or question (depending on type). */
  stimulus: Txt
  /** The inference / assumption / conclusion / argument to judge. */
  proposition: Txt
  /** Index into CRITICAL_OPTIONS[type]. */
  answer: number
  /** German explanation. */
  reason: string
}

export const VERBAL_OPTIONS = { en: ['True', 'False', 'Cannot say'], de: ['Wahr', 'Falsch', 'Nicht bestimmbar'] }
export const VERBAL_INDEX = { T: 0, F: 1, C: 2 } as const

export const CRITICAL_OPTIONS: Record<CriticalType, { en: string[]; de: string[] }> = {
  inference: {
    en: ['True', 'Probably true', 'Insufficient data', 'Probably false', 'False'],
    de: ['Wahr', 'Wahrscheinlich wahr', 'Unzureichende Daten', 'Wahrscheinlich falsch', 'Falsch'],
  },
  assumption: { en: ['Assumption made', 'Assumption not made'], de: ['Annahme wird gemacht', 'Annahme wird nicht gemacht'] },
  deduction: { en: ['Conclusion follows', 'Conclusion does not follow'], de: ['Schlussfolgerung folgt', 'Schlussfolgerung folgt nicht'] },
  interpretation: { en: ['Conclusion follows', 'Conclusion does not follow'], de: ['Schlussfolgerung folgt', 'Schlussfolgerung folgt nicht'] },
  evaluation: { en: ['Strong argument', 'Weak argument'], de: ['Starkes Argument', 'Schwaches Argument'] },
}

export const CRITICAL_PROMPTS: Record<CriticalType, { en: string; de: string }> = {
  inference: {
    en: 'Based on the passage, how would you rate the proposed inference?',
    de: 'Wie bewertest du die vorgeschlagene Schlussfolgerung auf Basis des Textes?',
  },
  assumption: {
    en: 'Is the following assumption made in the statement?',
    de: 'Wird die folgende Annahme in der Aussage stillschweigend gemacht?',
  },
  deduction: {
    en: 'Assume the statements are true. Does the conclusion necessarily follow?',
    de: 'Angenommen, die Aussagen sind wahr. Folgt die Schlussfolgerung zwingend?',
  },
  interpretation: {
    en: 'Assume the passage is true. Does the conclusion follow beyond a reasonable doubt?',
    de: 'Angenommen, der Text ist wahr. Folgt die Schlussfolgerung ohne vernünftigen Zweifel?',
  },
  evaluation: {
    en: 'Is the argument strong or weak in relation to the question?',
    de: 'Ist das Argument in Bezug auf die Frage stark oder schwach?',
  },
}

export const TRAP_DE: Record<VerbalTrap, string> = {
  'prior-knowledge': 'Falle „Vorwissen“: Nur der Text zählt – auch wenn die Aussage in der Realität stimmt.',
  'some-all': 'Falle „einige vs. alle“: Signalwörter genau vergleichen (some, most, all, only, never).',
  causation: 'Falle „Korrelation vs. Kausalität“: Dass zwei Dinge zusammen auftreten, heißt nicht, dass eins das andere verursacht.',
  temporal: 'Falle „Zeitbezug“: Gilt die Aussage für denselben Zeitraum wie der Text?',
  paraphrase: 'Umformulierung: Prüfe, ob die Aussage inhaltlich exakt dasselbe sagt wie der Text.',
  negation: 'Verneinung: Doppelte oder versteckte Verneinungen sorgfältig auflösen.',
  comparison: 'Vergleich: Steht der Vergleich (mehr/weniger/größter) wirklich so im Text?',
  quantity: 'Zahlen/Mengen: Exakte Werte und Einheiten vergleichen.',
  none: 'Direkt mit dem Text abgleichen.',
}
