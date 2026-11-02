import type { CategoryId, Difficulty } from './types'

export interface CategoryMeta {
  id: CategoryId
  letter: string
  name: string
  short: string
  description: string
  /** Where it appears (companies / providers). */
  usedBy: string
  /** Target seconds per item at difficulty 1/2/3 (test level = 2). */
  targetSec: Record<Difficulty, number>
  calculator: 'optional' | 'never'
  academy: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'numerical',
    letter: 'A',
    name: 'Numerical Reasoning',
    short: 'Datenanalyse',
    description: 'Tabellen und Diagramme auswerten: Prozente, Verhältnisse, Durchschnitte, CAGR, Wechselkurse.',
    usedBy: 'Bain (Sova/TestGorilla), BCG CCA, Kearney, Allianz, Deutsche Bank (SHL)',
    targetSec: { 1: 50, 2: 70, 3: 90 },
    calculator: 'optional',
    academy: 'numerical',
  },
  {
    id: 'speed',
    letter: 'B',
    name: 'Speed Math & Kopfrechnen',
    short: 'Kopfrechnen',
    description: 'Kopfrechnen ohne Taschenrechner: Grundrechenarten, Prozent, Brüche, Überschlag, Zahlenreihen.',
    usedBy: 'BCG Cognitive Test (ohne Hilfsmittel), Kearney Recruitment Test (Quant-Teil, laut Berichten ohne Rechner)',
    targetSec: { 1: 15, 2: 22, 3: 30 },
    calculator: 'never',
    academy: 'speed',
  },
  {
    id: 'inductive',
    letter: 'C',
    name: 'Inductive Reasoning',
    short: 'Figurenmuster',
    description: 'Figurenreihen, 3×3-Matrizen und Odd one out: Regeln erkennen und fortführen.',
    usedBy: 'SHL (Deutsche Bank G+, Kearney SHL-Variante), Sova (Bain)',
    targetSec: { 1: 45, 2: 60, 3: 75 },
    calculator: 'never',
    academy: 'inductive',
  },
  {
    id: 'deductive',
    letter: 'D',
    name: 'Deductive Reasoning',
    short: 'Logik',
    description: 'Syllogismen, Reihenfolge- und Terminrätsel, Wenn-dann-Regeln: Was folgt zwingend?',
    usedBy: 'SHL (Deutsche Bank G+, Kearney SHL-Variante), BCG Cognitive Test (Logikteil), Sova (Bain)',
    targetSec: { 1: 45, 2: 70, 3: 90 },
    calculator: 'never',
    academy: 'deductive',
  },
  {
    id: 'verbal',
    letter: 'E',
    name: 'Verbal Reasoning',
    short: 'True / False / Cannot Say',
    description: 'Kurze Business-Texte: Folgt die Aussage aus dem Text, widerspricht sie ihm oder ist es offen?',
    usedBy: 'Allianz, Kearney Recruitment Test (Verbal-Teile), Bain Sova (früher)',
    targetSec: { 1: 45, 2: 50, 3: 60 },
    calculator: 'never',
    academy: 'verbal',
  },
  {
    id: 'critical',
    letter: 'F',
    name: 'Critical Thinking',
    short: 'Watson-Glaser-Stil',
    description: 'Inference, Annahmen, Deduktion, Interpretation und Argumente bewerten.',
    usedBy: 'Bain TestGorilla, Kearney (früher Watson-Glaser)',
    targetSec: { 1: 45, 2: 60, 3: 75 },
    calculator: 'never',
    academy: 'critical',
  },
  {
    id: 'diagrammatic',
    letter: 'G',
    name: 'Diagrammatic Reasoning',
    short: 'Flussdiagramme',
    description: 'Operatoren verändern Zeichenfolgen: Ergebnis bestimmen oder fehlenden Operator finden.',
    usedBy: 'bei den sechs Zielunternehmen nicht ausdrücklich berichtet – Ergänzung für allgemeine Logik-Tests',
    targetSec: { 1: 40, 2: 60, 3: 80 },
    calculator: 'never',
    academy: 'diagrammatic',
  },
  {
    id: 'aon',
    letter: 'H',
    name: 'Aon Games',
    short: 'Switch · Digit · Grid',
    description: 'P&G Interactive Assessment: Switch, Digit und Grid Challenge mit Countdown.',
    usedBy: 'P&G Interactive Assessment (Aon)',
    targetSec: { 1: 15, 2: 20, 3: 30 },
    calculator: 'never',
    academy: 'aon',
  },
  {
    id: 'interactive',
    letter: 'I',
    name: 'SHL Interaktiv',
    short: 'Ziehen & Ordnen',
    description: 'Verify-Interactive-Formate: Balken ziehen, Reihenfolge per Drag & Drop, Tabellenzelle befüllen.',
    usedBy: 'Deutsche Bank (SHL Verify Interactive G+)',
    targetSec: { 1: 60, 2: 90, 3: 110 },
    calculator: 'optional',
    academy: 'interactive',
  },
]

export const CATEGORY_BY_ID: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Einstieg',
  2: 'Test-Niveau',
  3: 'Schwerer als Test',
}
