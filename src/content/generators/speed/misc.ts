/** Estimation, rule of three, linear equations, one-sentence word problems, big numbers. */
import { fmt, fmtAuto, pct, roundTo } from '../../format'
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Lang, McqItem } from '../../types'
import { decimalsOf, numericMcq } from './common'

const N = (x: number, lang: Lang, k = decimalsOf(x)) => fmt(x, lang, k)
const money = (x: number, lang: Lang) => (lang === 'de' ? `${fmt(x, lang, Number.isInteger(x) ? 0 : 2)} €` : `EUR ${fmt(x, lang, Number.isInteger(x) ? 0 : 2)}`)

// ---------------------------------------------------------------- estimation

const sig2 = (v: number) => Number(v.toPrecision(2))

export const estimate: GeneratorDef = {
  id: 'speed.estimate',
  version: 1,
  category: 'speed',
  title: 'Überschlagen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      let terms: number[]
      let ops: ('*' | '/')[]
      let text: string
      if (d === 1) {
        terms = [rng.int(1100, 9900) + rng.int(1, 99), rng.int(11, 95) / 100]
        ops = ['*']
        text = `${N(terms[0], lang)} × ${N(terms[1], lang)}`
      } else if (d === 2) {
        terms = [rng.int(210, 990), rng.int(11, 99), rng.int(12, 95)]
        ops = ['*', '/']
        text = `${N(terms[0], lang)} × ${N(terms[1], lang)} ÷ ${N(terms[2], lang)}`
      } else {
        terms = [rng.int(1100, 9900), rng.int(21, 99), rng.int(12, 95), rng.int(3, 19)]
        ops = ['*', '/', '/']
        text = `(${N(terms[0], lang)} × ${N(terms[1], lang)}) ÷ (${N(terms[2], lang)} × ${N(terms[3], lang)})`
      }
      if (terms.some((t) => t % 10 === 0)) return null
      const exact = ops.reduce((acc, op, i) => (op === '*' ? acc * terms[i + 1] : acc / terms[i + 1]), terms[0])
      const best = sig2(exact)
      const factors = rng.shuffle([10, 0.1, 2, 0.5, 3, 1 / 3, 5, 0.2])
      const values = [best]
      for (const f of factors) {
        if (values.length >= 5) break
        const v = sig2(best * f)
        if (values.every((w) => Math.max(v / w, w / v) >= 1.6)) values.push(v)
      }
      if (values.length < 5) return null
      values.sort((a, b) => a - b)
      const dp = Math.max(0, ...values.map((v) => decimalsOf(v)))
      if (dp > 2) return null
      const options = values.map((v) => ({ text: fmtAuto(v, lang, dp), tag: v === best ? 'correct' : 'magnitude' }))
      const correct = values.indexOf(best)
      const rough = terms.map((t) => Number(t.toPrecision(1)))
      const roughVal = ops.reduce((acc, op, i) => (op === '*' ? acc * rough[i + 1] : acc / rough[i + 1]), rough[0])
      const item: McqItem = {
        ...core(this, seed, d, lang),
        type: 'mcq',
        exhibits: [],
        prompt: tr(lang, `Which value is closest to ${text}?`, `Welcher Wert liegt am nächsten an ${text}?`),
        query: { family: 'estimate', terms, ops },
        options,
        correct,
        free: { answer: exact, tolerance: Math.abs(exact) * 0.05, decimals: dp },
        explanation: {
          steps: [
            `Auf eine gültige Ziffer runden: ${rough.map((r) => N(r, lang)).join(ops.length === 1 ? ' × ' : ', ')}`,
            `Grobe Rechnung: ≈ ${fmt(roundTo(roughVal, 2), lang, decimalsOf(roundTo(roughVal, 2)))}`,
            `Genauer Wert: ${fmt(exact, lang, exact < 10 ? 3 : 1)} → nächstgelegene Option **${fmtAuto(best, lang, dp)}**`,
          ],
          distractors: values
            .map((v, i) => ({ v, i }))
            .filter(({ v }) => v !== best)
            .map(({ v, i }) => `**${String.fromCharCode(65 + i)}** (${fmtAuto(v, lang, dp)}): um den Faktor ${fmtAuto(Math.max(v / best, best / v), lang, 1)} daneben – typischer Stellenwert-/Nullenfehler.`),
          shortcut: 'Die Optionen liegen um Faktoren auseinander – es kommt nur auf die Größenordnung an. Runde mutig und zähle die Nullen getrennt.',
        },
      }
      return item
    })
  },
}

// ------------------------------------------------------------- rule of three

