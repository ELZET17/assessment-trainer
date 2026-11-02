/**
 * Pure mental arithmetic (Kopfrechnen): add/sub, multiplication, division,
 * squares. Calculator is never allowed in this category.
 */
import { fmt, roundTo } from '../../format'
import { tr, type GeneratorDef } from '../../generator'
import type { Distractor } from '../../options'
import { firstAccepted } from '../../pipeline'
import type { Difficulty, Lang } from '../../types'
import { decimalsOf, numericMcq, swapLastDigits } from './common'

type Op = '+' | '-' | '*' | '/'
const SYM: Record<Op, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

function exprText(terms: number[], ops: Op[], lang: Lang, dp: number[]): string {
  let s = fmt(terms[0], lang, dp[0])
  ops.forEach((op, i) => (s += ` ${SYM[op]} ${fmt(terms[i + 1], lang, dp[i + 1])}`))
  return s
}

const calcPrompt = (lang: Lang, expr: string) => tr(lang, `Calculate: ${expr}`, `Berechne: ${expr}`)

// ------------------------------------------------------------------ add/sub

export const addSub: GeneratorDef = {
  id: 'speed.addsub',
  version: 1,
  category: 'speed',
  title: 'Addition & Subtraktion',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      let terms: number[]
      let ops: Op[]
      let dp = 0
      if (d === 1) {
        const a = rng.int(120, 899)
        const b = rng.int(110, 799)
        const op: Op = rng.chance(0.5) ? '+' : '-'
        if (op === '-' && a - b < 50) return null
        if (op === '+' && (a % 10) + (b % 10) < 10) return null
        if (op === '-' && a % 10 >= b % 10) return null
        terms = [a, b]
        ops = [op]
      } else if (d === 2) {
        const a = rng.int(1200, 9800)
        const b = rng.int(1100, 8900)
        const op: Op = rng.chance(0.5) ? '+' : '-'
        if (op === '-' && a - b < 300) return null
        if (op === '+' && a + b > 15000) return null
        const carries =
          op === '+'
            ? Number((a % 10) + (b % 10) >= 10) + Number(Math.floor(a / 10) % 10 + (Math.floor(b / 10) % 10) >= 10)
            : Number(a % 10 < b % 10) + Number(Math.floor(a / 10) % 10 < Math.floor(b / 10) % 10)
        if (carries < 2) return null
        terms = [a, b]
        ops = [op]
      } else {
        dp = 1
        const a = rng.int(2000, 9999) / 10
        const b = rng.int(150, 999) / 10
        const c = rng.int(150, 999) / 10
        ops = [rng.chance(0.5) ? '+' : '-', rng.chance(0.5) ? '+' : '-']
        terms = [a, b, c]
        if ([a, b, c].some((x) => Number.isInteger(x))) return null
      }
      const value = roundTo(
        terms.slice(1).reduce((acc, t, i) => (ops[i] === '+' ? acc + t : acc - t), terms[0]),
        dp,
      )
      if (value <= 0) return null
      const unit = 10 ** -dp
      const firstOp = ops[0]
      const distractors: Distractor[] = []
      if (terms.length === 2) {
        // Only carries/borrows that really occur in this sum (Gate 4: no invented carry errors).
        const [A, B] = terms.map((t) => Math.round(t * 10 ** dp))
        const placeName = (k: number) => ['Hundertstel', 'Zehntel', 'Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender'][k - dp + 2]
        let carry = 0
        for (let k = 0; k < 6; k++) {
          const da = Math.floor(A / 10 ** k) % 10
          const db = Math.floor(B / 10 ** k) % 10
          if (firstOp === '+') {
            carry = da + db + carry >= 10 ? 1 : 0
            if (carry) distractors.push({ value: value - 10 ** (k + 1) * unit, tag: 'carry', why: `Übertrag in die ${placeName(k + 1)}stelle vergessen.` })
          } else {
            carry = da - db - carry < 0 ? 1 : 0
            if (carry) distractors.push({ value: value + 10 ** (k + 1) * unit, tag: 'borrow', why: `Beim Abziehen das Borgen aus der ${placeName(k + 1)}stelle vergessen.` })
          }
        }
      }
      if (terms.length === 2) {
        const other = firstOp === '+' ? terms[0] - terms[1] : terms[0] + terms[1]
        distractors.push({ value: other, tag: 'wrong-op', why: 'Falsche Rechenart (Plus und Minus vertauscht).' })
      } else {
        const flipped = terms[0] + (ops[0] === '+' ? -terms[1] : terms[1]) + (ops[1] === '+' ? terms[2] : -terms[2])
        distractors.push({ value: flipped, tag: 'wrong-op', why: 'Vorzeichen des zweiten Terms vertauscht.' })
        distractors.push({ value: value + (ops[1] === '+' ? -1 : 1) * terms[2] * 9, tag: 'decimal', why: 'Komma beim letzten Term falsch ausgerichtet (Faktor 10).' })
      }
      const swapped = dp === 0 ? swapLastDigits(value) : null
      if (swapped !== null) distractors.push({ value: swapped, tag: 'transpose', why: 'Zahlendreher in den letzten beiden Ziffern.' })
      distractors.push({ value: value + 1000 * unit, tag: 'slip', why: 'Rechenfehler.' })

      const dps = terms.map(() => dp)
      const expr = exprText(terms, ops, lang, dps)
      const steps: string[] = []
      let acc = terms[0]
      terms.slice(1).forEach((t, i) => {
        const next = roundTo(ops[i] === '+' ? acc + t : acc - t, dp)
        steps.push(`${fmt(acc, lang, dp)} ${SYM[ops[i]]} ${fmt(t, lang, dp)} = ${fmt(next, lang, dp)}`)
        acc = next
      })
      // Shortcut with the actual numbers: round the second term to a round number and correct.
      const b = terms[1]
      const step = dp === 0 ? 100 : 10
      const bRound = Math.ceil(b / step) * step
      const corr = roundTo(bRound - b, dp)
      const shortcut =
        ops[0] === '+'
          ? `Runde den zweiten Summanden auf: ${fmt(terms[0], lang, dp)} + ${fmt(bRound, lang, dp)} = ${fmt(terms[0] + bRound, lang, dp)}, dann ${fmt(corr, lang, dp)} wieder abziehen. Glatte Zahlen rechnen sich im Kopf schneller.`
          : `Ziehe eine glatte Zahl ab und korrigiere: ${fmt(terms[0], lang, dp)} − ${fmt(bRound, lang, dp)} = ${fmt(roundTo(terms[0] - bRound, dp), lang, dp)}, dann ${fmt(corr, lang, dp)} wieder dazuzählen. Kontrolle über die letzte Ziffer.`
      return numericMcq(this, seed, d, lang, rng, {
        prompt: calcPrompt(lang, expr),
        query: { family: 'arith', terms, ops },
        value,
        decimals: dp,
        distractors,
        steps,
        shortcut,
        exact: true,
      })
    })
  },
}

