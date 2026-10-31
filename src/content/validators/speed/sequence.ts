/**
 * Independent number-series solver. Tries a library of simple rules and
 * returns every next value that some rule supports. A series is only fair
 * if exactly one value comes out (quality rule 4).
 *
 * Each rule must be confirmed by at least two data points beyond what was
 * needed to fit it, otherwise any series would "fit".
 */

const EPS = 1e-9
const eq = (a: number, b: number) => Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b))
const diffs = (t: number[]) => t.slice(1).map((x, i) => x - t[i])
const allEq = (xs: number[]) => xs.every((x) => eq(x, xs[0]))

type Rule = { name: string; next: (t: number[]) => number | null }

function arithmetic(t: number[]): number | null {
  const d = diffs(t)
  return d.length >= 3 && allEq(d) ? t[t.length - 1] + d[0] : null
}

function geometric(t: number[]): number | null {
  if (t.length < 4 || t.some((x) => x === 0)) return null
  const r = t[1] / t[0]
  for (let i = 1; i < t.length; i++) if (!eq(t[i], t[i - 1] * r)) return null
  return t[t.length - 1] * r
}

function secondOrder(t: number[]): number | null {
  if (t.length < 5) return null
  const d = diffs(t)
  const dd = diffs(d)
  return allEq(dd) ? t[t.length - 1] + d[d.length - 1] + dd[0] : null
}

function diffsGeometric(t: number[]): number | null {
  if (t.length < 5) return null
  const d = diffs(t)
  const g = geometric(d)
  return g === null ? null : t[t.length - 1] + g
}

function ratiosArithmetic(t: number[]): number | null {
  if (t.length < 5 || t.some((x) => x === 0)) return null
  const r = t.slice(1).map((x, i) => x / t[i])
  const dr = diffs(r)
  if (!allEq(dr) || eq(dr[0], 0)) return null
  return t[t.length - 1] * (r[r.length - 1] + dr[0])
}

function alternatingDiffs(t: number[]): number | null {
  if (t.length < 5) return null
  const d = diffs(t)
  const even = d.filter((_, i) => i % 2 === 0)
  const odd = d.filter((_, i) => i % 2 === 1)
  if (!allEq(even) || !allEq(odd) || eq(even[0], odd[0])) return null
  return t[t.length - 1] + (d.length % 2 === 0 ? even[0] : odd[0])
}

function alternatingRatios(t: number[]): number | null {
  if (t.length < 5 || t.some((x) => x === 0)) return null
  const r = t.slice(1).map((x, i) => x / t[i])
  const even = r.filter((_, i) => i % 2 === 0)
  const odd = r.filter((_, i) => i % 2 === 1)
  if (!allEq(even) || !allEq(odd) || eq(even[0], odd[0])) return null
  return t[t.length - 1] * (r.length % 2 === 0 ? even[0] : odd[0])
}

/** Alternating "+a" and "×b" (either order). */
function alternatingAddMul(t: number[]): number | null {
  if (t.length < 5) return null
  for (const phase of [0, 1]) {
    // phase 0: step 0 is additive; phase 1: step 0 is multiplicative.
    let a: number | null = null
    let b: number | null = null
    let ok = true
    for (let i = 0; i < t.length - 1 && ok; i++) {
      const additive = (i + phase) % 2 === 0
      if (additive) {
        const v = t[i + 1] - t[i]
        if (a === null) a = v
        else if (!eq(a, v)) ok = false
      } else {
        if (t[i] === 0) {
          ok = false
          break
        }
        const v = t[i + 1] / t[i]
        if (b === null) b = v
        else if (!eq(b, v)) ok = false
      }
    }
    if (ok && a !== null && b !== null && !eq(b, 1) && !eq(a, 0)) {
      const additive = (t.length - 1 + phase) % 2 === 0
      return additive ? t[t.length - 1] + a : t[t.length - 1] * b
    }
  }
  return null
}

/** Odd and even positions each follow their own arithmetic or geometric rule. */
function interleaved(t: number[]): number | null {
  if (t.length < 6) return null
  const sub = t.filter((_, i) => i % 2 === t.length % 2)
  const other = t.filter((_, i) => i % 2 !== t.length % 2)
  const fit = (s: number[]): number | null => {
    if (s.length < 3) return null
    const d = diffs(s)
    if (allEq(d)) return s[s.length - 1] + d[0]
    if (s.every((x) => x !== 0)) {
      const r = s[1] / s[0]
      if (s.every((x, i) => i === 0 || eq(x, s[i - 1] * r))) return s[s.length - 1] * r
    }
    return null
  }
  const otherFits = (() => {
    if (other.length < 3) return false
    const d = diffs(other)
    if (allEq(d)) return true
    if (other.every((x) => x !== 0)) {
      const r = other[1] / other[0]
      return other.every((x, i) => i === 0 || eq(x, other[i - 1] * r))
    }
    return false
  })()
  if (!otherFits) return null
  return fit(sub)
}

function fibonacci(t: number[]): number | null {
  if (t.length < 5) return null
  for (let i = 2; i < t.length; i++) if (!eq(t[i], t[i - 1] + t[i - 2])) return null
  return t[t.length - 1] + t[t.length - 2]
}

/** t[i+1] = a·t[i] + b with integer a, b. */
function linearRecurrence(t: number[]): number | null {
  if (t.length < 5 || eq(t[1], t[0])) return null
  const a = (t[2] - t[1]) / (t[1] - t[0])
  const b = t[1] - a * t[0]
  if (!Number.isInteger(Math.round(a * 1e6) / 1e6) || Math.abs(a) > 6) return null
  for (let i = 1; i < t.length; i++) if (!eq(t[i], a * t[i - 1] + b)) return null
  return a * t[t.length - 1] + b
}

/** (i + s)^3 + c */
function cubes(t: number[]): number | null {
  if (t.length < 5) return null
  for (let s = -2; s <= 12; s++) {
    const c = t[0] - s ** 3
    if (t.every((x, i) => eq(x, (i + s) ** 3 + c))) return (t.length + s) ** 3 + c
  }
  return null
}

export const SEQUENCE_RULES: Rule[] = [
  { name: 'arithmetic', next: arithmetic },
  { name: 'geometric', next: geometric },
  { name: 'second-order', next: secondOrder },
  { name: 'diffs-geometric', next: diffsGeometric },
  { name: 'ratios-arithmetic', next: ratiosArithmetic },
  { name: 'alternating-diffs', next: alternatingDiffs },
  { name: 'alternating-ratios', next: alternatingRatios },
  { name: 'alternating-add-mul', next: alternatingAddMul },
  { name: 'interleaved', next: interleaved },
  { name: 'fibonacci', next: fibonacci },
  { name: 'linear-recurrence', next: linearRecurrence },
  { name: 'cubes', next: cubes },
]

export interface SequenceSolution {
  predictions: number[]
  rules: string[]
}

export function solveSequence(terms: number[]): SequenceSolution {
  const predictions: number[] = []
  const rules: string[] = []
  for (const r of SEQUENCE_RULES) {
    const v = r.next(terms)
    if (v === null || !Number.isFinite(v)) continue
    const rounded = Math.round(v * 1e6) / 1e6
    rules.push(r.name)
    if (!predictions.some((p) => eq(p, rounded))) predictions.push(rounded)
  }
  return { predictions, rules }
}
