/** Numerical Reasoning: exchange rates, averages, median/mode/range, CAGR, index, projection. */
import { fmt, pct, roundTo } from '../../format'
import { tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { BarExhibit, ComboExhibit, LineExhibit, TableExhibit } from '../../types'
import { numMcq } from './common'
import { barByYear, lineOf, makeDataset, rowLabels, tableOf } from './dataset'
import { subjOf, THEMES, unitOf } from './themes'

// ----------------------------------------------------------- exchange rates

const CURRENCIES: { code: string; range: [number, number] }[] = [
  { code: 'USD', range: [1.04, 1.16] },
  { code: 'GBP', range: [0.82, 0.9] },
  { code: 'CHF', range: [0.92, 0.99] },
  { code: 'CAD', range: [1.44, 1.56] },
  { code: 'AUD', range: [1.6, 1.72] },
]

export const exchangeRates: GeneratorDef = {
  id: 'num.fx',
  version: 1,
  category: 'numerical',
  title: 'Wechselkurse',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const cur = rng.sample(CURRENCIES, 4)
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => `${q} 2025`)
      const rates = cur.map((c) => quarters.map(() => roundTo(c.range[0] + rng.next() * (c.range[1] - c.range[0]), 3)))
      const table: TableExhibit = {
        kind: 'table',
        title: tr(lang, 'Exchange rates', 'Wechselkurse'),
        unitNote: tr(lang, 'units of currency per EUR 1', 'Währungseinheiten je 1 EUR'),
        rowHeader: tr(lang, 'Currency', 'Währung'),
        header: quarters,
        rows: cur.map((c, k) => ({ label: c.code, cells: rates[k] })),
        decimals: quarters.map(() => 3),
      }
      const q = rng.int(0, 3)
      const qName = quarters[q]
      const ci = rng.int(0, 3)
      const cj = (ci + 1 + rng.int(0, 2)) % 4
      const A = cur[ci].code
      const B = cur[cj].code
      const ra = rates[ci][q]
      const rb = rates[cj][q]
      const f0 = (x: number) => fmt(x, lang, 0)
      const f3 = (x: number) => fmt(x, lang, 3)
      const qOther = (q + 1) % 4
      if (d === 1) {
        const amount = rng.int(4, 90) * 50
        const value = amount * ra
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [table],
          prompt: tr(lang, `In ${qName}, how many ${A} would EUR ${f0(amount)} have bought?`, `Wie viele ${A} hätte man in ${qName} für ${f0(amount)} EUR erhalten?`),
          query: { family: 'num', op: 'fx', amount, from: 'EUR', to: A, col: qName },
          value,
          decimals: 0,
          distractors: [
            { value: amount / ra, tag: 'divide', why: 'Dividiert statt multipliziert – der Kurs gibt an, wie viele Einheiten man PRO EUR erhält.' },
            { value: amount * rates[ci][qOther], tag: 'wrong-quarter', why: `Kurs aus ${quarters[qOther]} verwendet.` },
            { value: amount * rb, tag: 'wrong-row', why: `Kurs von ${B} verwendet.` },
            { value: amount * ra * 10, tag: 'decimal', why: 'Komma verschoben.' },
          ],
          steps: [`Kurs ${qName}: 1 EUR = ${f3(ra)} ${A}`, `${f0(amount)} × ${f3(ra)} = ${fmt(value, lang, 2)} ${A}`],
          shortcut: 'Richtung prüfen: Bekommt man pro EUR mehr als 1 Einheit, muss der Betrag in der Fremdwährung größer werden.',
        })
      }
      if (d === 2) {
        const amount = rng.int(10, 200) * 50
        const value = amount / ra
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [table],
          prompt: tr(lang, `In ${qName}, how many EUR was ${A} ${f0(amount)} worth?`, `Wie viele EUR waren ${f0(amount)} ${A} in ${qName} wert?`),
          query: { family: 'num', op: 'fx', amount, from: A, to: 'EUR', col: qName },
          value,
          decimals: 0,
          distractors: [
            { value: amount * ra, tag: 'multiply', why: 'Multipliziert statt dividiert.' },
            { value: amount / rates[ci][qOther], tag: 'wrong-quarter', why: `Kurs aus ${quarters[qOther]} verwendet.` },
            { value: amount / rb, tag: 'wrong-row', why: `Kurs von ${B} verwendet.` },
            { value: amount, tag: 'no-convert', why: 'Nicht umgerechnet.' },
          ],
          steps: [`Kurs ${qName}: 1 EUR = ${f3(ra)} ${A}`, `${f0(amount)} ÷ ${f3(ra)} = ${fmt(value, lang, 2)} EUR`],
          shortcut: 'Fremdwährung → EUR: durch den Kurs teilen. Plausibilität: Kurs > 1 → weniger EUR als Fremdwährungseinheiten.',
        })
      }
      const amount = rng.int(10, 200) * 100
      const value = (amount / ra) * rb
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [table],
        prompt: tr(lang, `In ${qName}, how many ${B} was ${A} ${f0(amount)} worth (converted via EUR)?`, `Wie viele ${B} waren ${f0(amount)} ${A} in ${qName} wert (Umrechnung über EUR)?`),
        query: { family: 'num', op: 'fx', amount, from: A, to: B, col: qName },
        value,
        decimals: 0,
        distractors: [
          { value: (amount * ra) / rb, tag: 'inverse-cross', why: 'Kreuzkurs umgedreht.' },
          { value: amount * ra * rb, tag: 'multiply', why: 'Beide Kurse multipliziert.' },
          { value: (amount / rates[ci][qOther]) * rates[cj][qOther], tag: 'wrong-quarter', why: `Kurse aus ${quarters[qOther]} verwendet.` },
          { value: amount / ra, tag: 'partial', why: 'Nur bis EUR umgerechnet.' },
        ],
        steps: [`${A} → EUR: ${f0(amount)} ÷ ${f3(ra)} = ${fmt(amount / ra, lang, 2)} EUR`, `EUR → ${B}: × ${f3(rb)} = ${fmt(value, lang, 2)} ${B}`],
        shortcut: `Kreuzkurs in einem Schritt: Betrag × (${B}-Kurs ÷ ${A}-Kurs) = ${f0(amount)} × ${fmt(rb / ra, lang, 4)}.`,
      })
    })
  },
}

