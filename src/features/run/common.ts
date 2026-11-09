import { useEffect, useState } from 'react'
import { checkAnswer, type CheckResult } from '../../content/check'
import { CATEGORY_BY_ID } from '../../content/categories'
import { GENERATORS } from '../../content/registry'
import type { Answer, CategoryId, Difficulty, Item } from '../../content/types'
import { abortStaleSessions, localDay, saveSession, uuid } from '../../data/repo'
import type { Attempt, Mode, Session } from '../../data/types'

export function makeAttempt(item: Item, o: { mode: Mode; sessionId: string; answer: Answer | null; timeMs: number; points?: number; result?: CheckResult; id?: string; seq?: number }): Attempt {
  const res = o.result ?? (o.answer ? checkAnswer(item, o.answer) : { correct: false, credit: 0 })
  const ts = Date.now()
  return {
    // Deterministic ids (session + position) let a run save every answer immediately and upsert it later.
    id: o.id ?? uuid(),
    ts,
    day: localDay(ts),
    itemKey: item.key,
    ref: item.ref,
    category: item.category,
    sub: item.sub,
    difficulty: item.difficulty,
    mode: o.mode,
    sessionId: o.sessionId,
    answered: o.answer !== null,
    correct: o.answer !== null && res.correct,
    credit: o.answer !== null ? res.credit : 0,
    points: o.points,
    timeMs: Math.max(0, Math.round(o.timeMs)),
    targetSec: item.targetSec,
    lang: item.lang,
    answer: o.answer ?? undefined,
    seq: o.seq,
  }
}

export async function startSession(s: Omit<Session, 'id' | 'startedAt' | 'status'>): Promise<Session> {
  // A run of this kind left without finishing (reload, closed app) is closed as "aborted" first.
  await abortStaleSessions(s.mode)
  const session: Session = { ...s, id: uuid(), startedAt: Date.now(), status: 'running' }
  await saveSession(session)
  return session
}

export async function finishSession(s: Session, status: Session['status'] = 'finished'): Promise<Session> {
  const done = { ...s, status, endedAt: Date.now() }
  await saveSession(done)
  return done
}

/** Asks before reloading or closing the page while a timed run is active (answers are saved anyway). */
export function useLeaveWarning(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}

/** Re-renders every `ms` milliseconds; returns Date.now(). */
export function useNow(ms = 250, active = true): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), ms)
    const vis = () => setNow(Date.now())
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [ms, active])
  return now
}

export function haptic(ok: boolean, enabled: boolean): void {
  if (!enabled) return
  try {
    navigator.vibrate?.(ok ? 15 : [20, 40, 20])
  } catch {
    /* not supported (iOS Safari) */
  }
}

let audio: AudioContext | null = null
export function beep(ok: boolean, enabled: boolean): void {
  if (!enabled) return
  try {
    audio ??= new AudioContext()
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.frequency.value = ok ? 880 : 220
    g.gain.value = 0.05
    o.connect(g).connect(audio.destination)
    o.start()
    o.stop(audio.currentTime + 0.08)
  } catch {
    /* audio unavailable */
  }
}

/** Deep-link parameters are validated: unknown values fall back to sensible defaults. */
export function parseRunParams(params: URLSearchParams): { cat: CategoryId; sub: string | null; d: Difficulty | 'adaptive'; n: number } {
  const rawCat = params.get('cat') ?? 'speed'
  const cat = (rawCat in CATEGORY_BY_ID ? rawCat : 'speed') as CategoryId
  const rawSub = params.get('sub')
  // Generator subcategories must exist in this category; bank subcategories (verbal.*, critical.*) are filtered by the picker.
  const sub = rawSub && (GENERATORS.some((g) => g.id === rawSub && g.category === cat) || rawSub.startsWith(`${cat}.`)) ? rawSub : null
  const rawD = params.get('d') ?? '2'
  const d = rawD === 'adaptive' ? 'adaptive' : (['1', '2', '3'].includes(rawD) ? Number(rawD) : 2) as Difficulty
  const rawN = Number(params.get('n') ?? 10)
  const n = Number.isFinite(rawN) ? Math.max(3, Math.min(40, Math.round(rawN))) : 10
  return { cat, sub, d, n }
}
