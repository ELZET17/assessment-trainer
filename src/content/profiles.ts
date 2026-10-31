/**
 * Test simulation profiles. All parameters are configurable here and carry
 * the research status from docs/research.md (offiziell / berichtet / Annahme).
 * Formats vary by office – the invitation is always authoritative.
 */
import type { Difficulty } from './types'

export type Status = 'offiziell' | 'berichtet' | 'Annahme'

export interface MixEntry {
  /** Generator id, or a bank. */
  gen?: string
  bank?: 'verbal' | 'critical'
  weight: number
  d?: Difficulty
}

export interface SectionSpec {
  id: string
  title: string
  /** Seconds for this section (ignored if the profile uses a total timer). */
  timeLimitSec: number
  /** Number of items; null = unlimited (Aon games: as many as possible). */
  count: number | null
  mix: MixEntry[]
  calculator: boolean
  game?: 'switch' | 'digit' | 'grid'
}

export interface Profile {
  id: string
  company: string
  name: string
  provider: string
  researchDate: string
  /** One total timer across all sections (Kearney) instead of per-section timers. */
  totalTimeSec?: number
  allowBack: boolean
  allowSkip: boolean
  adaptive: boolean
  scoring: { correct: number; wrong: number; blank: number }
  difficulty: Difficulty
  sections: SectionSpec[]
  /** "So sieht der echte Test aus (laut Recherche …)". */
  info: string[]
  status: { label: string; value: string; status: Status }[]
  caveats: string[]
}

const NUM_ALL: MixEntry[] = [
  { gen: 'num.pctchange', weight: 2 },
  { gen: 'num.ppoints', weight: 1 },
  { gen: 'num.share', weight: 2 },
  { gen: 'num.ratio', weight: 1 },
  { gen: 'num.units', weight: 1 },
  { gen: 'num.extreme', weight: 1 },
  { gen: 'num.fx', weight: 1 },
  { gen: 'num.average', weight: 1 },
  { gen: 'num.stats', weight: 1 },
  { gen: 'num.cagr', weight: 1 },
  { gen: 'num.index', weight: 1 },
  { gen: 'num.projection', weight: 1 },
]

const SPEED_ALL: MixEntry[] = [
  { gen: 'speed.addsub', weight: 1 },
  { gen: 'speed.mul', weight: 2 },
  { gen: 'speed.div', weight: 1 },
  { gen: 'speed.squares', weight: 1 },
  { gen: 'speed.percent', weight: 3 },
  { gen: 'speed.fraction', weight: 2 },
  { gen: 'speed.estimate', weight: 2 },
  { gen: 'speed.rule3', weight: 1 },
  { gen: 'speed.equation', weight: 1 },
  { gen: 'speed.word', weight: 2 },
  { gen: 'speed.units', weight: 1 },
  { gen: 'speed.sequence', weight: 2 },
]

const INDUCTIVE: MixEntry[] = [
  { gen: 'ind.series', weight: 3 },
  { gen: 'ind.matrix', weight: 2 },
  { gen: 'ind.odd', weight: 1 },
]

const DEDUCTIVE: MixEntry[] = [
  { gen: 'ded.syllogism', weight: 2 },
  { gen: 'ded.ordering', weight: 2 },
  { gen: 'ded.seating', weight: 1 },
  { gen: 'ded.rules', weight: 2 },
  { gen: 'ded.tfc', weight: 1 },
]

const RD = '31.10.2026'

