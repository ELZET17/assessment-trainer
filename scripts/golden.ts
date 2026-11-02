/**
 * Writes tests/content/golden.json: a hash of the item every generator produces for
 * fixed seeds. The golden test fails when a change alters items without a version bump (D17).
 * Usage: npm run golden (only after bumping the version of every changed generator).
 */
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { GENERATORS } from '../src/content/registry'
import type { Difficulty } from '../src/content/types'

export const GOLDEN_SEEDS = [11, 2024, 987654321]

export function goldenHashes(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const g of GENERATORS)
    for (const d of [1, 2, 3] as Difficulty[])
      for (const s of GOLDEN_SEEDS) {
        const json = JSON.stringify([g.generate(s, d, 'en'), g.generate(s, d, 'de')])
        out[`${g.id}@${g.version}:${d}:${s}`] = createHash('sha256').update(json).digest('hex').slice(0, 16)
      }
  return out
}

if (process.argv[1]?.endsWith('golden.ts')) {
  writeFileSync('tests/content/golden.json', JSON.stringify(goldenHashes(), null, 1) + '\n')
  console.log('tests/content/golden.json written')
}
