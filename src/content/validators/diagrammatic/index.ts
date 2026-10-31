/**
 * Independent solver for flow charts: tries every assignment of library
 * operations to the operator symbols that is consistent with the legend and
 * all example rows, then evaluates the question for each assignment.
 */
import type { FlowRow, FlowSpec } from '../../generators/diagrammatic/flow'
import type { PublicItem } from '../../types'
import { fail, mcq, type Validation } from '../result'

type Op = (s: string) => string
const shift = (s: string, k: number) => [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + k)).join('')

/** Library of candidate operations, keyed by a meaning test. */
const LIB: { id: string; f: Op; matches: (meaning: string) => boolean }[] = [
  { id: 'rev', f: (s) => [...s].reverse().join(''), matches: (m) => /reverse|umkehren/i.test(m) },
  { id: 'swapEnds', f: (s) => s[3] + s[1] + s[2] + s[0], matches: (m) => /first and the last|erstes und letztes/i.test(m) },
  { id: 'swapMid', f: (s) => s[0] + s[2] + s[1] + s[3], matches: (m) => /middle|mittleren/i.test(m) },
  { id: 'rotL', f: (s) => s.slice(1) + s[0], matches: (m) => /first element to the end|erstes Element ans Ende/i.test(m) },
  { id: 'rotR', f: (s) => s[3] + s.slice(0, 3), matches: (m) => /last element to the front|letztes Element an den Anfang/i.test(m) },
  { id: 'inc', f: (s) => shift(s, 1), matches: (m) => /next letter|nächsten/i.test(m) },
  { id: 'dec', f: (s) => shift(s, -1), matches: (m) => /previous letter|vorherigen/i.test(m) },
  { id: 'swapPairs', f: (s) => s[1] + s[0] + s[3] + s[2], matches: (m) => /1st↔2nd|1\.↔2\./i.test(m) },
]

function* assignments(symbols: string[], legend: FlowSpec['legend']): Generator<Map<string, Op>> {
  const fixed = new Map<string, Op[]>()
  for (const l of legend) fixed.set(l.symbol, LIB.filter((x) => x.matches(l.meaning)).map((x) => x.f))
  const rec = function* (i: number, acc: Map<string, Op>, usedIds: Set<Op>): Generator<Map<string, Op>> {
    if (i === symbols.length) {
      yield new Map(acc)
      return
    }
    const sym = symbols[i]
    const cands = fixed.get(sym) ?? LIB.map((x) => x.f)
    for (const f of cands) {
      if (usedIds.has(f)) continue // different symbols mean different operations
      acc.set(sym, f)
      usedIds.add(f)
      yield* rec(i + 1, acc, usedIds)
      usedIds.delete(f)
      acc.delete(sym)
    }
  }
  yield* rec(0, new Map(), new Set())
}

const run = (row: FlowRow, a: Map<string, Op>, missing?: Op): string =>
  row.ops.reduce<string>((acc, s) => (s === null ? (missing as Op)(acc) : (a.get(s) as Op)(acc)), row.input.join(''))

/** Returns the indices of options consistent with every admissible assignment. */
export function solveFlow(spec: FlowSpec, options: string[], ask: 'output' | 'missing'): number[] {
  const consistent: Map<string, Op>[] = []
  for (const a of assignments(spec.symbols, spec.legend)) {
    if (spec.examples.every((ex) => ex.output !== null && run(ex, a) === ex.output.join(''))) consistent.push(a)
  }
  if (consistent.length === 0) return []
  if (ask === 'output') {
    const outs = new Set(consistent.map((a) => run(spec.question, a)))
    if (outs.size !== 1) return []
    const out = [...outs][0]
    return options.map((o, i) => (o === out ? i : -1)).filter((i) => i >= 0)
  }
  // missing operator: options are symbols
  const target = (spec.question.output as string[]).join('')
  return options
    .map((sym, i) => (consistent.every((a) => run(spec.question, a, a.get(sym)) === target) ? i : -1))
    .filter((i) => i >= 0)
}

export function validateDiagrammatic(item: PublicItem): Validation {
  if (item.type !== 'mcq') return fail('not mcq')
  const ex = item.exhibits[0]
  if (!ex || ex.kind !== 'flow') return fail('missing flow exhibit')
  const ask = (item.query as { ask?: string } | undefined)?.ask
  if (ask !== 'output' && ask !== 'missing') return fail('unknown ask')
  const hits = solveFlow(
    ex.flow,
    item.options.map((o) => o.text),
    ask,
  )
  return hits.length === 1 ? mcq(hits[0]) : fail(`${hits.length} options consistent`)
}
