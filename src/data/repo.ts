/** All reads/writes of persistent data go through here. */
import { db as defaultDb, SCHEMA_VERSION, type TrainerDb } from './db'
import { DEFAULT_SETTINGS, type Attempt, type ExportFile, type Session, type Settings } from './types'

export function uuid(): string {
  return crypto.randomUUID()
}

export function localDay(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export async function saveAttempt(a: Attempt, db: TrainerDb = defaultDb): Promise<void> {
  await db.attempts.put(a)
}

export async function saveAttempts(list: Attempt[], db: TrainerDb = defaultDb): Promise<void> {
  if (list.length) await db.attempts.bulkPut(list)
}

export async function saveSession(s: Session, db: TrainerDb = defaultDb): Promise<void> {
  await db.sessions.put(s)
}

export async function loadSettings(db: TrainerDb = defaultDb): Promise<Settings> {
  const s = await db.settings.get('settings')
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) }
}

export async function storeSettings(s: Settings, db: TrainerDb = defaultDb): Promise<void> {
  await db.settings.put(s)
}

export async function exportAll(db: TrainerDb = defaultDb): Promise<ExportFile> {
  const [attempts, sessions, settings] = await Promise.all([db.attempts.toArray(), db.sessions.toArray(), db.settings.get('settings')])
  return {
    app: 'assessment-trainer',
    format: 1,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    attempts: attempts.sort((a, b) => a.ts - b.ts),
    sessions: sessions.sort((a, b) => a.startedAt - b.startedAt),
    settings: settings ?? null,
  }
}

export class ImportError extends Error {}

/** Brings an export file of any known format to the current shape. */
export function migrateExport(raw: unknown): ExportFile {
  if (!raw || typeof raw !== 'object') throw new ImportError('Keine gültige Exportdatei.')
  const f = raw as Partial<ExportFile>
  if (f.app !== 'assessment-trainer') throw new ImportError('Die Datei stammt nicht aus dem Assessment Trainer.')
  if (!Array.isArray(f.attempts) || !Array.isArray(f.sessions)) throw new ImportError('Die Datei ist unvollständig.')
  if ((f.schemaVersion ?? 1) > SCHEMA_VERSION) throw new ImportError('Die Datei stammt aus einer neueren App-Version. Bitte zuerst die App aktualisieren.')
  for (const a of f.attempts) {
    if (!a || typeof a.id !== 'string' || typeof a.itemKey !== 'string' || typeof a.ts !== 'number') throw new ImportError('Die Datei enthält ungültige Einträge.')
  }
  return { app: 'assessment-trainer', format: 1, schemaVersion: SCHEMA_VERSION, exportedAt: f.exportedAt ?? '', attempts: f.attempts, sessions: f.sessions, settings: f.settings ?? null }
}

export interface ImportResult {
  addedAttempts: number
  skippedAttempts: number
  addedSessions: number
}

/** Merges an export into the local database. Deduplicates by id – importing twice changes nothing. */
export async function importMerge(raw: unknown, db: TrainerDb = defaultDb): Promise<ImportResult> {
  const file = migrateExport(raw)
  return db.transaction('rw', db.attempts, db.sessions, db.settings, async () => {
    const existing = new Set((await db.attempts.bulkGet(file.attempts.map((a) => a.id))).filter(Boolean).map((a) => (a as Attempt).id))
    const newAttempts = file.attempts.filter((a) => !existing.has(a.id))
    await db.attempts.bulkAdd(newAttempts)
    const existingS = new Set((await db.sessions.bulkGet(file.sessions.map((s) => s.id))).filter(Boolean).map((s) => (s as Session).id))
    const newSessions = file.sessions.filter((s) => !existingS.has(s.id))
    await db.sessions.bulkAdd(newSessions)
    if (file.settings && !(await db.settings.get('settings'))) await db.settings.put(file.settings)
    return { addedAttempts: newAttempts.length, skippedAttempts: file.attempts.length - newAttempts.length, addedSessions: newSessions.length }
  })
}

export async function resetAll(db: TrainerDb = defaultDb): Promise<void> {
  await db.transaction('rw', db.attempts, db.sessions, db.settings, async () => {
    await db.attempts.clear()
    await db.sessions.clear()
    await db.settings.clear()
  })
}