const DIRECT = [
  { en: ['notebooks', 'notebooks'], de: ['Notizbücher', 'Notizbücher'], prices: [1.5, 2.5, 3.2, 4.5, 6, 7.5] },
  { en: ['kg of coffee', 'kg of coffee'], de: ['kg Kaffee', 'kg Kaffee'], prices: [8, 12.5, 14, 16.5, 18] },
  { en: ['litres of paint', 'litres of paint'], de: ['Liter Farbe', 'Liter Farbe'], prices: [3.5, 4.2, 6.5, 9, 11] },
]
const INVERSE = [
  { en: (w: number, t: number) => `${w} workers need ${t} days for a job.`, de: (w: number, t: number) => `${w} Arbeiter brauchen ${t} Tage für einen Auftrag.`, q: { en: (w: number) => `How many days do ${w} workers need at the same pace?`, de: (w: number) => `Wie viele Tage brauchen ${w} Arbeiter bei gleichem Tempo?` }, unitDe: 'Tage' },
  { en: (w: number, t: number) => `${w} pumps fill a tank in ${t} hours.`, de: (w: number, t: number) => `${w} Pumpen füllen einen Tank in ${t} Stunden.`, q: { en: (w: number) => `How many hours do ${w} identical pumps need?`, de: (w: number) => `Wie viele Stunden brauchen ${w} gleiche Pumpen?` }, unitDe: 'Stunden' },
]

export const ruleOfThree: GeneratorDef = {
  id: 'speed.rule3',
  version: 1,
  category: 'speed',
  title: 'Dreisatz',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      if (d === 1) {
        const ctx = rng.pick(DIRECT)
        const p = rng.pick(ctx.prices)
        const q1 = rng.int(2, 9)
        const q2 = rng.int(2, 15)
        if (q1 === q2) return null
        const c1 = roundTo(q1 * p, 2)
        const c2 = roundTo(q2 * p, 2)
        const label = lang === 'de' ? ctx.de : ctx.en
        return numericMcq(this, seed, d, lang, rng, {
          prompt: tr(lang, `${q1} ${label[0]} cost ${money(c1, lang)}. How much do ${q2} ${label[1]} cost?`, `${q1} ${label[0]} kosten ${money(c1, lang)}. Wie viel kosten ${q2} ${label[1]}?`),
          query: { family: 'rule3', kind: 'direct', q1, c1, q2 },
          value: c2,
          decimals: decimalsOf(c2),
          format: (v) => money(roundTo(v, 2), lang),
          exact: true,
          distractors: [
            { value: c1 + (q2 - q1), tag: 'additive', why: 'Additiv statt proportional gedacht.' },
            { value: roundTo((c1 * q1) / q2, 2), tag: 'inverse', why: 'Umgekehrt proportional gerechnet – mehr Stück kosten aber mehr.' },
            { value: c2 + p, tag: 'row', why: 'Ein Stück zu viel.' },
            { value: c2 - p, tag: 'row', why: 'Ein Stück zu wenig.' },
            { value: c1 * q2, tag: 'no-divide', why: 'Vergessen, zuerst durch die Ausgangsmenge zu teilen.' },
          ],
          steps: [`Preis pro Stück: ${money(c1, lang)} ÷ ${q1} = ${money(p, lang)}`, `${q2} × ${money(p, lang)} = ${money(c2, lang)}`],
          shortcut: 'Erst auf 1 Einheit runterrechnen, dann hoch. Kontrolle: mehr Menge → höherer Preis.',
        })
      }
      if (d === 2) {
        const ctx = rng.pick(INVERSE)
        const w1 = rng.int(2, 12)
        const t1 = rng.int(3, 30)
        const W = w1 * t1
        const divisors = []
        for (let k = 2; k <= 24; k++) if (W % k === 0 && k !== w1) divisors.push(k)
        if (divisors.length === 0) return null
        const w2 = rng.pick(divisors)
        const t2 = W / w2
        return numericMcq(this, seed, d, lang, rng, {
          prompt: lang === 'de' ? `${ctx.de(w1, t1)} ${ctx.q.de(w2)}` : `${ctx.en(w1, t1)} ${ctx.q.en(w2)}`,
          query: { family: 'rule3', kind: 'inverse', a1: w1, b1: t1, a2: w2 },
          value: t2,
          decimals: 0,
          exact: true,
          distractors: [
            { value: roundTo((t1 * w2) / w1, 1), tag: 'direct', why: 'Proportional statt umgekehrt proportional gerechnet – mehr Kräfte brauchen weniger Zeit.' },
            { value: t1 - (w2 - w1), tag: 'additive', why: 'Additiv gedacht.' },
            { value: W, tag: 'no-divide', why: 'Nur die Gesamtarbeit berechnet, nicht durch die neue Anzahl geteilt.' },
            { value: t2 + 1, tag: 'slip', why: 'Rechenfehler.' },
            { value: t2 + 2, tag: 'slip', why: 'Rechenfehler.' },
          ],
          steps: [`Gesamtarbeit: ${w1} × ${t1} = ${W} Einheiten (z. B. Arbeiter-Tage)`, `Verteilt auf ${w2}: ${W} ÷ ${w2} = ${t2}`],
          shortcut: 'Umgekehrter Dreisatz: Das Produkt bleibt konstant (Anzahl × Zeit). Plausibilitätscheck: mehr Kräfte → weniger Zeit.',
        })
      }
      const m1 = rng.int(2, 9)
      const h1 = rng.int(2, 8)
      const m2 = rng.int(2, 12)
      const h2 = rng.int(2, 10)
      if (m1 === m2 || h1 === h2) return null
      const perMH = rng.int(2, 30) * 5
      const u1 = perMH * m1 * h1
      const u2 = perMH * m2 * h2
      return numericMcq(this, seed, d, lang, rng, {
        prompt: tr(
          lang,
          `${m1} machines produce ${N(u1, lang)} parts in ${h1} hours. How many parts do ${m2} machines produce in ${h2} hours at the same rate?`,
          `${m1} Maschinen produzieren ${N(u1, lang)} Teile in ${h1} Stunden. Wie viele Teile produzieren ${m2} Maschinen in ${h2} Stunden bei gleicher Leistung?`,
        ),
        query: { family: 'rule3', kind: 'compound', m1, u1, h1, m2, h2 },
        value: u2,
        decimals: 0,
        exact: true,
        distractors: [
          { value: (u1 * m2) / m1, tag: 'partial', why: 'Nur die Maschinenzahl angepasst, die Stunden vergessen.' },
          { value: (u1 * h2) / h1, tag: 'partial', why: 'Nur die Stunden angepasst, die Maschinenzahl vergessen.' },
          { value: (u1 * m2 * h1) / (m1 * h2), tag: 'inverse', why: 'Stunden umgekehrt proportional angesetzt.' },
          { value: u2 + perMH, tag: 'slip', why: 'Eine Maschinenstunde zu viel.' },
        ],
        steps: [
          `Pro Maschine und Stunde: ${N(u1, lang)} ÷ (${m1} × ${h1}) = ${perMH}`,
          `${m2} Maschinen × ${h2} Stunden × ${perMH} = ${N(u2, lang)}`,
        ],
        shortcut: 'Auf „pro Maschine und Stunde“ normieren, dann hochrechnen – so kann keine Größe vergessen werden.',
      })
    })
  },
}

