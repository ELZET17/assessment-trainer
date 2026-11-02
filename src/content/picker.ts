/**
 * Item selection for all modes: random seeds for generators, sampling without
 * replacement for banks, adaptive difficulty and weakness-weighted mixes.
 */
import { CRITICAL_IDS, criticalDifficulty, VERBAL_IDS, verbalDifficulty } from './banks'
import { CRITICAL } from './banks/critical'
import { VERBAL } from './banks/verbal'
import { contentKey, resolveItem } from './items'
import type { MixEntry } from './profiles'
import { GENERATORS, getGenerator } from './registry'
import { createRng, randomSeed, type Rng } from './rng'
import { refKey, type CategoryId, type Difficulty, type ItemRef } from './types'

export type DifficultyChoice = Difficulty | 'adaptive'

/**
 * Staircase from `start` over the answer history: 2 correct in a row → one level
 * harder, 1 wrong → one level easier. The run of correct answers starts again after
 * every level change, so each step up needs two fresh correct answers.
 */
export function adaptiveLevel(start: Difficulty, history: boolean[]): Difficulty {
  let level = start
  let run = 0
  for (const ok of history) {
    if (!ok) {
      level = Math.max(1, level - 1) as Difficulty
      run = 0
    } else if (++run === 2) {
      level = Math.min(3, level + 1) as Difficulty
      run = 0
    }
  }
  return level
}

function bankSubOf(bank: 'verbal' | 'critical', id: string): string {
  if (bank === 'verbal') {
    for (const p of VERBAL) for (const s of p.statements) if (s.id === id) return `verbal.${s.trap}`
  } else {
    const c = CRITICAL.find((x) => x.id === id)
    if (c) return `critical.${c.type}`
  }
  return ''
}

export interface PickContext {
  /** Item keys already used in this session (no repetition); pickFrom also records content keys here. */
  used: Set<string>
  /** Bank ids answered at any time (prefer unseen ones). */
  seen?: Set<string>
  rng?: Rng
}

export function pickFrom(category: CategoryId, sub: string | null, d: Difficulty, ctx: PickContext): ItemRef | null {
  const rng = ctx.rng ?? createRng(randomSeed())
  if (category === 'verbal' || category === 'critical') {
    const bank = category
    const ids = (bank === 'verbal' ? VERBAL_IDS : CRITICAL_IDS).filter((id) => !sub || bankSubOf(bank, id) === sub)
    const diffOf = bank === 'verbal' ? verbalDifficulty : criticalDifficulty
    const free = ids.filter((id) => !ctx.used.has(`b:${bank}:${id}@1`))
    if (free.length === 0) return null
    const unseen = free.filter((id) => !ctx.seen?.has(id))
    const pool = unseen.length ? unseen : free
    const atLevel = pool.filter((id) => diffOf(id) === d)
    const id = rng.pick(atLevel.length ? atLevel : pool)
    return { kind: 'bank', bank, id, v: 1 }
  }
  const gens = GENERATORS.filter((g) => g.category === category && (!sub || g.id === sub))
  if (gens.length === 0) return null
  for (let i = 0; i < 20; i++) {
    const g = rng.pick(gens)
    const ref: ItemRef = { kind: 'gen', gen: g.id, v: g.version, seed: (rng.next() * 2 ** 32) >>> 0, d }
    const key = `g:${g.id}@${g.version}:${d}:${ref.seed}`
    if (ctx.used.has(key)) continue
    // Same task from a different seed counts as a repetition too.
    const item = resolveItem(ref, 'en')
    const ck = item ? contentKey(item) : null
    if (!ck || ctx.used.has(ck)) continue
    ctx.used.add(ck)
    return ref
  }
  return null
}

export function refForGen(genId: string, d: Difficulty, rng: Rng): ItemRef {
  const g = getGenerator(genId)
  if (!g) throw new Error(`unknown generator ${genId}`)
  return { kind: 'gen', gen: g.id, v: g.version, seed: (rng.next() * 2 ** 32) >>> 0, d }
}

const CHART_KINDS = new Set(['bar', 'line', 'pie', 'combo'])

function exhibitFits(ref: ItemRef, want: MixEntry['exhibit']): boolean {
  if (!want) return true
  const kinds = resolveItem(ref, 'en')?.exhibits.map((e) => e.kind) ?? []
  return kinds.length > 0 && kinds.every((k) => (want === 'table' ? k === 'table' : CHART_KINDS.has(k)))
}

/**
 * One item for a simulation section: weighted mix entry, no repetition within
 * the run (`used`), bank items seen in earlier runs last (`seen`), exhibit filter.
 */
export function pickForSection(rng: Rng, mix: MixEntry[], d: Difficulty, used: Set<string>, seen?: Set<string>): ItemRef | null {
  for (let i = 0; i < 80; i++) {
    const m = weighted(rng, mix.map((x) => ({ item: x, w: x.weight })))
    const diff = m.d ?? d
    let ref: ItemRef | null = null
    if (m.bank) ref = pickFrom(m.bank, m.sub ?? null, diff, { used, rng, seen })
    else if (m.gen && getGenerator(m.gen)) ref = refForGen(m.gen, diff, rng)
    if (!ref || used.has(refKey(ref)) || !exhibitFits(ref, m.exhibit)) continue
    const item = resolveItem(ref, 'en')
    const ck = item ? contentKey(item) : null
    if (!ck || used.has(ck)) continue
    used.add(refKey(ref))
    used.add(ck)
    return ref
  }
  return null
}

/** Weighted random choice. */
export function weighted<T>(rng: Rng, items: { item: T; w: number }[]): T {
  const total = items.reduce((s, x) => s + x.w, 0)
  let r = rng.next() * total
  for (const x of items) {
    r -= x.w
    if (r <= 0) return x.item
  }
  return items[items.length - 1].item
}

/** Quick set: 10 mixed items, weighted towards weak subcategories. */
export function quickSetPlan(accuracyBySub: Map<string, number>, n = 10, rng: Rng = createRng(randomSeed())): ItemRef[] {
  const cats: CategoryId[] = ['numerical', 'speed', 'inductive', 'deductive', 'verbal', 'critical', 'diagrammatic', 'interactive']
  const subs: { item: { cat: CategoryId; sub: string | null }; w: number }[] = []
  for (const cat of cats) {
    const own = GENERATORS.filter((g) => g.category === cat).map((g) => g.id)
    const list = own.length ? own : [null]
    for (const sub of list) {
      const acc = sub ? accuracyBySub.get(sub) : undefined
      // Unknown → medium weight; weak → high weight; strong → low weight.
      const w = acc === undefined ? 1 : Math.max(0.25, (100 - acc) / 40)
      subs.push({ item: { cat, sub }, w: w / list.length })
    }
  }
  const used = new Set<string>()
  const out: ItemRef[] = []
  for (let i = 0; i < n * 5 && out.length < n; i++) {
    const { cat, sub } = weighted(rng, subs)
    const ref = pickFrom(cat, sub, 2, { used, rng })
    if (!ref) continue
    const key = ref.kind === 'gen' ? `g:${ref.gen}@${ref.v}:${ref.d}:${ref.seed}` : `b:${ref.bank}:${ref.id}@1`
    used.add(key)
    out.push(ref)
  }
  return out
}
