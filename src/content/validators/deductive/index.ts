/**
 * Independent brute-force solvers for Deductive Reasoning:
 * - syllogisms: enumerate all Venn models (bitmask over regions),
 * - ordering/seating: enumerate all permutations,
 * - propositional rules: full truth tables.
 */
import type { PublicItem } from '../../types'
import { fail, mcq, type Validation } from '../result'

// ------------------------------------------------------------- syllogisms

export type Quant = 'all' | 'some' | 'no' | 'someNot'
export interface Cat {
  q: Quant
  a: number
  b: number
}

/** Bitmask of regions (over k sets, region r ⊂ sets by bits of r, r ≥ 1). */
function regionMask(k: number, pred: (r: number) => boolean): number {
  let m = 0
  for (let r = 1; r < 1 << k; r++) if (pred(r)) m |= 1 << r
  return m
}

interface Compiled {
  q: Quant
  aNotB: number
  aAndB: number
}

function compile(k: number, s: Cat): Compiled {
  const inA = (r: number) => (r >> s.a) & 1
  const inB = (r: number) => (r >> s.b) & 1
  return {
    q: s.q,
    aNotB: regionMask(k, (r) => !!inA(r) && !inB(r)),
    aAndB: regionMask(k, (r) => !!inA(r) && !!inB(r)),
  }
}

function holds(model: number, s: Compiled): boolean {
  switch (s.q) {
    case 'all':
      return (model & s.aNotB) === 0
    case 'no':
      return (model & s.aAndB) === 0
    case 'some':
      return (model & s.aAndB) !== 0
    case 'someNot':
      return (model & s.aNotB) !== 0
  }
}

/** Does `c` follow from `premises` over k sets? `existential`: every set is non-empty. */
export function follows(k: number, premises: Cat[], c: Cat, existential: boolean): boolean {
  const nonEmpty = Array.from({ length: k }, (_, i) => regionMask(k, (r) => !!((r >> i) & 1)))
  const ps = premises.map((p) => compile(k, p))
  const cc = compile(k, c)
  let anyModel = false
  for (let model = 0; model < 1 << (1 << k); model += 2) {
    // bit 0 (region 0 = outside all sets) is irrelevant → only even masks.
    if (existential && nonEmpty.some((m) => (model & m) === 0)) continue
    if (!ps.every((p) => holds(model, p))) continue
    anyModel = true
    if (!holds(model, cc)) return false
  }
  return anyModel
}

function validateSyllogism(item: PublicItem, q: Record<string, unknown>): Validation {
  const k = q.sets as number
  const premises = q.premises as Cat[]
  const options = q.options as Cat[]
  if (item.type !== 'mcq' || options.length !== item.options.length) return fail('syllogism option mismatch')
  const ok: number[] = []
  for (let i = 0; i < options.length; i++) {
    const strict = follows(k, premises, options[i], false)
    const exist = follows(k, premises, options[i], true)
    if (strict !== exist) return fail(`option ${i} depends on existential import`)
    if (strict) ok.push(i)
  }
  return ok.length === 1 ? mcq(ok[0]) : fail(`${ok.length} conclusions follow`)
}

// --------------------------------------------------- orderings and seating

export type Clue =
  | { t: 'before'; a: number; b: number }
  | { t: 'justBefore'; a: number; b: number }
  | { t: 'pos'; a: number; k: number }
  | { t: 'notPos'; a: number; k: number }
  | { t: 'adjacent'; a: number; b: number }
  | { t: 'notAdjacent'; a: number; b: number }
  | { t: 'gap'; a: number; b: number; n: number }
  | { t: 'notEnd'; a: number }

export type Fact =
  | { t: 'at'; a: number; k: number }
  | { t: 'before'; a: number; b: number }
  | { t: 'adjacent'; a: number; b: number }
  | { t: 'justBefore'; a: number; b: number }

function* permutations(n: number): Generator<number[]> {
  const a = Array.from({ length: n }, (_, i) => i)
  const c = new Array(n).fill(0)
  yield a.slice()
  let i = 0
  while (i < n) {
    if (c[i] < i) {
      const j = i % 2 === 0 ? 0 : c[i]
      ;[a[j], a[i]] = [a[i], a[j]]
      yield a.slice()
      c[i]++
      i = 0
    } else {
      c[i] = 0
      i++
    }
  }
}

/** pos[p] = position (0-based) of person p. */
function dist(pa: number, pb: number, n: number, circular: boolean): number {
  const d = Math.abs(pa - pb)
  return circular ? Math.min(d, n - d) : d
}

export function clueHolds(c: Clue, pos: number[], circular: boolean): boolean {
  const n = pos.length
  switch (c.t) {
    case 'before':
      return pos[c.a] < pos[c.b]
    case 'justBefore':
      return circular ? (pos[c.a] + 1) % n === pos[c.b] : pos[c.a] + 1 === pos[c.b]
    case 'pos':
      return pos[c.a] === c.k
    case 'notPos':
      return pos[c.a] !== c.k
    case 'adjacent':
      return dist(pos[c.a], pos[c.b], n, circular) === 1
    case 'notAdjacent':
      return dist(pos[c.a], pos[c.b], n, circular) !== 1
    case 'gap':
      return dist(pos[c.a], pos[c.b], n, circular) === c.n + 1
    case 'notEnd':
      return pos[c.a] !== 0 && pos[c.a] !== n - 1
  }
}

