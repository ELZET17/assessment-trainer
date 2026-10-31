/** Percentages and fractions without a calculator. */
import { fmt, onRoundingBoundary, pct, roundTo } from '../../format'
import { tr, type GeneratorDef } from '../../generator'
import { buildLabelOptions, type Distractor } from '../../options'
import { firstAccepted } from '../../pipeline'
import { core } from '../../generator'
import type { McqItem } from '../../types'
import { decimalsOf, numericMcq } from './common'

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

export const percent: GeneratorDef = {
  id: 'speed.percent',
  version: 1,
  category: 'speed',
  title: 'Prozentrechnung',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const kinds = d === 1 ? ['of', 'whatPct'] : d === 2 ? ['of', 'whatPct', 'change'] : ['reverse', 'ofOf', 'successive', 'change']
      const kind = rng.pick(kinds)
      const P = (x: number, k = decimalsOf(x)) => pct(x, lang, k)
      const N = (x: number, k = decimalsOf(x)) => fmt(x, lang, k)

      if (kind === 'of') {
        const p = d === 1 ? rng.pick([5, 10, 20, 25, 30, 40, 50, 75]) : rng.pick([2.5, 7.5, 12.5, 15, 17.5, 35, 45, 62.5, 37.5])
        const base = d === 1 ? rng.int(2, 45) * 20 : rng.int(4, 96) * 10
        const value = (p * base) / 100
        if (decimalsOf(value) > 1) return null
        const tenPct = base / 10
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `What is ${P(p)} of ${N(base)}?`, `Wie viel sind ${P(p)} von ${N(base)}?`),
          query: { family: 'percent', kind, p, base },
          value,
          decimals: decimalsOf(value),
          exact: true,
          distractors: [
            { value: value * 10, tag: 'decimal', why: 'Komma verschoben (Faktor 10).' },
            { value: value / 10, tag: 'decimal', why: 'Komma verschoben (Faktor 10).' },
            { value: base - value, tag: 'complement', why: `Das ist der Rest (${P(100 - p)}), nicht ${P(p)}.` },
            { value: (base * 100) / p / 10, tag: 'inverse', why: 'Durch den Prozentsatz geteilt statt mit ihm multipliziert.' },
            { value: value + tenPct / 2, tag: 'slip', why: 'Zerlegung in Teilprozente falsch zusammengesetzt.' },
          ],
          steps: [
            `10 % von ${N(base)} = ${N(tenPct)}`,
            `${P(p)} = ${N(p / 10)} × 10 % → ${N(p / 10)} × ${N(tenPct)} = ${N(value)}`,
          ],
          shortcut: `Über 10 %, 5 % und 1 % zusammensetzen – oder tauschen: ${P(p)} von ${N(base)} ist dasselbe wie ${N(base)} % von ${N(p)}, wenn das leichter ist.`,
        })
      }

      if (kind === 'whatPct') {
        const b = d === 1 ? rng.pick([20, 25, 40, 50, 80, 200, 250, 400, 500]) : rng.pick([16, 24, 32, 40, 48, 64, 80, 120, 160, 240])
        const p = d === 1 ? rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80]) : rng.pick([12.5, 37.5, 62.5, 87.5, 6.25, 18.75, 22.5, 7.5, 42.5])
        const a = (p * b) / 100
        if (!Number.isInteger(a) && decimalsOf(a) > 1) return null
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `${N(a)} is what percentage of ${N(b)}?`, `${N(a)} sind wie viel Prozent von ${N(b)}?`),
          query: { family: 'percent', kind, a, b },
          value: p,
          decimals: decimalsOf(p),
          format: (v) => P(v, decimalsOf(p)),
          exact: true,
          distractors: [
            { value: (b / a) * 100 > 1000 ? p * 2 : (b / a) * 100, tag: 'inverse', why: 'Bruch umgedreht (Basis und Anteil vertauscht).' },
            { value: p * 10, tag: 'decimal', why: 'Komma verschoben.' },
            { value: 100 - p, tag: 'complement', why: 'Den Rest statt des Anteils berechnet.' },
            { value: p / 10, tag: 'decimal', why: 'Komma verschoben.' },
            { value: p + 5, tag: 'slip', why: 'Überschlagsfehler.' },
          ],
          steps: [`Anteil = ${N(a)} / ${N(b)}`, `${N(a)} / ${N(b)} = ${N(p / 100, decimalsOf(p / 100))} = ${P(p)}`],
          shortcut: `Kürzen hilft: ${N(a)}/${N(b)} so weit kürzen, bis ein bekannter Bruch (1/8 = 12,5 %, 3/8 = 37,5 % …) übrig bleibt.`,
        })
      }

      if (kind === 'change') {
        const from = d === 2 ? rng.pick([40, 50, 60, 80, 120, 150, 160, 200, 240, 250, 400]) : rng.pick([64, 72, 96, 112, 125, 144, 175, 225, 320, 360])
        const p = d === 2 ? rng.pick([-40, -30, -25, -20, -15, -10, 5, 10, 15, 20, 25, 30, 40, 60]) : rng.pick([-37.5, -12.5, -6.25, 12.5, 37.5, 62.5, 18.75, -18.75, 87.5])
        const to = from * (1 + p / 100)
        if (!Number.isInteger(to)) return null
        const up = p > 0
        const mag = Math.abs(p)
        return numericMcq(this, seed, d, lang, rng, {
          prompt: up
            ? tr(lang, `A value rises from ${N(from)} to ${N(to)}. By what percentage did it increase?`, `Ein Wert steigt von ${N(from)} auf ${N(to)}. Um wie viel Prozent ist er gestiegen?`)
            : tr(lang, `A value falls from ${N(from)} to ${N(to)}. By what percentage did it decrease?`, `Ein Wert sinkt von ${N(from)} auf ${N(to)}. Um wie viel Prozent ist er gesunken?`),
          query: { family: 'percent', kind, from, to },
          value: mag,
          decimals: decimalsOf(mag),
          format: (v) => P(v, decimalsOf(mag)),
          exact: true,
          distractors: [
            { value: (Math.abs(to - from) / to) * 100, tag: 'wrong-base', why: 'Falsche Basis: durch den neuen statt durch den alten Wert geteilt.' },
            { value: Math.abs(to - from), tag: 'absolute', why: 'Absolute Differenz statt prozentualer Änderung.' },
            { value: (to / from) * 100, tag: 'ratio', why: 'Verhältnis neu/alt statt Änderung.' },
            { value: mag * 2, tag: 'slip', why: 'Rechenfehler.' },
            { value: mag / 2, tag: 'slip', why: 'Rechenfehler.' },
          ],
          steps: [
            `Differenz: ${N(to)} − ${N(from)} = ${N(to - from)}`,
            `Bezogen auf den **Ausgangswert**: ${N(Math.abs(to - from))} / ${N(from)} = ${P(mag)}`,
          ],
          shortcut: 'Prozentuale Änderung = Differenz ÷ ALTER Wert. Die häufigste Falle ist das Teilen durch den neuen Wert.',
        })
      }

      if (kind === 'reverse') {
        const p = rng.pick([5, 10, 12.5, 20, 25, 40, 50, -20, -25, -10, -40])
        const orig = rng.int(4, 60) * 8
        const now = orig * (1 + p / 100)
        if (!Number.isInteger(now)) return null
        const up = p > 0
        const mag = Math.abs(p)
        return numericMcq(this, seed, d, lang, rng, {
          prompt: up
            ? tr(lang, `After a ${P(mag)} increase, a price is ${N(now)}. What was the original price?`, `Nach einer Erhöhung um ${P(mag)} kostet etwas ${N(now)}. Wie hoch war der ursprüngliche Preis?`)
            : tr(lang, `After a ${P(mag)} reduction, a price is ${N(now)}. What was the original price?`, `Nach einer Senkung um ${P(mag)} kostet etwas ${N(now)}. Wie hoch war der ursprüngliche Preis?`),
          query: { family: 'percent', kind, p, now },
          value: orig,
          decimals: 0,
          exact: false,
          distractors: [
            { value: now * (1 - p / 100), tag: 'reverse-error', why: `${P(mag)} vom neuen Preis ${up ? 'abgezogen' : 'addiert'} – aber die ${P(mag)} beziehen sich auf den alten Preis.` },
            { value: now - p, tag: 'absolute', why: 'Prozentpunkte als absolute Zahl abgezogen.' },
            { value: now * (1 + p / 100), tag: 'direction', why: 'In die falsche Richtung gerechnet.' },
            { value: orig * 1.5, tag: 'slip', why: 'Rechenfehler.' },
          ],
          steps: [
            `Neuer Preis = alter Preis × ${N(1 + p / 100, decimalsOf(1 + p / 100))}`,
            `Alter Preis = ${N(now)} ÷ ${N(1 + p / 100, decimalsOf(1 + p / 100))} = ${N(orig)}`,
          ],
          shortcut: `Rückwärts immer DIVIDIEREN: ${up ? '+' : '−'}${P(mag)} rückgängig machen heißt ÷ ${N(1 + p / 100, decimalsOf(1 + p / 100))}, nicht ${up ? '−' : '+'}${P(mag)}.`,
        })
      }

      if (kind === 'ofOf') {
        const p1 = rng.pick([10, 20, 25, 40, 50])
        const p2 = rng.pick([15, 30, 35, 45, 60, 75])
        const base = rng.int(2, 30) * 200
        const value = (base * p1 * p2) / 10000
        if (!Number.isInteger(value)) return null
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `What is ${P(p1)} of ${P(p2)} of ${N(base)}?`, `Wie viel sind ${P(p1)} von ${P(p2)} von ${N(base)}?`),
          query: { family: 'percent', kind, p1, p2, base },
          value,
          decimals: 0,
          exact: true,
          distractors: [
            { value: (base * (p1 + p2)) / 100, tag: 'add-pcts', why: 'Prozentsätze addiert statt verkettet.' },
            { value: (base * p2) / 100, tag: 'partial', why: 'Nur den zweiten Prozentsatz angewendet.' },
            { value: (base * p1) / 100, tag: 'partial', why: 'Nur den ersten Prozentsatz angewendet.' },
            { value: value * 10, tag: 'decimal', why: 'Komma verschoben.' },
          ],
          steps: [
            `${P(p2)} von ${N(base)} = ${N((base * p2) / 100)}`,
            `${P(p1)} davon = ${N(value)}`,
          ],
          shortcut: `Prozentsätze multiplizieren: ${P(p1)} × ${P(p2)} = ${P((p1 * p2) / 100, decimalsOf((p1 * p2) / 100))}, dann einmal auf ${N(base)} anwenden.`,
        })
      }

      // successive changes
      const a = rng.pick([10, 20, 25, 50])
      const b = rng.pick([10, 20, 25, 40, 50])
      const upFirst = rng.chance(0.5)
      const f1 = upFirst ? 1 + a / 100 : 1 - a / 100
      const f2 = upFirst ? 1 - b / 100 : 1 + b / 100
      const net = roundTo((f1 * f2 - 1) * 100, 4)
      if (net === 0) return null
      const fmtSigned = (v: number) => (v > 0 ? '+' : '') + P(v, decimalsOf(net))
      const item: McqItem = numericMcq(this, seed, d, lang, rng, {
        prompt: upFirst
          ? tr(lang, `A price rises by ${P(a)} and then falls by ${P(b)}. What is the overall percentage change?`, `Ein Preis steigt um ${P(a)} und sinkt danach um ${P(b)}. Wie groß ist die prozentuale Gesamtänderung?`)
          : tr(lang, `A price falls by ${P(a)} and then rises by ${P(b)}. What is the overall percentage change?`, `Ein Preis sinkt um ${P(a)} und steigt danach um ${P(b)}. Wie groß ist die prozentuale Gesamtänderung?`),
        query: { family: 'percent', kind, first: upFirst ? a : -a, second: upFirst ? -b : b },
        value: net,
        decimals: decimalsOf(net),
        format: fmtSigned,
        exact: true,
        distractors: [
          { value: upFirst ? a - b : b - a, tag: 'add-pcts', why: 'Prozentsätze einfach addiert – die zweite Änderung bezieht sich aber auf den bereits geänderten Wert.' },
          { value: -net, tag: 'sign', why: 'Vorzeichen vertauscht.' },
          { value: net * 2, tag: 'slip', why: 'Rechenfehler.' },
          { value: net - 5, tag: 'slip', why: 'Rechenfehler.' },
        ],
        steps: [
          `Faktoren multiplizieren: ${N(f1, decimalsOf(f1))} × ${N(f2, decimalsOf(f2))} = ${N(f1 * f2, decimalsOf(roundTo(f1 * f2, 4)))}`,
          `${N(f1 * f2, decimalsOf(roundTo(f1 * f2, 4)))} − 1 = ${fmtSigned(net)}`,
        ],
        shortcut: `Faustregel: +a % und dann −b % ergibt a − b − a·b/100. Hier: ${fmtSigned(net)}.`,
      })
      return item
    })
  },
}

