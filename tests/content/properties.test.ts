/**
 * Property-based tests (fast-check): arbitrary seeds, levels and languages on
 * top of the fixed 2,000-seed sweep in gate2.test.ts.
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { GENERATORS } from '../../src/content/registry'
import type { Difficulty, Lang } from '../../src/content/types'
import { checkOne } from './harness'

const seed = fc.integer({ min: 0, max: 2 ** 32 - 1 })
const level = fc.constantFrom<Difficulty>(1, 2, 3)
const lang = fc.constantFrom<Lang>('en', 'de')

describe('properties over arbitrary seeds', () => {
  for (const g of GENERATORS) {
    it(`${g.id}: key agrees with the independent validator`, () => {
      fc.assert(
        fc.property(seed, level, lang, (s, d, l) => {
          expect(checkOne(g, d, s, l)).toBeNull()
        }),
        { numRuns: 150 },
      )
    })
  }

  it('same (generator, seed, level) → identical item', () => {
    fc.assert(
      fc.property(fc.constantFrom(...GENERATORS), seed, level, (g, s, d) => {
        expect(JSON.stringify(g.generate(s, d, 'en'))).toBe(JSON.stringify(g.generate(s, d, 'en')))
      }),
      { numRuns: 300 },
    )
  })
})
