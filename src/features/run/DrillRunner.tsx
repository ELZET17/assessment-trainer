/** Drill: N items on the clock, feedback at the end. URL: /run/drill?cat=…&sub=…&d=…&n=10 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useSearchParams } from 'react-router'
import { CATEGORY_BY_ID } from '../../content/categories'
import { resolveItem } from '../../content/items'
import { pickFrom } from '../../content/picker'
import type { Answer, Difficulty, Item } from '../../content/types'
import { refKey } from '../../content/types'
import { saveAttempts } from '../../data/repo'
import type { Attempt, Session } from '../../data/types'
import { useSettings } from '../../state/settings'
import { Calculator } from '../../ui/Calculator'
import { ItemView, needsSubmitButton } from '../../ui/ItemView'
import { Badge, Button, Card, Confirm, fmtDuration, Icon, LinkButton, PageHeader, pctText, Progress } from '../../ui/kit'
import { finishSession, makeAttempt, parseRunParams, startSession, useLeaveWarning, useNow } from './common'
import { Review } from './Review'

export default function DrillRunner() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { settings } = useSettings()
  const { cat, sub, d: dParam, n } = parseRunParams(params)
  const d: Difficulty = dParam === 'adaptive' ? 2 : dParam
  const [items, setItems] = useState<Item[] | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [pos, setPos] = useState(0)
  const [results, setResults] = useState<Attempt[]>([])
  const [draft, setDraft] = useState<Answer | null>(null)
  const [endsAt, setEndsAt] = useState(0)
  const [shownAt, setShownAt] = useState(() => Date.now())
  const [done, setDone] = useState(false)
  const [calc, setCalc] = useState(false)
  const [askQuit, setAskQuit] = useState(false)
  const busy = useRef(false)
  const doneRef = useRef(false)
  // Synchronous guards (state updates arrive one render later – too late for a tap at the time limit).
  const ending = useRef(false)
  const resultsRef = useRef<Attempt[]>([])
  /** Taps right after a question change are ignored, so a double tap cannot answer the next question. */
  const lockUntil = useRef(0)

  useEffect(() => {
    const used = new Set<string>()
    const list: Item[] = []
    for (let i = 0; i < n * 3 && list.length < n; i++) {
      const ref = pickFrom(cat, sub, d, { used })
      if (!ref) break
      used.add(refKey(ref))
      const it = resolveItem(ref, settings.itemLang)
      if (it) list.push(it)
    }
    setItems(list)
    const total = list.reduce((s, it) => s + it.targetSec, 0)
    void startSession({ mode: 'drill', title: `Drill · ${CATEGORY_BY_ID[cat].name}`, category: cat, sub: sub ?? undefined, difficulty: d, sections: [{ id: 'drill', title: 'Drill', planned: list.length, timeLimitSec: total }] }).then((s) => {
      setSession(s)
      setEndsAt(Date.now() + total * 1000)
      setShownAt(Date.now())
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => !doneRef.current && !!session && currentLocation.pathname !== nextLocation.pathname)

  /** Ids are session + position: every item is stored exactly once, whatever races happen. */
  const idOf = (s: Session, i: number) => `${s.id}:${i}`

  const end = useCallback(async () => {
    if (!items || !session || ending.current) return
    ending.current = true
    // Unanswered items (time ran out) are stored as not answered.
    const given = resultsRef.current
    const missing = items.slice(given.length).map((it, k) => makeAttempt(it, { mode: 'drill', sessionId: session.id, answer: null, timeMs: 0, id: idOf(session, given.length + k), seq: given.length + k }))
    const all = [...given, ...missing]
    await saveAttempts(missing)
    await finishSession(session)
    doneRef.current = true
    setResults(all)
    setDone(true)
  }, [items, session])

  const answer = useCallback(
    async (a: Answer) => {
      if (!items || !session || busy.current || ending.current || Date.now() < lockUntil.current) return
      const index = resultsRef.current.length
      if (index !== pos) return
      busy.current = true
      const att = makeAttempt(items[index], { mode: 'drill', sessionId: session.id, answer: a, timeMs: Date.now() - shownAt, id: idOf(session, index), seq: index })
      resultsRef.current = [...resultsRef.current, att]
      setResults(resultsRef.current)
      setDraft(null)
      await saveAttempts([att])
      if (index + 1 >= items.length) await end()
      else {
        lockUntil.current = Date.now() + 350
        setPos(index + 1)
        setShownAt(Date.now())
      }
      busy.current = false
    },
    [items, session, pos, shownAt, end],
  )

  // Ordering items start with a valid answer (the shown order), like in SHL tests.
  useEffect(() => {
    const it = items?.[pos]
    setDraft(it?.type === 'order' ? { type: 'order', order: it.entries.map((_, i) => i) } : null)
  }, [items, pos])

  // Setting "Taschenrechner standardmäßig öffnen" (only where the calculator is allowed).
  const calcOpened = useRef(false)
  useEffect(() => {
    if (items?.[pos]?.calculator === 'allowed' && settings.calculatorDefault && !calcOpened.current) {
      calcOpened.current = true
      setCalc(true)
    }
  }, [items, pos, settings.calculatorDefault])

  useLeaveWarning(!!session && !done)
  const now = useNow(250, !done && endsAt > 0)
  const remaining = endsAt ? (endsAt - now) / 1000 : 0
  useEffect(() => {
    if (!done && endsAt && remaining <= 0 && !ending.current) void end()
  }, [remaining, done, endsAt, end])

  if (!items || !session) return <p className="muted p-6">Lade Drill …</p>

  if (done) {
    const answered = results.filter((r) => r.answered)
    const correct = answered.filter((r) => r.correct).length
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Drill-Ergebnis" subtitle={`${CATEGORY_BY_ID[cat].name} · ${items.length} Aufgaben`} />
        <Card className="mb-4">
          <p className="text-lg">
            <strong className="tabnums">
              {correct} / {items.length}
            </strong>{' '}
            richtig ({pctText(items.length ? (correct / items.length) * 100 : null)}) · {answered.length} von {items.length} in der Zeit beantwortet
          </p>
        </Card>
        <Review entries={results.map((r, i) => ({ item: items[i], attempt: r }))} />
        <div className="mt-4 flex gap-2">
          <LinkButton to={`/practice/${cat}`} variant="primary">
            Zurück zur Kategorie
          </LinkButton>
          <LinkButton to="/stats">Statistik</LinkButton>
        </div>
      </div>
    )
  }

  const item = items[pos]
  const submitWidget = needsSubmitButton(item)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setAskQuit(true)}>
          <Icon name="back" /> Abbrechen
        </Button>
        <span className="flex-1 sm:hidden" />
        <div className="order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
          <div className="text-sm font-semibold">
            Drill · Frage {pos + 1} von {items.length}
          </div>
          <Progress value={(pos / items.length) * 100} label="Fortschritt" />
        </div>
        <Badge tone={remaining < 30 ? 'bad' : 'neutral'}>
          <span className="tabnums" aria-live="off">
            ⏱ {fmtDuration(remaining)}
          </span>
        </Badge>
        {item.calculator === 'allowed' && (
          <Button variant="ghost" aria-label="Taschenrechner" onClick={() => setCalc((c) => !c)}>
            <Icon name="calc" />
          </Button>
        )}
      </div>
      <ItemView key={item.key} item={item} mode={submitWidget ? 'draft' : 'instant'} draft={draft} onDraft={setDraft} onSubmit={(a) => void answer(a)} freeInput={item.category === 'speed' && settings.speedInput === 'free'} />
      {submitWidget && (
        <Button className="mt-4" variant="primary" disabled={!draft} onClick={() => draft && void answer(draft)}>
          Antwort abgeben
        </Button>
      )}
      {calc && item.calculator === 'allowed' && <Calculator onClose={() => setCalc(false)} />}
      <Confirm
        open={askQuit || blocker.state === 'blocked'}
        title="Drill abbrechen?"
        body="Bisher gegebene Antworten bleiben gespeichert."
        confirmLabel="Drill abbrechen"
        cancelLabel="Weiter üben"
        danger
        onCancel={() => {
          setAskQuit(false)
          if (blocker.state === 'blocked') blocker.reset()
        }}
        onConfirm={() => {
          setAskQuit(false)
          ending.current = true
          void finishSession(session, 'aborted').then(() => {
            doneRef.current = true
            setDone(true)
            if (blocker.state === 'blocked') blocker.proceed()
            else nav(`/practice/${cat}`)
          })
        }}
      />
    </div>
  )
}