export const fractions: GeneratorDef = {
  id: 'speed.fraction',
  version: 1,
  category: 'speed',
  title: 'Brüche ↔ Prozent',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const kind = d === 1 ? rng.pick(['toPct', 'toPct', 'ofNumber']) : d === 2 ? rng.pick(['toPct', 'ofNumber']) : rng.pick(['largest', 'ofNumber', 'toPct'])
      const N = (x: number, k = decimalsOf(x)) => fmt(x, lang, k)
      if (kind === 'toPct') {
        const den = d === 1 ? rng.pick([2, 4, 5, 10, 20, 25, 50]) : d === 2 ? rng.pick([3, 6, 8, 9, 12, 40]) : rng.pick([16, 32, 7, 11, 15])
        const num = rng.int(1, den - 1)
        if (gcd(num, den) !== 1) return null
        const exact = (num / den) * 100
        const dp = decimalsOf(exact) <= 2 ? decimalsOf(exact) : 1
        if (onRoundingBoundary(exact, dp)) return null
        const rounded = decimalsOf(exact) > dp
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `Express ${num}/${den} as a percentage.`, `Schreibe ${num}/${den} als Prozentzahl.`),
          hint: rounded ? tr(lang, `Round to ${dp} decimal place${dp > 1 ? 's' : ''}.`, `Auf ${dp} Nachkommastelle${dp > 1 ? 'n' : ''} runden.`) : undefined,
          query: { family: 'fraction', kind, num, den, decimals: dp },
          value: exact,
          decimals: dp,
          format: (v) => pct(v, lang, dp),
          exact: !rounded,
          distractors: [
            { value: (den / num) * 100 < 1000 ? (den / num) * 100 : exact * 2, tag: 'inverse', why: 'Bruch umgedreht.' },
            { value: exact / 10, tag: 'decimal', why: 'Komma verschoben.' },
            { value: 100 - exact, tag: 'complement', why: 'Gegenwahrscheinlichkeit/Rest berechnet.' },
            { value: num * 10 + den / 10, tag: 'concat', why: 'Zähler und Nenner falsch kombiniert.' },
            { value: exact + 5, tag: 'slip', why: 'Überschlagsfehler.' },
            { value: exact - 5, tag: 'slip', why: 'Überschlagsfehler.' },
          ],
          steps: [
            `1/${den} = ${pct((1 / den) * 100, lang, Math.min(decimalsOf((1 / den) * 100), 3))}${decimalsOf((1 / den) * 100) > 3 ? ' (gerundet)' : ''}`,
            ...(num > 1 ? [`${num}/${den} = ${num} × 1/${den} = ${pct(exact, lang, Math.min(decimalsOf(exact), 3))}${decimalsOf(exact) > 3 ? '…' : ''}`] : []),
            ...(rounded ? [`Gerundet: ${pct(exact, lang, dp)}`] : []),
          ],
          shortcut: 'Stammbrüche auswendig: 1/3 = 33,3 %, 1/6 = 16,7 %, 1/8 = 12,5 %, 1/9 = 11,1 %, 1/12 = 8,3 %, 1/16 = 6,25 %. Dann nur noch mit dem Zähler multiplizieren.',
        })
      }
      if (kind === 'ofNumber') {
        const den = d === 1 ? rng.pick([2, 4, 5, 10]) : d === 2 ? rng.pick([3, 6, 8, 12]) : rng.pick([7, 9, 12, 16, 15])
        const num = rng.int(1, den - 1)
        if (gcd(num, den) !== 1) return null
        const n = den * (d === 3 ? rng.int(12, 250) : rng.int(3, 60))
        const value = (n / den) * num
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `What is ${num}/${den} of ${N(n)}?`, `Wie viel sind ${num}/${den} von ${N(n)}?`),
          query: { family: 'fraction', kind, num, den, n },
          value,
          decimals: 0,
          exact: true,
          distractors: [
            { value: n / den, tag: 'partial', why: `Nur durch ${den} geteilt, nicht mit ${num} multipliziert.` },
            { value: (n / num) * den > 0 && Number.isInteger((n / num) * den) ? (n / num) * den : value * 2, tag: 'inverse', why: 'Bruch umgedreht.' },
            { value: n - value, tag: 'complement', why: 'Den Rest berechnet.' },
            { value: value + n / den, tag: 'row', why: 'Ein Teil zu viel.' },
            { value: value - n / den, tag: 'row', why: 'Ein Teil zu wenig.' },
          ],
          steps: [`${N(n)} ÷ ${den} = ${N(n / den)}`, `${N(n / den)} × ${num} = ${N(value)}`],
          shortcut: 'Erst teilen, dann malnehmen – so bleiben die Zahlen klein.',
        })
      }
      // largest / smallest of five fractions
      const askLargest = rng.chance(0.5)
      const fracs: [number, number][] = []
      for (let i = 0; i < 40 && fracs.length < 5; i++) {
        const den = rng.int(3, 16)
        const num = rng.int(Math.ceil(den * 0.3), Math.floor(den * 0.95))
        if (gcd(num, den) !== 1) continue
        const v = num / den
        if (fracs.some(([a, b]) => Math.abs(a / b - v) < 0.015)) continue
        fracs.push([num, den])
      }
      if (fracs.length < 5) return null
      const sorted = fracs.slice().sort((x, y) => x[0] / x[1] - y[0] / y[1])
      const target = askLargest ? sorted[4] : sorted[0]
      const runnerUp = askLargest ? sorted[3] : sorted[1]
      if (Math.abs(target[0] / target[1] - runnerUp[0] / runnerUp[1]) > 0.08) return null
      const label = ([a, b]: [number, number]) => `${a}/${b}`
      const built = buildLabelOptions(
        rng,
        label(target),
        fracs.filter((f) => f !== target).map((f) => ({ label: label(f), why: `${label(f)} = ${pct((f[0] / f[1]) * 100, lang, 1)}` })),
      )
      return {
        ...core(this, seed, d, lang),
        type: 'mcq',
        exhibits: [],
        prompt: askLargest ? tr(lang, 'Which fraction is the largest?', 'Welcher Bruch ist am größten?') : tr(lang, 'Which fraction is the smallest?', 'Welcher Bruch ist am kleinsten?'),
        query: { family: 'fraction', kind: askLargest ? 'largest' : 'smallest' },
        options: built.options,
        correct: built.correct,
        explanation: {
          steps: [
            'In Prozent umrechnen (eine Nachkommastelle reicht):',
            ...sorted.map((f) => `${label(f)} ≈ ${pct((f[0] / f[1]) * 100, lang, 1)}`),
            `${askLargest ? 'Am größten' : 'Am kleinsten'}: **${label(target)}**`,
          ],
          distractors: built.notes,
          shortcut: 'Über Kreuz vergleichen: a/b > c/d genau dann, wenn a·d > c·b. So vergleichst du zwei Brüche ohne Division.',
        },
      }
    })
  },
}

export type { Distractor }