// ----------------------------------------------------------------- averages

const PRODUCTS = [
  ['Basic', 'Basic'],
  ['Standard', 'Standard'],
  ['Premium', 'Premium'],
  ['Pro', 'Pro'],
  ['Enterprise', 'Enterprise'],
]

export const averages: GeneratorDef = {
  id: 'num.average',
  version: 1,
  category: 'numerical',
  title: 'Durchschnitt (einfach & gewichtet)',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      if (d < 3) {
        const theme = rng.pick(THEMES)
        const ds = makeDataset(rng, theme, { nRows: d === 1 ? 3 : 5, nYears: d === 1 ? 4 : 5, nice: d === 1 })
        if (!ds) return null
        const f = (x: number) => fmt(x, lang, ds.decimals)
        const labels = rowLabels(ds, lang)
        if (d === 1) {
          const r = rng.int(0, ds.rows.length - 1)
          const vals = ds.values[r]
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length
          const sorted = vals.slice().sort((a, b) => a - b)
          const median = (sorted[1] + sorted[2]) / 2
          return numMcq(this, seed, d, lang, rng, {
            exhibits: [rng.chance(0.5) ? tableOf(ds, lang) : barByYear(ds, lang)],
            prompt: tr(lang, `What was the average annual value for ${labels[r]} over the ${vals.length} years shown?`, `Wie hoch war der durchschnittliche Jahreswert von ${labels[r]} über die ${vals.length} dargestellten Jahre?`),
            query: { family: 'num', op: 'mean', refs: ds.years.map((y) => ({ ex: 0, row: labels[r], col: String(y) })) },
            value: mean,
            decimals: 1,
            distractors: [
              { value: median, tag: 'median', why: 'Median statt Mittelwert.' },
              { value: vals.reduce((a, b) => a + b, 0) / (vals.length - 1), tag: 'n-1', why: 'Durch eine Jahreszahl zu wenig geteilt.' },
              { value: (vals[0] + vals[vals.length - 1]) / 2, tag: 'endpoints', why: 'Nur Anfangs- und Endwert gemittelt.' },
              { value: ds.values[(r + 1) % ds.rows.length].reduce((a, b) => a + b, 0) / vals.length, tag: 'wrong-row', why: 'Falsche Zeile.' },
            ],
            steps: [`Summe: ${vals.map(f).join(' + ')} = ${f(roundTo(vals.reduce((a, b) => a + b, 0), ds.decimals))}`, `÷ ${vals.length} = ${fmt(mean, lang, 2)}`],
            shortcut: 'Schätzwert wählen (z. B. eine runde Zahl in der Mitte) und nur die Abweichungen addieren: Mittelwert = Schätzwert + Summe der Abweichungen ÷ n.',
          })
        }
        const c = rng.int(0, ds.years.length - 1)
        const year = String(ds.years[c])
        const col = ds.values.map((row) => row[c])
        const mean = col.reduce((a, b) => a + b, 0) / col.length
        const sorted = col.slice().sort((a, b) => a - b)
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [tableOf(ds, lang)],
          prompt: tr(lang, `What was the average value per ${theme.entity.en} in ${year}?`, `Wie hoch war im Jahr ${year} der Durchschnittswert je ${theme.entity.de}?`),
          query: { family: 'num', op: 'mean', refs: labels.map((l) => ({ ex: 0, row: l, col: year })) },
          value: mean,
          decimals: 1,
          distractors: [
            { value: sorted[2], tag: 'median', why: 'Median statt Mittelwert.' },
            { value: col.reduce((a, b) => a + b, 0) / (col.length - 1), tag: 'n-1', why: 'Durch n − 1 geteilt.' },
            { value: ds.values.map((row) => row[(c + 1) % ds.years.length]).reduce((a, b) => a + b, 0) / col.length, tag: 'wrong-year', why: 'Spalte des falschen Jahres.' },
            { value: (Math.max(...col) + Math.min(...col)) / 2, tag: 'midrange', why: 'Mitte aus Maximum und Minimum statt Mittelwert.' },
          ],
          steps: [`Summe ${year}: ${col.map(f).join(' + ')} = ${f(roundTo(col.reduce((a, b) => a + b, 0), ds.decimals))}`, `÷ ${col.length} = ${fmt(mean, lang, 2)}`],
          shortcut: 'Bei 5 Werten: Summe × 2 ÷ 10 – Teilen durch 5 ist dasselbe wie Verdoppeln und durch 10 teilen.',
        })
      }
      // d3: weighted average price per unit from two exhibits
      const rows = rng.sample([0, 1, 2, 3, 4], 4)
      const names = rows.map((i) => PRODUCTS[i][lang === 'de' ? 1 : 0])
      const units = rows.map(() => roundTo(10 + rng.next() * 190, 1))
      const prices = rows.map((_, k) => roundTo(20 + k * 25 + rng.next() * 30, 2))
      const revenue = units.reduce((s, u, k) => s + u * prices[k], 0)
      const totalUnits = units.reduce((a, b) => a + b, 0)
      const value = revenue / totalUnits
      const simple = prices.reduce((a, b) => a + b, 0) / prices.length
      if (Math.abs(value - simple) / value < 0.06) return null
      const unitsEx: TableExhibit = {
        kind: 'table',
        title: tr(lang, 'Units sold by product tier, 2025', 'Verkaufte Einheiten nach Produktstufe, 2025'),
        unitNote: tr(lang, 'thousand units', 'Tsd. Stück'),
        rowHeader: tr(lang, 'Tier', 'Stufe'),
        header: ['2025'],
        rows: names.map((n, k) => ({ label: n, cells: [units[k]] })),
        decimals: [1],
      }
      const priceEx: TableExhibit = {
        kind: 'table',
        title: tr(lang, 'Average selling price by product tier, 2025', 'Durchschnittlicher Verkaufspreis nach Produktstufe, 2025'),
        unitNote: 'EUR',
        rowHeader: tr(lang, 'Tier', 'Stufe'),
        header: ['2025'],
        rows: names.map((n, k) => ({ label: n, cells: [prices[k]] })),
        decimals: [2],
      }
      const f1 = (x: number) => fmt(x, lang, 1)
      const f2 = (x: number) => fmt(x, lang, 2)
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [unitsEx, priceEx],
        prompt: tr(lang, 'What was the average selling price per unit across all product tiers in 2025, in EUR?', 'Wie hoch war 2025 der durchschnittliche Verkaufspreis je Einheit über alle Produktstufen hinweg, in EUR?'),
        query: { family: 'num', op: 'weightedMean', weights: names.map((n) => ({ ex: 0, row: n, col: '2025' })), values: names.map((n) => ({ ex: 1, row: n, col: '2025' })) },
        value,
        decimals: 2,
        distractors: [
          { value: simple, tag: 'unweighted', why: 'Ungewichteter Durchschnitt der Preise – die Stufen verkaufen aber unterschiedlich viel.' },
          { value: prices.slice().sort((a, b) => a - b).slice(1, 3).reduce((a, b) => a + b, 0) / 2, tag: 'median', why: 'Median der Preise.' },
          { value: revenue / totalUnits / 1.1, tag: 'slip', why: 'Rechenfehler bei der Umsatzsumme.' },
          { value: (revenue / totalUnits) * 1.1, tag: 'slip', why: 'Rechenfehler bei der Umsatzsumme.' },
        ],
        steps: [
          `Umsatz je Stufe = Einheiten × Preis: ${names.map((n, k) => `${n} ${f1(units[k])} × ${f2(prices[k])} = ${f2(units[k] * prices[k])}`).join('; ')}`,
          `Gesamtumsatz: ${f2(revenue)} (Tsd. Einheiten × EUR)`,
          `Gesamteinheiten: ${f1(totalUnits)}`,
          `Durchschnittspreis: ${f2(revenue)} ÷ ${f1(totalUnits)} = ${fmt(value, lang, 3)} EUR`,
        ],
        shortcut: 'Gewichteter Durchschnitt = Σ(Gewicht × Wert) ÷ Σ Gewichte. Plausibilität: Er liegt näher am Preis der meistverkauften Stufe.',
      })
    })
  },
}

