/**
 * Validator-side parsing of displayed option texts. Validators deliberately
 * read the text a candidate sees ("1,081", "12.5%", "9 million", "CHF 60")
 * instead of any hidden numeric field.
 */
import type { Lang } from '../types'

const SCALE_WORDS: [RegExp, number][] = [
  [/\b(billion|bn|mrd\.?|milliarden?)\b/i, 1e9],
  [/\b(million|millions|mio\.?|millionen?)\b/i, 1e6],
  [/\b(thousand|tsd\.?|tausend)\b/i, 1e3],
]

export function parseDisplayedNumber(text: string, lang: Lang): number | null {
  let s = text.trim().replace(/−/g, '-').replace(/\u00a0|\u202f/g, ' ')
  let scale = 1
  for (const [re, f] of SCALE_WORDS) {
    if (re.test(s)) {
      scale = f
      s = s.replace(re, ' ')
      break
    }
  }
  // Keep digits, separators and sign only.
  const m = /-?[\d.,]+/.exec(s.replace(/\s/g, ''))
  if (!m) return null
  let num = m[0]
  if (lang === 'de') num = num.replace(/\./g, '').replace(',', '.')
  else num = num.replace(/,/g, '')
  const v = Number(num)
  return Number.isFinite(v) ? v * scale : null
}

/** Exact rational arithmetic (validators only). */
export class Frac {
  readonly n: number
  readonly d: number
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('Frac: division by zero')
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      const f = Frac.fromDecimal(n / d)
      n = f.n
      d = f.d
    }
    const g = gcd(Math.abs(n), Math.abs(d)) || 1
    const sign = d < 0 ? -1 : 1
    this.n = (sign * n) / g
    this.d = (sign * d) / g
    if (!Number.isSafeInteger(this.n) || !Number.isSafeInteger(this.d)) throw new Error('Frac: overflow')
  }
  static fromDecimal(x: number): Frac {
    // Up to 6 decimals – all generated inputs have at most 4.
    for (let p = 0; p <= 6; p++) {
      const scaled = x * 10 ** p
      if (Math.abs(scaled - Math.round(scaled)) < 1e-7) return new Frac(Math.round(scaled), 10 ** p)
    }
    throw new Error(`Frac: not a short decimal: ${x}`)
  }
  add(o: Frac): Frac {
    return new Frac(this.n * o.d + o.n * this.d, this.d * o.d)
  }
  sub(o: Frac): Frac {
    return new Frac(this.n * o.d - o.n * this.d, this.d * o.d)
  }
  mul(o: Frac): Frac {
    return new Frac(this.n * o.n, this.d * o.d)
  }
  div(o: Frac): Frac {
    return new Frac(this.n * o.d, this.d * o.n)
  }
  valueOf(): number {
    return this.n / this.d
  }
  isInteger(): boolean {
    return this.d === 1
  }
  eq(o: Frac): boolean {
    return this.n === o.n && this.d === o.d
  }
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

export const F = (x: number) => Frac.fromDecimal(x)

/** Evaluate terms/ops with standard precedence (× ÷ before + −), exactly. */
export function evalExact(terms: number[], ops: string[]): Frac {
  const vals: Frac[] = [F(terms[0])]
  const addOps: string[] = []
  for (let i = 0; i < ops.length; i++) {
    const t = F(terms[i + 1])
    const op = ops[i]
    if (op === '*' || op === '/') {
      const last = vals.pop() as Frac
      vals.push(op === '*' ? last.mul(t) : last.div(t))
    } else {
      addOps.push(op)
      vals.push(t)
    }
  }
  let acc = vals[0]
  for (let i = 0; i < addOps.length; i++) acc = addOps[i] === '+' ? acc.add(vals[i + 1]) : acc.sub(vals[i + 1])
  return acc
}

export type MatchResult = { ok: true; index: number } | { ok: false; reason: string }

/**
 * Find the single option matching `exact` at `decimals` precision.
 * If the exact value needs rounding, all other options must be more than
 * 1.5 display units away (rule 3: rounding can never make two options right).
 */
export function matchNumericOption(texts: string[], lang: Lang, exact: number, decimals: number): MatchResult {
  const unit = 10 ** -decimals
  const values = texts.map((t) => parseDisplayedNumber(t, lang))
  if (values.some((v) => v === null)) return { ok: false, reason: `unparsable option in ${JSON.stringify(texts)}` }
  const scaled = Math.abs(exact) / unit
  const fracPart = scaled - Math.floor(scaled)
  if (Math.abs(fracPart - 0.5) < 1e-6) return { ok: false, reason: `exact value ${exact} lies on a rounding boundary` }
  const needsRounding = Math.abs(fracPart) > 1e-9 && Math.abs(fracPart - 1) > 1e-9
  const hits: number[] = []
  values.forEach((v, i) => {
    const diff = Math.abs((v as number) - exact)
    if (diff <= unit / 2 + 1e-9 * Math.max(1, Math.abs(exact))) hits.push(i)
    else if (needsRounding && diff <= 1.5 * unit) hits.push(-1 - i)
  })
  if (hits.some((h) => h < 0)) return { ok: false, reason: `an option is within rounding distance of ${exact}` }
  if (hits.length !== 1) return { ok: false, reason: `${hits.length} options match ${exact} (${texts.join(' | ')})` }
  // Distinct display values.
  if (new Set(values).size !== values.length) return { ok: false, reason: 'duplicate option values' }
  return { ok: true, index: hits[0] }
}
