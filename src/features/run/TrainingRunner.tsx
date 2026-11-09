/**
 * Training (immediate feedback), Fehlerheft practice and the daily Quick-Set.
 * URL: /run/training?cat=…&sub=…&d=1|2|3|adaptive, /run/mistakes, /run/quick
 */
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { CATEGORY_BY_ID, DIFFICULTY_LABEL } from '../../content/categories'
import { checkAnswer, type CheckResult } from '../../content/check'
import { isReproducible, resolveItem, subTitle } from '../../content/items'
import { adaptiveLevel, pickFrom, quickSetPlan } from '../../content/picker'
import type { Answer, Difficulty, Item, ItemRef } from '../../content/types'
import { refKey } from '../../content/types'
import { db } from '../../data/db'
import { mistakeBook } from '../../data/mistakes'
import { saveAttempt } from '../../data/repo'
import { aggregate, bySub } from '../../data/stats'
import type { Attempt, Mode, Session } from '../../data/types'
import { useSettings } from '../../state/settings'
import { Calculator } from '../../ui/Calculator'
import { Explanation, ItemView, needsSubmitButton } from '../../ui/ItemView'
import { Badge, Button, Card, fmtDuration, Icon, LinkButton, PageHeader, pctText } from '../../ui/kit'
import { beep, finishSession, haptic, makeAttempt, parseRunParams, startSession, useNow } from './common'

type Kind = 'training' | 'mistakes' | 'quick'

/** Adaptive training starts at test level. */
const ADAPTIVE_START: Difficulty = 2