// --------------------------------------------------- median / mode / range

export const statistics: GeneratorDef = {
  id: 'num.stats',
  version: 1,
  category: 'numerical',
  title: 'Median, Modus, Spannweite',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const n = d === 1 ? 5 : d === 2 ? 6 : 8
      const stores = Array.from({ length: n }, (_, i) => `${tr(lang, 'Store', 'Filiale')} ${String.fromCharCode(65 + i)}`)
      const kind = d === 1 ? rng.pick(['median', 'range']) : d === 2 ? rng.pick(['median', 'mode', 'range']) : rng.pick(['meanMinusMedian', 'median'])
      let vals = stores.map(() => rng.int(18, 95) * (d === 1 ? 1 : 1))
      if (kind === 'mode') {
        const dup = rng.int(0, n - 1)
        const other = (dup + 1 + rng.int(0, n - 2)) % n
        vals[other] = vals[dup]
        if (new Set(vals).size !== n - 1) return null
      } else if (new Set(vals).size !== n) return null
      vals = vals.map((v) => v)
      const sorted = vals.slice().sort((a, b) => a - b)
      const mean = vals.reduce((a, b) => a + b, 0) / n
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      const mode = vals.find((v, i) => vals.indexOf(v) !== i) ?? NaN
      const range = sorted[n - 1] - sorted[0]
      const unsortedMid = n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2
      const title = tr(lang, 'Customer visits per day by store (average)', 'Kundenbesuche pro Tag nach Filiale (Durchschnitt)')
      const exhibit: BarExhibit | TableExhibit =
        rng.chance(0.5) && n <= 6
          ? { kind: 'bar', title, unitNote: tr(lang, 'visits', 'Besuche'), categories: stores, series: [{ name: '2025', values: vals }], decimals: 0 }
          : ({
              kind: 'table',
              title,
              unitNote: tr(lang, 'visits', 'Besuche'),
              rowHeader: tr(lang, 'Store', 'Filiale'),
              header: ['2025'],
              rows: stores.map((s, i) => ({ label: s, cells: [vals[i]] })),
              decimals: [0],
            } as TableExhibit)
      const refs = stores.map((s) => ({ ex: 0, row: s, col: '2025' }))
      const f = (x: number, k = 1) => fmt(x, lang, k)
      const sortedText = sorted.map((v) => f(v, 0)).join(', ')
      if (kind === 'median') {
        if (Math.abs(median - mean) < 1.5 || Math.abs(median - unsortedMid) < 1) return null
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [exhibit],
          prompt: tr(lang, 'What is the median number of daily visits across the stores shown?', 'Wie hoch ist der Median der täglichen Besuche über die dargestellten Filialen?'),
          query: { family: 'num', op: 'median', refs },
          value: median,
          decimals: 1,
          distractors: [
            { value: mean, tag: 'mean', why: 'Mittelwert statt Median.' },
            { value: unsortedMid, tag: 'unsorted', why: 'Mittleren Wert der UNsortierten Liste genommen.' },
            { value: n % 2 ? sorted[(n - 1) / 2 + 1] : sorted[n / 2], tag: 'one-middle', why: 'Nur einen der beiden mittleren Werte genommen bzw. falsch abgezählt.' },
            { value: (sorted[0] + sorted[n - 1]) / 2, tag: 'midrange', why: 'Mitte aus Minimum und Maximum.' },
          ],
          steps: [`Sortieren: ${sortedText}`, n % 2 ? `Ungerade Anzahl (${n}): mittlerer Wert ist der ${(n + 1) / 2}. → ${f(median, 0)}` : `Gerade Anzahl (${n}): Durchschnitt des ${n / 2}. und ${n / 2 + 1}. Werts → (${f(sorted[n / 2 - 1], 0)} + ${f(sorted[n / 2], 0)}) ÷ 2 = ${f(median)}`],
          shortcut: 'Immer zuerst sortieren. Bei gerader Anzahl sind es zwei mittlere Werte – deren Durchschnitt ist der Median.',
        })
      }
      if (kind === 'mode') {
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [exhibit],
          prompt: tr(lang, 'What is the mode of the daily visit numbers shown?', 'Welcher Wert ist der Modus der dargestellten täglichen Besuchszahlen?'),
          query: { family: 'num', op: 'mode', refs },
          value: mode,
          decimals: 0,
          distractors: [
            { value: median, tag: 'median', why: 'Median statt Modus.' },
            { value: mean, tag: 'mean', why: 'Mittelwert statt Modus.' },
            { value: sorted[n - 1], tag: 'max', why: 'Größter Wert statt häufigster.' },
            { value: range, tag: 'range', why: 'Spannweite statt Modus.' },
          ],
          hint: '',
          steps: [`Sortiert: ${sortedText}`, `${f(mode, 0)} kommt zweimal vor, alle anderen Werte nur einmal → Modus = ${f(mode, 0)}`],
          shortcut: 'Modus = häufigster Wert. Beim Sortieren springen Doppelte sofort ins Auge.',
        })
      }
      if (kind === 'range') {
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [exhibit],
          prompt: tr(lang, 'What is the range of the daily visit numbers shown?', 'Wie groß ist die Spannweite der dargestellten täglichen Besuchszahlen?'),
          query: { family: 'num', op: 'range', refs },
          value: range,
          decimals: 0,
          distractors: [
            { value: sorted[n - 1], tag: 'max', why: 'Nur das Maximum.' },
            { value: sorted[n - 2] - sorted[1], tag: 'inner', why: 'Zweitgrößten minus zweitkleinsten Wert genommen.' },
            { value: sorted[n - 1] + sorted[0], tag: 'sum', why: 'Summe statt Differenz.' },
            { value: Math.round(median), tag: 'median', why: 'Median statt Spannweite.' },
          ],
          hint: '',
          steps: [`Maximum: ${f(sorted[n - 1], 0)}, Minimum: ${f(sorted[0], 0)}`, `Spannweite = ${f(sorted[n - 1], 0)} − ${f(sorted[0], 0)} = ${f(range, 0)}`],
          shortcut: 'Spannweite = Maximum − Minimum. Nur die beiden Extremwerte suchen, nichts sortieren.',
        })
      }
      const diff = mean - median
      if (Math.abs(diff) < 1) return null
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [exhibit],
        prompt: tr(lang, 'By how much does the mean exceed the median of the daily visits shown? (A negative value means the mean is lower.)', 'Um wie viel liegt der Mittelwert über dem Median der dargestellten täglichen Besuche? (Negativ, wenn der Mittelwert darunter liegt.)'),
        query: { family: 'num', op: 'meanMinusMedian', refs },
        value: diff,
        decimals: 2,
        format: (v) => fmt(v, lang, 2),
        distractors: [
          { value: -diff, tag: 'sign', why: 'Vorzeichen vertauscht (Median − Mittelwert).' },
          { value: mean - unsortedMid, tag: 'unsorted', why: 'Median aus der unsortierten Liste.' },
          { value: mean - sorted[n / 2], tag: 'one-middle', why: 'Nur einen mittleren Wert als Median genommen.' },
          { value: diff + 1, tag: 'slip', why: 'Rechenfehler bei der Summe.' },
        ],
        steps: [`Summe: ${vals.reduce((a, b) => a + b, 0)} → Mittelwert = ${f(mean, 3)}`, `Sortiert: ${sortedText} → Median = ${f(median)}`, `Differenz: ${f(mean, 3)} − ${f(median)} = ${f(diff, 3)}`],
        shortcut: 'Erst sortieren (für den Median), dann summieren (für den Mittelwert) – beides aus derselben sortierten Liste.',
        minGapRel: 0.1,
      })
    })
  },
}

