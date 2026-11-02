/** Numerical Reasoning: % change, percentage points, share, ratio, units, extremes. */
import { fmt, pct, roundTo } from '../../format'
import { tr, type GeneratorDef } from '../../generator'
import { buildLabelOptions, type Distractor } from '../../options'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { Difficulty, Exhibit, Lang, TableExhibit } from '../../types'
import { core } from '../../generator'
import { numMcq } from './common'
import { barByEntity, barByYear, lineOf, makeDataset, rowLabels, stackedByYear, tableOf, type Dataset } from './dataset'
import { deIst, subjOf, THEMES, unitOf, type Theme } from './themes'

type Ref = { ex: number; row: string; col: string }

function pickTheme(rng: Rng, filter?: (t: Theme) => boolean): Theme {
  return rng.pick(THEMES.filter(filter ?? (() => true)))
}

function displayFor(rng: Rng, ds: Dataset, lang: Lang, d: Difficulty, rowsForLine: number[]): Exhibit {
  const kinds = d === 1 ? ['table', 'barYear'] : ['table', 'barYear', 'line']
  const k = rng.pick(kinds)
  if (k === 'barYear' && ds.rows.length * ds.years.length <= 12) return barByYear(ds, lang)
  if (k === 'line' && rowsForLine.length <= 2) return lineOf(ds, lang, rowsForLine)
  return tableOf(ds, lang)
}

// ------------------------------------------------------------- % change

export const pctChange: GeneratorDef = {
  id: 'num.pctchange',
  version: 1,
  category: 'numerical',
  title: 'Prozentuale Veränderung',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = pickTheme(rng)
      const ds = makeDataset(rng, theme, { nRows: d === 1 ? 3 : d === 2 ? 4 : 5, nYears: d === 1 ? 3 : 5, nice: d === 1 })
      if (!ds) return null
      const f = (x: number, k = ds.decimals) => fmt(x, lang, k)
      const r = rng.int(0, ds.rows.length - 1)
      const r2 = d === 3 ? (r + 1 + rng.int(0, ds.rows.length - 2)) % ds.rows.length : -1
      const i = d === 1 ? rng.int(0, ds.years.length - 2) : rng.int(0, ds.years.length - 2)
      const j = d === 1 ? i + 1 : rng.int(i + 1, ds.years.length - 1)
      if (d === 3 && j - i < 2) return null
      const rowsUsed = d === 3 ? [r, r2] : [r]
      const a = roundTo(rowsUsed.reduce((s, x) => s + ds.values[x][i], 0), ds.decimals)
      const b = roundTo(rowsUsed.reduce((s, x) => s + ds.values[x][j], 0), ds.decimals)
      const change = ((b - a) / a) * 100
      if (Math.abs(change) < 3) return null
      const up = change > 0
      const ex = d === 3 ? (rng.chance(0.5) ? tableOf(ds, lang) : lineOf(ds, lang, [r, r2])) : displayFor(rng, ds, lang, d, [r])
      const labels = rowLabels(ds, lang)
      const yI = String(ds.years[i])
      const yJ = String(ds.years[j])
      const refs = (c: string): Ref[] => rowsUsed.map((x) => ({ ex: 0, row: labels[x], col: c }))
      const dir = up ? tr(lang, 'increase', 'gestiegen') : tr(lang, 'decrease', 'gesunken')
      let subject: string
      if (d === 3) {
        subject = lang === 'de' ? `der gemeinsame Wert von ${labels[r]} und ${labels[r2]}` : `the combined value of ${labels[r]} and ${labels[r2]}`
      } else subject = subjOf(theme, ds.rows[r], lang)
      const prompt =
        lang === 'de'
          ? `Um wie viel Prozent ${d === 3 ? 'ist' : deIst(theme)} ${subject} von ${yI} bis ${yJ} ${dir}?`
          : `By what percentage did ${subject} ${dir} from ${yI} to ${yJ}?`
      const mag = Math.abs(change)
      const other = (r + 1) % ds.rows.length
      const oa = ds.values[other][i]
      const ob = ds.values[other][j]
      const distractors: Distractor[] = [
        { value: (Math.abs(b - a) / b) * 100, tag: 'wrong-base', why: `Falsche Basis: durch den Endwert ${yJ} statt durch den Ausgangswert ${yI} geteilt.` },
        { value: (b / a) * 100, tag: 'ratio', why: 'Verhältnis Endwert/Ausgangswert statt Veränderung (100 % zu viel bzw. zu wenig).' },
        { value: Math.abs((ob - oa) / oa) * 100, tag: 'wrong-row', why: `Werte der falschen Zeile (${labels[other]}) abgelesen.` },
      ]
      if (j - i >= 2) {
        const aa = roundTo(rowsUsed.reduce((s, x) => s + ds.values[x][j - 1], 0), ds.decimals)
        distractors.push({ value: Math.abs((b - aa) / aa) * 100, tag: 'wrong-period', why: `Nur die Veränderung ${ds.years[j - 1]} → ${yJ} berechnet.` })
      }
      if (d === 3) {
        distractors.unshift({ value: Math.abs((ds.values[r][j] - ds.values[r][i]) / ds.values[r][i]) * 100, tag: 'partial', why: `Nur ${labels[r]} betrachtet, ${labels[r2]} vergessen.` })
      }
      const steps =
        d === 3
          ? [
              `${yI}: ${f(ds.values[r][i])} + ${f(ds.values[r2][i])} = ${f(a)}`,
              `${yJ}: ${f(ds.values[r][j])} + ${f(ds.values[r2][j])} = ${f(b)}`,
              `Veränderung: (${f(b)} − ${f(a)}) ÷ ${f(a)} = ${pct(change, lang, 2)}`,
            ]
          : [`Werte: ${yI} = ${f(a)}, ${yJ} = ${f(b)}`, `(${f(b)} − ${f(a)}) ÷ ${f(a)} × 100 = ${pct(change, lang, 2)}`]
      steps.push(`Gerundet: ${pct(mag, lang, 1)} ${up ? 'Anstieg' : 'Rückgang'}`)
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [ex],
        prompt,
        query: { family: 'num', op: 'pctChange', from: refs(yI), to: refs(yJ), dir: up ? 'up' : 'down' },
        value: mag,
        decimals: 1,
        format: (v) => pct(v, lang, 1),
        distractors,
        steps,
        shortcut: `Überschlag zuerst: ${f(b)} ÷ ${f(a)} ≈ ${fmt(b / a, lang, 2)} → etwa ${pct(Math.abs(b / a - 1) * 100, lang, 0)}. Das schließt meist schon drei Optionen aus. Immer durch den ALTEN Wert teilen.`,
      })
    })
  },
}

