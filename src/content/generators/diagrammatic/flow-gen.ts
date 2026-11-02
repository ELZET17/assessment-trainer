/**
 * Diagrammatic reasoning: strings of 4 letters pass through operator boxes.
 * Level 1: legend given, find the output. Level 2: legend given, find the
 * missing operator. Level 3: no legend – infer operators from examples.
 */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { McqItem } from '../../types'
import { solveFlow } from '../../validators/diagrammatic'
import type { FlowRow, FlowSpec } from './flow'

type OpId = 'rev' | 'swapEnds' | 'swapMid' | 'rotL' | 'rotR' | 'inc' | 'dec' | 'swapPairs'

const OPS: Record<OpId, { f: (s: string[]) => string[]; en: string; de: string }> = {
  rev: { f: (s) => s.slice().reverse(), en: 'reverse the order', de: 'Reihenfolge umkehren' },
  swapEnds: { f: (s) => [s[3], s[1], s[2], s[0]], en: 'swap the first and the last element', de: 'erstes und letztes Element tauschen' },
  swapMid: { f: (s) => [s[0], s[2], s[1], s[3]], en: 'swap the two middle elements', de: 'die beiden mittleren Elemente tauschen' },
  rotL: { f: (s) => [s[1], s[2], s[3], s[0]], en: 'move the first element to the end', de: 'erstes Element ans Ende stellen' },
  rotR: { f: (s) => [s[3], s[0], s[1], s[2]], en: 'move the last element to the front', de: 'letztes Element an den Anfang stellen' },
  inc: { f: (s) => s.map((c) => String.fromCharCode(c.charCodeAt(0) + 1)), en: 'replace each letter by the next letter of the alphabet', de: 'jeden Buchstaben durch den nächsten im Alphabet ersetzen' },
  dec: { f: (s) => s.map((c) => String.fromCharCode(c.charCodeAt(0) - 1)), en: 'replace each letter by the previous letter of the alphabet', de: 'jeden Buchstaben durch den vorherigen im Alphabet ersetzen' },
  swapPairs: { f: (s) => [s[1], s[0], s[3], s[2]], en: 'swap 1st↔2nd and 3rd↔4th', de: '1.↔2. und 3.↔4. Element tauschen' },
}

const SYMBOLS = ['■', '●', '▲', '◆', '★', '✚']

function randomWord(rng: Rng): string[] {
  // Letters C–W so that ±1 never leaves the alphabet; 4 distinct letters.
  return rng.sample('CDEFGHJKLMNPQRSTUVW'.split(''), 4)
}

const apply = (s: string[], ops: OpId[]) => ops.reduce((acc, o) => OPS[o].f(acc), s)
const word = (s: string[]) => s.join('')