// ----------------------------------------------------------- multiplication

export const multiply: GeneratorDef = {
  id: 'speed.mul',
  version: 1,
  category: 'speed',
  title: 'Multiplikation',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      let a: number
      let b: number
      if (d === 1) {
        a = rng.int(13, 98)
        b = rng.int(3, 9)
      } else if (d === 2) {
        a = rng.int(13, 98)
        b = rng.int(13, 98)
        if (b % 10 === 0 || b === 11 || b < 13) return null
      } else if (rng.chance(0.5)) {
        a = rng.int(102, 499)
        b = rng.int(12, 39)
        if (b % 10 === 0 || a % 10 === 0) return null
      } else {
        a = rng.int(12, 98) / 10
        b = rng.int(12, 95) / 10
        if (Number.isInteger(a) || Number.isInteger(b)) return null
      }
      if (a % 10 === 0) return null
      const dpA = decimalsOf(a)
      const dpB = decimalsOf(b)
      const dp = dpA + dpB
      const value = roundTo(a * b, dp)
      const unit = 10 ** -dp
      // Decompose b into tens and units (on the integer level).
      const bInt = Math.round(b * 10 ** dpB)
      const aInt = Math.round(a * 10 ** dpA)
      const tens = Math.floor(bInt / 10) * 10
      const ones = bInt % 10
      const scale = 10 ** -dp
      const distractors: Distractor[] = [
        ...(tens > 0 && ones > 0 ? [{ value: (aInt * tens + ones) * scale, tag: 'partial', why: 'Nur den Zehneranteil multipliziert und die Einer bloß addiert.' }] : []),
        { value: aInt * (bInt + 1) * scale, tag: 'row', why: 'Eine Zeile zu viel gerechnet (Faktor um 1 zu groß).' },
        { value: aInt * (bInt - 1) * scale, tag: 'row', why: 'Eine Zeile zu wenig gerechnet (Faktor um 1 zu klein).' },
        { value: value + 10 * unit, tag: 'slip', why: 'Fehler beim Addieren der Teilprodukte.' },
        { value: value - 10 * unit, tag: 'slip', why: 'Fehler beim Addieren der Teilprodukte.' },
        { value: value * 10, tag: 'place', why: 'Stellenwert/Komma um eine Stelle verschoben.' },
        { value: value / 10, tag: 'place', why: 'Stellenwert/Komma um eine Stelle verschoben.' },
        { value: value + 100 * unit, tag: 'slip', why: 'Rechenfehler.' },
      ]
      const f = (x: number, k = dp) => fmt(x, lang, k)
      const expr = `${f(a, dpA)} × ${f(b, dpB)}`
      const steps: string[] = []
      if (dp > 0) steps.push(`Ohne Komma rechnen: ${aInt} × ${bInt}, am Ende ${dp} Nachkommastellen setzen.`)
      if (ones === 0 || tens === 0) {
        steps.push(`${aInt} × ${bInt} = ${f(aInt * bInt, 0)}`)
      } else {
        steps.push(`Zerlegen: ${aInt} × ${bInt} = ${aInt} × ${tens} + ${aInt} × ${ones}`)
        steps.push(`${aInt} × ${tens} = ${f(aInt * tens, 0)}; ${aInt} × ${ones} = ${f(aInt * ones, 0)}`)
        steps.push(`${f(aInt * tens, 0)} + ${f(aInt * ones, 0)} = ${f(aInt * bInt, 0)}`)
      }
      if (dp > 0) steps.push(`${dp} Nachkommastellen: ${f(value)}`)
      const aR = Math.round(aInt / 10) * 10
      const diff = aInt - aR
      const shortcut =
        diff !== 0
          ? `Runden und korrigieren: ${aR} × ${bInt} = ${f(aR * bInt, 0)}, dann ${diff > 0 ? '+' : '−'} ${Math.abs(diff)} × ${bInt} = ${f(Math.abs(diff) * bInt, 0)} → ${f(aInt * bInt, 0)}. Endziffern-Check: ${aInt % 10} × ${bInt % 10} endet auf ${(aInt * bInt) % 10}.`
          : `Endziffern-Check: ${aInt % 10} × ${bInt % 10} endet auf ${(aInt * bInt) % 10} – das schließt viele Optionen sofort aus.`
      return numericMcq(this, seed, d as Difficulty, lang, rng, {
        prompt: calcPrompt(lang, expr),
        query: { family: 'arith', terms: [a, b], ops: ['*'] },
        value,
        decimals: dp,
        distractors,
        steps,
        shortcut,
        exact: true,
      })
    })
  },
}