// ---------------------------------------------- percentage points vs percent

const ONLINE = {
  title: { en: 'Online share of retail sales', de: 'Online-Anteil am Einzelhandelsumsatz' },
  rows: [
    ['Germany', 'Deutschland'],
    ['France', 'Frankreich'],
    ['Italy', 'Italien'],
    ['Spain', 'Spanien'],
    ['Netherlands', 'Niederlande'],
    ['Poland', 'Polen'],
  ] as [string, string][],
}

export const percentagePoints: GeneratorDef = {
  id: 'num.ppoints',
  version: 1,
  category: 'numerical',
  title: 'Prozentpunkte vs. Prozent',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const nRows = d === 1 ? 3 : 4
      const years = d === 1 ? [2023, 2024, 2025] : [2022, 2023, 2024, 2025]
      const rowIdx = rng.sample([0, 1, 2, 3, 4, 5], nRows)
      const vals = rowIdx.map(() => {
        let v = 5 + rng.next() * 30
        return years.map(() => {
          const out = roundTo(d === 1 ? Math.round(v * 2) / 2 : v, 1)
          v += -1 + rng.next() * 5
          return out
        })
      })
      if (vals.some((r) => r.some((v, c) => c > 0 && v === r[c - 1]))) return null
      const labels = rowIdx.map((i) => ONLINE.rows[i][lang === 'de' ? 1 : 0])
      const pctSuffix = lang === 'de' ? ' %' : '%'
      const table: TableExhibit = {
        kind: 'table',
        title: lang === 'de' ? ONLINE.title.de : ONLINE.title.en,
        unitNote: lang === 'de' ? 'in %' : 'in %',
        rowHeader: lang === 'de' ? 'Land' : 'Country',
        header: years.map(String),
        rows: labels.map((l, k) => ({ label: l, cells: vals[k] })),
        decimals: years.map(() => 1),
        suffix: years.map(() => pctSuffix),
      }
      const r = rng.int(0, nRows - 1)
      const i = rng.int(0, years.length - 2)
      const j = d === 1 ? i + 1 : rng.int(i + 1, years.length - 1)
      const a = vals[r][i]
      const b = vals[r][j]
      const up = b > a
      const ppDiff = roundTo(Math.abs(b - a), 1)
      const rel = (Math.abs(b - a) / a) * 100
      const F1 = (x: number) => fmt(x, lang, 1)
      const variant = d === 3 ? rng.pick(['abs', 'pp', 'rel']) : rng.pick(['pp', 'rel'])
      const country = labels[r]
      const yI = String(years[i])
      const yJ = String(years[j])
      if (variant === 'pp') {
        if (ppDiff < 0.5) return null
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [table],
          prompt: tr(
            lang,
            `By how many percentage points did the online share in ${country} ${up ? 'increase' : 'decrease'} from ${yI} to ${yJ}?`,
            `Um wie viele Prozentpunkte ist der Online-Anteil in ${country} von ${yI} bis ${yJ} ${up ? 'gestiegen' : 'gesunken'}?`,
          ),
          query: { family: 'num', op: 'ppDiff', a: { ex: 0, row: country, col: yI }, b: { ex: 0, row: country, col: yJ }, dir: up ? 'up' : 'down' },
          value: ppDiff,
          decimals: 1,
          distractors: [
            { value: rel, tag: 'relative', why: 'Relative Veränderung in % berechnet – gefragt sind Prozentpunkte (einfache Differenz).' },
            { value: Math.abs(vals[(r + 1) % nRows][j] - vals[(r + 1) % nRows][i]), tag: 'wrong-row', why: 'Falsche Zeile abgelesen.' },
            { value: a + b, tag: 'sum', why: 'Summe statt Differenz.' },
            ...(j - i >= 2 ? [{ value: Math.abs(b - vals[r][j - 1]), tag: 'wrong-period', why: 'Nur das letzte Jahr betrachtet.' }] : []),
          ],
          steps: [`${yI}: ${pct(a, lang, 1)}, ${yJ}: ${pct(b, lang, 1)}`, `Differenz: ${F1(b)} − ${F1(a)} = ${up ? '' : '−'}${F1(ppDiff)} Prozentpunkte`],
          shortcut: 'Prozentpunkte = einfache Differenz zweier Prozentwerte. Prozent (relativ) = Differenz ÷ Ausgangswert. Lies die Frage auf genau dieses Wort.',
        })
      }
      if (variant === 'rel') {
        if (rel < 2) return null
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [table],
          prompt: tr(
            lang,
            `By what percentage did the online share in ${country} ${up ? 'increase' : 'decrease'} from ${yI} to ${yJ}?`,
            `Um wie viel Prozent ist der Online-Anteil in ${country} von ${yI} bis ${yJ} ${up ? 'gestiegen' : 'gesunken'}?`,
          ),
          query: { family: 'num', op: 'pctChange', from: [{ ex: 0, row: country, col: yI }], to: [{ ex: 0, row: country, col: yJ }], dir: up ? 'up' : 'down' },
          value: rel,
          decimals: 1,
          format: (v) => pct(v, lang, 1),
          distractors: [
            { value: ppDiff, tag: 'pp', why: 'Prozentpunkte (Differenz) statt relativer Veränderung.' },
            { value: (Math.abs(b - a) / b) * 100, tag: 'wrong-base', why: 'Durch den neuen statt den alten Wert geteilt.' },
            { value: (b / a) * 100, tag: 'ratio', why: 'Verhältnis statt Veränderung.' },
            { value: (Math.abs(vals[(r + 1) % nRows][j] - vals[(r + 1) % nRows][i]) / vals[(r + 1) % nRows][i]) * 100, tag: 'wrong-row', why: 'Falsche Zeile.' },
          ],
          steps: [`Differenz: ${F1(b)} − ${F1(a)} = ${F1(b - a)} Prozentpunkte`, `Relativ: ${F1(Math.abs(b - a))} ÷ ${F1(a)} × 100 = ${pct(rel, lang, 2)}`],
          shortcut: 'Achtung Falle: „um wie viel Prozent“ ≠ „um wie viele Prozentpunkte“. Hier ist die relative Veränderung gefragt.',
        })
      }
      // variant 'abs': absolute online sales need the market total of that year.
      const total = roundTo(30 + rng.next() * 60, 1)
      const askYear = rng.chance(0.5) ? years[years.length - 1] : years[rng.int(0, years.length - 2)]
      const c = years.indexOf(askYear)
      const totalsTable: TableExhibit = {
        kind: 'table',
        title: lang === 'de' ? 'Einzelhandelsumsatz gesamt' : 'Total retail sales',
        unitNote: lang === 'de' ? 'Mrd. EUR' : 'EUR billion',
        rowHeader: '',
        header: [String(years[years.length - 1])],
        rows: [{ label: country, cells: [total] }],
        decimals: [1],
      }
      const available = askYear === years[years.length - 1]
      const share = vals[r][c]
      const value = available ? (share * total) / 100 : null
      const wrongTotal = (share * total) / 100
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [table, totalsTable],
        prompt: tr(
          lang,
          `What were online retail sales in ${country} in ${askYear}, in EUR billion?`,
          `Wie hoch war der Online-Einzelhandelsumsatz in ${country} im Jahr ${askYear} in Mrd. EUR?`,
        ),
        query: { family: 'num', op: 'shareOfTotal', share: { ex: 0, row: country, col: String(askYear) }, total: { ex: 1, row: country, col: String(askYear) } },
        value,
        decimals: 2,
        cannotSay: true,
        distractors: available
          ? [
              { value: (vals[r][years.length - 2] * total) / 100, tag: 'wrong-year', why: 'Anteil des falschen Jahres verwendet.' },
              { value: share, tag: 'share', why: 'Nur den Anteil abgelesen.' },
              { value: (share * total) / 10, tag: 'decimal', why: 'Komma verschoben.' },
            ]
          : [
              { value: wrongTotal, tag: 'wrong-year-total', why: `Gesamtumsatz von ${years[years.length - 1]} verwendet – für ${askYear} ist kein Gesamtumsatz angegeben.` },
              { value: share, tag: 'share', why: 'Den Anteil als Betrag gelesen.' },
              { value: (vals[r][years.length - 1] * total) / 100, tag: 'other-year', why: `Das ist der Wert für ${years[years.length - 1]}.` },
              { value: wrongTotal * 1.5, tag: 'guess', why: 'Hochgerechnet ohne Datengrundlage.' },
            ],
        steps: available
          ? [`Anteil ${askYear}: ${F1(share)} %`, `Gesamtumsatz ${askYear}: ${F1(total)} Mrd. EUR`, `${F1(share)} % × ${F1(total)} = ${fmt((share * total) / 100, lang, 3)} Mrd. EUR`]
          : [`Für ${askYear} ist nur der Online-Anteil bekannt, der Gesamtumsatz steht nur für ${years[years.length - 1]} in der Tabelle.`, 'Ohne Gesamtumsatz lässt sich der absolute Online-Umsatz nicht berechnen.'],
        shortcut: 'Prozentwerte allein sagen nichts über absolute Größen. Prüfe immer: Gibt es eine Basisgröße für genau dieses Jahr?',
      })
    })
  },
}

