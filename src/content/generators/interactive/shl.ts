/** SHL Verify-Interactive style formats: drag a bar, drag items into order, fill a table cell. */
import { fmt, pct, roundTo } from '../../format'
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { BarDragItem, OrderItem, TableExhibit, TableFillItem } from '../../types'
import { makeDataset, rowLabels, tableOf } from '../numerical/dataset'
import { subjOf, THEMES, unitOf } from '../numerical/themes'

// --------------------------------------------------------------- bar drag

export const barDrag: GeneratorDef = {
  id: 'int.bar',
  version: 1,
  category: 'interactive',
  title: 'Balken auf Wert ziehen',
  types: ['bar'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = rng.pick(THEMES.filter((t) => t.decimals === 0))
      const step = rng.pick([5, 10])
      const years = [2021, 2022, 2023, 2024, 2025]
      const vals = years.slice(0, 4).map(() => rng.int(Math.ceil(theme.range[0] / step), Math.floor(theme.range[1] / 2 / step)) * step)
      const last = vals[3]
      let answer: number
      let prompt: string
      let steps: string[]
      let query: { family: string } & Record<string, unknown>
      const f = (x: number) => fmt(x, lang, 0)
      const subject = subjOf(theme, rng.int(0, theme.rows.length - 1), lang)
      if (d === 1) {
        const delta = rng.pick([-1, 1]) * rng.int(2, 12) * step
        answer = last + delta
        prompt = tr(lang, `In 2025, ${subject} ${theme.enPlural ? 'were' : 'was'} ${f(Math.abs(delta))} ${delta > 0 ? 'higher' : 'lower'} than in 2024. Drag the 2025 bar to the correct value.`, `Im Jahr 2025 lag${theme.dePlural ? 'en' : ''} ${subject} um ${f(Math.abs(delta))} ${delta > 0 ? 'höher' : 'niedriger'} als 2024. Ziehe den Balken für 2025 auf den richtigen Wert.`)
        steps = [`2024: ${f(last)}`, `${f(last)} ${delta > 0 ? '+' : '−'} ${f(Math.abs(delta))} = ${f(answer)}`]
        query = { family: 'bar', kind: 'delta', delta }
      } else if (d === 2) {
        const p = rng.pick([-20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40])
        answer = last * (1 + p / 100)
        if (!Number.isInteger(answer / step)) return null
        prompt = tr(lang, `In 2025, ${subject} ${theme.enPlural ? 'were' : 'was'} ${pct(Math.abs(p), lang)} ${p > 0 ? 'higher' : 'lower'} than in 2024. Drag the 2025 bar to the correct value.`, `Im Jahr 2025 lag${theme.dePlural ? 'en' : ''} ${subject} um ${pct(Math.abs(p), lang)} ${p > 0 ? 'höher' : 'niedriger'} als 2024. Ziehe den Balken für 2025 auf den richtigen Wert.`)
        steps = [`2024: ${f(last)}`, `${f(last)} × ${fmt(1 + p / 100, lang, 2)} = ${f(answer)}`]
        query = { family: 'bar', kind: 'pct', p }
      } else {
        const avg = rng.int(Math.ceil(theme.range[0] / step), Math.floor(theme.range[1] / 2 / step)) * step
        answer = avg * 5 - vals.reduce((a, b) => a + b, 0)
        if (answer <= 0 || !Number.isInteger(answer / step)) return null
        // Keep the required bar in a realistic range of the others.
        if (answer < Math.min(...vals) * 0.5 || answer > Math.max(...vals) * 1.6) return null
        prompt = tr(lang, `The average value over 2021–2025 was ${f(avg)}. Drag the 2025 bar to the value that makes this true.`, `Der Durchschnitt über 2021–2025 betrug ${f(avg)}. Ziehe den Balken für 2025 auf den Wert, der das erfüllt.`)
        steps = [`Summe aller 5 Jahre = 5 × ${f(avg)} = ${f(avg * 5)}`, `Summe 2021–2024: ${vals.map(f).join(' + ')} = ${f(vals.reduce((a, b) => a + b, 0))}`, `2025 = ${f(avg * 5)} − ${f(vals.reduce((a, b) => a + b, 0))} = ${f(answer)}`]
        query = { family: 'bar', kind: 'average', avg }
      }
      if (answer <= 0) return null
      const max = Math.ceil((Math.max(...vals, answer) * 1.3) / (step * 10)) * step * 10
      const item: BarDragItem = {
        ...core(this, seed, d, lang),
        type: 'bar',
        exhibits: [],
        prompt,
        hint: tr(lang, `The bar snaps to steps of ${step}.`, `Der Balken rastet in ${step}er-Schritten ein.`),
        query,
        chart: { categories: years.map(String), values: [...vals, null], target: 4, min: 0, max, step, unit: unitOf(theme, lang), decimals: 0 },
        answer,
        explanation: { steps: [...steps, `Balken auf **${f(answer)}** ziehen.`], shortcut: 'Erst die Zahl ausrechnen, dann ziehen – beim Ziehen auf die Wertanzeige achten, nicht auf das Augenmaß.' },
      }
      return item
    })
  },
}

