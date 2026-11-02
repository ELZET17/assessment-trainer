/** Number series ("What comes next?"). */
import { fmt } from '../../format'
import { tr, type GeneratorDef } from '../../generator'
import type { Distractor } from '../../options'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import { solveSequence } from '../../validators/speed/sequence'
import { numericMcq } from './common'

interface Built {
  terms: number[]
  next: number
  /** German description of the rule, with numbers. */
  rule: string[]
  wrong: Distractor[]
}

const sgn = (x: number) => (x >= 0 ? `+${x}` : `−${Math.abs(x)}`)

function build(rng: Rng, d: 1 | 2 | 3): Built | null {
  const n = d === 1 ? 5 : 6
  const fam =
    d === 1
      ? rng.pick(['arith', 'arith', 'geom'])
      : d === 2
        ? rng.pick(['second', 'altAdd', 'addMul', 'inter'])
        : rng.pick(['fib', 'mulAdd', 'cube', 'diffDouble', 'interMix', 'ratioUp'])
  const t: number[] = []
  let rule: string[]
  switch (fam) {
    case 'arith': {
      const a = rng.int(2, 60)
      const s = rng.pick([-1, 1]) * rng.int(3, 15)
      for (let i = 0; i <= n; i++) t.push(a + i * s)
      rule = [`Konstante Differenz: jeweils ${sgn(s)}.`]
      break
    }
    case 'geom': {
      const r = rng.pick([2, 3])
      const a = rng.int(1, r === 2 ? 9 : 5)
      for (let i = 0; i <= n; i++) t.push(a * r ** i)
      rule = [`Jede Zahl wird mit ${r} multipliziert.`]
      break
    }
    case 'second': {
      const a = rng.int(1, 20)
      const d0 = rng.int(1, 8)
      const dd = rng.pick([-1, 1, 2, 3, 4, 5])
      let cur = a
      let step = d0
      for (let i = 0; i <= n; i++) {
        t.push(cur)
        cur += step
        step += dd
      }
      rule = [`Differenzen: ${t.slice(1, n).map((x, i) => sgn(x - t[i])).join(', ')}`, `Die Differenz ändert sich jedes Mal um ${sgn(dd)}.`]
      break
    }
    case 'altAdd': {
      const a = rng.int(5, 40)
      const p = rng.int(3, 12)
      const q = -rng.int(1, p - 1)
      for (let i = 0; i <= n; i++) t.push(i === 0 ? a : t[i - 1] + (i % 2 === 1 ? p : q))
      rule = [`Abwechselnd ${sgn(p)} und ${sgn(q)}.`]
      break
    }
    case 'addMul': {
      const a = rng.int(1, 6)
      const p = rng.int(1, 5)
      const m = 2
      for (let i = 0; i <= n; i++) t.push(i === 0 ? a : i % 2 === 1 ? t[i - 1] + p : t[i - 1] * m)
      rule = [`Abwechselnd ${sgn(p)} und × ${m}.`]
      break
    }
    case 'inter': {
      const a = rng.int(1, 20)
      const s1 = rng.int(2, 9)
      const b = rng.int(30, 90)
      const s2 = -rng.int(2, 9)
      for (let i = 0; i <= n; i++) t.push(i % 2 === 0 ? a + (i / 2) * s1 : b + ((i - 1) / 2) * s2)
      rule = [`Zwei verschränkte Reihen: Positionen 1, 3, 5, … laufen ${sgn(s1)}, Positionen 2, 4, 6, … laufen ${sgn(s2)}.`]
      break
    }
    case 'fib': {
      const a = rng.int(1, 9)
      const b = rng.int(1, 9)
      t.push(a, b)
      for (let i = 2; i <= n; i++) t.push(t[i - 1] + t[i - 2])
      rule = ['Jede Zahl ist die Summe der beiden vorherigen.']
      break
    }
    case 'mulAdd': {
      const k = rng.pick([2, 3])
      const c = rng.pick([-3, -2, -1, 1, 2, 3, 4, 5])
      const a = rng.int(1, 6)
      for (let i = 0; i <= n; i++) t.push(i === 0 ? a : t[i - 1] * k + c)
      rule = [`Jede Zahl: vorherige × ${k} ${c > 0 ? '+' : '−'} ${Math.abs(c)}.`]
      break
    }
    case 'cube': {
      const s = rng.int(1, 4)
      const c = rng.pick([-2, -1, 1, 2, 3])
      for (let i = 0; i <= n; i++) t.push((i + s) ** 3 + c)
      rule = [`Kubikzahlen ${c > 0 ? 'plus' : 'minus'} ${Math.abs(c)}: ${s}³ ${c > 0 ? '+' : '−'} ${Math.abs(c)}, ${s + 1}³ ${c > 0 ? '+' : '−'} ${Math.abs(c)}, …`]
      break
    }
    case 'diffDouble': {
      const a = rng.int(1, 20)
      const d0 = rng.int(1, 4)
      const r = rng.pick([2, 3])
      let cur = a
      let step = d0
      for (let i = 0; i <= n; i++) {
        t.push(cur)
        cur += step
        step *= r
      }
      rule = [`Differenzen: ${t.slice(1, n).map((x, i) => sgn(x - t[i])).join(', ')}`, `Die Differenz wird jedes Mal mit ${r} multipliziert.`]
      break
    }
    case 'interMix': {
      const len = 7
      const a = rng.int(1, 4)
      const b = rng.int(20, 60)
      const s = -rng.int(2, 7)
      for (let i = 0; i <= len; i++) t.push(i % 2 === 0 ? a * 2 ** (i / 2) : b + ((i - 1) / 2) * s)
      rule = [`Zwei verschränkte Reihen: Positionen 1, 3, 5, … verdoppeln sich, Positionen 2, 4, 6, … laufen ${sgn(s)}.`]
      const next = t.pop() as number
      return finish(t, next, rule)
    }
    default: {
      // ratioUp: ×2, ×3, ×4, …
      const a = rng.int(1, 3)
      const k0 = rng.pick([1, 2])
      for (let i = 0; i <= n; i++) t.push(i === 0 ? a : t[i - 1] * (k0 + i - 1 + 1))
      rule = [`Multiplikatoren steigen: × ${k0 + 1}, × ${k0 + 2}, × ${k0 + 3}, …`]
    }
  }
  const next = t.pop() as number
  return finish(t, next, rule)
}