// ------------------------------------------------------------------- share

export const share: GeneratorDef = {
  id: 'num.share',
  version: 1,
  category: 'numerical',
  title: 'Anteil am Gesamten',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = pickTheme(rng)
      const ds = makeDataset(rng, theme, { nRows: d === 1 ? 4 : 5, nYears: d === 1 ? 2 : 4, nice: d === 1 })
      if (!ds) return null
      const f = (x: number) => fmt(x, lang, ds.decimals)
      const c = d === 1 ? 1 : rng.int(0, ds.years.length - 1)
      const r = rng.int(0, ds.rows.length - 1)
      const r2 = d === 3 ? (r + 1 + rng.int(0, ds.rows.length - 2)) % ds.rows.length : -1
      const labels = rowLabels(ds, lang)
      const year = String(ds.years[c])
      let ex: Exhibit
      if (d === 1) ex = barByEntity(ds, lang, [c])
      else if (d === 2) ex = rng.chance(0.5) ? tableOf(ds, lang) : stackedByYear(ds, lang)
      else ex = tableOf(ds, lang)
      const parts = d === 3 ? [r, r2] : [r]
      const part = roundTo(parts.reduce((s, x) => s + ds.values[x][c], 0), ds.decimals)
      const total = roundTo(ds.values.reduce((s, row) => s + row[c], 0), ds.decimals)
      const value = (part / total) * 100
      const who = d === 3 ? (lang === 'de' ? `${labels[r]} und ${labels[r2]} zusammen` : `${labels[r]} and ${labels[r2]} combined`) : labels[r]
      const c2 = (c + 1) % ds.years.length
      const otherYearShare = (parts.reduce((s, x) => s + ds.values[x][c2], 0) / ds.values.reduce((s, row) => s + row[c2], 0)) * 100
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [ex],
        prompt: tr(
          lang,
          `In ${year}, what percentage of the ${theme.total.en} did ${who} account for?`,
          `Welchen Anteil hatte${d === 3 ? 'n' : ''} ${who} im Jahr ${year} ${theme.total.de}?`,
        ),
        query: { family: 'num', op: 'share', parts: parts.map((x) => ({ ex: 0, row: labels[x], col: year })), whole: { ex: 0, col: year } },
        value,
        decimals: 1,
        format: (v) => pct(v, lang, 1),
        distractors: [
          { value: (part / (total - part)) * 100, tag: 'exclude-self', why: 'Durch die Summe der ANDEREN geteilt statt durch die Gesamtsumme.' },
          ...(ds.years.length > 1 ? [{ value: otherYearShare, tag: 'wrong-year', why: `Anteil im Jahr ${ds.years[c2]} berechnet.` }] : []),
          { value: 100 - value, tag: 'complement', why: 'Anteil aller anderen statt des gesuchten.' },
          { value: (part / Math.max(...ds.values.map((row) => row[c]))) * 100, tag: 'vs-max', why: 'Durch den größten Einzelwert statt durch die Summe geteilt.' },
          { value: (ds.values[(r + 2) % ds.rows.length][c] / total) * 100, tag: 'wrong-row', why: 'Falsche Zeile.' },
        ],
        steps: [
          `Summe ${year}: ${ds.values.map((row) => f(row[c])).join(' + ')} = ${f(total)}`,
          ...(d === 3 ? [`${labels[r]} + ${labels[r2]}: ${f(ds.values[r][c])} + ${f(ds.values[r2][c])} = ${f(part)}`] : []),
          `Anteil: ${f(part)} ÷ ${f(total)} × 100 = ${pct(value, lang, 2)}`,
        ],
        shortcut: `Überschlag: ${f(part)} von rund ${fmt(Math.round(total / 10) * 10, lang, 0)} ist etwa ${pct(Math.round(value), lang, 0)}. ${ex.kind === 'bar' && ex.stacked ? 'Bei gestapelten Balken steht die Summe oft schon über dem Balken – nicht neu addieren.' : 'Die Summe nur einmal bilden und für alle Anteile wiederverwenden.'}`,
      })
    })
  },
}

