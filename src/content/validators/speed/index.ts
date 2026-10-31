/**
 * Independent solver for Speed Math items. Recomputes every answer from the
 * structured query with exact rational arithmetic and matches it against the
 * displayed option texts.
 */
import type { PublicItem } from '../../types'
import { evalExact, F, Frac, matchNumericOption, parseDisplayedNumber } from '../numparse'
import { fail, mcq, texts, type Validation } from '../result'
import { solveSequence } from './sequence'

type Q = Record<string, unknown>
const num = (q: Q, k: string): number => {
  const v = q[k]
  if (typeof v !== 'number') throw new Error(`query.${k} missing`)
  return v
}

/** Number of decimals of a terminating fraction (or null if not terminating within 4). */
function decimalsNeeded(f: Frac): number | null {
  for (let d = 0; d <= 4; d++) if (Number.isInteger((f.n * 10 ** d) / f.d)) return d
  return null
}

function exactMatch(item: PublicItem, value: Frac | number, decimals?: number): Validation {
  const v = typeof value === 'number' ? value : value.valueOf()
  const dp = decimals ?? (typeof value === 'number' ? 4 : (decimalsNeeded(value) ?? 4))
  const r = matchNumericOption(texts(item), item.lang, v, dp)
  return r.ok ? mcq(r.index) : fail(r.reason)
}

/** Decimals as displayed by the options themselves (all options share a format). */
function displayedDecimals(item: PublicItem): number {
  const t = texts(item)[0].replace(/[^\d.,]/g, '')
  const sep = item.lang === 'de' ? ',' : '.'
  const i = t.lastIndexOf(sep)
  return i < 0 ? 0 : t.length - i - 1
}