export default function TrainingRunner() {
  const { kind = 'training' } = useParams() as { kind: Kind }
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { settings } = useSettings()
  const { cat, sub, d: dParam } = parseRunParams(params)
  const adaptive = dParam === 'adaptive'
  const [difficulty, setDifficulty] = useState<Difficulty>(dParam === 'adaptive' ? ADAPTIVE_START : dParam)
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  const [plan, setPlan] = useState<ItemRef[] | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [shownAt, setShownAt] = useState(() => Date.now())
  const [result, setResult] = useState<CheckResult | null>(null)
  const [draft, setDraft] = useState<Answer | null>(null)
  const [log, setLog] = useState<{ correct: boolean; timeMs: number }[]>([])
  const [done, setDone] = useState(false)
  // 'auto' = opened by the setting (no focus grab), 'user' = opened by the button (keyboard goes to it)
  const [calc, setCalc] = useState<false | 'auto' | 'user'>(false)
  const calcOpened = useRef(false)
  const advancing = useRef(false)
  const lockUntil = useRef(0)
  const used = useRef(new Set<string>())
  const index = useRef(0)
  const submitting = useRef(false)
  const mode: Mode = kind === 'training' ? 'training' : kind === 'mistakes' ? 'mistakes' : 'quick'

  // Build fixed plans for mistakes / quick set once attempts are loaded.
  useEffect(() => {
    if (plan !== null || !attempts) return
    if (kind === 'mistakes') setPlan(mistakeBook(attempts).filter((m) => (!params.get('cat') || m.category === params.get('cat')) && isReproducible(m.ref)).map((m) => m.ref))
    else if (kind === 'quick') {
      const acc = new Map<string, number>()
      for (const [k, v] of bySub(attempts)) if (v.accuracy !== null && v.answered >= 3) acc.set(k, v.accuracy)
      setPlan(quickSetPlan(acc, 10))
    } else setPlan([])
  }, [attempts, kind, plan, params])

  const title = kind === 'training' ? `Training · ${CATEGORY_BY_ID[cat].name}` : kind === 'mistakes' ? 'Fehlerheft üben' : 'Tägliches Quick-Set'

  const nextItem = useCallback(
    (d: Difficulty) => {
      let ref: ItemRef | null = null
      if (kind === 'training') {
        const seen = new Set((attempts ?? []).filter((a) => a.ref.kind === 'bank').map((a) => (a.ref as { id: string }).id))
        ref = pickFrom(cat, sub, d, { used: used.current, seen })
      } else if (plan) {
        ref = plan[index.current] ?? null
        index.current++
      }
      if (!ref) {
        setItem(null)
        setDone(true)
        return
      }
      used.current.add(refKey(ref))
      const it = resolveItem(ref, settings.itemLang)
      if (!it) {
        setDone(true)
        return
      }
      setItem(it)
      setResult(null)
      // Ordering items start with a valid answer (the shown order), like in SHL tests.
      setDraft(it.type === 'order' ? { type: 'order', order: it.entries.map((_, i) => i) } : null)
      setShownAt(Date.now())
      submitting.current = false
    },
    [kind, attempts, cat, sub, plan, settings.itemLang],
  )

  // Start the session and show the first item.
  useEffect(() => {
    if (session || plan === null) return
    let alive = true
    void startSession({ mode, title, category: kind === 'training' ? cat : undefined, sub: sub ?? undefined, difficulty: kind === 'training' ? (adaptive ? 'adaptive' : difficulty) : undefined }).then((s) => {
      if (!alive) return
      setSession(s)
      nextItem(difficulty)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  const submit = useCallback(
    async (a: Answer) => {
      // Ignore taps in the first 350 ms after "Weiter" (second tap of a double tap on the new item).
      if (!item || !session || result || submitting.current || Date.now() < lockUntil.current) return
      submitting.current = true
      const r = checkAnswer(item, a)
      const timeMs = Date.now() - shownAt
      setResult(r)
      setDraft(a)
      setLog((l) => [...l, { correct: r.correct, timeMs }])
      haptic(r.correct, settings.haptics)
      beep(r.correct, settings.sound)
      const att: Attempt = makeAttempt(item, { mode, sessionId: session.id, answer: a, timeMs, result: r })
      await saveAttempt(att)
    },
    [item, session, result, shownAt, settings.haptics, settings.sound, mode],
  )

  const next = useCallback(() => {
    // One advance per answer (a double press must not skip a planned item).
    if (!result || advancing.current) return
    advancing.current = true
    lockUntil.current = Date.now() + 350
    let d = difficulty
    if (adaptive) {
      d = adaptiveLevel(ADAPTIVE_START, log.map((l) => l.correct))
      setDifficulty(d)
    }
    nextItem(d)
  }, [result, adaptive, difficulty, log, nextItem])

  // The next press of "Weiter" is accepted once the new item is on screen.
  useEffect(() => {
    advancing.current = false
  }, [item])

  // Setting "Taschenrechner standardmäßig öffnen": open it once at the first item that allows it.
  useEffect(() => {
    if (item?.calculator === 'allowed' && settings.calculatorDefault && !calcOpened.current) {
      calcOpened.current = true
      setCalc('auto')
    }
  }, [item, settings.calculatorDefault])

  // Enter = next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && result && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, next])

  const now = useNow(500, !result && !!item)
  const finish = async () => {
    if (session) await finishSession(session)
    setDone(true)
  }

  const stats = useMemo(() => aggregate(log.map((l) => ({ answered: true, correct: l.correct, timeMs: l.timeMs, targetSec: 0 }) as unknown as Attempt)), [log])

  if (done) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Sitzung beendet" subtitle={title} />
        <Card className="space-y-2">
          {log.length === 0 && kind === 'mistakes' ? <p>Dein Fehlerheft ist leer – sehr gut!</p> : null}
          {log.length === 0 && kind !== 'mistakes' ? <p>Keine Aufgaben bearbeitet.</p> : null}
          {log.length > 0 && (
            <>
              <p className="text-lg">
                <strong className="tabnums">
                  {stats.correct} / {stats.answered}
                </strong>{' '}
                richtig ({pctText(stats.accuracy)})
              </p>
              <p className="muted text-sm">Ø Zeit pro Aufgabe: {stats.avgTimeSec?.toFixed(1).replace('.', ',')} s</p>
            </>
          )}
        </Card>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton to="/stats" variant="primary">
            Zur Statistik
          </LinkButton>
          <LinkButton to={kind === 'training' ? `/practice/${cat}` : '/'}>Zurück</LinkButton>
        </div>
      </div>
    )
  }

  if (!item) return <p className="muted p-6">Lade Aufgabe …</p>

  const submitWidget = needsSubmitButton(item)
  const elapsed = (now - shownAt) / 1000
  const freeInput = item.category === 'speed' && settings.speedInput === 'free'
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => void finish().then(() => nav(-1))} aria-label="Training beenden">
          <Icon name="back" /> Beenden
        </Button>
        <span className="flex-1 sm:hidden" />
        <div className="order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="muted truncate text-xs">
            {subTitle(item.sub)} · {DIFFICULTY_LABEL[item.difficulty]}
            {adaptive ? ' (adaptiv)' : ''}
          </div>
        </div>
        <Badge tone="neutral">
          <span className="tabnums">
            {log.filter((l) => l.correct).length}/{log.length}
          </span>
        </Badge>
        <Badge tone={elapsed > item.targetSec && !result ? 'warn' : 'neutral'}>
          <span className="tabnums">
            ⏱ {fmtDuration(result ? (log.at(-1)?.timeMs ?? 0) / 1000 : elapsed)} / Ziel {item.targetSec} s
          </span>
        </Badge>
        {item.calculator === 'allowed' && (
          <Button variant="ghost" aria-label="Taschenrechner" onClick={() => setCalc((c) => (c ? false : 'user'))}>
            <Icon name="calc" />
          </Button>
        )}
      </div>
      <ItemView key={item.key} item={item} mode={submitWidget ? 'draft' : 'instant'} draft={draft} onDraft={setDraft} onSubmit={(a) => void submit(a)} revealed={!!result} freeInput={freeInput} />
      {submitWidget && !result && (
        <div className="mt-4">
          <Button variant="primary" disabled={!draft} onClick={() => draft && void submit(draft)}>
            Antwort abgeben
          </Button>
        </div>
      )}
      {result && (
        <>
          <Explanation item={item} correct={result.correct} />
          <div className="sticky bottom-0 mt-4 flex justify-end bg-gradient-to-t from-[var(--bg)] pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <Button variant="primary" onClick={next} autoFocus>
              Weiter ↵
            </Button>
          </div>
        </>
      )}
      {calc && item?.calculator === 'allowed' && <Calculator autoFocus={calc === 'user'} onClose={() => setCalc(false)} />}
    </div>
  )
}