// ------------------------------------------------------------------- ratio

export const ratio: GeneratorDef = {
  id: 'num.ratio',
  version: 1,
  category: 'numerical',
  title: 'Verhältnisse',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = pickTheme(rng)
      const ds = makeDataset(rng, theme, { nRows: 4, nYears: d === 1 ? 2 : 4, nice: d === 1 })
      if (!ds) return null
      const f = (x: number) => fmt(x, lang, ds.decimals)
      const labels = rowLabels(ds, lang)
      const [ra, rb] = rng.sample([0, 1, 2, 3], 2)
      if (d < 3) {
        const c = rng.int(0, ds.years.length - 1)
        const A = ds.values[ra][c]
        const B = ds.values[rb][c]
        if (A <= B) return null
        const value = A / B
        if (value < 1.08) return null
        const year = String(ds.years[c])
        const ex = d === 1 ? barByEntity(ds, lang, [c]) : rng.chance(0.5) ? tableOf(ds, lang) : barByYear(ds, lang)
        const c2 = (c + 1) % ds.years.length
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [ex],
          prompt: tr(lang, `In ${year}, how many times as large as the value for ${labels[rb]} was the value for ${labels[ra]}?`, `Wie viel Mal so groß wie der Wert von ${labels[rb]} war der Wert von ${labels[ra]} im Jahr ${year}?`),
          query: { family: 'num', op: 'ratio', a: [{ ex: 0, row: labels[ra], col: year }], b: [{ ex: 0, row: labels[rb], col: year }] },
          value,
          decimals: 2,
          distractors: [
            { value: B / A, tag: 'inverse', why: 'Verhältnis umgedreht.' },
            { value: (A - B) / B, tag: 'excess', why: 'Nur den Überschuss (wie viel MEHR) berechnet, nicht das Vielfache.' },
            ...(ds.years.length > 1 ? [{ value: ds.values[ra][c2] / ds.values[rb][c2], tag: 'wrong-year', why: `Werte von ${ds.years[c2]} verwendet.` }] : []),
            { value: A / ds.values[(rb + 1) % 4 === ra ? (rb + 2) % 4 : (rb + 1) % 4][c], tag: 'wrong-row', why: 'Falsche Vergleichszeile.' },
          ],
          steps: [`${labels[ra]}: ${f(A)}, ${labels[rb]}: ${f(B)}`, `${f(A)} ÷ ${f(B)} = ${fmt(value, lang, 3)}`],
          shortcut: '„Wie viel Mal so groß“ = Division A ÷ B. „Um wie viel größer“ wäre die Differenz A − B, „um wie viel Prozent größer“ wäre (A − B) ÷ B – genau lesen.',
        })
      }
      // d3: ratio of absolute increases
      const i = rng.int(0, 1)
      const j = rng.int(i + 2, 3)
      const incA = roundTo(ds.values[ra][j] - ds.values[ra][i], ds.decimals)
      const incB = roundTo(ds.values[rb][j] - ds.values[rb][i], ds.decimals)
      if (incA <= 0 || incB <= 0 || incA <= incB) return null
      const value = incA / incB
      if (value < 1.1 || value > 20) return null
      const yI = String(ds.years[i])
      const yJ = String(ds.years[j])
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [rng.chance(0.5) ? tableOf(ds, lang) : lineOf(ds, lang, [ra, rb])],
        prompt: tr(
          lang,
          `From ${yI} to ${yJ}, how many times as large as the absolute increase for ${labels[rb]} was the absolute increase for ${labels[ra]}?`,
          `Wie viel Mal so groß wie der absolute Zuwachs von ${labels[rb]} war der absolute Zuwachs von ${labels[ra]} von ${yI} bis ${yJ}?`,
        ),
        query: { family: 'num', op: 'ratioOfIncreases', a: [{ ex: 0, row: labels[ra], col: yI }, { ex: 0, row: labels[ra], col: yJ }], b: [{ ex: 0, row: labels[rb], col: yI }, { ex: 0, row: labels[rb], col: yJ }] },
        value,
        decimals: 2,
        distractors: [
          { value: incB / incA, tag: 'inverse', why: 'Verhältnis umgedreht.' },
          { value: ds.values[ra][j] / ds.values[rb][j], tag: 'levels', why: 'Verhältnis der Endwerte statt der Zuwächse.' },
          { value: ((ds.values[ra][j] - ds.values[ra][i]) / ds.values[ra][i]) / ((ds.values[rb][j] - ds.values[rb][i]) / ds.values[rb][i]), tag: 'relative', why: 'Verhältnis der prozentualen statt der absoluten Zuwächse.' },
          { value: value + 0.5, tag: 'slip', why: 'Rechenfehler.' },
        ],
        steps: [
          `Zuwachs ${labels[ra]}: ${f(ds.values[ra][j])} − ${f(ds.values[ra][i])} = ${f(incA)}`,
          `Zuwachs ${labels[rb]}: ${f(ds.values[rb][j])} − ${f(ds.values[rb][i])} = ${f(incB)}`,
          `${f(incA)} ÷ ${f(incB)} = ${fmt(value, lang, 3)}`,
        ],
        shortcut: 'Erst die beiden Differenzen bilden, dann teilen. Nicht die Endwerte vergleichen.',
      })
    })
  },
}