export function factHolds(f: Fact, pos: number[], circular: boolean): boolean {
  const n = pos.length
  switch (f.t) {
    case 'at':
      return pos[f.a] === f.k
    case 'before':
      return pos[f.a] < pos[f.b]
    case 'adjacent':
      return dist(pos[f.a], pos[f.b], n, circular) === 1
    case 'justBefore':
      return circular ? (pos[f.a] + 1) % n === pos[f.b] : pos[f.a] + 1 === pos[f.b]
  }
}

/** All position vectors satisfying the clues. */
export function solveOrdering(n: number, clues: Clue[], circular: boolean): number[][] {
  const out: number[][] = []
  for (const order of permutations(n)) {
    // order[k] = person at position k → invert to pos[]
    const pos = new Array(n)
    order.forEach((p, k) => (pos[p] = k))
    if (clues.every((c) => clueHolds(c, pos, circular))) out.push(pos)
  }
  return out
}

function validateOrdering(item: PublicItem, q: Record<string, unknown>): Validation {
  const n = q.n as number
  const circular = q.circular as boolean
  const sols = solveOrdering(n, q.clues as Clue[], circular)
  if (sols.length === 0) return fail('no arrangement satisfies the clues')
  if (item.type !== 'mcq') return fail('not mcq')
  const ask = q.ask as Record<string, unknown>
  if (ask.t === 'whoAt') {
    const k = ask.k as number
    const people = new Set(sols.map((pos) => pos.indexOf(k)))
    if (people.size !== 1) return fail('position not determined')
    const who = [...people][0]
    const idx = (q.optionPeople as number[]).indexOf(who)
    return idx >= 0 ? mcq(idx) : fail('answer not among options')
  }
  if (ask.t === 'whereIs') {
    const a = ask.a as number
    const ks = new Set(sols.map((pos) => pos[a]))
    if (ks.size !== 1) return fail('position not determined')
    const idx = (q.optionPositions as number[]).indexOf([...ks][0])
    return idx >= 0 ? mcq(idx) : fail('answer not among options')
  }
  if (ask.t === 'must') {
    const facts = q.optionFacts as Fact[]
    const ok = facts.map((f, i) => (sols.every((pos) => factHolds(f, pos, circular)) ? i : -1)).filter((i) => i >= 0)
    return ok.length === 1 ? mcq(ok[0]) : fail(`${ok.length} statements must be true`)
  }
  if (ask.t === 'tfc') {
    const f = ask.fact as Fact
    const vals = new Set(sols.map((pos) => factHolds(f, pos, circular)))
    // Options are fixed: 0 = True, 1 = False, 2 = Cannot say.
    return mcq(vals.size === 2 ? 2 : vals.has(true) ? 0 : 1)
  }
  return fail('unknown ask')
}

// ------------------------------------------------- propositional rules

export type Lit = { v: number; neg: boolean }
export type Prop =
  | { t: 'lit'; l: Lit }
  | { t: 'if'; a: Lit; b: Lit }
  | { t: 'or'; a: Lit; b: Lit }
  | { t: 'and'; a: Lit; b: Lit }
  | { t: 'notBoth'; a: Lit; b: Lit }

const litVal = (l: Lit, m: number) => (((m >> l.v) & 1) === 1) !== l.neg

export function propHolds(p: Prop, m: number): boolean {
  switch (p.t) {
    case 'lit':
      return litVal(p.l, m)
    case 'if':
      return !litVal(p.a, m) || litVal(p.b, m)
    case 'or':
      return litVal(p.a, m) || litVal(p.b, m)
    case 'and':
      return litVal(p.a, m) && litVal(p.b, m)
    case 'notBoth':
      return !(litVal(p.a, m) && litVal(p.b, m))
  }
}

export function entails(vars: number, premises: Prop[], c: Prop): boolean {
  let any = false
  for (let m = 0; m < 1 << vars; m++) {
    if (!premises.every((p) => propHolds(p, m))) continue
    any = true
    if (!propHolds(c, m)) return false
  }
  return any
}

function validateRules(item: PublicItem, q: Record<string, unknown>): Validation {
  const vars = q.vars as number
  const premises = q.premises as Prop[]
  const options = q.options as Prop[]
  if (item.type !== 'mcq' || options.length !== item.options.length) return fail('rules option mismatch')
  const ok = options.map((o, i) => (entails(vars, premises, o) ? i : -1)).filter((i) => i >= 0)
  return ok.length === 1 ? mcq(ok[0]) : fail(`${ok.length} options follow`)
}

export function validateDeductive(item: PublicItem): Validation {
  const q = item.query as Record<string, unknown> | undefined
  if (!q) return fail('missing query')
  switch (q.family) {
    case 'syllogism':
      return validateSyllogism(item, q)
    case 'ordering':
      return validateOrdering(item, q)
    case 'rules':
      return validateRules(item, q)
    default:
      return fail(`unknown deductive family ${String(q.family)}`)
  }
}
