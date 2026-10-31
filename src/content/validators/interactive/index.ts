/** Independent solver for the SHL interactive formats. */
import type { PublicItem, TableExhibit } from '../../types'
import { fail, type Validation } from '../result'

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

function cell(t: TableExhibit, r: number, c: number): number {
  const v = t.rows[r].cells[c]
  if (v === null || v === undefined) throw new Error(`blank cell ${r},${c}`)
  return v
}

export function validateInteractive(item: PublicItem): Validation {
  const q = item.query as Record<string, unknown> | undefined
  if (!q) return fail('missing query')
  if (item.type === 'bar') {
    const vals = item.chart.values
    const prev = vals[item.chart.target - 1]
    if (prev === null) return fail('previous bar missing')
    let v: number
    if (q.kind === 'delta') v = prev + (q.delta as number)
    else if (q.kind === 'pct') v = prev * (1 + (q.p as number) / 100)
    else if (q.kind === 'average') v = (q.avg as number) * vals.length - sum(vals.filter((x): x is number => x !== null))
    else return fail('unknown bar kind')
    if (Math.abs(v / item.chart.step - Math.round(v / item.chart.step)) > 1e-9) return fail('answer not on the snapping grid')
    if (v < item.chart.min || v > item.chart.max) return fail('answer outside the axis')
    return { ok: true, solution: { kind: 'numeric', value: v } }
  }
  if (item.type === 'order') {
    const t = item.exhibits[0]
    if (!t || t.kind !== 'table') return fail('order: table missing')
    const metricOf = (label: string): number => {
      const r = t.rows.findIndex((x) => x.label === label)
      if (r < 0) throw new Error(`row ${label} missing`)
      if (q.kind === 'level') return cell(t, r, t.header.indexOf(q.to as string))
      if (q.kind === 'pct') {
        const a = cell(t, r, t.header.indexOf(q.from as string))
        const b = cell(t, r, t.header.indexOf(q.to as string))
        return (b - a) / a
      }
      return cell(t, r, 1) / cell(t, r, 0)
    }
    const m = item.entries.map(metricOf)
    const idx = m.map((_, i) => i).sort((a, b) => (q.desc ? m[b] - m[a] : m[a] - m[b]))
    for (let k = 1; k < idx.length; k++) if (m[idx[k]] === m[idx[k - 1]]) return fail('tie in ordering')
    return { ok: true, solution: { kind: 'order', order: idx } }
  }
  if (item.type === 'tablefill') {
    const t = item.table
    const { row, col } = item.blank
    if (t.rows[row].cells[col] !== null) return fail('blank cell is not blank')
    if (q.kind === 'rowTotal') {
      const cells = t.rows[row].cells
      const total = cells[cells.length - 1] as number
      return { ok: true, solution: { kind: 'numeric', value: total - sum(cells.slice(0, -1).filter((x): x is number => x !== null)) } }
    }
    if (q.kind === 'share') {
      const vc = q.valueCol as number
      const colVals = t.rows.map((_, r) => cell(t, r, vc))
      return { ok: true, solution: { kind: 'numeric', value: (cell(t, row, vc) / sum(colVals)) * 100 } }
    }
    if (q.kind === 'fromChange') {
      return { ok: true, solution: { kind: 'numeric', value: cell(t, row, 0) * (1 + cell(t, row, 2) / 100) } }
    }
    return fail('unknown table kind')
  }
  return fail('unsupported interactive item')
}
