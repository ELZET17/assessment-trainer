/** Random but plausible datasets and the exhibits that display them. */
import { roundTo } from '../../format'
import type { Rng } from '../../rng'
import type { BarExhibit, LineExhibit, PieExhibit, TableExhibit, Lang } from '../../types'
import { label, titleOf, unitOf, type Theme } from './themes'

export interface Dataset {
  theme: Theme
  /** Theme row indices in display order. */
  rows: number[]
  years: number[]
  /** values[r][c] – already rounded to the displayed precision. */
  values: number[][]
  decimals: number
}

export interface DatasetOptions {
  nRows: number
  nYears: number
  /** Round to "nice" values (multiples of 5 or 0.5) for level 1. */
  nice?: boolean
  lastYear?: number
}

function niceRound(v: number, decimals: number): number {
  return decimals === 0 ? Math.max(5, Math.round(v / 5) * 5) : Math.max(0.5, Math.round(v * 2) / 2)
}

export function makeDataset(rng: Rng, theme: Theme, o: DatasetOptions): Dataset | null {
  const rows = rng.sample(
    theme.rows.map((_, i) => i),
    o.nRows,
  )
  const last = o.lastYear ?? 2025
  const years = Array.from({ length: o.nYears }, (_, i) => last - o.nYears + 1 + i)
  const decimals = theme.decimals
  const values = rows.map(() => {
    const out: number[] = []
    let v = theme.range[0] + rng.next() * (theme.range[1] - theme.range[0])
    for (let c = 0; c < o.nYears; c++) {
      out.push(o.nice ? niceRound(v, decimals) : roundTo(v, decimals))
      v *= 1 + theme.growth[0] + rng.next() * (theme.growth[1] - theme.growth[0])
    }
    return out
  })
  // Distinct, positive values per column keep "largest/smallest" questions fair.
  for (let c = 0; c < o.nYears; c++) {
    const col = values.map((r) => r[c])
    if (new Set(col).size !== col.length || col.some((v) => v <= 0)) return null
  }
  // Consecutive equal values make change questions degenerate.
  if (values.some((r) => r.some((v, c) => c > 0 && v === r[c - 1]))) return null
  return { theme, rows, years, values, decimals }
}

export function rowLabels(ds: Dataset, lang: Lang): string[] {
  return ds.rows.map((r) => label(ds.theme, r, lang))
}

export function tableOf(ds: Dataset, lang: Lang, cols?: number[]): TableExhibit {
  const cs = cols ?? ds.years.map((_, i) => i)
  return {
    kind: 'table',
    title: titleOf(ds.theme, lang),
    unitNote: unitOf(ds.theme, lang),
    rowHeader: lang === 'de' ? ds.theme.entity.de : cap(ds.theme.entity.en),
    header: cs.map((c) => String(ds.years[c])),
    rows: ds.rows.map((_, r) => ({ label: label(ds.theme, ds.rows[r], lang), cells: cs.map((c) => ds.values[r][c]) })),
    decimals: cs.map(() => ds.decimals),
  }
}

/** Grouped bars: categories = years, one series per row. */
export function barByYear(ds: Dataset, lang: Lang, cols?: number[]): BarExhibit {
  const cs = cols ?? ds.years.map((_, i) => i)
  return {
    kind: 'bar',
    title: titleOf(ds.theme, lang),
    unitNote: unitOf(ds.theme, lang),
    categories: cs.map((c) => String(ds.years[c])),
    series: ds.rows.map((_, r) => ({ name: label(ds.theme, ds.rows[r], lang), values: cs.map((c) => ds.values[r][c]) })),
    decimals: ds.decimals,
  }
}

/** Bars per entity for one or two years: categories = entities, series = years. */
export function barByEntity(ds: Dataset, lang: Lang, cols: number[]): BarExhibit {
  return {
    kind: 'bar',
    title: titleOf(ds.theme, lang),
    unitNote: unitOf(ds.theme, lang),
    categories: rowLabels(ds, lang),
    series: cols.map((c) => ({ name: String(ds.years[c]), values: ds.values.map((r) => r[c]) })),
    decimals: ds.decimals,
  }
}

export function stackedByYear(ds: Dataset, lang: Lang, cols?: number[]): BarExhibit {
  return { ...barByYear(ds, lang, cols), stacked: true, showTotals: true }
}

export function lineOf(ds: Dataset, lang: Lang, rowIdx: number[]): LineExhibit {
  return {
    kind: 'line',
    title: titleOf(ds.theme, lang),
    unitNote: unitOf(ds.theme, lang),
    categories: ds.years.map(String),
    series: rowIdx.map((r) => ({ name: label(ds.theme, ds.rows[r], lang), values: ds.values[r].slice() })),
    decimals: ds.decimals,
  }
}

export function pieOf(title: string, labels: string[], shares: number[], decimals: number, lang: Lang): PieExhibit {
  return {
    kind: 'pie',
    title,
    slices: labels.map((l, i) => ({ label: l, value: shares[i] })),
    decimals,
    suffix: lang === 'de' ? ' %' : '%',
  }
}

/** Integer-ish percentage shares that sum to exactly 100 at the given precision. */
export function makeShares(rng: Rng, n: number, decimals: number, minShare = 6): number[] | null {
  const raw = Array.from({ length: n }, () => 0.5 + rng.next())
  const sum = raw.reduce((a, b) => a + b, 0)
  const unit = 10 ** -decimals
  const shares = raw.map((x) => roundTo((x / sum) * 100, decimals))
  const diff = roundTo(100 - shares.reduce((a, b) => a + b, 0), decimals)
  shares[shares.indexOf(Math.max(...shares))] = roundTo(Math.max(...shares) + diff, decimals)
  if (shares.some((s) => s < minShare)) return null
  if (new Set(shares).size !== n) return null
  if (Math.abs(shares.reduce((a, b) => a + b, 0) - 100) > unit / 2) return null
  return shares
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