// ---------------------------------------------------------------------- CAGR

export const cagr: GeneratorDef = {
  id: 'num.cagr',
  version: 1,
  category: 'numerical',
  title: 'CAGR (jährliche Wachstumsrate)',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = rng.pick(THEMES.filter((t) => t.id !== 'costs'))
      const label = theme.rows[rng.int(0, theme.rows.length - 1)][lang === 'de' ? 1 : 0]
      const years = [2020, 2021, 2022, 2023, 2024, 2025]
      const periods = d === 1 ? 2 : d === 2 ? rng.pick([2, 3]) : rng.pick([4, 5])
      const end = years.length - 1
      const start = end - periods
      let vals: number[]
      if (d === 1) {
        const g = rng.pick([0.1, 0.2, 0.5, 0.25])
        const base = rng.pick([100, 200, 400, 500, 800, 1000, 1600])
        vals = years.map((_, k) => roundTo(base * (1 + g) ** Math.max(0, k - start) * (k < start ? 1 - 0.03 * (start - k) : 1), theme.decimals))
        if (!Number.isInteger(vals[end] * 10 ** theme.decimals)) return null
      } else {
        let v = theme.range[0] + rng.next() * (theme.range[1] - theme.range[0])
        vals = years.map(() => {
          const out = roundTo(v, theme.decimals)
          v *= 1 + 0.02 + rng.next() * 0.16
          return out
        })
      }
      const a = vals[start]
      const b = vals[end]
      const value = ((b / a) ** (1 / periods) - 1) * 100
      if (value < 1) return null
      const total = (b / a - 1) * 100
      const yearly = vals.slice(start + 1, end + 1).map((v, k) => (v / vals[start + k] - 1) * 100)
      const arith = yearly.reduce((s, x) => s + x, 0) / yearly.length
      const line: LineExhibit = {
        kind: 'line',
        title: `${lang === 'de' ? theme.title.de : theme.title.en}: ${label}`,
        unitNote: unitOf(theme, lang),
        categories: years.map(String),
        series: [{ name: label, values: vals }],
        decimals: theme.decimals,
      }
      const f = (x: number) => fmt(x, lang, theme.decimals)
      const yA = String(years[start])
      const yB = String(years[end])
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [rng.chance(0.6) ? line : { kind: 'table', title: line.title, unitNote: line.unitNote, rowHeader: '', header: years.map(String), rows: [{ label, cells: vals }], decimals: years.map(() => theme.decimals) }],
        prompt: tr(lang, `What was the compound annual growth rate (CAGR) from ${yA} to ${yB}?`, `Wie hoch war die durchschnittliche jährliche Wachstumsrate (CAGR) von ${yA} bis ${yB}?`),
        query: { family: 'num', op: 'cagr', a: { ex: 0, row: label, col: yA }, b: { ex: 0, row: label, col: yB }, periods },
        value,
        decimals: 1,
        format: (v) => pct(v, lang, 1),
        minGapRel: 0.06,
        distractors: [
          { value: total / periods, tag: 'simple-average', why: 'Gesamtwachstum einfach durch die Jahre geteilt – ignoriert den Zinseszinseffekt.' },
          { value: total, tag: 'total', why: 'Gesamtwachstum statt jährlicher Rate.' },
          { value: ((b / a) ** (1 / (periods + 1)) - 1) * 100, tag: 'periods+1', why: `Mit ${periods + 1} statt ${periods} Perioden gerechnet (Jahre statt Abstände gezählt).` },
          { value: arith, tag: 'arith-mean', why: 'Arithmetisches Mittel der Einzeljahre – nicht dasselbe wie die CAGR.' },
          { value: ((b / a) ** (1 / Math.max(1, periods - 1)) - 1) * 100, tag: 'periods-1', why: 'Eine Periode zu wenig.' },
        ],
        steps: [
          `${yA}: ${f(a)}, ${yB}: ${f(b)} → ${periods} Perioden (Jahresabstände)`,
          `Faktor gesamt: ${f(b)} ÷ ${f(a)} = ${fmt(b / a, lang, 4)}`,
          `CAGR = ${fmt(b / a, lang, 4)}^(1/${periods}) − 1 = ${pct(value, lang, 2)}`,
        ],
        shortcut: `Optionen rückwärts prüfen: (1 + Option)^${periods} muss ≈ ${fmt(b / a, lang, 3)} ergeben. Näherung: CAGR ≈ Gesamtwachstum ÷ Jahre, aber etwas kleiner.`,
      })
    })
  },
}