export const PROFILES: Profile[] = [
  {
    id: 'bain-sova',
    company: 'Bain',
    name: 'Bain – Sova (Europa)',
    provider: 'Sova',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'num', title: 'Numerical Reasoning', timeLimitSec: 16 * 60, count: 12, mix: NUM_ALL, calculator: true },
      { id: 'log', title: 'Logical Reasoning', timeLimitSec: 12 * 60, count: 12, mix: [...INDUCTIVE, { gen: 'ded.syllogism', weight: 1 }, { gen: 'ded.ordering', weight: 1 }, { gen: 'speed.sequence', weight: 2 }], calculator: false },
    ],
    info: [
      'Anbieter Sova, vor allem in Europa und im Nahen Osten.',
      'Numerical Reasoning mit Tabellen und Diagrammen, Taschenrechner erlaubt.',
      'Logical Reasoning: Zahlen- und Figurenreihen, Deduktion, visuelle Induktion.',
      'Gesamtdauer laut Bain ca. 30–40 Minuten (Kandidaten berichten teils länger, inkl. Persönlichkeit/SJT – nicht Teil dieser Simulation).',
    ],
    status: [
      { label: 'Inhalte', value: 'Numerical + Logical', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit je Teil', value: '12 Fragen / 16 bzw. 12 Min.', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: ['Verbal Reasoning ist in neueren Durchgängen oft entfallen, kann aber vorkommen.', 'Bei Sova fließt teils die Bearbeitungszeit in die Wertung ein.'],
  },
  {
    id: 'bain-tg',
    company: 'Bain',
    name: 'Bain – TestGorilla',
    provider: 'TestGorilla',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'num', title: 'Numerical Reasoning', timeLimitSec: 10 * 60, count: 10, mix: [...NUM_ALL, { gen: 'speed.sequence', weight: 3 }], calculator: true },
      { id: 'ct', title: 'Critical Thinking', timeLimitSec: 10 * 60, count: 10, mix: [{ bank: 'critical', weight: 3 }, { gen: 'ded.syllogism', weight: 1 }, { gen: 'ded.rules', weight: 1 }], calculator: false },
      { id: 'data', title: 'Data Interpretation', timeLimitSec: 12 * 60, count: 8, mix: NUM_ALL.map((m) => ({ ...m, d: 3 as Difficulty })), calculator: true },
    ],
    info: [
      'Anbieter TestGorilla, vor allem in den USA, teils auch in Europa.',
      'Mehrere zeitlich begrenzte Blöcke à ca. 8–15 Minuten mit je ca. 6–10 Multiple-Choice-Fragen.',
      'Numerical Reasoning (inkl. Zahlenreihen), Critical Thinking, Data Interpretation.',
      'Kein Zurückspringen zu früheren Fragen.',
    ],
    status: [
      { label: 'Blöcke', value: 'Numerical, Critical Thinking, Data Interpretation', status: 'berichtet' },
      { label: 'Zurückspringen', value: 'nein', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit', value: '10/10/8 Fragen, 10/10/12 Min.', status: 'Annahme' },
    ],
    caveats: ['Gesamtdauer berichtet zwischen ca. 45 und 52 Minuten; die genaue Blockzusammensetzung variiert.'],
  },
  {
    id: 'bcg-cognitive',
    company: 'BCG',
    name: 'BCG – Cognitive Test (80 Fragen / 30 Min.)',
    provider: 'BCG (live beaufsichtigt)',
    researchDate: RD,
    allowBack: true,
    allowSkip: true,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      {
        id: 'all',
        title: 'Cognitive Test',
        timeLimitSec: 30 * 60,
        count: 80,
        mix: [...SPEED_ALL.map((m) => ({ ...m, weight: m.weight * 2 })), { gen: 'ded.syllogism', weight: 4, d: 1 }, { gen: 'ded.ordering', weight: 2, d: 1 }, { gen: 'ded.rules', weight: 3, d: 1 }, { gen: 'ded.tfc', weight: 2, d: 1 }, { gen: 'ind.series', weight: 2, d: 1 }],
        calculator: false,
      },
    ],
    info: [
      'BCG Schweiz (offiziell): 30-minütiger Cognitive Test mit numerischen, verbalen und logischen Aufgaben, Multiple Choice, ohne Hilfsmittel.',
      'Berichtet: 80 Fragen in 30 Minuten (≈ 22 Sekunden pro Frage), ca. 60–70 % numerisch, 30–40 % logisch.',
      'Kein Taschenrechner; Papier und Stift erlaubt; Live-Aufsicht per Video.',
      'Eingesetzt u. a. in allen deutschen Büros, Österreich, Teilen der Schweiz und den Nordics.',
    ],
    status: [
      { label: 'Dauer 30 Min., ohne Hilfsmittel', value: 'ja', status: 'offiziell' },
      { label: 'Fragenzahl', value: '80', status: 'berichtet' },
      { label: 'Zurückspringen/Überspringen', value: 'erlaubt', status: 'Annahme' },
      { label: 'Negativwertung', value: 'keine', status: 'Annahme' },
    ],
    caveats: ['80 Fragen sind kaum vollständig lösbar – Überspringen ist Teil der Strategie.', 'Der Anteil verbaler Aufgaben ist unklar (Quellen widersprüchlich).'],
  },
  {
    id: 'bcg-cca',
    company: 'BCG',
    name: 'BCG – CCA kognitiver Teil (SHL-Stil)',
    provider: 'SHL',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'num', title: 'Numerical Reasoning (SHL)', timeLimitSec: 20 * 60, count: 15, mix: [...NUM_ALL, { gen: 'int.bar', weight: 2 }, { gen: 'int.order', weight: 2 }, { gen: 'int.tablefill', weight: 2 }], calculator: true },
    ],
    info: [
      'Consulting Career Assessment: von SHL entwickelt und durchgeführt, misst kognitive Fähigkeiten und Verhaltensmerkmale.',
      'Berichtet: ein numerischer Block (SHL-Stil) eingebettet zwischen Work-Style-Teilen; nur ein Versuch.',
      'Diese Simulation trainiert nur den kognitiven (numerischen) Teil.',
    ],
    status: [
      { label: 'Anbieter SHL', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit', value: '15 Fragen / 20 Min.', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: ['Der genaue Aufbau des CCA ist nicht öffentlich; Work-Style-Teile sind nicht Teil der App.'],
  },
  {
    id: 'kearney-test',
    company: 'Kearney',
    name: 'Kearney – Recruitment Test (40 / 60, +5/−1)',
    provider: 'Kearney',
    researchDate: RD,
    totalTimeSec: 60 * 60,
    allowBack: true,
    allowSkip: true,
    adaptive: false,
    scoring: { correct: 5, wrong: -1, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'q1', title: 'Quantitativ I', timeLimitSec: 0, count: 7, mix: [...SPEED_ALL, { gen: 'num.pctchange', weight: 2 }], calculator: true },
      { id: 'v1', title: 'Verbal I', timeLimitSec: 0, count: 7, mix: [{ bank: 'verbal', weight: 3 }, { bank: 'critical', weight: 1 }], calculator: true },
      { id: 'c1', title: 'Case-Daten I', timeLimitSec: 0, count: 6, mix: NUM_ALL, calculator: true },
      { id: 'q2', title: 'Quantitativ II', timeLimitSec: 0, count: 7, mix: [...SPEED_ALL, { gen: 'ded.rules', weight: 2 }, { gen: 'ded.syllogism', weight: 2 }], calculator: true },
      { id: 'v2', title: 'Verbal II', timeLimitSec: 0, count: 7, mix: [{ bank: 'verbal', weight: 2 }, { bank: 'critical', weight: 2 }], calculator: true },
      { id: 'c2', title: 'Case-Daten II', timeLimitSec: 0, count: 6, mix: NUM_ALL.map((m) => ({ ...m, d: 3 as Difficulty })), calculator: true },
    ],
    info: [
      '40 Fragen in 60 Minuten (≈ 1:30 Min. pro Frage), sechs Abschnitte: quantitativ, verbal und Case-Datenauswertung.',
      'Wertung: +5 Punkte richtig, −1 Punkt falsch, 0 Punkte leer (max. 200).',
      'Raten: Bei +5/−1 hat schon blindes Raten einen leicht positiven Erwartungswert (+0,2 Punkte bei 5 Optionen); nach Ausschluss einer Option lohnt es sich deutlich.',
    ],
    status: [
      { label: '40 Fragen / 60 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Wertung +5/−1/0', value: 'ja', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'erlaubt', status: 'Annahme' },
    ],
    caveats: ['Keine offizielle Kearney-Quelle gefunden; die Abschnittsaufteilung wird unterschiedlich beschrieben.', 'Manche Büros nutzen stattdessen SHL-Tests oder einen Excel-Test.'],
  },
  {
    id: 'kearney-shl',
    company: 'Kearney',
    name: 'Kearney – SHL General Ability',
    provider: 'SHL',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'num', title: 'Numerical', timeLimitSec: 20 * 60, count: 14, mix: NUM_ALL, calculator: true },
      { id: 'ded', title: 'Deductive', timeLimitSec: 20 * 60, count: 16, mix: DEDUCTIVE, calculator: false },
      { id: 'ind', title: 'Inductive', timeLimitSec: 20 * 60, count: 18, mix: INDUCTIVE, calculator: false },
    ],
    info: ['Drei SHL-Tests: Numerical, Deductive und Inductive Reasoning, je ca. 20 Minuten (Kandidatenbericht).', 'Positive Wertung, keine Abzüge.'],
    status: [
      { label: '3 × ca. 20 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl je Test', value: '14 / 16 / 18', status: 'Annahme' },
    ],
    caveats: ['Beruht auf einem einzelnen Kandidatenbericht; SHL G+ wird sonst als ein gemischter 36-Minuten-Test beschrieben.'],
  },
  {
    id: 'pg-interactive',
    company: 'P&G',
    name: 'P&G – Interactive Assessment (Aon)',
    provider: 'Aon (cut-e)',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: true,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'switch', title: 'Switch Challenge', timeLimitSec: 6 * 60, count: null, mix: [{ gen: 'aon.switch', weight: 1 }], calculator: false, game: 'switch' },
      { id: 'digit', title: 'Digit Challenge', timeLimitSec: 5 * 60, count: null, mix: [{ gen: 'aon.digit', weight: 1 }], calculator: false, game: 'digit' },
      { id: 'grid', title: 'Grid Challenge', timeLimitSec: 6 * 60, count: null, mix: [{ gen: 'aon.grid', weight: 1 }], calculator: false, game: 'grid' },
    ],
    info: [
      'P&G (offiziell): Interactive Assessment, ca. 30 Minuten, kurze kognitive Aufgaben, mobil nutzbar.',
      'Berichtet: drei Aon-Spiele – Switch (~6 Min.), Digit (~5 Min.), Grid (~6–9 Min.); so viele Aufgaben wie möglich, Schwierigkeit steigt bei richtigen Antworten.',
      'Kein Zurückspringen.',
    ],
    status: [
      { label: 'ca. 30 Min., kognitive Aufgaben', value: 'ja', status: 'offiziell' },
      { label: 'Spiele Switch/Digit/Grid', value: 'ja', status: 'berichtet' },
      { label: 'Zeiten 6/5/6 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Digit: Punkt vor Strich', value: 'ja', status: 'Annahme' },
    ],
    caveats: ['Je nach Rolle werden ein, zwei oder alle drei Spiele verlangt.', 'PEAK Performance (Persönlichkeit/SJT) ist nicht Teil der App.'],
  },
  {
    id: 'allianz',
    company: 'Allianz',
    name: 'Allianz – Online-Assessment',
    provider: 'unbekannt (Aon-ähnlich)',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      { id: 'num', title: 'Numerical Reasoning', timeLimitSec: 15 * 60, count: 15, mix: NUM_ALL, calculator: true },
      { id: 'verb', title: 'Verbal Reasoning', timeLimitSec: 12 * 60, count: 16, mix: [{ bank: 'verbal', weight: 1 }], calculator: false },
      { id: 'log', title: 'Logical Reasoning', timeLimitSec: 12 * 60, count: 12, mix: [...INDUCTIVE, { gen: 'speed.sequence', weight: 2 }], calculator: false },
    ],
    info: [
      'Allianz Deutschland (offiziell): Online-Assessment-Center per E-Mail-Link, 14 Tage Bearbeitungszeit.',
      'Berichtet: Numerical mit Diagrammen und Tabellen (≈ 1 Minute pro Frage), Verbal (Aussagen zu kurzen Texten), teils Logical Reasoning.',
    ],
    status: [
      { label: 'Online-Assessment, 14 Tage Frist', value: 'ja', status: 'offiziell' },
      { label: 'Numerical ≈ 1 Min./Frage', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit', value: '15/16/12 Fragen', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: ['Anbieter und genaue Zusammensetzung sind nicht belastbar bekannt.'],
  },
  {
    id: 'db-shl',
    company: 'Deutsche Bank',
    name: 'Deutsche Bank – SHL Verify Interactive G+',
    provider: 'SHL',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: true,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [
      {
        id: 'gplus',
        title: 'General Ability (interaktiv)',
        timeLimitSec: 36 * 60,
        count: 24,
        mix: [{ gen: 'int.bar', weight: 2 }, { gen: 'int.order', weight: 2 }, { gen: 'int.tablefill', weight: 2 }, ...NUM_ALL.map((m) => ({ ...m, weight: m.weight / 4 })), ...INDUCTIVE, ...DEDUCTIVE.map((m) => ({ ...m, weight: m.weight / 2 }))],
        calculator: true,
      },
    ],
    info: [
      'Berichtet: SHL Verify Interactive G+ mit ca. 24 Fragen in 36 Minuten, gemischt aus Numerical, Inductive und Deductive Reasoning.',
      'Interaktive Antwortformate (Balken ziehen, Elemente anordnen, Werte eintragen) statt nur Multiple Choice.',
      'Adaptiv: Die Schwierigkeit passt sich an. Kein Zurückspringen. Dazu SJT und OPQ (nicht Teil der App).',
    ],
    status: [
      { label: '24 Fragen / 36 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Adaptiv', value: 'ja', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' },
    ],
    caveats: ['Keine offizielle Deutsche-Bank-Quelle gefunden; einzelne Quellen nennen zusätzlich Verbal Reasoning.'],
  },
]

export function getProfile(id: string): Profile | undefined {
  return PROFILES.find((p) => p.id === id)
}
