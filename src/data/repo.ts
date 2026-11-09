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

const CATEGORY_IDS = new Set(['numerical', 'speed', 'inductive', 'deductive', 'verbal', 'critical', 'diagrammatic', 'aon', 'interactive'])
const MODES = new Set(['training', 'drill', 'simulation', 'mistakes', 'quick', 'sprint', 'game'])
const isStr = (x: unknown): x is string => typeof x === 'string' && x.length > 0 && x.length < 400
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

/** Field-by-field check of an imported attempt – a broken entry must never reach the database. */
function validAttempt(a: unknown): a is Attempt {
  if (!a || typeof a !== 'object') return false
  const x = a as Record<string, unknown>
  const ref = x.ref as Record<string, unknown> | undefined
  const refOk =
    !!ref &&
    typeof ref === 'object' &&
    ((ref.kind === 'gen' && isStr(ref.gen) && isNum(ref.v) && isNum(ref.seed) && [1, 2, 3].includes(ref.d as number)) ||
      (ref.kind === 'bank' && (ref.bank === 'verbal' || ref.bank === 'critical') && isStr(ref.id)))
  return (
    isStr(x.id) &&
    isNum(x.ts) &&
    isStr(x.day) &&
    isStr(x.itemKey) &&
    refOk &&
    CATEGORY_IDS.has(x.category as string) &&
    typeof x.sub === 'string' &&
    [1, 2, 3].includes(x.difficulty as number) &&
    MODES.has(x.mode as string) &&
    isStr(x.sessionId) &&
    typeof x.answered === 'boolean' &&
    typeof x.correct === 'boolean' &&
    isNum(x.credit) &&
    x.credit >= 0 &&
    x.credit <= 1 &&
    (x.points === undefined || isNum(x.points)) &&
    isNum(x.timeMs) &&
    x.timeMs >= 0 &&
    isNum(x.targetSec) &&
    (x.lang === 'en' || x.lang === 'de') &&
    (x.seq === undefined || isNum(x.seq))
  )
}

function validSession(s: unknown): s is Session {
  if (!s || typeof s !== 'object') return false
  const x = s as Record<string, unknown>
  const sectionsOk =
    x.sections === undefined ||
    (Array.isArray(x.sections) &&
      x.sections.every((sec: unknown) => {
        const z = sec as Record<string, unknown> | null
        return !!z && isStr(z.id) && typeof z.title === 'string' && (z.planned === null || (isNum(z.planned) && z.planned >= 0)) && (z.timeLimitSec === null || z.timeLimitSec === undefined || isNum(z.timeLimitSec))
      }))
  return isStr(x.id) && isNum(x.startedAt) && MODES.has(x.mode as string) && ['running', 'finished', 'aborted'].includes(x.status as string) && typeof x.title === 'string' && sectionsOk
}

/** Only known settings with the right type and value range are taken over from a file. */
function cleanSettings(raw: object): Settings {
  const x = raw as Record<string, unknown>
  const out: Settings = { ...DEFAULT_SETTINGS }
  for (const [k, def] of Object.entries(DEFAULT_SETTINGS) as [keyof Settings, unknown][]) {
    const v = x[k]
    if (typeof v === typeof def && (typeof v !== 'number' || Number.isFinite(v))) (out as unknown as Record<string, unknown>)[k] = v
  }
  if (!['en', 'de'].includes(out.itemLang)) out.itemLang = DEFAULT_SETTINGS.itemLang
  if (!['system', 'light', 'dark'].includes(out.theme)) out.theme = DEFAULT_SETTINGS.theme
  if (!['mcq', 'free'].includes(out.speedInput)) out.speedInput = DEFAULT_SETTINGS.speedInput
  out.targetAccuracy = Math.min(100, Math.max(0, out.targetAccuracy))
  out.id = 'settings'
  return out
}

/** Keeps the first entry per id (a file may contain an id twice). */
function uniqueById<T extends { id: string }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)))
}

/** Brings an export file of any known format to the current shape. */
export function migrateExport(raw: unknown): ExportFile {
  if (!raw || typeof raw !== 'object') throw new ImportError('Keine gültige Exportdatei.')
  const f = raw as Partial<ExportFile>
  if (f.app !== 'assessment-trainer') throw new ImportError('Die Datei stammt nicht aus dem Assessment Trainer.')
  if (!Array.isArray(f.attempts) || !Array.isArray(f.sessions)) throw new ImportError('Die Datei ist unvollständig.')
  if (f.format !== undefined && f.format !== 1) throw new ImportError('Unbekanntes Dateiformat.')
  if (f.schemaVersion !== undefined && !isNum(f.schemaVersion)) throw new ImportError('Die Datei ist beschädigt.')
  if ((f.schemaVersion ?? 1) > SCHEMA_VERSION) throw new ImportError('Die Datei stammt aus einer neueren App-Version. Bitte zuerst die App aktualisieren.')
  const valid = f.attempts.filter(validAttempt)
  const attempts = uniqueById(valid)
  const sessions = uniqueById(f.sessions.filter(validSession))
  if (f.attempts.length > 0 && attempts.length === 0) throw new ImportError('Die Datei enthält keine gültigen Einträge.')
  const settings = f.settings && typeof f.settings === 'object' && !Array.isArray(f.settings) ? cleanSettings(f.settings) : null
  return { app: 'assessment-trainer', format: 1, schemaVersion: SCHEMA_VERSION, exportedAt: typeof f.exportedAt === 'string' ? f.exportedAt : '', attempts, sessions, settings, invalid: f.attempts.length - valid.length }
}

export interface ImportResult {
  addedAttempts: number
  skippedAttempts: number
  /** Entries dropped because a field was missing or had the wrong type. */
  invalidAttempts: number
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
    if (file.settings && !(await db.settings.get('settings'))) await db.settings.put({ ...DEFAULT_SETTINGS, ...file.settings })
    return { addedAttempts: newAttempts.length, skippedAttempts: file.attempts.length - newAttempts.length, invalidAttempts: file.invalid ?? 0, addedSessions: newSessions.length }
  })
}

/**
 * Marks runs that were left without finishing (reload, closed app) as aborted, so they
 * do not stay "running" forever. Called when a new run of the same mode starts.
 */
export async function abortStaleSessions(mode: Session['mode'], db: TrainerDb = defaultDb): Promise<void> {
  const stale = await db.sessions.where('mode').equals(mode).filter((s) => s.status === 'running').toArray()
  if (stale.length) await db.sessions.bulkPut(stale.map((s) => ({ ...s, status: 'aborted' as const, endedAt: s.endedAt ?? Date.now() })))
}

export async function resetAll(db: TrainerDb = defaultDb): Promise<void> {
  await db.transaction('rw', db.attempts, db.sessions, db.settings, async () => {
    await db.attempts.clear()
    await db.sessions.clear()
    await db.settings.clear()
  })
}