// --------------------------------------------------------------------- index

export const indexValues: GeneratorDef = {
  id: 'num.index',
  version: 1,
  category: 'numerical',
  title: 'Indexwerte',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025]
      const mkIndex = () => {
        let v = 100
        return years.map((_, k) => {
          if (k > 0) v *= 1 + -0.02 + rng.next() * 0.09
          return k === 0 ? 100 : roundTo(v, 1)
        })
      }
      const price = mkIndex()
      const base = rng.int(12, 90) * 5
      const f1 = (x: number) => fmt(x, lang, 1)
      const baseEx: TableExhibit = {
        kind: 'table',
        title: tr(lang, 'Average price in the base year', 'Durchschnittspreis im Basisjahr'),
        unitNote: 'EUR',
        rowHeader: '',
        header: ['2020'],
        rows: [{ label: tr(lang, 'Average price', 'Durchschnittspreis'), cells: [base] }],
        decimals: [0],
      }
      const priceLabel = tr(lang, 'Price index', 'Preisindex')
      if (d === 1) {
        const k = rng.int(1, 5)
        const value = (base * price[k]) / 100
        const ex: LineExhibit = { kind: 'line', title: tr(lang, 'Price index (2020 = 100)', 'Preisindex (2020 = 100)'), categories: years.map(String), series: [{ name: priceLabel, values: price }], decimals: 1 }
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [ex, baseEx],
          prompt: tr(lang, `What was the average price in ${years[k]}, in EUR?`, `Wie hoch war der Durchschnittspreis im Jahr ${years[k]} in EUR?`),
          query: { family: 'num', op: 'indexValue', base: { ex: 1, row: tr(lang, 'Average price', 'Durchschnittspreis'), col: '2020' }, idx: { ex: 0, row: priceLabel, col: String(years[k]) } },
          value,
          decimals: 2,
          distractors: [
            { value: base + price[k], tag: 'add', why: 'Indexwert addiert statt als Faktor verwendet.' },
            { value: base + (price[k] - 100), tag: 'points-as-eur', why: 'Indexpunkte als EUR-Betrag addiert.' },
            { value: (base * 100) / price[k], tag: 'inverse', why: 'Durch den Index geteilt statt mit ihm multipliziert.' },
            { value: (base * price[Math.max(1, k - 1)]) / 100, tag: 'wrong-year', why: 'Indexwert des falschen Jahres.' },
          ],
          steps: [`Index ${years[k]}: ${f1(price[k])} → Preis = Basispreis × ${f1(price[k])} ÷ 100`, `${fmt(base, lang, 0)} × ${fmt(price[k] / 100, lang, 3)} = ${fmt(value, lang, 3)} EUR`],
          shortcut: 'Index 100 = Basisjahr. Ein Index von 112,4 heißt: 12,4 % über dem Basisjahr.',
        })
      }
      if (d === 2) {
        const i = rng.int(1, 3)
        const j = rng.int(i + 1, 5)
        const value = (price[j] / price[i] - 1) * 100
        if (Math.abs(value) < 1) return null
        const up = value > 0
        const ex: LineExhibit = { kind: 'line', title: tr(lang, 'Price index (2020 = 100)', 'Preisindex (2020 = 100)'), categories: years.map(String), series: [{ name: priceLabel, values: price }], decimals: 1 }
        if (Math.abs(Math.abs(price[j] - price[i]) - Math.abs(value)) < 0.4) return null
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [ex],
          prompt: tr(lang, `By what percentage did prices ${up ? 'rise' : 'fall'} from ${years[i]} to ${years[j]}?`, `Um wie viel Prozent sind die Preise von ${years[i]} bis ${years[j]} ${up ? 'gestiegen' : 'gesunken'}?`),
          query: { family: 'num', op: 'pctChange', from: [{ ex: 0, row: priceLabel, col: String(years[i]) }], to: [{ ex: 0, row: priceLabel, col: String(years[j]) }], dir: up ? 'up' : 'down' },
          value: Math.abs(value),
          decimals: 1,
          format: (v) => pct(v, lang, 1),
          distractors: [
            { value: Math.abs(price[j] - price[i]), tag: 'index-points', why: 'Indexpunkte-Differenz als Prozent gelesen – das stimmt nur ab dem Basisjahr (Index 100).' },
            { value: price[j] - 100, tag: 'vs-base', why: 'Veränderung gegenüber dem Basisjahr 2020 statt gegenüber ' + years[i] + '.' },
            { value: (Math.abs(price[j] - price[i]) / price[j]) * 100, tag: 'wrong-base', why: 'Durch den neuen Indexwert geteilt.' },
            { value: Math.abs(value) * 2, tag: 'slip', why: 'Rechenfehler.' },
          ].filter((x) => x.value > 0),
          steps: [`Index ${years[i]}: ${f1(price[i])}, Index ${years[j]}: ${f1(price[j])}`, `${f1(price[j])} ÷ ${f1(price[i])} − 1 = ${pct(value, lang, 2)}`],
          shortcut: 'Indexpunkte ≠ Prozent! Nur gegenüber dem Basisjahr (Index = 100) ist die Punktedifferenz gleich der Prozentveränderung.',
        })
      }
      const volume = mkIndex()
      const i = rng.int(0, 2)
      const j = rng.int(i + 2, 5)
      const value = ((price[j] * volume[j]) / (price[i] * volume[i]) - 1) * 100
      if (Math.abs(value) < 1) return null
      const up = value > 0
      const volLabel = tr(lang, 'Volume index', 'Mengenindex')
      const ex: ComboExhibit = {
        kind: 'combo',
        title: tr(lang, 'Price and volume indices (2020 = 100)', 'Preis- und Mengenindex (2020 = 100)'),
        categories: years.map(String),
        bars: { name: volLabel, values: volume },
        barUnit: tr(lang, 'Volume index', 'Mengenindex'),
        barDecimals: 1,
        line: { name: priceLabel, values: price },
        lineUnit: tr(lang, 'Price index', 'Preisindex'),
        lineDecimals: 1,
      }
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [ex],
        prompt: tr(lang, `Revenue equals price × volume. By what percentage did revenue ${up ? 'rise' : 'fall'} from ${years[i]} to ${years[j]}?`, `Umsatz = Preis × Menge. Um wie viel Prozent ist der Umsatz von ${years[i]} bis ${years[j]} ${up ? 'gestiegen' : 'gesunken'}?`),
        query: { family: 'num', op: 'productChange', a: [{ ex: 0, row: priceLabel, col: String(years[i]) }, { ex: 0, row: volLabel, col: String(years[i]) }], b: [{ ex: 0, row: priceLabel, col: String(years[j]) }, { ex: 0, row: volLabel, col: String(years[j]) }], dir: up ? 'up' : 'down' },
        value: Math.abs(value),
        decimals: 1,
        format: (v) => pct(v, lang, 1),
        distractors: [
          { value: Math.abs((price[j] / price[i] - 1) * 100 + (volume[j] / volume[i] - 1) * 100), tag: 'add-rates', why: 'Preis- und Mengenwachstum addiert – das ignoriert den Kreuzeffekt.' },
          { value: Math.abs((price[j] / price[i] - 1) * 100), tag: 'price-only', why: 'Nur die Preisentwicklung.' },
          { value: Math.abs((volume[j] / volume[i] - 1) * 100), tag: 'volume-only', why: 'Nur die Mengenentwicklung.' },
          { value: Math.abs(price[j] - price[i] + volume[j] - volume[i]), tag: 'points', why: 'Indexpunkte addiert.' },
        ],
        steps: [
          `Preisfaktor: ${f1(price[j])} ÷ ${f1(price[i])} = ${fmt(price[j] / price[i], lang, 4)}`,
          `Mengenfaktor: ${f1(volume[j])} ÷ ${f1(volume[i])} = ${fmt(volume[j] / volume[i], lang, 4)}`,
          `Umsatzfaktor: ${fmt(price[j] / price[i], lang, 4)} × ${fmt(volume[j] / volume[i], lang, 4)} = ${fmt((price[j] * volume[j]) / (price[i] * volume[i]), lang, 4)} → ${pct(value, lang, 2)}`,
        ],
        shortcut: 'Wachstumsraten von Produkten multiplizieren sich: (1 + p)(1 + m) − 1 = p + m + p·m. Einfach addieren unterschätzt das Ergebnis um p·m.',
      })
    })
  },
}