// --------------------------------------------------------- linear equations

const lin = (a: number, b: number) => `${a === 1 ? '' : a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`

export const equation: GeneratorDef = {
  id: 'speed.equation',
  version: 1,
  category: 'speed',
  title: 'Gleichungen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const solveFor = tr(lang, 'Solve for x:', 'Löse nach x auf:')
      if (d === 1) {
        const a = rng.int(2, 9)
        const x = rng.int(2, 15)
        const b = rng.int(-20, 30)
        if (b === 0) return null
        const c = a * x + b
        return numericMcq(this, seed, d, lang, rng, {
          prompt: `${solveFor} ${lin(a, b)} = ${c}`,
          query: { family: 'linear', form: 'axb', a, b, c },
          value: x,
          decimals: 0,
          exact: true,
          distractors: [
            { value: (c + b) / a, tag: 'sign', why: `${b > 0 ? '+' : '−'}${Math.abs(b)} mit falschem Vorzeichen auf die andere Seite gebracht.` },
            { value: c - b, tag: 'no-divide', why: `Vergessen, durch ${a} zu teilen.` },
            { value: c / a - b, tag: 'order', why: 'Erst geteilt, dann nur c durch a – Reihenfolge falsch.' },
            { value: x + 1, tag: 'slip', why: 'Rechenfehler.' },
            { value: -x, tag: 'sign', why: 'Vorzeichenfehler.' },
          ].filter((t) => Number.isInteger(t.value)),
          steps: [`${a}x = ${c} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${c - b}`, `x = ${c - b} ÷ ${a} = ${x}`],
          shortcut: `Einsetzen statt lösen: Optionen in ${lin(a, b)} einsetzen geht oft schneller. ${a} × ${x} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c} ✓`,
        })
      }
      if (d === 2) {
        const form = rng.pick(['bracket', 'frac', 'both'] as const)
        if (form === 'bracket') {
          const a = rng.int(2, 9)
          const b = rng.int(1, 9)
          const x = rng.int(b + 1, b + 15)
          const c = a * (x - b)
          return numericMcq(this, seed, d, lang, rng, {
            prompt: `${solveFor} ${a}(x − ${b}) = ${c}`,
            query: { family: 'linear', form, a, b, c },
            value: x,
            decimals: 0,
            exact: true,
            distractors: [
              { value: c / a - b, tag: 'sign', why: `${b} abgezogen statt addiert.` },
              { value: (c + b) / a, tag: 'expand', why: `Klammer falsch aufgelöst (nur x mit ${a} multipliziert).` },
              { value: c - b, tag: 'no-divide', why: `Nicht durch ${a} geteilt.` },
              { value: x + 1, tag: 'slip', why: 'Rechenfehler.' },
              { value: x - 2, tag: 'slip', why: 'Rechenfehler.' },
            ].filter((t) => Number.isInteger(t.value) && t.value > 0),
            steps: [`Durch ${a} teilen: x − ${b} = ${c / a}`, `x = ${c / a} + ${b} = ${x}`],
            shortcut: 'Zuerst durch den Faktor vor der Klammer teilen – dann bleibt eine einfache Gleichung übrig.',
          })
        }
        if (form === 'frac') {
          const a = rng.int(2, 9)
          const q = rng.int(2, 12)
          const x = a * q
          const b = rng.int(1, 20)
          const c = q + b
          return numericMcq(this, seed, d, lang, rng, {
            prompt: `${solveFor} x/${a} + ${b} = ${c}`,
            query: { family: 'linear', form, a, b, c },
            value: x,
            decimals: 0,
            exact: true,
            distractors: [
              { value: (c + b) * a, tag: 'sign', why: `${b} addiert statt abgezogen.` },
              { value: c - b, tag: 'no-multiply', why: `Vergessen, mit ${a} zu multiplizieren.` },
              { value: c * a - b, tag: 'order', why: 'Reihenfolge der Umformungen vertauscht.' },
              { value: x + a, tag: 'slip', why: 'Rechenfehler.' },
            ].filter((t) => Number.isInteger(t.value) && t.value > 0),
            steps: [`x/${a} = ${c} − ${b} = ${q}`, `x = ${q} × ${a} = ${x}`],
            shortcut: 'Rückwärts rechnen: erst die Addition rückgängig machen, dann die Division.',
          })
        }
        const c2 = rng.int(1, 5)
        const a = rng.int(c2 + 1, c2 + 6)
        const x = rng.int(1, 14)
        const b = rng.int(-10, 15)
        const dd = (a - c2) * x + b
        if (b === 0 || dd === b) return null
        return numericMcq(this, seed, d, lang, rng, {
          prompt: `${solveFor} ${lin(a, b)} = ${lin(c2, dd)}`,
          query: { family: 'linear', form: 'both', a, b, c: c2, d: dd },
          value: x,
          decimals: 0,
          exact: true,
          distractors: [
            { value: (dd + b) / (a - c2), tag: 'sign', why: 'Konstante mit falschem Vorzeichen umgestellt.' },
            { value: (dd - b) / (a + c2), tag: 'sign', why: 'x-Terme addiert statt subtrahiert.' },
            { value: dd - b, tag: 'no-divide', why: `Nicht durch ${a - c2} geteilt.` },
            { value: x + 1, tag: 'slip', why: 'Rechenfehler.' },
            { value: x + 2, tag: 'slip', why: 'Rechenfehler.' },
          ].filter((t) => Number.isInteger(t.value)),
          steps: [
            `x-Terme nach links, Zahlen nach rechts: ${a}x − ${c2}x = ${dd} ${b < 0 ? '+' : '−'} ${Math.abs(b)}`,
            `${a - c2}x = ${dd - b}`,
            `x = ${x}`,
          ],
          shortcut: 'Optionen einsetzen und beide Seiten vergleichen ist bei kleinen Zahlen oft am schnellsten.',
        })
      }
      // d3: system of two equations
      const x = rng.int(1, 15)
      const y = rng.int(1, 15)
      const a1 = rng.int(1, 5)
      const b1 = rng.int(1, 5)
      const a2 = rng.int(1, 5)
      const b2 = rng.int(-4, 5)
      if (b2 === 0 || a1 * b2 - a2 * b1 === 0 || x === y) return null
      const c1 = a1 * x + b1 * y
      const c2 = a2 * x + b2 * y
      const ask = rng.pick(['x', 'y'] as const)
      const term = (a: number, b: number) => `${a === 1 ? '' : a}x ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y`
      const val = ask === 'x' ? x : y
      const other = ask === 'x' ? y : x
      return numericMcq(this, seed, d, lang, rng, {
        prompt: tr(lang, `${term(a1, b1)} = ${c1} and ${term(a2, b2)} = ${c2}. What is ${ask}?`, `${term(a1, b1)} = ${c1} und ${term(a2, b2)} = ${c2}. Wie groß ist ${ask}?`),
        query: { family: 'linear', form: 'system', eqs: [[a1, b1, c1], [a2, b2, c2]], ask },
        value: val,
        decimals: 0,
        exact: true,
        distractors: [
          { value: other, tag: 'swap', why: `Das ist der Wert der anderen Variablen (${ask === 'x' ? 'y' : 'x'}).` },
          { value: val + 1, tag: 'slip', why: 'Rechenfehler beim Eliminieren.' },
          { value: val - 1, tag: 'slip', why: 'Rechenfehler beim Eliminieren.' },
          { value: x + y, tag: 'sum', why: 'Die Summe x + y statt der gesuchten Variable.' },
          { value: val + 2, tag: 'slip', why: 'Rechenfehler.' },
        ].filter((t) => t.value > 0),
        steps: [
          `Eine Variable eliminieren (z. B. Gleichungen so multiplizieren, dass ${ask === 'x' ? 'y' : 'x'} wegfällt).`,
          `Ergebnis: x = ${x}, y = ${y}`,
          `Probe: ${a1}·${x} + ${b1}·${y} = ${c1} ✓ und ${a2}·${x} ${b2 < 0 ? '−' : '+'} ${Math.abs(b2)}·${y} = ${c2} ✓`,
        ],
        shortcut: 'Unter Zeitdruck: Optionen für die gesuchte Variable in die einfachere Gleichung einsetzen, die andere Variable ausrechnen und mit der zweiten Gleichung prüfen.',
      })
    })
  },
}

