import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import type { CategoryId, ItemRef } from '../content/types'
import { DB_NAME, openDb, SCHEMAS } from './db'
import { mistakeBook } from './mistakes'
import { exportAll, importMerge, migrateExport, resetAll, saveAttempts, saveSession, storeSettings } from './repo'
import { aggregate, byCategory, simulationResults, streak, trend, weaknesses } from './stats'
import { DEFAULT_SETTINGS, type Attempt, type Session } from './types'

let n = 0
function att(p: Partial<Attempt> & { correct: boolean }): Attempt {
  n++
  const ref: ItemRef = p.ref ?? { kind: 'gen', gen: 'num.share', v: 1, seed: n, d: 2 }
  return {
    id: `a${n}`,
    ts: 1_700_000_000_000 + n * 1000,
    day: '2026-10-30',
    itemKey: `g:${(ref as { gen: string }).gen}@1:2:${(ref as { seed: number }).seed}`,
    ref,
    category: 'numerical' as CategoryId,
    sub: 'num.share',
    difficulty: 2,
    mode: 'training',
    sessionId: 's1',
    answered: true,
    credit: p.correct ? 1 : 0,
    timeMs: 30_000,
    targetSec: 70,
    lang: 'en',
    ...p,
  }
}

describe('statistics are computed from raw attempts', () => {
  it('7 of 10 correct → 7/10 and 70 %', () => {
    const list = Array.from({ length: 10 }, (_, i) => att({ correct: i < 7 }))
    const a = byCategory(list).get('numerical')
    expect(a?.correct).toBe(7)
    expect(a?.answered).toBe(10)
    expect(a?.accuracy).toBe(70)
    expect(a?.avgTimeSec).toBe(30)
  })
  it('unanswered attempts do not count towards accuracy', () => {
    const list = [att({ correct: true }), att({ correct: false, answered: false })]
    expect(aggregate(list).accuracy).toBe(100)
    expect(aggregate(list).attempts).toBe(2)
  })
  it('streak counts consecutive days ending today or yesterday', () => {
    const days = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-31']
    const list = days.map((day) => att({ correct: true, day }))
    expect(streak(list, '2026-10-31')).toBe(1)
    expect(streak(list.slice(0, 3), '2026-10-30')).toBe(3)
    expect(streak(list.slice(0, 3), '2026-10-31')).toBe(0)
  })
  it('weakness ranking needs ≥ 10 attempts and sorts by accuracy', () => {
    const weak = Array.from({ length: 10 }, (_, i) => att({ correct: i < 3, sub: 'num.cagr' }))
    const ok = Array.from({ length: 10 }, (_, i) => att({ correct: i < 8, sub: 'num.fx' }))
    const few = Array.from({ length: 9 }, () => att({ correct: false, sub: 'num.index' }))
    const w = weaknesses([...weak, ...ok, ...few])
    expect(w.map((x) => x.sub)).toEqual(['num.cagr', 'num.fx'])
  })
  it('trend groups by day', () => {
    const list = [att({ correct: true, day: '2026-10-01' }), att({ correct: false, day: '2026-10-01' }), att({ correct: true, day: '2026-10-02' })]
    expect(trend(list)).toEqual([
      { day: '2026-10-01', accuracy: 50, answered: 2 },
      { day: '2026-10-02', accuracy: 100, answered: 1 },
    ])
  })
  it('simulation results use points incl. negative marking', () => {
    const s: Session = { id: 'sim1', mode: 'simulation', title: 'Kearney', startedAt: 1, status: 'finished', profileId: 'kearney-test', sections: [{ id: 'a', title: 'A', planned: 3, timeLimitSec: null }] }
    const list = [att({ correct: true, sessionId: 'sim1', points: 5 }), att({ correct: false, sessionId: 'sim1', points: -1 }), att({ correct: false, sessionId: 'sim1', answered: false, points: 0 })]
    const [r] = simulationResults([s], list, () => 5)
    expect(r.points).toBe(4)
    expect(r.maxPoints).toBe(15)
    expect(r.answered).toBe(2)
  })
  it('handles 10,000 attempts quickly', () => {
    const list = Array.from({ length: 10_000 }, (_, i) => att({ correct: i % 3 !== 0, sub: `num.${i % 12}`, day: `2026-10-${String((i % 28) + 1).padStart(2, '0')}` }))
    const t0 = performance.now()
    byCategory(list)
    weaknesses(list)
    trend(list)
    mistakeBook(list)
    expect(performance.now() - t0).toBeLessThan(500)
  })
})

