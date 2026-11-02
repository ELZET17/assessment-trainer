import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { goldenHashes } from '../../scripts/golden'

describe('golden items (D17: same generator version → same items)', () => {
  it('every generator still produces exactly the recorded items for the golden seeds', () => {
    const stored = JSON.parse(readFileSync('tests/content/golden.json', 'utf8')) as Record<string, string>
    const now = goldenHashes()
    const changed = Object.keys(now).filter((k) => stored[k] !== undefined && stored[k] !== now[k])
    const missing = Object.keys(now).filter((k) => stored[k] === undefined)
    expect(changed, 'Items changed without a version bump – bump the generator version, then run `npm run golden`.').toEqual([])
    expect(missing, 'New generator or version – run `npm run golden`.').toEqual([])
  })
})
