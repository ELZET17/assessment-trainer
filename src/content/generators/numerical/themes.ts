/** Business data themes for Numerical Reasoning (fictional, original data). */
import type { Lang } from '../../types'

export interface Theme {
  id: string
  title: { en: string; de: string }
  unit: { en: string; de: string }
  /** Entity rows (EN/DE). */
  rows: [string, string][]
  entity: { en: string; de: string; dePlural: string; enPlural: string; deWhich: 'Welche' | 'Welcher' }
  /** Noun phrase in nominative, e.g. "revenue in Europe" / "der Umsatz in Europa". */
  subj: { en: (r: string) => string; de: (r: string) => string }
  /** German verb agreement for subj ("ist" vs. "sind"). */
  dePlural: boolean
  /** English verb agreement for subj ("unit sales were" vs. "revenue was"). */
  enPlural: boolean
  /** EN: "total revenue of all regions shown"; DE incl. preposition: "am Gesamtumsatz …" */
  total: { en: string; de: string }
  range: [number, number]
  decimals: number
  growth: [number, number]
}

export const THEMES: Theme[] = [
  {
    id: 'revenue',
    title: { en: 'Revenue by region', de: 'Umsatz nach Region' },
    unit: { en: 'EUR million', de: 'Mio. EUR' },
    rows: [
      ['North America', 'Nordamerika'],
      ['Europe', 'Europa'],
      ['Asia-Pacific', 'Asien-Pazifik'],
      ['Latin America', 'Lateinamerika'],
      ['Middle East', 'Naher Osten'],
      ['Africa', 'Afrika'],
    ],
    entity: { en: 'region', enPlural: 'regions', de: 'Region', dePlural: 'Regionen', deWhich: 'Welche' },
    subj: { en: (r) => `revenue in ${r}`, de: (r) => `der Umsatz in ${r}` },
    dePlural: false,
    enPlural: false,
    total: { en: 'total revenue of all regions shown', de: 'am Gesamtumsatz aller dargestellten Regionen' },
    range: [120, 980],
    decimals: 0,
    growth: [-0.08, 0.18],
  },
  {
    id: 'units',
    title: { en: 'Units sold by product line', de: 'Verkaufte Einheiten nach Produktlinie' },
    unit: { en: 'thousand units', de: 'Tsd. Stück' },
    rows: [
      ['Laptops', 'Laptops'],
      ['Tablets', 'Tablets'],
      ['Monitors', 'Monitore'],
      ['Printers', 'Drucker'],
      ['Headsets', 'Headsets'],
      ['Docks', 'Dockingstationen'],
    ],
    entity: { en: 'product line', enPlural: 'product lines', de: 'Produktlinie', dePlural: 'Produktlinien', deWhich: 'Welche' },
    subj: { en: (r) => `unit sales of ${r}`, de: (r) => `der Absatz von ${r}` },
    dePlural: false,
    enPlural: true,
    total: { en: 'total unit sales of all product lines shown', de: 'am Gesamtabsatz aller dargestellten Produktlinien' },
    range: [40, 650],
    decimals: 1,
    growth: [-0.1, 0.2],
  },
  {
    id: 'staff',
    title: { en: 'Employees by department', de: 'Mitarbeitende nach Abteilung' },
    unit: { en: 'employees', de: 'Personen' },
    rows: [
      ['Sales', 'Vertrieb'],
      ['R&D', 'F&E'],
      ['Operations', 'Betrieb'],
      ['Finance', 'Finanzen'],
      ['Marketing', 'Marketing'],
      ['IT', 'IT'],
    ],
    entity: { en: 'department', enPlural: 'departments', de: 'Abteilung', dePlural: 'Abteilungen', deWhich: 'Welche' },
    subj: { en: (r) => `headcount in ${r}`, de: (r) => `die Mitarbeiterzahl der Abteilung ${r}` },
    dePlural: false,
    enPlural: false,
    total: { en: 'total headcount of all departments shown', de: 'an der Gesamtzahl der Mitarbeitenden aller dargestellten Abteilungen' },
    range: [35, 480],
    decimals: 0,
    growth: [-0.06, 0.15],
  },
  {
    id: 'passengers',
    title: { en: 'Passengers by airport', de: 'Passagiere nach Flughafen' },
    unit: { en: 'million passengers', de: 'Mio. Passagiere' },
    rows: [
      ['Northfield', 'Northfield'],
      ['Easton', 'Easton'],
      ['Westbay', 'Westbay'],
      ['Southport', 'Southport'],
      ['Lakeside', 'Lakeside'],
      ['Hillcrest', 'Hillcrest'],
    ],
    entity: { en: 'airport', enPlural: 'airports', de: 'Flughafen', dePlural: 'Flughäfen', deWhich: 'Welcher' },
    subj: { en: (r) => `passenger numbers at ${r}`, de: (r) => `die Passagierzahl am Flughafen ${r}` },
    dePlural: false,
    enPlural: true,
    total: { en: 'total passengers of all airports shown', de: 'an der Gesamtzahl der Passagiere aller dargestellten Flughäfen' },
    range: [3, 48],
    decimals: 1,
    growth: [-0.05, 0.14],
  },
  {
    id: 'energy',
    title: { en: 'Electricity generation by source', de: 'Stromerzeugung nach Quelle' },
    unit: { en: 'TWh', de: 'TWh' },
    rows: [
      ['Solar', 'Solarenergie'],
      ['Wind', 'Windenergie'],
      ['Hydro', 'Wasserkraft'],
      ['Gas', 'Gas'],
      ['Nuclear', 'Kernkraft'],
      ['Biomass', 'Biomasse'],
    ],
    entity: { en: 'source', enPlural: 'sources', de: 'Quelle', dePlural: 'Quellen', deWhich: 'Welche' },
    subj: { en: (r) => `electricity generation from ${r}`, de: (r) => `die Stromerzeugung aus ${r}` },
    dePlural: false,
    enPlural: false,
    total: { en: 'total generation of all sources shown', de: 'an der Gesamterzeugung aller dargestellten Quellen' },
    range: [8, 140],
    decimals: 1,
    growth: [-0.12, 0.25],
  },
  {
    id: 'costs',
    title: { en: 'Operating costs by category', de: 'Betriebskosten nach Kategorie' },
    unit: { en: 'EUR thousand', de: 'Tsd. EUR' },
    rows: [
      ['Travel', 'Reisen'],
      ['Materials', 'Material'],
      ['Logistics', 'Logistik'],
      ['Marketing', 'Marketing'],
      ['IT', 'IT'],
      ['Rent', 'Miete'],
    ],
    entity: { en: 'cost category', enPlural: 'cost categories', de: 'Kostenkategorie', dePlural: 'Kostenkategorien', deWhich: 'Welche' },
    subj: { en: (r) => `costs for ${r}`, de: (r) => `die Kosten für ${r}` },
    dePlural: true,
    enPlural: true,
    total: { en: 'total operating costs of all categories shown', de: 'an den gesamten Betriebskosten aller dargestellten Kategorien' },
    range: [150, 2400],
    decimals: 0,
    growth: [-0.05, 0.12],
  },
]

export function label(theme: Theme, row: number, lang: Lang): string {
  return theme.rows[row][lang === 'de' ? 1 : 0]
}

export function unitOf(theme: Theme, lang: Lang): string {
  return lang === 'de' ? theme.unit.de : theme.unit.en
}

export function titleOf(theme: Theme, lang: Lang, suffix = ''): string {
  return `${lang === 'de' ? theme.title.de : theme.title.en}${suffix}`
}

export function subjOf(theme: Theme, row: number, lang: Lang): string {
  return lang === 'de' ? theme.subj.de(label(theme, row, lang)) : theme.subj.en(label(theme, row, lang))
}

/** German verb for subj: "ist/sind". */
export function deIst(theme: Theme): string {
  return theme.dePlural ? 'sind' : 'ist'
}

/** Capitalise the first letter (German sentence start). */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
