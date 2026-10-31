/** Aon (cut-e) style games used in the P&G Interactive Assessment: Switch, Digit, Grid. */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { DigitItem, GridItem, McqItem } from '../../types'
import type { DigitEquation, DigitToken } from './digitTypes'
import type { GridJudgement } from './gridTypes'
import type { SwitchSymbol } from './switchTypes'

// ------------------------------------------------------------------ switch

const SYMS: SwitchSymbol[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'cross']
const SYM_DE: Record<SwitchSymbol, string> = { circle: 'Kreis', square: 'Quadrat', triangle: 'Dreieck', diamond: 'Raute', star: 'Stern', cross: 'Kreuz' }

/** Code c (1-based): output[i] = input[c[i] - 1]. */
const applyCode = <T>(row: T[], code: number[]) => code.map((c) => row[c - 1])
const codeText = (c: number[]) => c.join('')

function allCodes(): number[][] {
  const out: number[][] = []
  const rec = (acc: number[]) => {
    if (acc.length === 4) return void out.push(acc.slice())
    for (let i = 1; i <= 4; i++) if (!acc.includes(i)) rec([...acc, i])
  }
  rec([])
  return out
}
const CODES = allCodes()
const isIdentity = (c: number[]) => c.every((x, i) => x === i + 1)

function inverse(c: number[]): number[] {
  const inv = [0, 0, 0, 0]
  c.forEach((x, i) => (inv[x - 1] = i + 1))
  return inv
}

export const switchChallenge: GeneratorDef = {
  id: 'aon.switch',
  version: 1,
  category: 'aon',
  title: 'Switch Challenge',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const input = rng.sample(SYMS, 4)
      const nSwitches = d === 1 ? 1 : d === 2 ? 2 : 3
      const codes = Array.from({ length: nSwitches }, () => rng.pick(CODES.filter((c) => !isIdentity(c))))
      const missing = d === 1 ? 0 : rng.int(0, nSwitches - 1)
      let row = input
      const rows = [input]
      for (const c of codes) {
        row = applyCode(row, c)
        rows.push(row)
      }
      const target = codes[missing]
      // Distractors: inverse permutation (the classic mix-up), reversed code, one swap away.
      const cands: { c: number[]; why: string }[] = [
        { c: inverse(target), why: 'Umkehrung verwechselt: Der Code beschreibt, WOHER das Symbol kommt, nicht WOHIN es geht.' },
        { c: target.slice().reverse(), why: 'Code rückwärts gelesen.' },
      ]
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++) {
          const s = target.slice()
          ;[s[i], s[j]] = [s[j], s[i]]
          cands.push({ c: s, why: `Zwei Positionen (${i + 1} und ${j + 1}) vertauscht.` })
        }
      const opts: { c: number[]; why: string }[] = [{ c: target, why: '' }]
      for (const x of rng.shuffle(cands.slice(2)).concat(cands.slice(0, 2)).reverse()) {
        if (opts.length >= 5) break
        if (opts.some((o) => codeText(o.c) === codeText(x.c))) continue
        // Must not produce the same output (would make two options right).
        const test = codes.map((c, i) => (i === missing ? x.c : c)).reduce((r, c) => applyCode(r, c), input)
        if (test.join() === rows[rows.length - 1].join()) continue
        opts.push(x)
      }
      if (opts.length < 5) return null
      const shuffled = rng.shuffle(opts)
      const correct = shuffled.findIndex((o) => codeText(o.c) === codeText(target))
      const name = (s: SwitchSymbol) => (lang === 'de' ? SYM_DE[s] : s)
      const before = rows[missing]
      const after = rows[missing + 1]
      const traced = after.map((s, i) => `Position ${i + 1}: ${SYM_DE[s]} stand vorher an Position ${before.indexOf(s) + 1}`)
      const item: McqItem = {
        ...core(this, seed, d, lang),
        type: 'mcq',
        exhibits: [{ kind: 'switch', spec: { input, switches: codes.map((c, i) => (i === missing ? null : c)), output: rows[rows.length - 1] } }],
        prompt: tr(lang, 'Which code belongs in the empty operator?', 'Welcher Code gehört in den leeren Operator?'),
        query: { family: 'switch' },
        options: shuffled.map((o) => ({ text: codeText(o.c) })),
        correct,
        explanation: {
          steps: [
            ...(nSwitches > 1 ? [`Zwischenstand vor dem leeren Operator: ${before.map(name).join(' · ')}; danach muss stehen: ${after.map(name).join(' · ')}.`] : []),
            ...traced,
            `Code = **${codeText(target)}**`,
          ],
          distractors: shuffled.map((o, i) => ({ o, i })).filter(({ i }) => i !== correct).map(({ o, i }) => `**${String.fromCharCode(65 + i)}** (${codeText(o.c)}): ${o.why}`),
          shortcut: 'Nicht alle vier Symbole verfolgen: Ein Symbol reicht oft, um drei Optionen zu streichen (z. B. „das erste Ausgangssymbol stand an Position 3 → Code beginnt mit 3“).',
        },
      }
      return item
    })
  },
}