function finish(terms: number[], next: number, rule: string[]): Built | null {
  if (Math.max(...terms.map(Math.abs), Math.abs(next)) > 20000) return null
  const last = terms[terms.length - 1]
  const prev = terms[terms.length - 2]
  const wrong: Distractor[] = [
    { value: last + (last - prev), tag: 'naive-diff', why: 'Letzte Differenz einfach wiederholt – die Regel ist komplexer.' },
    { value: next + (next - last), tag: 'skip', why: 'Nach dem richtigen Glied die letzte Differenz noch einmal addiert – ein Schritt zu weit.' },
    { value: next + 1, tag: 'slip', why: 'Um eins verrechnet.' },
    { value: next - 1, tag: 'slip', why: 'Um eins verrechnet.' },
    { value: next + 2, tag: 'slip', why: 'Rechenfehler.' },
    { value: next - 2, tag: 'slip', why: 'Rechenfehler.' },
  ]
  if (prev !== 0 && Number.isInteger(last / prev)) wrong.unshift({ value: (last * last) / prev, tag: 'naive-ratio', why: 'Letztes Verhältnis wiederholt.' })
  return { terms, next, rule, wrong }
}

export const sequence: GeneratorDef = {
  id: 'speed.sequence',
  version: 1,
  category: 'speed',
  title: 'Zahlenreihen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const b = build(rng, d)
      if (!b) return null
      // Ambiguity filter (docs/decisions.md D11): exactly one simple rule-prediction.
      if (solveSequence(b.terms).predictions.length !== 1) return null
      const list = b.terms.map((x) => fmt(x, lang, 0)).join(', ')
      return numericMcq(this, seed, d, lang, rng, {
        prompt: tr(lang, `What number comes next? ${list}, ?`, `Welche Zahl kommt als Nächstes? ${list}, ?`),
        query: { family: 'sequence', terms: b.terms },
        value: b.next,
        decimals: 0,
        exact: true,
        allowNegative: b.next < 6 || b.terms.some((x) => x < 0),
        distractors: b.wrong.filter((w) => Number.isInteger(w.value)),
        steps: [...b.rule, `Nächste Zahl: ${fmt(b.next, lang, 0)}`],
        shortcut: 'Prüfreihenfolge: 1. Differenzen, 2. Verhältnisse, 3. Differenzen der Differenzen, 4. abwechselnde Muster (jede zweite Zahl), 5. Summe der Vorgänger.',
      })
    })
  },
}