// ------------------------------------------------------------------ division

function smallestFactor(n: number): number | null {
  for (let p = 2; p * p <= n; p++) if (n % p === 0 && n / p > 1) return p
  return null
}

export const divide: GeneratorDef = {
  id: 'speed.div',
  version: 1,
  category: 'speed',
  title: 'Division',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      let dividend: number
      let divisor: number
      let q: number
      if (d === 1) {
        q = rng.int(12, 98)
        divisor = rng.int(3, 9)
        dividend = q * divisor
      } else if (d === 2) {
        q = rng.int(12, 98)
        divisor = rng.int(12, 48)
        if (divisor % 10 === 0) return null
        dividend = q * divisor
      } else if (rng.chance(0.5)) {
        divisor = rng.pick([0.2, 0.25, 0.4, 0.5, 0.75, 1.5, 2.5])
        q = rng.int(12, 480)
        dividend = roundTo(q * divisor, 2)
        if (Number.isInteger(dividend) === false && decimalsOf(dividend) > 1) return null
      } else {
        divisor = rng.pick([8, 16, 40, 125])
        dividend = rng.int(30, 999)
        q = dividend / divisor
        if (Number.isInteger(q) || decimalsOf(q) > 3) return null
      }
      const dp = decimalsOf(q)
      const unit = 10 ** -dp
      const f = (x: number, k = dp) => fmt(x, lang, k)
      const dpDividend = decimalsOf(dividend)
      const dpDivisor = decimalsOf(divisor)
      const distractors: Distractor[] = [
        { value: q + unit, tag: 'slip', why: 'Letzte Stelle falsch.' },
        { value: q - unit, tag: 'slip', why: 'Letzte Stelle falsch.' },
        { value: q * 10, tag: 'place', why: 'Stellenwert verschoben (Faktor 10).' },
        { value: q / 10, tag: 'place', why: 'Stellenwert verschoben (Faktor 10).' },
        { value: q + 10 * unit, tag: 'slip', why: 'Beim schriftlichen Teilen eine Stelle falsch.' },
        { value: q - 10 * unit, tag: 'slip', why: 'Beim schriftlichen Teilen eine Stelle falsch.' },
      ]
      if (divisor < 1) distractors.unshift({ value: dividend * divisor, tag: 'wrong-op', why: 'Multipliziert statt dividiert (durch eine Zahl < 1 zu teilen macht das Ergebnis größer).' })
      const expr = `${f(dividend, dpDividend)} ÷ ${f(divisor, dpDivisor)}`
      const steps: string[] = []
      let shortcut: string
      if (divisor < 1 || !Number.isInteger(divisor)) {
        const k = 10 ** dpDivisor
        steps.push(`Beide Zahlen mit ${k} multiplizieren, damit der Divisor ganz wird: ${f(dividend * k, decimalsOf(dividend * k))} ÷ ${f(divisor * k, 0)}`)
        steps.push(`${f(dividend * k, decimalsOf(dividend * k))} ÷ ${f(divisor * k, 0)} = ${f(q)}`)
        const recip: Record<string, string> = { '0.2': '5', '0.25': '4', '0.4': '5/2', '0.5': '2', '0.75': '4/3', '1.5': '2/3', '2.5': '2/5' }
        shortcut = `Durch eine Dezimalzahl teilen heißt mit dem Kehrwert malnehmen: ÷ ${f(divisor, dpDivisor)} ist dasselbe wie × ${recip[String(divisor)] ?? `1/${f(divisor, dpDivisor)}`}. ${divisor < 1 ? 'Der Divisor ist kleiner als 1 – das Ergebnis muss also größer werden als der Dividend.' : 'Plausibilitätscheck: Der Divisor liegt über 1, das Ergebnis also unter dem Dividenden.'}`
      } else if (!Number.isInteger(q)) {
        const whole = Math.floor(q)
        const rest = dividend - whole * divisor
        steps.push(`${f(dividend, 0)} ÷ ${divisor} = ${whole} Rest ${rest}`)
        steps.push(`Rest ${rest} ÷ ${divisor} = ${fmt(rest / divisor, lang, decimalsOf(rest / divisor))}`)
        steps.push(`Zusammen: ${f(q)}`)
        shortcut = `Merke dir die Achtel/Sechzehntel: 1/8 = 0,125, 1/16 = 0,0625, 1/40 = 0,025, 1/125 = 0,008 – damit ist jeder Rest sofort eine Dezimalzahl.`
      } else {
        const p = smallestFactor(divisor)
        if (p !== null) {
          const mid = dividend / p
          steps.push(`Divisor zerlegen: ${divisor} = ${p} × ${divisor / p}`)
          steps.push(`${f(dividend, 0)} ÷ ${p} = ${f(mid, decimalsOf(mid))}`)
          steps.push(`${f(mid, decimalsOf(mid))} ÷ ${divisor / p} = ${f(q)}`)
        } else {
          const guess = Math.round(q / 10) * 10
          const k = q - guess
          steps.push(`Schätzen: ${divisor} × ${guess} = ${f(divisor * guess, 0)}`)
          if (k === 0) steps.push(`Passt genau: ${f(q)}`)
          else {
            steps.push(
              k > 0
                ? `Es fehlen ${f(dividend - divisor * guess, 0)} = ${k} × ${divisor}`
                : `Das ist um ${f(divisor * guess - dividend, 0)} = ${-k} × ${divisor} zu viel`,
            )
            steps.push(`Also ${guess} ${k > 0 ? '+' : '−'} ${Math.abs(k)} = ${f(q)}`)
          }
        }
        shortcut = `Probe rückwärts mit der Endziffer: ${q % 10} × ${divisor % 10} endet auf ${(q * divisor) % 10} – passt zu ${f(dividend, 0)}.`
      }
      return numericMcq(this, seed, d, lang, rng, {
        prompt: calcPrompt(lang, expr),
        query: { family: 'arith', terms: [dividend, divisor], ops: ['/'] },
        value: q,
        decimals: dp,
        distractors,
        steps,
        shortcut,
        exact: true,
      })
    })
  },
}