export const flowchart: GeneratorDef = {
  id: 'diag.flow',
  version: 1,
  category: 'diagrammatic',
  title: 'Flussdiagramme & Operatoren',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const opIds = Object.keys(OPS) as OpId[]
      const used = rng.sample(opIds, d === 1 ? 4 : d === 2 ? 5 : 3)
      const symbols = rng.sample(SYMBOLS, used.length)
      const symOf = (o: OpId) => symbols[used.indexOf(o)]
      const meaning = (o: OpId) => (lang === 'de' ? OPS[o].de : OPS[o].en)
      const legend = d === 3 ? [] : used.map((o) => ({ symbol: symOf(o), meaning: meaning(o) }))
      const input = randomWord(rng)
      if (d === 1 || d === 3) {
        const chain = d === 1 ? rng.sample(used, 2) : rng.shuffle(used).slice(0, rng.int(2, 3))
        const out = apply(input, chain)
        const examples: FlowRow[] = []
        if (d === 3) {
          // Each operator appears alone or in a pair in the examples.
          for (const o of used) {
            const w = randomWord(rng)
            examples.push({ input: w, ops: [symOf(o)], output: apply(w, [o]) })
          }
          if (rng.chance(0.5)) {
            // Replace one single-op example by a two-op example to require combination.
            const w = randomWord(rng)
            const pair = rng.sample(used, 2)
            examples[0] = { input: w, ops: pair.map(symOf), output: apply(w, pair) }
          }
        }
        const question: FlowRow = { input, ops: chain.map(symOf), output: null }
        const spec: FlowSpec = { examples: rng.shuffle(examples), question, legend, symbols }
        // Distractors: realistic slips.
        const cands: { w: string[]; why: string }[] = [
          { w: apply(input, chain.slice().reverse()), why: 'Operatoren in falscher Reihenfolge angewendet.' },
          { w: apply(input, chain.slice(1)), why: 'Den ersten Operator vergessen.' },
          { w: apply(input, chain.slice(0, -1)), why: 'Den letzten Operator vergessen.' },
          { w: out.slice().reverse(), why: 'Ergebnis spiegelverkehrt notiert.' },
          ...opIds.filter((o) => !chain.includes(o)).map((o) => ({ w: apply(input, [...chain.slice(0, -1), o]), why: `Letzten Operator mit „${meaning(o)}“ verwechselt.` })),
        ]
        const opts: { w: string; why: string }[] = [{ w: word(out), why: '' }]
        for (const c of cands) if (!opts.some((x) => x.w === word(c.w)) && opts.length < 5) opts.push({ w: word(c.w), why: c.why })
        if (opts.length < 5) return null
        const shuffled = rng.shuffle(opts)
        const correct = shuffled.findIndex((x) => x.w === word(out))
        const sol = solveFlow(spec, shuffled.map((x) => x.w), 'output')
        if (sol.length !== 1 || sol[0] !== correct) return null
        const steps: string[] = []
        if (d === 3) {
          for (const o of used) steps.push(`${symOf(o)} = ${OPS[o].de} (aus den Beispielen ablesbar).`)
        }
        let cur = input
        for (const o of chain) {
          const next = OPS[o].f(cur)
          steps.push(`${word(cur)} → ${symOf(o)} (${OPS[o].de}) → ${word(next)}`)
          cur = next
        }
        const item: McqItem = {
          ...core(this, seed, d, lang),
          type: 'mcq',
          exhibits: [{ kind: 'flow', flow: spec }],
          prompt: spec.examples.length ? tr(lang, 'What is the output of the last row?', 'Was kommt in der letzten Zeile heraus?') : tr(lang, 'What is the output?', 'Was kommt am Ende heraus?'),
          query: { family: 'flow', ask: 'output' },
          options: shuffled.map((x) => ({ text: x.w })),
          correct,
          explanation: {
            steps,
            distractors: shuffled.map((x, i) => ({ x, i })).filter(({ i }) => i !== correct).map(({ x, i }) => `**${String.fromCharCode(65 + i)}** (${x.w}): ${x.why}`),
            shortcut:
              d === 3
                ? 'Erst die Beispiele mit nur EINEM Operator entschlüsseln, dann Kombinationen. Positionsoperatoren erkennt man daran, dass dieselben Buchstaben nur umsortiert werden; Buchstabenoperatoren verändern die Buchstaben selbst.'
                : 'Zwischenergebnis nach jedem Kasten kurz notieren – im Kopf vertauscht man sonst leicht Positionen.',
          },
        }
        return item
      }
      // d2: missing operator, legend given.
      const chain = rng.sample(used, 3)
      const missingAt = rng.int(0, 2)
      const out = apply(input, chain)
      const question: FlowRow = { input, ops: chain.map((o, i) => (i === missingAt ? null : symOf(o))), output: out }
      const spec: FlowSpec = { examples: [], question, legend, symbols }
      const optionOps = used
      const sol = solveFlow(spec, optionOps.map(symOf), 'missing')
      if (sol.length !== 1) return null
      const correct = optionOps.indexOf(chain[missingAt])
      if (sol[0] !== correct) return null
      let cur = input
      const steps = chain.map((o, i) => {
        const next = OPS[o].f(cur)
        const s = `${word(cur)} → ${i === missingAt ? `? = ${symOf(o)}` : symOf(o)} (${OPS[o].de}) → ${word(next)}`
        cur = next
        return s
      })
      return {
        ...core(this, seed, d, lang),
        type: 'mcq' as const,
        exhibits: [{ kind: 'flow' as const, flow: spec }],
        prompt: tr(lang, 'Which operator replaces the question mark?', 'Welcher Operator ersetzt das Fragezeichen?'),
        query: { family: 'flow', ask: 'missing' },
        options: optionOps.map((o) => ({ text: `${symOf(o)}` })),
        correct,
        explanation: {
          steps: [...steps, `Nur ${symOf(chain[missingAt])} führt zum angegebenen Ergebnis.`],
          distractors: optionOps.filter((o) => o !== chain[missingAt]).map((o) => `${symOf(o)} (${OPS[o].de}): führt zu einem anderen Ergebnis.`),
          shortcut: 'Von beiden Seiten rechnen: vorwärts bis zum Fragezeichen, rückwärts vom Ergebnis bis zum Fragezeichen. Dann nur noch den Operator suchen, der die beiden Zwischenstände verbindet.',
        },
      }
    })
  },
}