export function validateSpeed(item: PublicItem): Validation {
  const q = item.query as Q | undefined
  if (!q) return fail('missing query')
  switch (q.family) {
    case 'arith': {
      const exact = evalExact(q.terms as number[], q.ops as string[])
      return exactMatch(item, exact, Math.max(decimalsNeeded(exact) ?? 4, displayedDecimals(item)))
    }
    case 'percent': {
      const k = q.kind
      let v: Frac
      if (k === 'of') v = F(num(q, 'p')).mul(F(num(q, 'base'))).div(F(100))
      else if (k === 'whatPct') v = F(num(q, 'a')).div(F(num(q, 'b'))).mul(F(100))
      else if (k === 'change') v = F(Math.abs(num(q, 'to') - num(q, 'from'))).div(F(num(q, 'from'))).mul(F(100))
      else if (k === 'reverse') v = F(num(q, 'now')).div(F(1).add(F(num(q, 'p')).div(F(100))))
      else if (k === 'ofOf') v = F(num(q, 'base')).mul(F(num(q, 'p1'))).mul(F(num(q, 'p2'))).div(F(10000))
      else if (k === 'successive') {
        const f = F(1).add(F(num(q, 'first')).div(F(100))).mul(F(1).add(F(num(q, 'second')).div(F(100))))
        v = f.sub(F(1)).mul(F(100))
      } else return fail(`unknown percent kind ${String(k)}`)
      return exactMatch(item, v, displayedDecimals(item))
    }
    case 'fraction': {
      if (q.kind === 'toPct') {
        const v = F(num(q, 'num')).div(F(num(q, 'den'))).mul(F(100))
        return exactMatch(item, v.valueOf(), num(q, 'decimals'))
      }
      if (q.kind === 'ofNumber') return exactMatch(item, F(num(q, 'n')).mul(F(num(q, 'num'))).div(F(num(q, 'den'))), 0)
      if (q.kind === 'largest' || q.kind === 'smallest') {
        const vals = texts(item).map((t) => {
          const m = /^(\d+)\/(\d+)$/.exec(t.trim())
          return m ? Number(m[1]) / Number(m[2]) : NaN
        })
        if (vals.some(Number.isNaN)) return fail('unparsable fraction option')
        const target = q.kind === 'largest' ? Math.max(...vals) : Math.min(...vals)
        const hits = vals.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0)
        return hits.length === 1 ? mcq(hits[0]) : fail('tie between fractions')
      }
      return fail('unknown fraction kind')
    }
    case 'estimate': {
      const exact = evalExact(q.terms as number[], q.ops as string[]).valueOf()
      const vals = texts(item).map((t) => parseDisplayedNumber(t, item.lang))
      if (vals.some((v) => v === null || v <= 0)) return fail('bad estimate option')
      const dist = vals.map((v) => Math.abs(Math.log((v as number) / exact)))
      const best = dist.indexOf(Math.min(...dist))
      if (dist[best] > Math.log(1.12)) return fail(`closest option too far from ${exact}`)
      if (dist.some((x, i) => i !== best && x < Math.log(1.45))) return fail('two options close to the exact value')
      return mcq(best)
    }
    case 'rule3': {
      let v: Frac
      if (q.kind === 'direct') v = F(num(q, 'c1')).div(F(num(q, 'q1'))).mul(F(num(q, 'q2')))
      else if (q.kind === 'inverse') v = F(num(q, 'a1')).mul(F(num(q, 'b1'))).div(F(num(q, 'a2')))
      else if (q.kind === 'compound')
        v = F(num(q, 'u1')).div(F(num(q, 'm1') * num(q, 'h1'))).mul(F(num(q, 'm2') * num(q, 'h2')))
      else return fail('unknown rule3 kind')
      return exactMatch(item, v)
    }
    case 'linear': {
      const a = q.a as number
      const b = q.b as number
      const c = q.c as number
      let x: Frac
      if (q.form === 'axb') x = F(c).sub(F(b)).div(F(a))
      else if (q.form === 'bracket') x = F(c).div(F(a)).add(F(b))
      else if (q.form === 'frac') x = F(c).sub(F(b)).mul(F(a))
      else if (q.form === 'both') x = F(num(q, 'd')).sub(F(b)).div(F(a).sub(F(c)))
      else if (q.form === 'system') {
        const [[a1, b1, c1], [a2, b2, c2]] = q.eqs as number[][]
        const det = a1 * b2 - a2 * b1
        if (det === 0) return fail('singular system')
        x = q.ask === 'x' ? new Frac(c1 * b2 - c2 * b1, det) : new Frac(a1 * c2 - a2 * c1, det)
      } else return fail('unknown linear form')
      return exactMatch(item, x)
    }
    case 'word': {
      const k = q.kind
      let v: Frac
      if (k === 'discount') v = F(num(q, 'price')).mul(F(100 - num(q, 'p'))).div(F(100))
      else if (k === 'vatAdd') v = F(num(q, 'net')).mul(F(100 + num(q, 'r'))).div(F(100))
      else if (k === 'avgSpeed') v = F(num(q, 'dist')).mul(F(60)).div(F(num(q, 'minutes')))
      else if (k === 'margin') v = F(num(q, 'profit')).mul(F(100)).div(F(num(q, 'revenue')))
      else if (k === 'split') v = F(num(q, 'total')).mul(F(num(q, 'b'))).div(F(num(q, 'a') + num(q, 'b')))
      else if (k === 'vatReverse') v = F(num(q, 'gross')).mul(F(100)).div(F(100 + num(q, 'r')))
      else if (k === 'compound') {
        const g = F(100 + num(q, 'r')).div(F(100))
        v = F(num(q, 'pr'))
        for (let i = 0; i < num(q, 'years'); i++) v = v.mul(g)
      } else if (k === 'breakEven') v = F(num(q, 'fixed')).div(F(num(q, 'price') - num(q, 'variable')))
      else if (k === 'weightedAvg')
        v = F(num(q, 'n1') * num(q, 'a1') + num(q, 'n2') * num(q, 'a2')).div(F(num(q, 'n1') + num(q, 'n2')))
      else if (k === 'successiveDiscount')
        v = F(num(q, 'price')).mul(F(100 - num(q, 'p1'))).mul(F(100 - num(q, 'p2'))).div(F(10000))
      else return fail(`unknown word kind ${String(k)}`)
      return exactMatch(item, v)
    }
    case 'sequence': {
      const sol = solveSequence(q.terms as number[])
      if (sol.predictions.length !== 1) return fail(`sequence ambiguous or unsolved: ${sol.predictions.join(', ')}`)
      return exactMatch(item, sol.predictions[0], 0)
    }
    default:
      return fail(`unknown family ${String(q.family)}`)
  }
}