// ------------------------------------------------------------------ squares

export const squares: GeneratorDef = {
  id: 'speed.squares',
  version: 1,
  category: 'speed',
  title: 'Quadrate & Produkte nahe 100',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const f = (x: number) => fmt(x, lang, 0)
      if (d === 3 && rng.chance(0.5)) {
        const a = rng.int(2, 12)
        const b = rng.int(2, 12)
        if (a === b) return null
        const x = 100 - a
        const y = 100 - b
        const value = x * y
        return numericMcq(this, seed, d, lang, rng, {
          prompt: calcPrompt(lang, `${x} × ${y}`),
          query: { family: 'arith', terms: [x, y], ops: ['*'] },
          value,
          decimals: 0,
          distractors: [
            { value: 100 * (100 - a - b), tag: 'partial', why: 'Das Produkt der Abstände (a × b) vergessen.' },
            { value: 100 * (100 - a - b) - a * b, tag: 'sign', why: 'Das Produkt der Abstände abgezogen statt addiert.' },
            { value: value + 100, tag: 'carry', why: 'Fehler in der Hunderterstelle.' },
            { value: value - 10, tag: 'carry', why: 'Übertrag vergessen.' },
            { value: x * (y + 1), tag: 'row', why: 'Mit dem falschen Faktor gerechnet.' },
          ],
          steps: [
            `Abstände zu 100: ${x} = 100 − ${a}, ${y} = 100 − ${b}`,
            `Vordere Stellen: 100 − ${a} − ${b} = ${100 - a - b} → ${f(100 * (100 - a - b))}`,
            `Hintere Stellen: ${a} × ${b} = ${a * b}`,
            `${f(100 * (100 - a - b))} + ${a * b} = ${f(value)}`,
          ],
          shortcut: `Nahe-100-Trick: (100 − a)(100 − b) = 100 × (100 − a − b) + a × b. Spart das komplette schriftliche Multiplizieren.`,
          exact: true,
        })
      }
      const n = d === 1 ? rng.int(11, 25) : d === 2 ? rng.int(26, 75) : rng.int(76, 125)
      if (n % 10 === 0 || n === 100) return null
      const value = n * n
      const t = Math.floor(n / 10) * 10
      const u = n - t
      const steps: string[] = []
      let shortcut: string
      if (Math.abs(n - 50) <= 9 && d >= 2) {
        const k = n - 50
        steps.push(`${n} = 50 ${k >= 0 ? '+' : '−'} ${Math.abs(k)}`)
        steps.push(`(50 ${k >= 0 ? '+' : '−'} ${Math.abs(k)})² = 2.500 ${k >= 0 ? '+' : '−'} 100 × ${Math.abs(k)} + ${k * k}`.replace('2.500', f(2500)))
        steps.push(`= ${f(2500 + 100 * k + k * k)}`)
        shortcut = `Nahe 50: n² = 2.500 + 100 × (n − 50) + (n − 50)². Beispiel hier: ${f(2500)} ${k >= 0 ? '+' : '−'} ${f(Math.abs(100 * k))} + ${k * k}.`.replace('2.500', f(2500))
      } else if (Math.abs(n - 100) <= 12) {
        const k = n - 100
        steps.push(`${n} = 100 ${k >= 0 ? '+' : '−'} ${Math.abs(k)}`)
        steps.push(`(100 ${k >= 0 ? '+' : '−'} ${Math.abs(k)})² = ${f(10000)} ${k >= 0 ? '+' : '−'} ${f(Math.abs(200 * k))} + ${k * k} = ${f(value)}`)
        shortcut = `Nahe 100: n² = 10.000 + 200 × (n − 100) + (n − 100)².`.replace('10.000', f(10000))
      } else {
        steps.push(`Binomische Formel: (${t} + ${u})² = ${t}² + 2 × ${t} × ${u} + ${u}²`)
        steps.push(`= ${f(t * t)} + ${f(2 * t * u)} + ${u * u} = ${f(value)}`)
        shortcut = `(a + b)² = a² + 2ab + b². Die Quadrate bis 25 auswendig zu kennen spart hier Zeit. Endziffer von ${n}² = Endziffer von ${u}² = ${(u * u) % 10}.`
      }
      return numericMcq(this, seed, d, lang, rng, {
        prompt: calcPrompt(lang, `${n}²`),
        query: { family: 'arith', terms: [n, n], ops: ['*'] },
        value,
        decimals: 0,
        distractors: [
          { value: t * t + u * u, tag: 'binomial', why: 'Den Mittelterm 2ab der binomischen Formel vergessen.' },
          { value: (n - 1) * (n - 1), tag: 'neighbour', why: `Das ist ${n - 1}², also die Nachbarzahl.` },
          { value: (n + 1) * (n + 1), tag: 'neighbour', why: `Das ist ${n + 1}², also die Nachbarzahl.` },
          { value: value + 10, tag: 'slip', why: 'Rechenfehler.' },
          { value: value - 100, tag: 'slip', why: 'Rechenfehler.' },
          { value: 2 * n * 10, tag: 'concept', why: 'Verdoppelt statt quadriert.' },
        ],
        steps,
        shortcut,
        exact: true,
      })
    })
  },
}