// --------------------------------------------------------------- projection

export const projection: GeneratorDef = {
  id: 'num.projection',
  version: 1,
  category: 'numerical',
  title: 'Hochrechnung / Prognose',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = rng.pick(THEMES)
      const ds = makeDataset(rng, theme, { nRows: d === 1 ? 2 : 3, nYears: 4, nice: d === 1 })
      if (!ds) return null
      const f = (x: number, k = ds.decimals) => fmt(x, lang, k)
      const labels = rowLabels(ds, lang)
      const r = rng.int(0, ds.rows.length - 1)
      const v = ds.values[r]
      const [, , y3, y4] = ds.years
      const ex = rng.chance(0.5) ? tableOf(ds, lang) : d === 1 ? barByYear(ds, lang) : lineOf(ds, lang, [r])
      const subject = subjOf(theme, ds.rows[r], lang)
      const pl = theme.enPlural
      const plDe = theme.dePlural
      const dp = ds.decimals + 1
      if (d === 1) {
        const value = v[3] + (v[3] - v[2])
        if (value <= 0) return null
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [ex],
          prompt: tr(lang, `If ${subject} ${pl ? 'change' : 'changes'} from ${y4} to ${y4 + 1} by the same absolute amount as from ${y3} to ${y4}, what will ${pl ? 'they' : 'it'} be in ${y4 + 1}?`, `Angenommen, ${subject} ${plDe ? 'verändern' : 'verändert'} sich von ${y4} bis ${y4 + 1} um denselben absoluten Betrag wie von ${y3} bis ${y4}. Welcher Wert ergibt sich für ${y4 + 1}?`),
          query: { family: 'num', op: 'projectAbs', a: { ex: 0, row: labels[r], col: String(y3) }, b: { ex: 0, row: labels[r], col: String(y4) } },
          value,
          decimals: dp,
          distractors: [
            { value: v[3] * (v[3] / v[2]), tag: 'percent', why: 'Prozentuales statt absolutes Wachstum fortgeschrieben.' },
            { value: v[3] - (v[3] - v[2]), tag: 'sign', why: 'Veränderung in die falsche Richtung angewendet.' },
            { value: v[3] + 2 * (v[3] - v[2]), tag: 'twice', why: 'Veränderung doppelt angewendet.' },
            { value: v[3] + (v[2] - v[1]), tag: 'wrong-period', why: 'Veränderung der falschen Periode.' },
          ],
          steps: [`Veränderung ${y3} → ${y4}: ${f(v[3])} − ${f(v[2])} = ${f(roundTo(v[3] - v[2], ds.decimals))}`, `${y4 + 1}: ${f(v[3])} + ${f(roundTo(v[3] - v[2], ds.decimals))} = ${f(value, dp)}`],
          shortcut: '„Gleicher absoluter Betrag“ = Differenz addieren. „Gleiche Rate“ = Faktor multiplizieren. Die Frage entscheidet.',
        })
      }
      if (d === 2) {
        const value = v[3] * (v[3] / v[2])
        const up = v[3] > v[2]
        return numMcq(this, seed, d, lang, rng, {
          exhibits: [ex],
          // Verb follows the direction of the change ("falls at the same percentage rate" for a decline).
          prompt: tr(
            lang,
            `If ${subject} ${up ? (pl ? 'grow' : 'grows') : pl ? 'fall' : 'falls'} from ${y4} to ${y4 + 1} at the same percentage rate as from ${y3} to ${y4}, what will ${pl ? 'they' : 'it'} be in ${y4 + 1}?`,
            `Angenommen, ${subject} ${up ? (plDe ? 'wachsen' : 'wächst') : plDe ? 'sinken' : 'sinkt'} von ${y4} bis ${y4 + 1} mit derselben prozentualen Rate wie von ${y3} bis ${y4}. Welcher Wert ergibt sich für ${y4 + 1}?`,
          ),
          query: { family: 'num', op: 'projectPct', a: { ex: 0, row: labels[r], col: String(y3) }, b: { ex: 0, row: labels[r], col: String(y4) } },
          value,
          decimals: dp,
          distractors: [
            { value: v[3] + (v[3] - v[2]), tag: 'absolute', why: 'Absolute statt prozentuale Veränderung fortgeschrieben.' },
            { value: v[3] * (v[2] / v[1]), tag: 'wrong-period', why: 'Rate der falschen Periode.' },
            { value: v[3] * (2 - v[2] / v[3]), tag: 'wrong-base', why: 'Rate auf den neuen Wert bezogen.' },
          ],
          steps: [`Rate ${y3} → ${y4}: ${f(v[3])} ÷ ${f(v[2])} = ${fmt(v[3] / v[2], lang, 4)}`, `${y4 + 1}: ${f(v[3])} × ${fmt(v[3] / v[2], lang, 4)} = ${f(value, dp + 1)}`],
          shortcut: 'Gleiche Rate = mit demselben Faktor multiplizieren: neu = alt × (alt ÷ vorher).',
        })
      }
      const value = v[3] * (v[3] / v[1])
      const up = v[3] > v[1]
      return numMcq(this, seed, d, lang, rng, {
        exhibits: [ex],
        prompt: tr(
          lang,
          `If ${subject} ${pl ? 'keep' : 'keeps'} ${up ? 'growing' : 'falling'} at the same compound annual ${up ? 'growth' : 'rate of decline'} (CAGR) as from ${ds.years[1]} to ${y4}, what will ${pl ? 'they' : 'it'} be in ${y4 + 2}?`,
          `Angenommen, ${subject} ${up ? (plDe ? 'wachsen' : 'wächst') : plDe ? 'sinken' : 'sinkt'} weiter mit derselben durchschnittlichen jährlichen ${up ? 'Wachstumsrate' : 'Rate'} (CAGR) wie von ${ds.years[1]} bis ${y4}. Welcher Wert ergibt sich für ${y4 + 2}?`,
        ),
        query: { family: 'num', op: 'projectCagr', a: { ex: 0, row: labels[r], col: String(ds.years[1]) }, b: { ex: 0, row: labels[r], col: String(y4) }, periods: 2, ahead: 2 },
        value,
        decimals: dp,
        distractors: [
          { value: v[3] * Math.sqrt(v[3] / v[1]), tag: 'one-year', why: 'Nur ein Jahr hochgerechnet.' },
          { value: v[3] + 2 * ((v[3] - v[1]) / 2), tag: 'absolute', why: 'Linear (absolut) statt mit der Rate fortgeschrieben.' },
          { value: v[3] * (v[3] / v[2]) ** 2, tag: 'last-year-rate', why: 'Nur die Rate des letzten Jahres verwendet.' },
          { value: v[3] * (v[3] / v[1]) ** 2, tag: 'squared', why: 'Faktor doppelt quadriert.' },
        ],
        steps: [
          `Faktor über 2 Jahre (${ds.years[1]} → ${y4}): ${f(v[3])} ÷ ${f(v[1])} = ${fmt(v[3] / v[1], lang, 4)}`,
          `2 weitere Jahre mit derselben jährlichen Rate = derselbe 2-Jahres-Faktor: ${f(v[3])} × ${fmt(v[3] / v[1], lang, 4)} = ${f(value, dp + 1)}`,
        ],
        shortcut: 'Trick: Gleiche jährliche Rate über gleich viele Jahre ergibt denselben Gesamtfaktor – die CAGR muss man gar nicht ausrechnen.',
      })
    })
  },
}