// ------------------------------------------------------------------- digit

const slot: DigitToken = { t: 'slot' }
const op = (o: '+' | '-' | '*'): DigitToken => ({ t: 'op', op: o })

/** Evaluate tokens with standard precedence; slots are filled from `digits` in order. */
export function evalTokens(tokens: DigitToken[], digits: number[], start = 0): { value: number; used: number } {
  const vals: number[] = []
  const ops: string[] = []
  let k = start
  for (const t of tokens) {
    if (t.t === 'slot') vals.push(digits[k++])
    else if (t.t === 'num') vals.push(t.v)
    else ops.push(t.op)
  }
  const terms = [vals[0]]
  const addOps: string[] = []
  ops.forEach((o, i) => {
    if (o === '*') terms[terms.length - 1] *= vals[i + 1]
    else {
      addOps.push(o)
      terms.push(vals[i + 1])
    }
  })
  const value = terms.slice(1).reduce((acc, x, i) => (addOps[i] === '+' ? acc + x : acc - x), terms[0])
  return { value, used: k - start }
}

const TEMPLATES: Record<1 | 2 | 3, DigitToken[][]> = {
  1: [
    [slot, op('+'), slot],
    [slot, op('*'), slot],
    [slot, op('-'), slot],
  ],
  2: [
    [slot, op('+'), slot, op('-'), slot],
    [slot, op('*'), slot, op('+'), slot],
    [slot, op('*'), slot, op('-'), slot],
  ],
  3: [
    [slot, op('*'), slot, op('-'), slot, op('+'), slot],
    [slot, op('+'), slot, op('*'), slot, op('-'), slot],
    [slot, op('*'), slot, op('+'), slot, op('*'), slot],
  ],
}

export const digitChallenge: GeneratorDef = {
  id: 'aon.digit',
  version: 1,
  category: 'aon',
  title: 'Digit Challenge',
  types: ['digit'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const both = d === 3 && rng.chance(0.3)
      let eq: DigitEquation
      let sample: number[]
      if (both) {
        // _ + _ = _ × _  (no result given)
        const digits = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)
        if (digits[0] + digits[1] !== digits[2] * digits[3]) return null
        eq = { lhs: [slot, op('+'), slot], rhs: [slot, op('*'), slot] }
        sample = digits
      } else {
        const tpl = rng.pick(TEMPLATES[d])
        const n = tpl.filter((t) => t.t === 'slot').length
        const digits = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n)
        const { value } = evalTokens(tpl, digits)
        if (value < 1) return null
        eq = { lhs: tpl, rhs: [{ t: 'num', v: value }] }
        sample = digits
      }
      const show = (toks: DigitToken[], ds?: number[]) => {
        let k = 0
        return toks.map((t) => (t.t === 'slot' ? (ds ? String(ds[k++]) : '□') : t.t === 'num' ? String(t.v) : t.op === '*' ? '×' : t.op === '-' ? '−' : '+')).join(' ')
      }
      const nl = eq.lhs.filter((t) => t.t === 'slot').length
      const item: DigitItem = {
        ...core(this, seed, d, lang),
        type: 'digit',
        exhibits: [],
        prompt: tr(lang, 'Fill in the boxes with digits 1–9 (each digit at most once) so that the equation is correct.', 'Fülle die Kästchen mit den Ziffern 1–9 (jede Ziffer höchstens einmal), sodass die Gleichung stimmt.'),
        hint: tr(lang, 'Multiplication before addition/subtraction.', 'Punkt vor Strich.'),
        query: { family: 'digit' },
        equation: eq,
        sample,
        explanation: {
          steps: [`Eine mögliche Lösung: ${show(eq.lhs, sample.slice(0, nl))} = ${show(eq.rhs, sample.slice(nl))}`, 'Jede andere Belegung, die die Gleichung erfüllt und keine Ziffer doppelt verwendet, zählt ebenfalls als richtig.'],
          shortcut: 'Mit dem restriktivsten Teil beginnen: Bei Produkten zuerst Teiler des Ergebnisses suchen, große Ergebnisse brauchen große Faktoren. Danach mit den Plus/Minus-Lücken feinjustieren.',
        },
      }
      return item
    })
  },
}

// -------------------------------------------------------------------- grid

const SYM_SIZE = 6
const ROT_SIZE = 4