// ------------------------------------------------------------ unit traps

export const unitConversion: GeneratorDef = {
  id: 'num.units',
  version: 1,
  category: 'numerical',
  title: 'Einheiten (Tsd. vs. Mio.)',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = pickTheme(rng, (t) => t.id === 'costs')
      const ds = makeDataset(rng, theme, { nRows: d === 1 ? 3 : 5, nYears: d === 1 ? 2 : 3, nice: d === 1 })
      if (!ds) return null
      const f = (x: number) => fmt(x, lang, ds.decimals)
      const labels = rowLabels(ds, lang)
      const c = rng.int(0, ds.years.length - 1)
      const year = String(ds.years[c])
      const k = d === 1 ? 2 : 3
      const rows = rng.sample(ds.rows.map((_, i) => i), k)
      const sum = roundTo(rows.reduce((s, x) => s + ds.values[x][c], 0), ds.decimals)
      const isCost = theme.id === 'costs'
      const bigUnit = isCost ? tr(lang, 'EUR million', 'Mio. EUR') : tr(lang, 'million units', 'Mio. Stück')
      const names = rows.map((x) => labels[x])
      const list = names.slice(0, -1).join(', ') + (lang === 'de' ? ' und ' : ' and ') + names[names.length - 1]
      let value = sum / 1000
      let prompt: string
      let steps: string[]
      let op = 'sumConvert'
      if (d === 3) {
        // Difference between the total of all rows and the listed rows, in the big unit.
        const total = roundTo(ds.values.reduce((s, row) => s + row[c], 0), ds.decimals)
        value = (total - sum) / 1000
        op = 'restConvert'
        prompt = tr(
          lang,
          `In ${year}, what was the combined value of all ${theme.entity.enPlural} except ${list}, in ${bigUnit}?`,
          `Wie hoch war im Jahr ${year} der Gesamtwert aller ${theme.entity.dePlural} außer ${list}, in ${bigUnit}?`,
        )
        steps = [`Summe aller: ${f(total)} ${unitOf(theme, lang)}`, `Minus ${list}: ${f(total)} − ${f(sum)} = ${f(total - sum)} ${unitOf(theme, lang)}`, `÷ 1.000 → ${fmt(value, lang, 3)} ${bigUnit}`.replace('1.000', fmt(1000, lang, 0))]
      } else {
        prompt = tr(lang, `What was the combined value of ${list} in ${year}, in ${bigUnit}?`, `Wie hoch war der gemeinsame Wert von ${list} im Jahr ${year}, in ${bigUnit}?`)
        steps = [`${names.map((n, i) => `${n}: ${f(ds.values[rows[i]][c])}`).join(', ')} (${unitOf(theme, lang)})`, `Summe: ${f(sum)} ${unitOf(theme, lang)}`, `÷ 1.000 → ${fmt(value, lang, 3)} ${bigUnit}`.replace('1.000', fmt(1000, lang, 0))]
      }
      if (value < 1) return null
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [d === 1 ? barByEntity(ds, lang, [c]) : tableOf(ds, lang)],
        prompt,
        query: { family: 'num', op, parts: rows.map((x) => ({ ex: 0, row: labels[x], col: year })), whole: { ex: 0, col: year }, factor: 1000 },
        value,
        decimals: 2,
        minGapRel: 0.08,
        distractors: [
          { value: value * 1000, tag: 'no-convert', why: 'Nicht umgerechnet (Tausender statt Millionen).' },
          { value: value * 10, tag: 'factor-100', why: 'Durch 100 statt durch 1.000 geteilt.' },
          { value: value / 10, tag: 'factor-10000', why: 'Durch 10.000 geteilt.' },
          { value: value / 1000, tag: 'double-convert', why: 'Doppelt umgerechnet.' },
          { value: (ds.values[rows[0]][c] / 1000) * (d === 3 ? 1 : 1), tag: 'partial', why: 'Nur einen Wert umgerechnet.' },
        ],
        steps,
        shortcut: `Einheit im Titel/der Achse prüfen: ${unitOf(theme, lang)}. 1.000 Tsd. = 1 Mio. – Komma um drei Stellen nach links.`.replace('1.000', fmt(1000, lang, 0)),
      })
    })
  },
}

