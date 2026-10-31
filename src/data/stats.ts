/**
 * Pure statistics over raw attempts. Nothing is counted separately, so the
 * dashboard can never drift from the stored data (requirement 5.3).
 */
import type { CategoryId } from '../content/types'
import type { Attempt, Session } from './types'

export interface Agg {
  attempts: number
  answered: number
  correct: number
  /** correct / answered in %, null if nothing answered. */
  accuracy: number | null
  avgTimeSec: number | null
  avgTargetSec: number | null
}

export function aggregate(list: Attempt[]): Agg {
  const answered = list.filter((a) => a.answered)
  const correct = answered.filter((a) => a.correct).length
  const time = answered.reduce((s, a) => s + a.timeMs, 0)
  const target = answered.reduce((s, a) => s + a.targetSec, 0)
  return {
    attempts: list.length,
    answered: answered.length,
    correct,
    accuracy: answered.length ? (correct / answered.length) * 100 : null,
    avgTimeSec: answered.length ? time / answered.length / 1000 : null,
    avgTargetSec: answered.length ? target / answered.length : null,
  }
}

export function groupBy<K extends string>(list: Attempt[], key: (a: Attempt) => K): Map<K, Attempt[]> {
  const m = new Map<K, Attempt[]>()
  for (const a of list) {
    const k = key(a)
    const arr = m.get(k)
    if (arr) arr.push(a)
    else m.set(k, [a])
  }
  return m
}

export function byCategory(list: Attempt[]): Map<CategoryId, Agg> {
  const out = new Map<CategoryId, Agg>()
  for (const [k, v] of groupBy(list, (a) => a.category)) out.set(k, aggregate(v))
  return out
}

export function bySub(list: Attempt[]): Map<string, Agg & { category: CategoryId }> {
  const out = new Map<string, Agg & { category: CategoryId }>()
  for (const [k, v] of groupBy(list, (a) => a.sub)) out.set(k, { ...aggregate(v), category: v[0].category })
  return out
}

export function inRange(list: Attempt[], range: '7' | '30' | 'all', now = Date.now()): Attempt[] {
  if (range === 'all') return list
  const days = Number(range)
  const from = now - days * 86400000
  return list.filter((a) => a.ts >= from)
}

/** Daily accuracy per category: rows sorted by day. */
export function trend(list: Attempt[], category?: CategoryId): { day: string; accuracy: number; answered: number }[] {
  const filtered = category ? list.filter((a) => a.category === category) : list
  return [...groupBy(filtered, (a) => a.day).entries()]
    .map(([day, v]) => ({ day, ...aggregate(v) }))
    .filter((r) => r.answered > 0)
    .map((r) => ({ day: r.day, accuracy: r.accuracy as number, answered: r.answered }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

function prevDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const dt = new Date(y, m - 1, d - 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** Consecutive practice days ending today (or yesterday if not yet practised today). */
export function streak(list: Attempt[], today: string): number {
  const days = new Set(list.map((a) => a.day))
  let cur = days.has(today) ? today : prevDay(today)
  let n = 0
  while (days.has(cur)) {
    n++
    cur = prevDay(cur)
  }
  return n
}

export interface Weakness {
  sub: string
  category: CategoryId
  accuracy: number
  answered: number
}

/** The three subcategories with the lowest accuracy (min. 10 answered attempts). */
export function weaknesses(list: Attempt[], min = 10, top = 3): Weakness[] {
  return [...bySub(list).entries()]
    .filter(([, v]) => v.answered >= min && v.accuracy !== null)
    .map(([sub, v]) => ({ sub, category: v.category, accuracy: v.accuracy as number, answered: v.answered }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered)
    .slice(0, top)
}

export interface SimResult {
  session: Session
  points: number
  maxPoints: number
  answered: number
  correct: number
  planned: number | null
}

export function simulationResults(sessions: Session[], attempts: Attempt[], maxPointsPerItem: (s: Session) => number): SimResult[] {
  const bySession = groupBy(attempts, (a) => a.sessionId)
  return sessions
    .filter((s) => s.mode === 'simulation' && s.status === 'finished')
    .map((s) => {
      const list = bySession.get(s.id) ?? []
      const planned = s.sections?.every((x) => x.planned !== null) ? s.sections.reduce((n, x) => n + (x.planned ?? 0), 0) : null
      return {
        session: s,
        points: list.reduce((p, a) => p + (a.points ?? (a.correct ? 1 : 0)), 0),
        maxPoints: (planned ?? list.length) * maxPointsPerItem(s),
        answered: list.filter((a) => a.answered).length,
        correct: list.filter((a) => a.correct).length,
        planned,
      }
    })
    .sort((a, b) => b.session.startedAt - a.session.startedAt)
}
