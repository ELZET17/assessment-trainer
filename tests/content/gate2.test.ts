import { describe, expect, it } from 'vitest'
import { GENERATORS } from '../../src/content/registry'
import type { Difficulty } from '../../src/content/types'
import { ITEMS_PER_LEVEL, runGenerator } from './harness'

const LEVELS: Difficulty[] = [1, 2, 3]

describe(`Gate 2 – ${ITEMS_PER_LEVEL} items per generator × level vs. independent validator`, () => {
  for (const g of GENERATORS) {
    for (const d of LEVELS) {
      it(`${g.id} · level ${d}`, () => {
        const failures = runGenerator(g, d)
        expect(failures.slice(0, 5), JSON.stringify(failures.slice(0, 5), null, 1)).toEqual([])
      })
    }
  }
})

describe('Determinism – same seed → identical item', () => {
  for (const g of GENERATORS) {
    it(g.id, () => {
      for (const d of LEVELS) {
        for (const seed of [1, 42, 123456789, 4294967295]) {
          expect(JSON.stringify(g.generate(seed, d, 'en'))).toBe(JSON.stringify(g.generate(seed, d, 'en')))
          // Language must not change the drawn numbers or the key.
          const en = g.generate(seed, d, 'en')
          const de = g.generate(seed, d, 'de')
          expect(de.type).toBe(en.type)
          if (en.type === 'mcq' && de.type === 'mcq') {
            expect(de.correct).toBe(en.correct)
            expect(de.options.length).toBe(en.options.length)
          }
        }
      }
    })
  }
})