describe('mistake book (Fehlerheft)', () => {
  const ref: ItemRef = { kind: 'gen', gen: 'speed.mul', v: 1, seed: 99, d: 2 }
  const key = 'g:speed.mul@1:2:99'
  const base = { ref, itemKey: key, sub: 'speed.mul', category: 'speed' as CategoryId }
  it('enters after a wrong answer, leaves after two correct answers in a row', () => {
    const wrong = att({ ...base, correct: false, ts: 1 })
    expect(mistakeBook([wrong]).length).toBe(1)
    const c1 = att({ ...base, correct: true, ts: 2 })
    expect(mistakeBook([wrong, c1])[0].streak).toBe(1)
    const c2 = att({ ...base, correct: true, ts: 3 })
    expect(mistakeBook([wrong, c1, c2]).length).toBe(0)
    const w2 = att({ ...base, correct: false, ts: 4 })
    expect(mistakeBook([wrong, c1, c2, w2]).length).toBe(1)
    const c3 = att({ ...base, correct: true, ts: 5 })
    const w3 = att({ ...base, correct: false, ts: 6 })
    expect(mistakeBook([wrong, c1, c2, w2, c3, w3])[0].streak).toBe(0)
  })
  it('items answered correctly only never enter', () => {
    expect(mistakeBook([att({ ...base, correct: true })]).length).toBe(0)
  })
})

describe('persistence: export, reset, import, migration', () => {
  it('export → reset → import gives an identical state; double import adds nothing', async () => {
    const db = openDb('test-roundtrip')
    const list = Array.from({ length: 25 }, (_, i) => att({ correct: i % 2 === 0 }))
    await saveAttempts(list, db)
    await saveSession({ id: 's1', mode: 'training', title: 'T', startedAt: 1, status: 'finished' }, db)
    await storeSettings({ ...DEFAULT_SETTINGS, itemLang: 'de' }, db)
    const before = await exportAll(db)
    await resetAll(db)
    expect(await db.attempts.count()).toBe(0)
    const r1 = await importMerge(JSON.parse(JSON.stringify(before)), db)
    expect(r1.addedAttempts).toBe(25)
    const after = await exportAll(db)
    expect(after.attempts).toEqual(before.attempts)
    expect(after.sessions).toEqual(before.sessions)
    expect(after.settings).toEqual(before.settings)
    const r2 = await importMerge(JSON.parse(JSON.stringify(before)), db)
    expect(r2.addedAttempts).toBe(0)
    expect(r2.skippedAttempts).toBe(25)
    expect(await db.attempts.count()).toBe(25)
    db.close()
  })
  it('import merges with existing local data instead of overwriting it', async () => {
    const db = openDb('test-merge')
    await saveAttempts([att({ correct: true, id: 'local-1' })], db)
    await importMerge({ app: 'assessment-trainer', format: 1, schemaVersion: 1, exportedAt: '', attempts: [att({ correct: false, id: 'remote-1' })], sessions: [], settings: null }, db)
    expect((await db.attempts.toArray()).map((a) => a.id).sort()).toEqual(['local-1', 'remote-1'])
    db.close()
  })
  it('rejects foreign or newer files with a clear message', () => {
    expect(() => migrateExport({ foo: 1 })).toThrow(/Assessment Trainer/)
    expect(() => migrateExport({ app: 'assessment-trainer', attempts: [], sessions: [], schemaVersion: 99 })).toThrow(/neueren/)
  })
  it('schema migration v1 → v2 keeps all data', async () => {
    const name = 'test-migration'
    const v1 = openDb(name)
    const list = Array.from({ length: 50 }, (_, i) => att({ correct: i % 2 === 0 }))
    await saveAttempts(list, v1)
    await saveSession({ id: 's9', mode: 'drill', title: 'D', startedAt: 5, status: 'finished' }, v1)
    v1.close()
    // A hypothetical version 2: new index on difficulty + data upgrade adding a field.
    const v2Schemas = [
      ...SCHEMAS,
      {
        version: 2,
        stores: { attempts: 'id, ts, day, itemKey, category, sub, sessionId, mode, difficulty', sessions: 'id, startedAt, mode, profileId, status', settings: 'id' },
        upgrade: async (tx: import('dexie').Transaction) => {
          await tx
            .table('attempts')
            .toCollection()
            .modify((a: Attempt & { migrated?: boolean }) => {
              a.migrated = true
            })
        },
      },
    ]
    const v2 = openDb(name, v2Schemas)
    const all = (await v2.attempts.toArray()) as (Attempt & { migrated?: boolean })[]
    expect(all.length).toBe(50)
    expect(all.every((a) => a.migrated)).toBe(true)
    expect(await v2.attempts.where('difficulty').equals(2).count()).toBe(50)
    expect(await v2.sessions.get('s9')).toBeTruthy()
    v2.close()
  })
  it('uses a stable database name', () => {
    expect(DB_NAME).toBe('assessment-trainer')
  })
})

