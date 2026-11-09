/**
 * IndexedDB via Dexie. The schema is versioned; every future change adds a
 * new `version(n)` with an upgrade function so that stored progress survives
 * app updates (migration test in src/data/data.test.ts).
 */
import Dexie, { type EntityTable } from 'dexie'
import type { Attempt, Session, Settings } from './types'

export const SCHEMA_VERSION = 1
export const DB_NAME = 'assessment-trainer'

export type TrainerDb = Dexie & {
  attempts: EntityTable<Attempt, 'id'>
  sessions: EntityTable<Session, 'id'>
  settings: EntityTable<Settings, 'id'>
}

/** Schema definitions per version. Never edit an old entry – append a new one. */
export const SCHEMAS: { version: number; stores: Record<string, string>; upgrade?: (tx: import('dexie').Transaction) => Promise<void> }[] = [
  {
    version: 1,
    stores: {
      attempts: 'id, ts, day, itemKey, category, sub, sessionId, mode',
      sessions: 'id, startedAt, mode, profileId, status',
      settings: 'id',
    },
  },
]

export function openDb(name = DB_NAME, schemas = SCHEMAS): TrainerDb {
  const db = new Dexie(name) as TrainerDb
  for (const s of schemas) {
    const v = db.version(s.version).stores(s.stores)
    if (s.upgrade) v.upgrade(s.upgrade)
  }
  return db
}

export const db = openDb()
