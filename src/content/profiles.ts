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
  /** Restrict a bank to one subcategory, e.g. 'critical.inference' (5 answer options). */
  sub?: string
  /** Only items whose exhibits are all tables / all charts (e.g. Kearney "reading a table" vs. "reading a graph"). */
  exhibit?: 'table' | 'chart'
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
  { gen: 'ind.series', weight: 2 },
  { gen: 'ind.multi', weight: 2 },
  { gen: 'ind.count', weight: 1 },
  { gen: 'ind.matrix', weight: 2 },
  { gen: 'ind.matrix2', weight: 2 },
  { gen: 'ind.analogy', weight: 1 },
  { gen: 'ind.odd', weight: 1 },
]

const DEDUCTIVE: MixEntry[] = [
  { gen: 'ded.syllogism', weight: 2 },
  { gen: 'ded.ordering', weight: 2 },
  { gen: 'ded.seating', weight: 1 },
  { gen: 'ded.rules', weight: 2 },
  { gen: 'ded.tfc', weight: 1 },
]

/** Date of docs/research.md – shown on the simulation pages. */
export const RD = '02.11.2026'

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
      'Ob Sova oder TestGorilla kommt, steht in deiner Einladung. Berichtet: Sova vor allem in Europa und im Nahen Osten; eigene DACH-Berichte gibt es nicht.',
      'Numerical Reasoning mit Tabellen und Diagrammen, Taschenrechner erlaubt.',
      'Logical Reasoning: Zahlen- und Figurenreihen, Deduktion, visuelle Induktion.',
      'Gesamtdauer laut Berichten ca. 30–40 Minuten (Bain-Angabe, nicht selbst verifiziert; Kandidaten berichten teils länger, inkl. Persönlichkeit/SJT – nicht Teil dieser Simulation).',
    ],
    status: [
      { label: 'Inhalte', value: 'Numerical + Logical', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit je Teil', value: '12 Fragen / 16 bzw. 12 Min.', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: [
      'Verbal Reasoning ist in neueren Durchgängen oft entfallen, kann aber vorkommen.',
      'Im echten Sova-Test läuft laut Berichten teils kein sichtbarer Timer je Abschnitt, die Bearbeitungszeit fließt aber in die Wertung ein. Die festen Zeitlimits hier sind eine Annahme.',
    ],
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
    caveats: ['Gesamtdauer berichtet zwischen ca. 45 und 52 Minuten; die genaue Blockzusammensetzung variiert. Die Simulation bildet nur die drei berichteten Blöcke ab (≈ 32 Min.) – der echte Test hat mehr bzw. längere Blöcke.'],
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
        // Number sequences (speed.sequence) count as "logical": ≈ 67 % arithmetic, 33 % logic, as reported.
        mix: [...SPEED_ALL.map((m) => ({ ...m, weight: m.weight * 2 })), { gen: 'ded.syllogism', weight: 4, d: 1 }, { gen: 'ded.ordering', weight: 2, d: 1 }, { gen: 'ded.rules', weight: 3, d: 1 }, { gen: 'ded.tfc', weight: 2, d: 1 }, { gen: 'ind.series', weight: 2, d: 1 }],
        calculator: false,
      },
    ],
    info: [
      'BCG Schweiz (offiziell): 30-minütiger Cognitive Test mit numerischen, verbalen und logischen Aufgaben, Multiple Choice, ohne Hilfsmittel, ca. einen Monat vor dem ersten Interview.',
      'Berichtet: 80 Fragen in 30 Minuten (≈ 22 Sekunden pro Frage), ca. 60–70 % numerisch, 30–40 % logisch.',
      'Berichtet: kein Taschenrechner, Papier und Stift erlaubt, Live-Aufsicht per Zoom.',
      'Berichtet (StrategyCase, Stand Mai 2026): eingesetzt u. a. in allen deutschen Büros, Österreich, Teilen der Schweiz und den Nordics.',
    ],
    status: [
      { label: 'Dauer 30 Min., Multiple Choice, ohne Hilfsmittel (Angabe BCG Schweiz)', value: 'ja', status: 'offiziell' },
      { label: 'Fragenzahl', value: '80', status: 'berichtet' },
      { label: 'Zurückspringen/Überspringen', value: 'erlaubt', status: 'Annahme' },
      { label: 'Negativwertung', value: 'keine', status: 'Annahme' },
    ],
    caveats: [
      '80 Fragen sind kaum vollständig lösbar – Überspringen ist Teil der Strategie.',
      'Diese Simulation enthält keine Verbal-Aufgaben. BCG Schweiz nennt offiziell auch verbale Fähigkeiten, Prep-Quellen berichten von wenig bis keinem Verbal-Anteil – Verbal Reasoning separat üben.',
    ],
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
      { label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' },
      { label: 'Interaktive SHL-Formate', value: 'enthalten', status: 'Annahme' },
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
      // Section sizes 8/6/6/8/6/6 as reported by StrategyCase; no calculator (pen and paper, candidate reports).
      { id: 'q1', title: 'Quantitativ: logisches Rechnen', timeLimitSec: 0, count: 8, mix: [...SPEED_ALL, { gen: 'num.pctchange', weight: 2 }], calculator: false },
      { id: 'q2', title: 'Quantitativ II (Textaufgaben)', timeLimitSec: 0, count: 6, mix: [{ gen: 'speed.word', weight: 3 }, { gen: 'speed.equation', weight: 2 }, { gen: 'speed.rule3', weight: 2 }, { gen: 'speed.percent', weight: 1 }], calculator: false },
      { id: 'v1', title: 'Verbal: logische Texte', timeLimitSec: 0, count: 6, mix: [{ gen: 'ded.rules', weight: 2 }, { gen: 'ded.syllogism', weight: 2 }, { bank: 'critical', sub: 'critical.inference', weight: 2 }], calculator: false },
      { id: 'v2', title: 'Verbal: Textverständnis', timeLimitSec: 0, count: 8, mix: [{ bank: 'verbal', weight: 2 }, { bank: 'critical', sub: 'critical.inference', weight: 1 }], calculator: false },
      { id: 'c1', title: 'Case: Tabellen', timeLimitSec: 0, count: 6, mix: NUM_ALL.map((m) => ({ ...m, exhibit: 'table' as const })), calculator: false },
      { id: 'c2', title: 'Case: Grafiken', timeLimitSec: 0, count: 6, mix: NUM_ALL.map((m) => ({ ...m, d: 3 as Difficulty, exhibit: 'chart' as const })), calculator: false },
    ],
    info: [
      '40 Fragen in 60 Minuten (≈ 1:30 Min. pro Frage), sechs Abschnitte: quantitativ, verbal und Case-Datenauswertung.',
      'Wertung: +5 Punkte richtig, −1 Punkt falsch, 0 Punkte leer (max. 200).',
      'Raten: Bei +5/−1/0 hat schon blindes Raten einen positiven Erwartungswert (+0,2 Punkte bei 5 Optionen, +0,5 bei 4), leer lassen bringt sicher 0. Also keine Frage leer lassen: lösbare zuerst, vor Ablauf alle offenen ankreuzen. Jede ausgeschlossene Option macht Raten noch lohnender.',
      'Laut Kandidatenberichten ohne Taschenrechner (Papier und Stift) – nicht offiziell bestätigt.',
      'Kearney bietet laut Prep-Quellen einen kostenlosen Übungstest auf der eigenen Website an.',
    ],
    status: [
      { label: '40 Fragen / 60 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Wertung +5/−1/0', value: 'ja', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'nicht erlaubt (Papier + Stift)', status: 'berichtet' },
      { label: 'Zurückspringen', value: 'erlaubt', status: 'Annahme' },
    ],
    caveats: [
      'Keine offizielle Kearney-Quelle gefunden; die Abschnittsaufteilung wird unterschiedlich beschrieben.',
      'Das Format „Data Sufficiency“ (berichtet im zweiten Quant-Teil) gibt es in der App nicht; dort kommen Textaufgaben.',
      'Die Textverständnis-Aufgaben haben hier 3 Optionen (Wahr/Falsch/Nicht bestimmbar), im echten Test laut Berichten 4–5 – Raten bringt hier also mehr als im Original.',
      'Manche Büros nutzen stattdessen SHL-Tests oder einen Excel-Test, früher Watson-Glaser (→ Kategorie F üben).',
    ],
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
    info: ['Drei SHL-Tests: Numerical, Deductive und Inductive Reasoning, je ca. 20 Minuten (Kandidatenbericht).', 'Annahme: keine Abzüge für falsche Antworten (bei SHL-Tests üblich, für Kearney nicht belegt).'],
    status: [
      { label: '3 × ca. 20 Min. (Einzelquelle)', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl je Test', value: '14 / 16 / 18', status: 'Annahme' },
      { label: 'Negativwertung', value: 'keine', status: 'Annahme' },
      { label: 'Adaptiv', value: 'nein', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: ['Beruht auf einem einzelnen Kandidatenbericht; SHL G+ wird sonst als ein gemischter 36-Minuten-Test beschrieben.', 'SHL-Verify-Tests sind laut SHL teils adaptiv – die Simulation ist es nicht.'],
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
    difficulty: 1, // the games start easy and adapt upwards
    sections: [
      { id: 'switch', title: 'Switch Challenge', timeLimitSec: 6 * 60, count: null, mix: [{ gen: 'aon.switch', weight: 1 }], calculator: false, game: 'switch' },
      { id: 'digit', title: 'Digit Challenge', timeLimitSec: 5 * 60, count: null, mix: [{ gen: 'aon.digit', weight: 1 }], calculator: false, game: 'digit' },
      { id: 'grid', title: 'Grid Challenge', timeLimitSec: 6 * 60, count: null, mix: [{ gen: 'aon.grid', weight: 1 }], calculator: false, game: 'grid' },
    ],
    info: [
      'P&G (offiziell): Interactive Assessment, ca. 30 Minuten, kurze kognitive Aufgaben, mobil nutzbar.',
      'Berichtet: drei Aon-Spiele – Switch (~6 Min.), Digit (~5 Min.), Grid (~6–9 Min.). Switch: so viele Aufgaben wie möglich, adaptiv. Digit und Grid sind in der App genauso umgesetzt (Annahme).',
      'Kein Zurückspringen.',
    ],
    status: [
      { label: 'ca. 30 Min., kognitive Aufgaben', value: 'ja', status: 'offiziell' },
      { label: 'Spiele Switch/Digit/Grid', value: 'ja', status: 'berichtet' },
      { label: 'Zeiten 6/5/6 Min. (Grid berichtet 6–9, App: 6)', value: 'ja', status: 'berichtet' },
      { label: 'Adaptiv (Digit/Grid)', value: 'ja', status: 'Annahme' },
      { label: 'Digit: ohne Rechner', value: 'ja', status: 'Annahme' },
      { label: 'Digit: Punkt vor Strich', value: 'ja', status: 'Annahme' },
    ],
    caveats: [
      'Je nach Rolle werden ein, zwei oder alle drei Spiele verlangt – einzelne Spiele übst du unter Üben → Aon-Spiele.',
      'Offiziell ca. 30 Min. insgesamt (vermutlich inkl. Anleitungen und Übungsrunden); die reine Spielzeit hier beträgt 17 Min.',
      'Eine Quelle nennt bei Digit einen Taschenrechner als erlaubt; bei einstelligen Ziffern kaum relevant.',
      'PEAK Performance (Persönlichkeit/SJT) ist nicht Teil der App.',
    ],
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
      'Laut Allianz-FAQ auf ausbildung.de (für Ausbildung und duales Studium): Zugang zum Online-Assessment-Center per E-Mail, 14 Tage Bearbeitungszeit. Ob das für Trainee- oder Direkteinstieg genauso gilt, ist nicht belegt.',
      'Berichtet: Numerical mit Diagrammen und Tabellen (≈ 1 Minute pro Frage), Verbal (Aussagen zu kurzen Texten), teils Logical Reasoning.',
    ],
    status: [
      { label: 'Online-Assessment, 14 Tage (Allianz-FAQ, Ausbildung/duales Studium)', value: 'ja', status: 'berichtet' },
      { label: 'Numerical ≈ 1 Min./Frage', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit', value: '15/16/12 Fragen, 15/12/12 Min.', status: 'Annahme' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' },
      { label: 'Negativwertung', value: 'keine', status: 'Annahme' },
      { label: 'Zurückspringen', value: 'nein', status: 'Annahme' },
    ],
    caveats: ['Anbieter und genaue Zusammensetzung sind nicht belastbar bekannt; Logical Reasoning kommt laut Berichten nur teils vor.'],
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
      'Berichtet: interaktive Antwortformate (Balken oder Linien ziehen, Diagramme anpassen, Elemente anordnen, Felder antippen) statt nur Multiple Choice. Die App übt Balken, Reihenfolge und Tabellenzelle.',
      'Berichtet: adaptiv (laut SHL-Factsheet), kein Zurückspringen. Dazu SJT und OPQ (nicht Teil der App).',
    ],
    status: [
      { label: '24 Fragen / 36 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Adaptiv', value: 'ja', status: 'berichtet' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' },
    ],
    caveats: [
      'Keine offizielle Deutsche-Bank-Quelle gefunden.',
      'Teils kommt stattdessen die Multiple-Choice-Version von G+ (30 Fragen / 36 Min.) oder ein separater Numerical-Test (18–25 Fragen, 12–25 Min., Profil „Deutsche Bank – Numerical“).',
    ],
  },
  {
    id: 'db-numerical',
    company: 'Deutsche Bank',
    name: 'Deutsche Bank – Numerical (separat)',
    provider: 'SHL',
    researchDate: RD,
    allowBack: false,
    allowSkip: false,
    adaptive: false,
    scoring: { correct: 1, wrong: 0, blank: 0 },
    difficulty: 2,
    sections: [{ id: 'num', title: 'Numerical Reasoning', timeLimitSec: 20 * 60, count: 20, mix: NUM_ALL, calculator: true }],
    info: ['Berichtet: separater Numerical-Test mit 18–25 Fragen in 12–25 Minuten, Taschenrechner erlaubt, keine Abzüge.'],
    status: [
      { label: '18–25 Fragen / 12–25 Min.', value: 'ja', status: 'berichtet' },
      { label: 'Fragenzahl/Zeit hier', value: '20 Fragen / 20 Min.', status: 'Annahme' },
      { label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' },
      { label: 'Adaptiv / Zurückspringen', value: 'nein / nein', status: 'Annahme' },
    ],
    caveats: ['Keine offizielle Deutsche-Bank-Quelle gefunden; Fragenzahl und Zeit schwanken in den Berichten stark.'],
  },
]

export function getProfile(id: string): Profile | undefined {
  return PROFILES.find((p) => p.id === id)
}