// ------------------------------------------------------------------ order

export const dragOrder: GeneratorDef = {
  id: 'int.order',
  version: 1,
  category: 'interactive',
  title: 'Reihenfolge per Drag & Drop',
  types: ['order'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      // Margins (level 3) only make sense for money: use the revenue theme there.
      const theme = d === 3 ? (THEMES.find((t) => t.id === 'revenue') as (typeof THEMES)[number]) : rng.pick(THEMES)
      const ds = makeDataset(rng, theme, { nRows: d === 1 ? 4 : 5, nYears: 2, nice: d === 1 })
      if (!ds) return null
      const labels = rowLabels(ds, lang)
      const y0 = String(ds.years[0])
      const y1 = String(ds.years[1])
      const desc = rng.chance(0.5)
      let metric: number[]
      let what: string
      let table: TableExhibit = tableOf(ds, lang)
      let kind: string
      const P = (x: number) => pct(x, lang, 1)
      if (d === 1) {
        metric = ds.values.map((r) => r[1])
        what = tr(lang, `by value in ${y1}`, `nach dem Wert ${y1}`)
        kind = 'level'
      } else if (d === 2) {
        metric = ds.values.map((r) => ((r[1] - r[0]) / r[0]) * 100)
        what = tr(lang, `by percentage change from ${y0} to ${y1}`, `nach prozentualer Veränderung von ${y0} bis ${y1}`)
        kind = 'pct'
      } else {
        // Profit margin from a revenue/profit table.
        const revenue = ds.values.map((r) => r[1])
        const margins = revenue.map(() => rng.int(30, 250) / 10)
        const profit = revenue.map((r, i) => roundTo((r * margins[i]) / 100, 1))
        table = {
          kind: 'table',
          title: tr(lang, `Revenue and profit, ${y1}`, `Umsatz und Gewinn, ${y1}`),
          unitNote: unitOf(theme, lang),
          rowHeader: lang === 'de' ? theme.entity.de : theme.entity.en,
          header: [tr(lang, 'Revenue', 'Umsatz'), tr(lang, 'Profit', 'Gewinn')],
          rows: labels.map((l, i) => ({ label: l, cells: [revenue[i], profit[i]] })),
          decimals: [ds.decimals, 1],
        }
        metric = revenue.map((r, i) => (profit[i] / r) * 100)
        what = tr(lang, 'by profit margin (profit ÷ revenue)', 'nach Gewinnmarge (Gewinn ÷ Umsatz)')
        kind = 'margin'
      }
      const sorted = metric.map((v, i) => ({ v, i })).sort((a, b) => (desc ? b.v - a.v : a.v - b.v))
      const minGap = kind === 'level' ? 0 : 0.5
      for (let k = 1; k < sorted.length; k++) if (Math.abs(sorted[k].v - sorted[k - 1].v) <= minGap) return null
      const entries = rng.shuffle(labels.map((_, i) => i))
      const correctOrder = sorted.map((s) => entries.indexOf(s.i))
      const fmtM = (v: number) => (kind === 'level' ? fmt(v, lang, ds.decimals) : P(v))
      const item: OrderItem = {
        ...core(this, seed, d, lang),
        type: 'order',
        exhibits: [table],
        prompt: tr(lang, `Drag the ${theme.entity.enPlural} into order ${what}, ${desc ? 'highest first' : 'lowest first'}.`, `Ziehe die ${theme.entity.dePlural} in die Reihenfolge ${what}, ${desc ? 'höchster Wert zuerst' : 'niedrigster Wert zuerst'}.`),
        query: { family: 'order', kind, desc, from: y0, to: y1 },
        entries: entries.map((i) => labels[i]),
        correctOrder,
        explanation: {
          steps: [...sorted.map((s, k) => `${k + 1}. ${labels[s.i]}: ${fmtM(s.v)}`)],
          shortcut: kind === 'level' ? 'Nur die Spalte des gefragten Jahres ansehen.' : 'Kennzahl für alle Zeilen grob überschlagen, nur eng beieinanderliegende Werte genauer rechnen.',
        },
      }
      return item
    })
  },
}

