import { useEffect, useState } from 'react'
import { checkAnswer, type CheckResult } from '../../content/check'
import type { Answer, Item } from '../../content/types'
import { localDay, saveSession, uuid } from '../../data/repo'
import type { Attempt, Mode, Session } from '../../data/types'

export function makeAttempt(item: Item, o: { mode: Mode; sessionId: string; answer: Answer | null; timeMs: number; points?: number; result?: CheckResult }): Attempt {
  const res = o.result ?? (o.answer ? checkAnswer(item, o.answer) : { correct: false, credit: 0 })
  const ts = Date.now()
  return {
    id: uuid(),
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
  }
}

export async function startSession(s: Omit<Session, 'id' | 'startedAt' | 'status'>): Promise<Session> {
  const session: Session = { ...s, id: uuid(), startedAt: Date.now(), status: 'running' }
  await saveSession(session)
  return session
}

export async function finishSession(s: Session, status: Session['status'] = 'finished'): Promise<Session> {
  const done = { ...s, status, endedAt: Date.now() }
  await saveSession(done)
  return done
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
