/** Drill: N items on the clock, feedback at the end. URL: /run/drill?cat=…&sub=…&d=…&n=10 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useSearchParams } from 'react-router'
import { CATEGORY_BY_ID } from '../../content/categories'
import { resolveItem } from '../../content/items'
import { pickFrom } from '../../content/picker'
import type { Answer, CategoryId, Difficulty, Item } from '../../content/types'
import { refKey } from '../../content/types'
import { saveAttempts } from '../../data/repo'
import type { Attempt, Session } from '../../data/types'
import { useSettings } from '../../state/settings'
import { Calculator } from '../../ui/Calculator'
import { ItemView, needsSubmitButton } from '../../ui/ItemView'
import { Badge, Button, Card, Confirm, fmtDuration, Icon, LinkButton, PageHeader, pctText, Progress } from '../../ui/kit'
import { finishSession, makeAttempt, startSession, useNow } from './common'
import { Review } from './Review'

export default function DrillRunner() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { settings } = useSettings()
  const cat = (params.get('cat') ?? 'speed') as CategoryId
  const sub = params.get('sub')
  const d = (Number(params.get('d') ?? 2) || 2) as Difficulty
  const n = Math.max(3, Math.min(40, Number(params.get('n') ?? 10)))
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

  const blocker = useBlocker(({ currentLocation, nextLocation }) => !done && !!session && currentLocation.pathname !== nextLocation.pathname)

  const end = useCallback(
    async (finalResults: Attempt[]) => {
      if (!items || !session || done) return
      // Unanswered items (time ran out) are stored as not answered.
      const missing = items.slice(finalResults.length).map((it) => makeAttempt(it, { mode: 'drill', sessionId: session.id, answer: null, timeMs: 0 }))
      const all = [...finalResults, ...missing]
      await saveAttempts(missing)
      await finishSession(session)
      setResults(all)
      setDone(true)
    },
    [items, session, done],
  )

  const answer = useCallback(
    async (a: Answer) => {
      if (!items || !session || busy.current || done) return
      busy.current = true
      const it = items[pos]
      const att = makeAttempt(it, { mode: 'drill', sessionId: session.id, answer: a, timeMs: Date.now() - shownAt })
      await saveAttempts([att])
      const next = [...results, att]
      setResults(next)
      setDraft(null)
      if (pos + 1 >= items.length) await end(next)
      else {
        setPos(pos + 1)
        setShownAt(Date.now())
      }
      busy.current = false
    },
    [items, session, pos, shownAt, results, end, done],
  )

  const now = useNow(250, !done && endsAt > 0)
  const remaining = endsAt ? (endsAt - now) / 1000 : 0
  useEffect(() => {
    if (!done && endsAt && remaining <= 0 && !busy.current) {
      busy.current = true
      void end(results).finally(() => (busy.current = false))
    }
  }, [remaining, done, endsAt, end, results])

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
      {calc && <Calculator onClose={() => setCalc(false)} />}
      <Confirm
        open={askQuit || blocker.state === 'blocked'}
        title="Drill abbrechen?"
        body="Bisher gegebene Antworten bleiben gespeichert."
        confirmLabel="Abbrechen"
        danger
        onCancel={() => {
          setAskQuit(false)
          if (blocker.state === 'blocked') blocker.reset()
        }}
        onConfirm={() => {
          setAskQuit(false)
          void finishSession(session, 'aborted').then(() => {
            setDone(true)
            if (blocker.state === 'blocked') blocker.proceed()
            else nav(`/practice/${cat}`)
          })
        }}
      />
    </div>
  )
}