// --------------------------------------------------------------- extremes

export const extremes: GeneratorDef = {
  id: 'num.extreme',
  version: 1,
  category: 'numerical',
  title: 'Größter / kleinster Wert',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = pickTheme(rng)
      const ds = makeDataset(rng, theme, { nRows: 5, nYears: d === 1 ? 2 : 4, nice: d === 1 })
      if (!ds) return null
      const f = (x: number) => fmt(x, lang, ds.decimals)
      const labels = rowLabels(ds, lang)
      const i = d === 1 ? 0 : rng.int(0, ds.years.length - 2)
      const j = d === 1 ? 1 : rng.int(i + 1, ds.years.length - 1)
      const metric = d === 1 ? rng.pick(['absInc', 'level']) : d === 2 ? rng.pick(['relInc', 'absInc']) : 'relInc'
      const largest = metric === 'level' ? rng.chance(0.6) : true
      const vals = ds.values.map((row) => (metric === 'level' ? row[j] : metric === 'absInc' ? row[j] - row[i] : ((row[j] - row[i]) / row[i]) * 100))
      const sorted = vals.map((v, k) => ({ v, k })).sort((x, y) => (largest ? y.v - x.v : x.v - y.v))
      const margin = Math.abs(sorted[0].v - sorted[1].v)
      const minMargin = metric === 'relInc' ? (d === 3 ? 1 : 2) : metric === 'absInc' ? 2 * 10 ** -ds.decimals * 5 : 0
      if (margin <= minMargin) return null
      if (metric !== 'level' && sorted[0].v <= 0) return null
      // Level 3 trap: the largest absolute increase belongs to a different row.
      const abs = ds.values.map((row) => row[j] - row[i])
      const absTop = abs.indexOf(Math.max(...abs))
      if (d === 3 && absTop === sorted[0].k) return null
      const yI = String(ds.years[i])
      const yJ = String(ds.years[j])
      const ent = lang === 'de' ? theme.entity.de : theme.entity.en
      const what =
        metric === 'level'
          ? tr(lang, `the ${largest ? 'highest' : 'lowest'} value in ${yJ}`, `im Jahr ${yJ} den ${largest ? 'höchsten' : 'niedrigsten'} Wert`)
          : metric === 'absInc'
            ? tr(lang, `the largest absolute increase from ${yI} to ${yJ}`, `von ${yI} bis ${yJ} den größten absoluten Zuwachs`)
            : tr(lang, `the largest percentage increase from ${yI} to ${yJ}`, `von ${yI} bis ${yJ} den größten prozentualen Zuwachs`)
      const prompt = tr(lang, `Which ${ent} had ${what}?`, `${theme.entity.deWhich} ${ent} hatte ${what}?`)
      const fmtMetric = (v: number) => (metric === 'relInc' ? pct(v, lang, 1) : (v > 0 && metric === 'absInc' ? '+' : '') + f(v))
      const built = buildLabelOptions(
        rng,
        labels[sorted[0].k],
        sorted.slice(1).map((s) => ({ label: labels[s.k], why: `${fmtMetric(s.v)}${s.k === absTop && metric === 'relInc' ? ' – größter absoluter, aber nicht prozentualer Zuwachs' : ''}` })),
      )
      return {
        ...core(this, seed, d, lang),
        type: 'mcq',
        exhibits: [d === 1 ? barByEntity(ds, lang, [0, 1]) : rng.chance(0.5) ? tableOf(ds, lang) : barByYear(ds, lang, [i, j])],
        prompt,
        query: { family: 'num', op: 'extreme', metric, largest, from: yI, to: yJ },
        options: built.options,
        correct: built.correct,
        explanation: {
          steps: [
            metric === 'level' ? `Werte ${yJ}:` : metric === 'absInc' ? `Veränderung ${yI} → ${yJ}:` : `Prozentuale Veränderung ${yI} → ${yJ}:`,
            ...sorted.map((s) => `${labels[s.k]}: ${fmtMetric(s.v)}`),
            `${largest ? 'Am größten' : 'Am kleinsten'}: **${labels[sorted[0].k]}**`,
          ],
          distractors: built.notes,
          shortcut:
            metric === 'relInc'
              ? 'Nicht jede Zeile exakt rechnen: Verhältnis neu/alt grob schätzen (z. B. 1,1 vs. 1,25) und nur die zwei engsten Kandidaten genau prüfen. Größter absoluter Zuwachs ≠ größter prozentualer Zuwachs.'
              : 'Nur Kandidaten mit großen Werten bzw. großen Sprüngen genau prüfen; offensichtlich kleine sofort streichen.',
        },
      }
    })
  },
}

export type { Dataset }
