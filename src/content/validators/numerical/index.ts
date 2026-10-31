/**
 * Independent solver for Numerical Reasoning items. Reads values only from
 * the displayed exhibits (by row/column label), recomputes the answer from
 * the structured question and matches it to the displayed options.
 */
import type { Exhibit, PublicItem } from '../../types'
import { matchNumericOption, parseDisplayedNumber } from '../numparse'
import { fail, mcq, type Validation } from '../result'

type Ref = { ex: number; row: string; col: string }
type Q = Record<string, unknown>

const CANNOT = ['cannot say', 'nicht bestimmbar']

export function lookup(exhibits: Exhibit[], ref: Ref): number | null {
  const ex = exhibits[ref.ex]
  if (!ex) return null
  switch (ex.kind) {
    case 'table': {
      const r = ex.rows.find((x) => x.label === ref.row)
      const c = ex.header.indexOf(ref.col)
      if (!r || c < 0) return null
      return r.cells[c] ?? null
    }
    case 'bar':
    case 'line': {
      let s = ex.series.find((x) => x.name === ref.row)
      let c = ex.categories.indexOf(ref.col)
      if (s && c >= 0) return s.values[c] ?? null
      s = ex.series.find((x) => x.name === ref.col)
      c = ex.categories.indexOf(ref.row)
      if (s && c >= 0) return s.values[c] ?? null
      return null
    }
    case 'combo': {
      const c = ex.categories.indexOf(ref.col)
      if (c < 0) return null
      if (ex.bars.name === ref.row) return ex.bars.values[c]
      if (ex.line.name === ref.row) return ex.line.values[c]
      return null
    }
    case 'pie': {
      const s = ex.slices.find((x) => x.label === ref.row)
      return s ? s.value : null
    }
    default:
      return null
  }
}