// ------------------------------------------------------------ word problems

export const wordProblems: GeneratorDef = {
  id: 'speed.word',
  version: 1,
  category: 'speed',
  title: 'Textaufgaben (ein Satz)',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const kinds = d === 1 ? ['discount', 'vatAdd'] : d === 2 ? ['avgSpeed', 'margin', 'split', 'vatReverse'] : ['compound', 'breakEven', 'weightedAvg', 'successiveDiscount']
      const kind = rng.pick(kinds)
      const P = (x: number) => pct(x, lang, decimalsOf(x))
      const n = (x: number) => N(x, lang)
      switch (kind) {
        case 'discount': {
          const price = rng.int(4, 60) * 10
          const p = rng.pick([10, 15, 20, 25, 30, 40, 50])
          const value = price * (1 - p / 100)
          if (!Number.isInteger(value)) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A jacket costs ${money(price, lang)} and is reduced by ${P(p)}. What is the new price?`, `Eine Jacke kostet ${money(price, lang)} und wird um ${P(p)} reduziert. Wie hoch ist der neue Preis?`),
            query: { family: 'word', kind, price, p },
            value,
            decimals: 0,
            format: (v) => money(v, lang),
            exact: true,
            distractors: [
              { value: (price * p) / 100, tag: 'discount-only', why: 'Nur den Rabatt berechnet, nicht den neuen Preis.' },
              { value: price * (1 + p / 100), tag: 'direction', why: 'Aufschlag statt Rabatt.' },
              { value: price - p, tag: 'absolute', why: 'Prozent als absoluten Betrag abgezogen.' },
              { value: value - 10, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`${P(p)} von ${money(price, lang)} = ${money((price * p) / 100, lang)}`, `${money(price, lang)} − ${money((price * p) / 100, lang)} = ${money(value, lang)}`],
            shortcut: `Direkt mit dem Restanteil rechnen: ${money(price, lang)} × ${n(1 - p / 100)} = ${money(value, lang)}.`,
          })
        }
        case 'vatAdd': {
          const net = rng.int(3, 90) * 10
          const r = rng.pick([10, 20])
          const value = net * (1 + r / 100)
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A service costs ${money(net, lang)} before VAT. VAT is ${P(r)}. What is the price including VAT?`, `Eine Leistung kostet netto ${money(net, lang)}. Die Mehrwertsteuer beträgt ${P(r)}. Wie hoch ist der Bruttopreis?`),
            query: { family: 'word', kind, net, r },
            value,
            decimals: 0,
            format: (v) => money(v, lang),
            exact: true,
            distractors: [
              { value: (net * r) / 100, tag: 'tax-only', why: 'Nur die Steuer berechnet.' },
              { value: net * (1 - r / 100), tag: 'direction', why: 'Steuer abgezogen statt addiert.' },
              { value: net + r, tag: 'absolute', why: 'Prozent als absoluten Betrag addiert.' },
              { value: value + 10, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`Steuer: ${P(r)} von ${money(net, lang)} = ${money((net * r) / 100, lang)}`, `Brutto: ${money(net, lang)} + ${money((net * r) / 100, lang)} = ${money(value, lang)}`],
            shortcut: `Brutto = Netto × ${n(1 + r / 100)}.`,
          })
        }
        case 'avgSpeed': {
          const minutes = rng.pick([20, 30, 40, 45, 75, 90, 120, 150])
          const speed = rng.int(6, 30) * 5
          const dist = (speed * minutes) / 60
          if (!Number.isInteger(dist)) return null
          const hText = lang === 'de' ? `${minutes} Minuten` : `${minutes} minutes`
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A train covers ${dist} km in ${hText}. What is its average speed in km/h?`, `Ein Zug legt ${dist} km in ${hText} zurück. Wie hoch ist seine Durchschnittsgeschwindigkeit in km/h?`),
            query: { family: 'word', kind, dist, minutes },
            value: speed,
            decimals: 0,
            format: (v) => `${fmt(v, lang, decimalsOf(v))} km/h`,
            exact: true,
            distractors: [
              { value: roundTo(dist / minutes, 2), tag: 'per-minute', why: 'km pro Minute statt pro Stunde.' },
              { value: roundTo((dist / minutes) * 100, 1), tag: 'decimal-hours', why: `${minutes} Minuten als ${minutes / 100} Stunden gerechnet (Dezimal- statt Zeitrechnung).` },
              { value: dist, tag: 'distance', why: 'Nur die Strecke angegeben.' },
              { value: speed + 10, tag: 'slip', why: 'Rechenfehler.' },
              { value: speed - 10, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`${minutes} Minuten = ${n(minutes / 60)} Stunden`, `${dist} km ÷ ${n(minutes / 60)} h = ${speed} km/h`],
            shortcut: `Auf 60 Minuten hochrechnen: ${dist} km × 60/${minutes} = ${speed} km/h.`,
          })
        }
        case 'margin': {
          const revenue = rng.int(4, 50) * 100
          const m = rng.pick([5, 8, 12, 12.5, 15, 20, 25, 30, 35, 40])
          const profit = (revenue * m) / 100
          if (!Number.isInteger(profit)) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A company earns a profit of ${money(profit, lang)} on revenue of ${money(revenue, lang)}. What is its profit margin?`, `Ein Unternehmen erzielt bei einem Umsatz von ${money(revenue, lang)} einen Gewinn von ${money(profit, lang)}. Wie hoch ist die Gewinnmarge?`),
            query: { family: 'word', kind, revenue, profit },
            value: m,
            decimals: decimalsOf(m),
            format: (v) => pct(v, lang, decimalsOf(m)),
            exact: true,
            distractors: [
              { value: (profit / (revenue - profit)) * 100, tag: 'wrong-base', why: 'Gewinn durch Kosten statt durch Umsatz geteilt.' },
              { value: 100 - m, tag: 'complement', why: 'Kostenquote statt Marge.' },
              { value: m * 10, tag: 'decimal', why: 'Komma verschoben.' },
              { value: m / 10, tag: 'decimal', why: 'Komma verschoben.' },
            ],
            steps: [`Marge = Gewinn ÷ Umsatz = ${money(profit, lang)} ÷ ${money(revenue, lang)}`, `= ${P(m)}`],
            shortcut: 'Marge immer auf den Umsatz beziehen. Beide Zahlen erst kürzen (Nullen streichen).',
          })
        }
        case 'split': {
          const a = rng.int(1, 7)
          const b = rng.int(1, 7)
          if (a === b) return null
          const unit = rng.int(2, 30) * 1000
          const total = unit * (a + b)
          const value = unit * b
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A profit of ${money(total, lang)} is split between A and B in the ratio ${a}:${b}. How much does B receive?`, `Ein Gewinn von ${money(total, lang)} wird im Verhältnis ${a}:${b} auf A und B verteilt. Wie viel erhält B?`),
            query: { family: 'word', kind, total, a, b },
            value,
            decimals: 0,
            format: (v) => money(v, lang),
            exact: true,
            distractors: [
              { value: unit * a, tag: 'swap', why: 'Das ist der Anteil von A.' },
              { value: (total * b) / 10, tag: 'decimal', why: 'Verhältnis wie Prozent behandelt.' },
              { value: total / b, tag: 'wrong-split', why: 'Durch den Anteil statt durch die Summe der Teile geteilt.' },
              { value: total / 2, tag: 'half', why: 'Einfach halbiert.' },
            ],
            steps: [`Teile insgesamt: ${a} + ${b} = ${a + b}`, `Ein Teil: ${money(total, lang)} ÷ ${a + b} = ${money(unit, lang)}`, `B: ${b} × ${money(unit, lang)} = ${money(value, lang)}`],
            shortcut: 'Erst „ein Teil“ ausrechnen, dann mit dem Anteil multiplizieren.',
          })
        }
        case 'vatReverse': {
          const r = rng.pick([20, 25, 10])
          const net = rng.int(2, 60) * 20
          const gross = net * (1 + r / 100)
          if (!Number.isInteger(gross)) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A price including ${P(r)} VAT is ${money(gross, lang)}. What is the price before VAT?`, `Ein Preis inklusive ${P(r)} Mehrwertsteuer beträgt ${money(gross, lang)}. Wie hoch ist der Nettopreis?`),
            query: { family: 'word', kind, gross, r },
            value: net,
            decimals: 0,
            format: (v) => money(roundTo(v, 2), lang),
            exact: false,
            distractors: [
              { value: gross * (1 - r / 100), tag: 'reverse-error', why: `${P(r)} vom Bruttopreis abgezogen – die Steuer bezieht sich aber auf den Nettopreis.` },
              { value: gross - r, tag: 'absolute', why: 'Prozent als Betrag abgezogen.' },
              { value: (gross * r) / 100, tag: 'tax-only', why: 'Nur einen Steueranteil berechnet.' },
              { value: net + 20, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`Brutto = Netto × ${n(1 + r / 100)}`, `Netto = ${money(gross, lang)} ÷ ${n(1 + r / 100)} = ${money(net, lang)}`],
            shortcut: `Rückwärts dividieren, nicht Prozent abziehen: ÷ ${n(1 + r / 100)}.`,
          })
        }
        case 'compound': {
          const pr = rng.int(2, 40) * 500
          const r = rng.pick([2, 3, 4, 5, 6, 8, 10])
          const value = roundTo(pr * (1 + r / 100) ** 2, 2)
          if (!Number.isInteger(value)) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `${money(pr, lang)} is invested at ${P(r)} interest per year, compounded annually. What is it worth after 2 years?`, `${money(pr, lang)} werden zu ${P(r)} Zinsen pro Jahr angelegt (Zinseszins, jährlich). Wie viel ist das Guthaben nach 2 Jahren wert?`),
            query: { family: 'word', kind, pr, r, years: 2 },
            value,
            decimals: 0,
            format: (v) => money(v, lang),
            exact: true,
            distractors: [
              { value: pr * (1 + (2 * r) / 100), tag: 'simple', why: 'Einfache statt Zinseszinsen gerechnet.' },
              { value: pr * (1 + r / 100), tag: 'one-year', why: 'Nur ein Jahr verzinst.' },
              { value: pr * (1 + r / 100) ** 2 - pr, tag: 'interest-only', why: 'Nur die Zinsen angegeben.' },
              { value: value + 100, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [
              `Jahr 1: ${money(pr, lang)} × ${n(1 + r / 100)} = ${money(pr * (1 + r / 100), lang)}`,
              `Jahr 2: ${money(pr * (1 + r / 100), lang)} × ${n(1 + r / 100)} = ${money(value, lang)}`,
            ],
            shortcut: `Zinseszins über 2 Jahre = einfache Zinsen + „Zins auf Zins“: 2 × ${P(r)} + (${P(r)})² = ${P(2 * r + (r * r) / 100)}.`,
          })
        }
        case 'breakEven': {
          const price = rng.int(12, 60)
          const variable = rng.int(4, price - 3)
          const margin = price - variable
          const units = rng.int(2, 40) * 50
          const fixed = units * margin
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `Fixed costs are ${money(fixed, lang)}. Each unit sells for ${money(price, lang)} and costs ${money(variable, lang)} to make. How many units are needed to break even?`, `Die Fixkosten betragen ${money(fixed, lang)}. Jede Einheit wird für ${money(price, lang)} verkauft und kostet ${money(variable, lang)} in der Herstellung. Wie viele Einheiten braucht es bis zur Gewinnschwelle?`),
            query: { family: 'word', kind, fixed, price, variable },
            value: units,
            decimals: 0,
            exact: true,
            distractors: [
              { value: roundTo(fixed / price, 0), tag: 'price-only', why: 'Durch den Preis statt durch den Deckungsbeitrag geteilt.' },
              { value: roundTo(fixed / variable, 0), tag: 'cost-only', why: 'Durch die variablen Kosten geteilt.' },
              { value: units * 2, tag: 'slip', why: 'Rechenfehler.' },
              { value: units + 50, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`Deckungsbeitrag pro Einheit: ${money(price, lang)} − ${money(variable, lang)} = ${money(margin, lang)}`, `${money(fixed, lang)} ÷ ${money(margin, lang)} = ${n(units)} Einheiten`],
            shortcut: 'Break-even = Fixkosten ÷ (Preis − variable Kosten).',
          })
        }
        case 'weightedAvg': {
          const n1 = rng.int(2, 9) * 10
          const n2 = rng.int(2, 9) * 10
          const a1 = rng.int(50, 95)
          const a2 = rng.int(50, 95)
          if (a1 === a2 || n1 === n2) return null
          const value = (n1 * a1 + n2 * a2) / (n1 + n2)
          if (decimalsOf(value) > 1) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `Team A (${n1} people) scores an average of ${a1}, team B (${n2} people) an average of ${a2}. What is the overall average?`, `Team A (${n1} Personen) erzielt im Schnitt ${a1} Punkte, Team B (${n2} Personen) im Schnitt ${a2}. Wie hoch ist der Gesamtdurchschnitt?`),
            query: { family: 'word', kind, n1, a1, n2, a2 },
            value,
            decimals: decimalsOf(value),
            exact: true,
            distractors: [
              { value: (a1 + a2) / 2, tag: 'unweighted', why: 'Ungewichteter Durchschnitt – die Teams sind aber unterschiedlich groß.' },
              { value: (n2 * a1 + n1 * a2) / (n1 + n2), tag: 'swapped-weights', why: 'Gewichte vertauscht.' },
              { value: value + 2, tag: 'slip', why: 'Rechenfehler.' },
              { value: value - 2, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`Summe: ${n1} × ${a1} + ${n2} × ${a2} = ${n(n1 * a1)} + ${n(n2 * a2)} = ${n(n1 * a1 + n2 * a2)}`, `÷ ${n1 + n2} Personen = ${n(value)}`],
            shortcut: `Der Schnitt liegt näher am größeren Team. Abstandsmethode: ${a1} + (${a2} − ${a1}) × ${n2}/${n1 + n2}.`,
          })
        }
        default: {
          const price = rng.int(4, 50) * 20
          const p1 = rng.pick([10, 20, 25, 50])
          const p2 = rng.pick([10, 20, 25])
          const value = price * (1 - p1 / 100) * (1 - p2 / 100)
          if (!Number.isInteger(value)) return null
          return numericMcq(this, seed, d, lang, rng, {
            prompt: tr(lang, `A price of ${money(price, lang)} is reduced by ${P(p1)}, and the reduced price by a further ${P(p2)}. What is the final price?`, `Ein Preis von ${money(price, lang)} wird um ${P(p1)} gesenkt, der reduzierte Preis dann nochmals um ${P(p2)}. Wie hoch ist der Endpreis?`),
            query: { family: 'word', kind: 'successiveDiscount', price, p1, p2 },
            value,
            decimals: 0,
            format: (v) => money(roundTo(v, 2), lang),
            exact: true,
            distractors: [
              { value: price * (1 - (p1 + p2) / 100), tag: 'add-pcts', why: 'Rabatte addiert – der zweite bezieht sich aber auf den bereits reduzierten Preis.' },
              { value: price * (1 - p1 / 100), tag: 'partial', why: 'Nur den ersten Rabatt angewendet.' },
              { value: price - value, tag: 'discount-only', why: 'Nur die Ersparnis berechnet.' },
              { value: value + 20, tag: 'slip', why: 'Rechenfehler.' },
            ],
            steps: [`Nach ${P(p1)}: ${money(price * (1 - p1 / 100), lang)}`, `Nach weiteren ${P(p2)}: ${money(value, lang)}`],
            shortcut: `Faktoren multiplizieren: ${n(1 - p1 / 100)} × ${n(1 - p2 / 100)} = ${n((1 - p1 / 100) * (1 - p2 / 100))}.`,
          })
        }
      }
    })
  },
}