function rotate(cells: number[], size: number): number[] {
  // 90° clockwise: (r, c) → (c, size-1-r)
  return cells.map((x) => {
    const r = Math.floor(x / size)
    const c = x % size
    return c * size + (size - 1 - r)
  })
}
function mirror(cells: number[], size: number): number[] {
  return cells.map((x) => Math.floor(x / size) * size + (size - 1 - (x % size)))
}
function normalize(cells: number[], size: number): string {
  const rs = cells.map((x) => Math.floor(x / size))
  const cs = cells.map((x) => x % size)
  const r0 = Math.min(...rs)
  const c0 = Math.min(...cs)
  return cells
    .map((x) => (Math.floor(x / size) - r0) * size + ((x % size) - c0))
    .sort((a, b) => a - b)
    .join(',')
}
function rotations(cells: number[], size: number): string[] {
  const out: string[] = []
  let cur = cells
  for (let i = 0; i < 4; i++) {
    out.push(normalize(cur, size))
    cur = rotate(cur, size)
  }
  return out
}

function symmetryTask(rng: Rng): GridJudgement {
  const half = SYM_SIZE / 2
  const cells = new Set<number>()
  for (let r = 0; r < SYM_SIZE; r++)
    for (let c = 0; c < half; c++)
      if (rng.chance(0.4)) {
        cells.add(r * SYM_SIZE + c)
        cells.add(r * SYM_SIZE + (SYM_SIZE - 1 - c))
      }
  const symmetric = rng.chance(0.5)
  if (!symmetric) {
    // Break symmetry with one or two flips of DIFFERENT cells on the right half.
    const right: number[] = []
    for (let r = 0; r < SYM_SIZE; r++) for (let c = half; c < SYM_SIZE; c++) right.push(r * SYM_SIZE + c)
    for (const x of rng.sample(right, rng.int(1, 2))) {
      if (cells.has(x)) cells.delete(x)
      else cells.add(x)
    }
  }
  return { kind: 'symmetry', size: SYM_SIZE, cells: [...cells].sort((a, b) => a - b), answer: symmetric }
}

function rotationTask(rng: Rng): GridJudgement | null {
  const cells = rng.sample(
    Array.from({ length: ROT_SIZE * ROT_SIZE }, (_, i) => i),
    rng.int(5, 7),
  )
  // Chiral shapes only (a mirror image must not equal any rotation).
  const rots = rotations(cells, ROT_SIZE)
  if (rots.includes(normalize(mirror(cells, ROT_SIZE), ROT_SIZE))) return null
  const same = rng.chance(0.5)
  let b = cells
  for (let i = 0; i < rng.int(1, 3); i++) b = rotate(b, ROT_SIZE)
  if (!same) b = mirror(b, ROT_SIZE)
  return { kind: 'rotation', size: ROT_SIZE, a: cells.slice().sort((x, y) => x - y), b: b.slice().sort((x, y) => x - y), answer: same }
}

export const gridChallenge: GeneratorDef = {
  id: 'aon.grid',
  version: 1,
  category: 'aon',
  title: 'Grid Challenge',
  types: ['grid'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const n = d === 1 ? 3 : d === 2 ? 4 : 5
      const dots = rng.sample(
        Array.from({ length: 16 }, (_, i) => i),
        n,
      )
      const judgements: GridJudgement[] = []
      for (let i = 0; i < n; i++) {
        const j = rng.chance(0.5) ? symmetryTask(rng) : rotationTask(rng)
        if (!j) return null
        judgements.push(j)
      }
      const cellName = (x: number) => `${'ABCD'[x % 4]}${Math.floor(x / 4) + 1}`
      const item: GridItem = {
        ...core(this, seed, d, lang),
        type: 'grid',
        exhibits: [],
        prompt: tr(lang, 'Remember the position of each dot. In between, answer the quick judgement tasks. At the end, tap the dots in the order they appeared.', 'Merke dir die Position jedes Punktes. Dazwischen beantwortest du kurze Urteilsaufgaben. Am Ende tippst du die Punkte in der richtigen Reihenfolge an.'),
        query: { family: 'grid' },
        round: { dots, judgements },
        explanation: {
          steps: [
            `Reihenfolge der Punkte: ${dots.map(cellName).join(' → ')} (Spalte A–D, Zeile 1–4).`,
            ...judgements.map((j, i) =>
              j.kind === 'symmetry'
                ? `Urteil ${i + 1}: Das Muster ist ${j.answer ? 'spiegelsymmetrisch zur senkrechten Achse' : 'NICHT symmetrisch'}.`
                : `Urteil ${i + 1}: Die rechte Figur ist ${j.answer ? 'dieselbe Figur, nur gedreht' : 'gespiegelt – also eine andere Figur'}.`,
            ),
          ],
          shortcut: 'Positionen verbal kodieren („oben links, Mitte rechts …“) oder als Schachkoordinaten (A1, C3) – sprachliches Merken wird von den räumlichen Zwischenaufgaben weniger gestört. Bei mehreren Punkten Chunks bilden (z. B. eine Linie, ein „L“).',
        },
      }
      return item
    })
  },
}

export { applyCode, inverse }
