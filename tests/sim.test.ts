import { describe, expect, it } from 'vitest'
import { resolveItem } from '../src/content/items'
import { pickForSection } from '../src/content/picker'
import { getProfile, PROFILES } from '../src/content/profiles'
import { createRng } from '../src/content/rng'
import { refKey, type ItemRef } from '../src/content/types'

function buildRun(profileId: string, seed: number, seen?: Set<string>) {
  const p = getProfile(profileId)!
  const used = new Set<string>()
  const rng = createRng(seed)
  return p.sections.map((s) => Array.from({ length: s.count ?? 0 }, () => pickForSection(rng, s.mix, p.difficulty, used, seen)))
}

describe('simulation item selection', () => {
  it('every non-game profile can be filled completely without repetition', () => {
    for (const p of PROFILES) {
      for (let seed = 1; seed <= 5; seed++) {
        const refs = buildRun(p.id, seed).flat()
        expect(refs.every((r) => r !== null), p.id).toBe(true)
        const keys = refs.map((r) => refKey(r as ItemRef))
        expect(new Set(keys).size, p.id).toBe(keys.length)
      }
    }
  })

  it('Kearney "Tabellen" draws only tables, "Grafiken" only charts', () => {
    const p = getProfile('kearney-test')!
    for (let seed = 1; seed <= 10; seed++) {
      const run = buildRun('kearney-test', seed)
      const kinds = (si: number) => run[si].flatMap((r) => resolveItem(r as ItemRef, 'en')!.exhibits.map((e) => e.kind))
      const c1 = p.sections.findIndex((s) => s.id === 'c1')
      const c2 = p.sections.findIndex((s) => s.id === 'c2')
      expect(kinds(c1).every((k) => k === 'table')).toBe(true)
      expect(kinds(c2).every((k) => ['bar', 'line', 'pie', 'combo'].includes(k))).toBe(true)
    }
  })

  it('bank items answered in earlier runs are drawn last', () => {
    const first = buildRun('kearney-test', 7).flat().filter((r) => r?.kind === 'bank') as Extract<ItemRef, { kind: 'bank' }>[]
    const seen = new Set(first.map((r) => r.id))
    const second = buildRun('kearney-test', 8, seen).flat().filter((r) => r?.kind === 'bank') as Extract<ItemRef, { kind: 'bank' }>[]
    // Enough unseen inference/verbal items exist for a second run, so none of the first run's texts repeat.
    expect(second.filter((r) => seen.has(r.id))).toEqual([])
  })
})

describe('no repeated tasks', () => {
  it('a 20-item drill from a small domain never shows the same task twice', async () => {
    const { pickFrom } = await import('../src/content/picker')
    const { contentKey } = await import('../src/content/items')
    for (const gen of ['speed.squares', 'aon.digit', 'speed.fraction']) {
      const used = new Set<string>()
      const keys: string[] = []
      for (let i = 0; i < 60 && keys.length < 20; i++) {
        const ref = pickFrom(gen.startsWith('aon') ? 'aon' : 'speed', gen, 1, { used, rng: createRng(i + 1) })
        if (!ref) continue
        used.add(refKey(ref))
        keys.push(contentKey(resolveItem(ref, 'en')!))
      }
      expect(new Set(keys).size, gen).toBe(keys.length)
    }
  })

  it('simulation runs contain no task twice (by content)', async () => {
    const { contentKey } = await import('../src/content/items')
    for (const p of PROFILES) {
      for (let seed = 1; seed <= 5; seed++) {
        const refs = buildRun(p.id, seed).flat().filter((r): r is ItemRef => r !== null)
        const keys = refs.map((r) => contentKey(resolveItem(r, 'en')!))
        expect(new Set(keys).size, p.id).toBe(keys.length)
      }
    }
  })
})