// ------------------------------------------------------------- table fill

export const tableFill: GeneratorDef = {
  id: 'int.tablefill',
  version: 1,
  category: 'interactive',
  title: 'Tabellenzelle befüllen',
  types: ['tablefill'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const theme = rng.pick(THEMES.filter((t) => t.decimals === 0))
      const ds = makeDataset(rng, theme, { nRows: 4, nYears: 4, nice: d === 1 })
      if (!ds) return null
      const labels = rowLabels(ds, lang)
      const r = rng.int(0, 3)
      if (d === 1) {
        // Quarterly values with a total column; one quarter missing.
        const header = ['Q1', 'Q2', 'Q3', 'Q4', tr(lang, 'Total', 'Summe')]
        const rows = ds.values.map((v, i) => ({ label: labels[i], cells: [...v, v.reduce((a, b) => a + b, 0)] as (number | null)[] }))
        const c = rng.int(0, 3)
        const answer = rows[r].cells[c] as number
        rows[r].cells[c] = null
        const table: TableExhibit = { kind: 'table', title: `${lang === 'de' ? theme.title.de : theme.title.en} 2025`, unitNote: unitOf(theme, lang), rowHeader: '', header, rows, decimals: header.map(() => 0) }
        const item: TableFillItem = {
          ...core(this, seed, d, lang),
          type: 'tablefill',
          exhibits: [],
          prompt: tr(lang, `The "Total" column is the sum of Q1–Q4. Enter the missing value for ${labels[r]}.`, `Die Spalte „Summe“ ist die Summe von Q1–Q4. Trage den fehlenden Wert für ${labels[r]} ein.`),
          query: { family: 'tablefill', kind: 'rowTotal' },
          table,
          blank: { row: r, col: c },
          answer,
          tolerance: 1e-9,
          decimals: 0,
          explanation: {
            steps: [`Summe ${fmt(rows[r].cells[4] as number, lang, 0)} minus die übrigen Quartale: ${rows[r].cells.slice(0, 4).filter((x) => x !== null).map((x) => fmt(x as number, lang, 0)).join(' + ')}`, `= **${fmt(answer, lang, 0)}**`],
            shortcut: 'Fehlender Summand = Summe − alle anderen. Kontrolle: Zeile neu aufaddieren.',
          },
        }
        return item
      }
      if (d === 2) {
        // Share column (% of column total); one share missing.
        const c = 3
        const total = ds.values.reduce((s, v) => s + v[c], 0)
        const shares = ds.values.map((v) => roundTo((v[c] / total) * 100, 1))
        const answer = (ds.values[r][c] / total) * 100
        // Both methods (divide, or 100 % minus the other rounded shares) must give the same 1-dp value.
        const viaRest = roundTo(100 - shares.filter((_, i) => i !== r).reduce((a, b) => a + b, 0), 1)
        if (Math.abs(viaRest - roundTo(answer, 1)) > 1e-9) return null
        const header = [String(ds.years[c]), tr(lang, `Share of total ${ds.years[c]}`, `Anteil an der Summe ${ds.years[c]}`)]
        const rows = ds.values.map((v, i) => ({ label: labels[i], cells: [v[c], i === r ? null : shares[i]] as (number | null)[] }))
        const table: TableExhibit = { kind: 'table', title: lang === 'de' ? theme.title.de : theme.title.en, unitNote: unitOf(theme, lang), rowHeader: '', header, rows, decimals: [0, 1], suffix: ['', lang === 'de' ? ' %' : '%'] }
        const item: TableFillItem = {
          ...core(this, seed, d, lang),
          type: 'tablefill',
          exhibits: [],
          prompt: tr(lang, `The share column shows each row as a percentage of the column total. Enter the missing share for ${labels[r]} (one decimal place).`, `Die Anteilsspalte zeigt jede Zeile in Prozent der Spaltensumme. Trage den fehlenden Anteil für ${labels[r]} ein (eine Nachkommastelle).`),
          query: { family: 'tablefill', kind: 'share', valueCol: 0 },
          table,
          blank: { row: r, col: 1 },
          answer,
          tolerance: 0.05 + 1e-9,
          decimals: 1,
          explanation: {
            steps: [`Spaltensumme: ${ds.values.map((v) => fmt(v[c], lang, 0)).join(' + ')} = ${fmt(total, lang, 0)}`, `${fmt(ds.values[r][c], lang, 0)} ÷ ${fmt(total, lang, 0)} × 100 = **${pct(answer, lang, 2)}** → ${pct(roundTo(answer, 1), lang, 1)}`],
            shortcut: `Alternativ: 100 % minus die übrigen Anteile (${shares.filter((_, i) => i !== r).map((s) => pct(s, lang, 1)).join(', ')}) – geht ohne Division, kann aber durch Rundung um 0,1 abweichen.`,
          },
        }
        return item
      }
      // d3: percentage change column; one 2025 value missing, change given.
      const v0 = ds.values.map((v) => v[2])
      const v1 = ds.values.map((v) => v[3])
      const changes = v1.map((x, i) => roundTo(((x - v0[i]) / v0[i]) * 100, 1))
      // The blank value is defined by the displayed (rounded) change → round result to 0 decimals.
      const exact = v0[r] * (1 + changes[r] / 100)
      const header = [String(ds.years[2]), String(ds.years[3]), tr(lang, 'Change', 'Veränderung')]
      const rows = labels.map((l, i) => ({ label: l, cells: [v0[i], i === r ? null : v1[i], changes[i]] as (number | null)[] }))
      const table: TableExhibit = { kind: 'table', title: lang === 'de' ? theme.title.de : theme.title.en, unitNote: unitOf(theme, lang), rowHeader: '', header, rows, decimals: [0, 0, 1], suffix: ['', '', lang === 'de' ? ' %' : '%'] }
      if (Math.abs(exact - Math.round(exact) - 0.5) < 0.02 || Math.abs(exact - Math.round(exact) + 0.5) < 0.02) return null
      const item: TableFillItem = {
        ...core(this, seed, d, lang),
        type: 'tablefill',
        exhibits: [],
        prompt: tr(lang, `The last column shows the percentage change from ${ds.years[2]} to ${ds.years[3]}. Enter the missing ${ds.years[3]} value for ${labels[r]} (nearest whole number).`, `Die letzte Spalte zeigt die prozentuale Veränderung von ${ds.years[2]} bis ${ds.years[3]}. Trage den fehlenden Wert ${ds.years[3]} für ${labels[r]} ein (auf ganze Zahl gerundet).`),
        query: { family: 'tablefill', kind: 'fromChange' },
        table,
        blank: { row: r, col: 1 },
        answer: exact,
        // Every whole number whose change rounds to the displayed value is accepted.
        tolerance: Math.max(0.5, v0[r] * 0.0005) + 1e-9,
        decimals: 0,
        explanation: {
          steps: [
            `${fmt(v0[r], lang, 0)} × (1 ${changes[r] >= 0 ? '+' : '−'} ${fmt(Math.abs(changes[r]) / 100, lang, 3)}) = ${fmt(exact, lang, 2)}`,
            `Gerundet: **${fmt(Math.round(exact), lang, 0)}**`,
            'Da die Veränderung nur auf eine Nachkommastelle gerundet angezeigt wird, zählen auch benachbarte ganze Zahlen als richtig, deren Veränderung ebenfalls so gerundet würde.',
          ],
          shortcut: 'Neuer Wert = alter Wert × (1 + Veränderung). Bei negativer Veränderung wird der Faktor kleiner als 1.',
        },
      }
      return item
    })
  },
}