describe('properties (fast-check)', () => {
  it('accuracy always equals correct ÷ answered of the raw attempts', async () => {
    const fc = (await import('fast-check')).default
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 60 }), (results) => {
        const list = results.map((c) => att({ correct: c }))
        const a = byCategory(list).get('numerical')
        const right = results.filter(Boolean).length
        expect(a?.correct).toBe(right)
        expect(a?.answered).toBe(results.length)
        expect(a?.accuracy).toBeCloseTo((right / results.length) * 100, 9)
      }),
    )
  })

  it('an item leaves the error book exactly after two correct answers in a row', async () => {
    const fc = (await import('fast-check')).default
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 12 }), (results) => {
        const ref: ItemRef = { kind: 'gen', gen: 'num.share', v: 1, seed: 777, d: 2 }
        const list = results.map((c) => att({ correct: c, ref, itemKey: 'g:num.share@1:2:777' }))
        const lastWrong = results.lastIndexOf(false)
        const after = lastWrong < 0 ? 0 : results.length - 1 - lastWrong
        const expected = lastWrong >= 0 && after < 2
        expect(mistakeBook(list).some((m) => m.itemKey === 'g:num.share@1:2:777')).toBe(expected)
      }),
    )
  })
})

describe('import validation', () => {
  it('drops broken attempts, de-duplicates ids inside the file and keeps valid entries', async () => {
    const db = openDb(`imp-${Math.random()}`)
    const good = att({ correct: true })
    const file = {
      app: 'assessment-trainer',
      format: 1,
      schemaVersion: 1,
      attempts: [good, good, { ...att({ correct: false }), ref: undefined }, { ...att({ correct: false }), category: 'nope' }, { __proto__: { polluted: true }, id: 'x' }],
      sessions: [],
      settings: null,
    }
    const r = await importMerge(file, db)
    expect(r.addedAttempts).toBe(1)
    expect(r.invalidAttempts).toBe(3)
    expect(await db.attempts.count()).toBe(1)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('rejects a file without any valid entry', () => {
    expect(() => migrateExport({ app: 'assessment-trainer', attempts: [{ id: 'a' }], sessions: [] })).toThrow(/keine gültigen/)
  })
})

describe('import validation of sessions and settings', () => {
  it('drops sessions with broken sections and cleans unknown or invalid settings', async () => {
    const db = openDb(`imp2-${Math.random()}`)
    const good = att({ correct: true })
    const file = {
      app: 'assessment-trainer',
      format: 1,
      schemaVersion: 1,
      attempts: [good],
      sessions: [
        { id: 's-ok', startedAt: 1, mode: 'drill', status: 'finished', title: 'ok', sections: [{ id: 'a', title: 'A', planned: 5, timeLimitSec: 60 }] },
        { id: 's-bad', startedAt: 1, mode: 'simulation', status: 'finished', title: 'bad', sections: [{ id: 'a', title: 'A', planned: 'zehn' }] },
      ],
      settings: { id: 'x', itemLang: 'fr', theme: 'dark', speedInput: 'telepathy', targetAccuracy: 250, sound: 'yes' },
    }
    const r = await importMerge(file, db)
    expect(r.addedSessions).toBe(1)
    const s = await db.settings.get('settings')
    expect(s?.itemLang).toBe('en')
    expect(s?.theme).toBe('dark')
    expect(s?.speedInput).toBe(DEFAULT_SETTINGS.speedInput)
    expect(s?.targetAccuracy).toBe(100)
    expect(s?.sound).toBe(DEFAULT_SETTINGS.sound)
  })

  it('rejects unknown formats', () => {
    expect(() => migrateExport({ app: 'assessment-trainer', format: 2, attempts: [], sessions: [] })).toThrow(/Dateiformat/)
    expect(() => migrateExport({ app: 'assessment-trainer', schemaVersion: {}, attempts: [], sessions: [] })).toThrow(/beschädigt/)
  })
})