// --------------------------------------------------------------- big numbers

export function fmtBig(v: number, lang: Lang): string {
  const abs = Math.abs(v)
  const word = (k: number, en: string, de: string) => `${fmtAuto(v / k, lang, 2)} ${lang === 'de' ? de : en}`
  if (abs >= 1e9 && decimalsOf(v / 1e9) <= 2) return word(1e9, 'billion', 'Mrd.')
  if (abs >= 1e6 && decimalsOf(v / 1e6) <= 2) return word(1e6, 'million', 'Mio.')
  return fmt(v, lang, decimalsOf(v))
}

export const bigNumbers: GeneratorDef = {
  id: 'speed.units',
  version: 1,
  category: 'speed',
  title: 'Große Zahlen & Einheiten',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const B = (x: number) => fmtBig(x, lang)
      let terms: number[]
      let ops: ('*' | '/')[]
      let prompt: string
      let steps: string[]
      if (d === 1) {
        const x = rng.pick([1.5, 2, 2.5, 3, 4, 4.5, 6, 8, 1.2, 3.5])
        const y = rng.pick([2, 3, 4, 5, 6, 8, 1.5, 2.5])
        const i = rng.int(2, 4)
        const j = rng.int(2, 4)
        terms = [x * 10 ** i, y * 10 ** j]
        ops = ['*']
        prompt = `${B(terms[0])} × ${B(terms[1])} = ?`
        steps = [`Ziffern: ${N(x, lang)} × ${N(y, lang)} = ${N(x * y, lang)}`, `Nullen: 10^${i} × 10^${j} = 10^${i + j}`, `Ergebnis: ${B(terms[0] * terms[1])}`]
      } else if (d === 2) {
        const q = rng.pick([2, 3, 4, 5, 6, 8, 12, 15, 25])
        const m = rng.pick([2, 3, 4, 5, 6, 8])
        const i = rng.int(3, 5)
        const j = rng.int(6, 9)
        const big = q * m * 10 ** j
        const small = m * 10 ** i
        if (big > 9e11) return null
        terms = [big, small]
        ops = ['/']
        prompt = `${B(big)} ÷ ${B(small)} = ?`
        steps = [`Ziffern: ${N(q * m, lang)} ÷ ${m} = ${q}`, `Nullen: 10^${j} ÷ 10^${i} = 10^${j - i}`, `Ergebnis: ${B(big / small)}`]
      } else if (rng.chance(0.5)) {
        const p = rng.pick([4, 6, 8, 12, 15, 25, 35, 45])
        const base = rng.pick([1.2, 2.4, 3.6, 4.5, 6, 8, 2.5]) * 10 ** rng.int(6, 9)
        terms = [p / 100, base]
        ops = ['*']
        prompt = tr(lang, `What is ${pct(p, lang)} of ${B(base)}?`, `Wie viel sind ${pct(p, lang)} von ${B(base)}?`)
        steps = [`10 % von ${B(base)} = ${B(base / 10)}`, `${pct(p, lang)} = ${N(p / 10, lang)} × 10 % → ${B((p * base) / 100)}`]
      } else {
        const perHead = rng.pick([40, 60, 75, 120, 150, 200, 250]) * 1000
        const heads = rng.pick([4, 8, 12, 16, 20, 24, 30]) * 1000
        const revenue = perHead * heads
        terms = [revenue, heads]
        ops = ['/']
        prompt = tr(lang, `A company with revenue of ${B(revenue)} euros has ${B(heads)} employees. What is the revenue per employee, in euros?`, `Ein Unternehmen mit ${B(revenue)} Euro Umsatz hat ${B(heads)} Mitarbeitende. Wie hoch ist der Umsatz pro Kopf, in Euro?`)
        steps = [`${B(revenue)} ÷ ${B(heads)}`, `Nullen getrennt behandeln: ${N(revenue / 1e6, lang)} Mio. ÷ ${N(heads / 1000, lang)} Tsd. = ${N(revenue / 1e6 / (heads / 1000), lang)} Tsd.`, `= ${B(perHead)}`]
      }
      const value = ops[0] === '*' ? terms[0] * terms[1] : terms[0] / terms[1]
      return numericMcq(this, seed, d, lang, rng, {
        prompt,
        query: { family: 'arith', terms, ops },
        value: roundTo(value, 6),
        decimals: 0,
        format: B,
        exact: true,
        minGapRel: 0.5,
        distractors: [
          { value: value * 10, tag: 'zeros', why: 'Eine Null zu viel.' },
          { value: value / 10, tag: 'zeros', why: 'Eine Null zu wenig.' },
          { value: value * 1000, tag: 'units', why: 'Einheit verwechselt (Tausend/Million).' },
          { value: value / 1000, tag: 'units', why: 'Einheit verwechselt (Tausend/Million).' },
          { value: value * 100, tag: 'zeros', why: 'Zwei Nullen zu viel.' },
        ],
        steps,
        shortcut: 'Ziffern und Zehnerpotenzen getrennt rechnen: erst die „Kernzahlen“, dann die Nullen zählen (Tsd. = 10³, Mio. = 10⁶, Mrd. = 10⁹).',
      })
    })
  },
}