/** Row labels and values of one column/category of an exhibit. */
function column(ex: Exhibit, col: string): { label: string; value: number }[] | null {
  if (ex.kind === 'table') {
    const c = ex.header.indexOf(col)
    if (c < 0) return null
    return ex.rows.map((r) => ({ label: r.label, value: r.cells[c] as number }))
  }
  if (ex.kind === 'bar' || ex.kind === 'line') {
    const c = ex.categories.indexOf(col)
    if (c >= 0) return ex.series.map((s) => ({ label: s.name, value: s.values[c] }))
    const s = ex.series.find((x) => x.name === col)
    if (s) return ex.categories.map((cat, i) => ({ label: cat, value: s.values[i] }))
  }
  return null
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Decimals shown in numeric option texts. */
function shownDecimals(texts: string[], lang: 'en' | 'de'): number {
  const sep = lang === 'de' ? ',' : '.'
  let best = 0
  for (const t of texts) {
    const digits = t.replace(/[^\d.,]/g, '')
    const i = digits.lastIndexOf(sep)
    if (i >= 0) best = Math.max(best, digits.length - i - 1)
  }
  return best
}

function finish(item: PublicItem, value: number | null): Validation {
  if (item.type !== 'mcq') return fail('numerical item is not MCQ')
  const texts = item.options.map((o) => o.text)
  const csIdx = texts.findIndex((t) => CANNOT.includes(t.trim().toLowerCase()))
  if (value === null) return csIdx >= 0 ? mcq(csIdx) : fail('data missing but no "Cannot say" option')
  if (!Number.isFinite(value)) return fail('non-finite value')
  const numeric = texts.map((t, i) => ({ t, i })).filter(({ i }) => i !== csIdx)
  const dp = shownDecimals(
    numeric.map((x) => x.t),
    item.lang,
  )
  const r = matchNumericOption(
    numeric.map((x) => x.t),
    item.lang,
    value,
    dp,
  )
  return r.ok ? mcq(numeric[r.index].i) : fail(r.reason)
}

export function validateNumerical(item: PublicItem): Validation {
  const q = item.query as Q | undefined
  if (!q || q.family !== 'num') return fail('missing numerical query')
  const ex = item.exhibits
  const get = (r: unknown): number | null => lookup(ex, r as Ref)
  const need = (r: unknown): number => {
    const v = get(r)
    if (v === null) throw new Error(`value not found: ${JSON.stringify(r)}`)
    return v
  }
  const sumRefs = (rs: unknown) => sum((rs as Ref[]).map(need))
  const checkDir = (a: number, b: number) => {
    if (q.dir === 'up' && !(b > a)) throw new Error('question says increase, data shows decrease')
    if (q.dir === 'down' && !(b < a)) throw new Error('question says decrease, data shows increase')
  }
  switch (q.op) {
    case 'pctChange': {
      const a = sumRefs(q.from)
      const b = sumRefs(q.to)
      checkDir(a, b)
      return finish(item, (Math.abs(b - a) / a) * 100)
    }
    case 'ppDiff': {
      const a = need(q.a)
      const b = need(q.b)
      checkDir(a, b)
      return finish(item, Math.abs(b - a))
    }
    case 'shareOfTotal': {
      const s = need(q.share)
      const t = get(q.total)
      return finish(item, t === null ? null : (s * t) / 100)
    }
    case 'share': {
      const whole = q.whole as { ex: number; col: string }
      const col = column(ex[whole.ex], whole.col)
      if (!col) return fail('column not found')
      return finish(item, (sumRefs(q.parts) / sum(col.map((c) => c.value))) * 100)
    }
    case 'ratio':
      return finish(item, sumRefs(q.a) / sumRefs(q.b))
    case 'ratioOfIncreases': {
      const [a0, a1] = (q.a as Ref[]).map(need)
      const [b0, b1] = (q.b as Ref[]).map(need)
      return finish(item, (a1 - a0) / (b1 - b0))
    }
    case 'sumConvert':
      return finish(item, sumRefs(q.parts) / (q.factor as number))
    case 'restConvert': {
      const whole = q.whole as { ex: number; col: string }
      const col = column(ex[whole.ex], whole.col)
      if (!col) return fail('column not found')
      return finish(item, (sum(col.map((c) => c.value)) - sumRefs(q.parts)) / (q.factor as number))
    }
    case 'fx': {
      const rate = (code: unknown) => (code === 'EUR' ? 1 : need({ ex: 0, row: code, col: q.col }))
      return finish(item, ((q.amount as number) / rate(q.from)) * rate(q.to))
    }
    case 'mean': {
      const v = (q.refs as Ref[]).map(need)
      return finish(item, sum(v) / v.length)
    }
    case 'weightedMean': {
      const w = (q.weights as Ref[]).map(need)
      const v = (q.values as Ref[]).map(need)
      return finish(item, sum(w.map((x, i) => x * v[i])) / sum(w))
    }
    case 'median':
    case 'mode':
    case 'range':
    case 'meanMinusMedian': {
      const v = (q.refs as Ref[]).map(need).sort((a, b) => a - b)
      const n = v.length
      const median = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2
      if (q.op === 'median') return finish(item, median)
      if (q.op === 'range') return finish(item, v[n - 1] - v[0])
      if (q.op === 'meanMinusMedian') return finish(item, sum(v) / n - median)
      const counts = new Map<number, number>()
      v.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
      const max = Math.max(...counts.values())
      const modes = [...counts.entries()].filter(([, c]) => c === max)
      if (max < 2 || modes.length !== 1) return fail('no unique mode')
      return finish(item, modes[0][0])
    }
    case 'cagr': {
      const a = q.a as Ref
      const b = q.b as Ref
      const periods = Number(b.col) - Number(a.col)
      if (!(periods > 0)) return fail('cannot derive periods from column labels')
      return finish(item, ((need(b) / need(a)) ** (1 / periods) - 1) * 100)
    }
    case 'indexValue':
      return finish(item, (need(q.base) * need(q.idx)) / 100)
    case 'productChange': {
      const a = (q.a as Ref[]).map(need).reduce((x, y) => x * y, 1)
      const b = (q.b as Ref[]).map(need).reduce((x, y) => x * y, 1)
      checkDir(a, b)
      return finish(item, (Math.abs(b - a) / a) * 100)
    }
    case 'projectAbs': {
      const a = need(q.a)
      const b = need(q.b)
      return finish(item, b + (b - a))
    }
    case 'projectPct': {
      const a = need(q.a)
      const b = need(q.b)
      return finish(item, b * (b / a))
    }
    case 'projectCagr': {
      const a = q.a as Ref
      const b = q.b as Ref
      const periods = Number(b.col) - Number(a.col)
      return finish(item, need(b) * (need(b) / need(a)) ** ((q.ahead as number) / periods))
    }
    case 'extreme': {
      const e = ex[0]
      const from = column(e, q.from as string)
      const to = column(e, q.to as string)
      if (!from || !to) return fail('extreme: columns not found')
      const metric = to.map((t) => {
        const f = from.find((x) => x.label === t.label)
        if (!f) throw new Error('row mismatch')
        if (q.metric === 'level') return { label: t.label, v: t.value }
        if (q.metric === 'absInc') return { label: t.label, v: t.value - f.value }
        return { label: t.label, v: ((t.value - f.value) / f.value) * 100 }
      })
      const sorted = metric.slice().sort((x, y) => (q.largest ? y.v - x.v : x.v - y.v))
      if (Math.abs(sorted[0].v - sorted[1].v) < 1e-9) return fail('tie')
      if (item.type !== 'mcq') return fail('not mcq')
      const idx = item.options.findIndex((o) => o.text === sorted[0].label)
      return idx >= 0 ? mcq(idx) : fail('winning label not among options')
    }
    default:
      return fail(`unknown op ${String(q.op)}`)
  }
}

export { parseDisplayedNumber }
