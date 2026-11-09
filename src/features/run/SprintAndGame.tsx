/** Kopfrechen-Sprint (/sprint) and standalone Aon game mode (/run/game/:game). */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { checkAnswer } from '../../content/check'
import { pickFrom } from '../../content/picker'
import { resolveItem } from '../../content/items'
import { randomSeed } from '../../content/rng'
import type { McqItem } from '../../content/types'
import { refKey } from '../../content/types'
import { saveAttempt } from '../../data/repo'
import type { Session } from '../../data/types'
import { useSettings } from '../../state/settings'
import { NumberEntry } from '../../ui/answers'
import { Badge, Button, Card, Confirm, fmtDuration, LinkButton, PageHeader, Segmented } from '../../ui/kit'
import { GameSection, type GameResult } from '../sim/GameSection'
import { finishSession, makeAttempt, startSession, useNow } from './common'

export function SprintSetup() {
  const [sec, setSec] = useState<60 | 90 | 120>(90)
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Kopfrechen-Sprint" subtitle="Freie Eingabe ohne Optionen. So viele Aufgaben wie möglich – ohne Taschenrechner." back />
      <Card className="space-y-4">
        <Segmented label="Dauer" value={sec} onChange={setSec} options={[{ value: 60, label: '60 s' }, { value: 90, label: '90 s' }, { value: 120, label: '120 s' }]} />
        <p className="muted text-sm">Mix aus Grundrechenarten, Prozent, Brüchen, Quadraten und großen Zahlen auf Test-Niveau. Komma oder Punkt als Dezimaltrenner möglich.</p>
        <Button variant="primary" onClick={() => nav(`/sprint/run?sec=${sec}`)}>
          Los geht’s
        </Button>
      </Card>
    </div>
  )
}

const SPRINT_GENS = ['speed.addsub', 'speed.mul', 'speed.div', 'speed.squares', 'speed.percent', 'speed.fraction', 'speed.units']

export function SprintRun() {
  const [params] = useSearchParams()
  const sec = Number(params.get('sec') ?? 90)
  const { settings } = useSettings()
  const [session, setSession] = useState<Session | null>(null)
  const [item, setItem] = useState<McqItem | null>(null)
  const [endsAt, setEndsAt] = useState(0)
  const [shownAt, setShownAt] = useState(() => Date.now())
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [flash, setFlash] = useState<null | boolean>(null)
  const [done, setDone] = useState(false)
  const used = useRef(new Set<string>())
  const next = () => {
    for (let i = 0; i < 10; i++) {
      const ref = pickFrom('speed', SPRINT_GENS[randomSeed() % SPRINT_GENS.length], 2, { used: used.current })
      if (!ref) continue
      used.current.add(refKey(ref))
      const it = resolveItem(ref, settings.itemLang)
      if (it && it.type === 'mcq' && it.free) {
        setItem(it)
        setShownAt(Date.now())
        return
      }
    }
  }
  useEffect(() => {
    void startSession({ mode: 'sprint', title: `Kopfrechen-Sprint ${sec} s`, category: 'speed' }).then((s) => {
      setSession(s)
      setEndsAt(Date.now() + sec * 1000)
      next()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const now = useNow(200, !done && endsAt > 0)
  const remaining = endsAt ? (endsAt - now) / 1000 : sec
  useEffect(() => {
    if (!done && endsAt && remaining <= 0 && session) {
      setDone(true)
      void finishSession(session)
    }
  }, [remaining, done, endsAt, session])
  if (done)
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Sprint beendet" />
        <Card>
          <p className="text-lg">
            <strong className="tabnums">{score.right}</strong> richtig von {score.total} in {sec} Sekunden
          </p>
          <p className="muted text-sm">Zum Vergleich: Im BCG Cognitive Test bleiben ca. 22 Sekunden pro Aufgabe – also rund {Math.round(sec / 22)} Aufgaben in {sec} s.</p>
        </Card>
        <div className="mt-4 flex gap-2">
          <LinkButton to="/sprint" variant="primary">
            Nochmal
          </LinkButton>
          <LinkButton to="/stats">Statistik</LinkButton>
        </div>
      </div>
    )
  if (!item || !session) return <p className="muted p-6">Lade …</p>
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <Badge tone="accent">
          <span className="tabnums">
            {score.right} richtig · {score.total} gesamt
          </span>
        </Badge>
        <Badge tone={remaining < 10 ? 'bad' : 'neutral'}>
          <span className="tabnums">⏱ {fmtDuration(remaining)}</span>
        </Badge>
      </div>
      <Card className={`mb-4 ${flash === null ? '' : flash ? 'border-[var(--ok)]' : 'border-[var(--bad)]'}`}>
        <p className="text-2xl font-bold tabnums">{item.prompt.replace(/^(Calculate|Berechne): /, '')}</p>
        {item.hint && <p className="muted text-sm">{item.hint}</p>}
      </Card>
      <NumberEntry
        key={item.key}
        label="Ergebnis"
        onSubmit={(v) => {
          const r = checkAnswer(item, { type: 'numeric', value: v })
          setScore((s) => ({ right: s.right + (r.correct ? 1 : 0), total: s.total + 1 }))
          setFlash(r.correct)
          setTimeout(() => setFlash(null), 300)
          saveAttempt(makeAttempt(item, { mode: 'sprint', sessionId: session.id, answer: { type: 'numeric', value: v }, timeMs: Date.now() - shownAt, result: r })).catch(() => undefined)
          next()
        }}
      />
      <p className="muted mt-3 text-xs">Unter Zeitdruck lieber schnell überschlagen und weiter – genau wie im echten Test.</p>
    </div>
  )
}

const GAME_SEC = { switch: 360, digit: 300, grid: 360 } as const

export function GameRun() {
  const { game = 'switch' } = useParams() as { game: 'switch' | 'digit' | 'grid' }
  // "Nochmal" stays on the same route, so a round counter remounts the game.
  const [round, setRound] = useState(0)
  return <GameRound key={`${game}-${round}`} game={game} onAgain={() => setRound((r) => r + 1)} />
}

function GameRound({ game, onAgain }: { game: 'switch' | 'digit' | 'grid'; onAgain: () => void }) {
  const { settings } = useSettings()
  const nav = useNavigate()
  const session = useRef<Promise<Session> | null>(null)
  const [results, setResults] = useState<GameResult[] | null>(null)
  const [endsAt, setEndsAt] = useState(0)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const now = useNow(250, !!endsAt && !results)
  // The session starts with the game (not on mount); every answer is saved right away.
  const start = (end: number) => {
    setEndsAt(end)
    session.current = startSession({ mode: 'game', title: `Aon ${game}`, category: 'aon', sub: `aon.${game}` })
  }
  const save = (r: GameResult, k: number) => {
    void session.current?.then((s) => saveAttempt(makeAttempt(r.item, { mode: 'game', sessionId: s.id, answer: r.answer, timeMs: r.timeMs, id: `${s.id}:${k}`, seq: k }))).catch(() => undefined)
  }
  const leave = async () => {
    const s = await session.current
    if (s) await finishSession(s, 'aborted')
    nav('/practice/aon')
  }
  if (results) {
    const right = results.filter((r) => r.correct).length
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Spiel beendet" />
        <Card>
          <p className="text-lg">
            <strong className="tabnums">{right}</strong> von {results.length} Aufgaben gelöst
          </p>
          <p className="muted text-sm">Höchste erreichte Stufe: {Math.max(1, ...results.map((r) => r.item.difficulty))}</p>
        </Card>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={onAgain}>
            Nochmal
          </Button>
          <LinkButton to="/practice/aon">Zurück</LinkButton>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        {endsAt > 0 ? (
          <Button variant="ghost" onClick={() => setConfirmEnd(true)}>
            ← Beenden
          </Button>
        ) : (
          <LinkButton to="/practice/aon" variant="ghost">
            ← Zurück
          </LinkButton>
        )}
        {endsAt > 0 && (
          <Badge tone={endsAt - now < 30000 ? 'bad' : 'neutral'}>
            <span className="tabnums">⏱ {fmtDuration((endsAt - now) / 1000)}</span>
          </Badge>
        )}
      </div>
      <GameSection
        game={game}
        durationSec={GAME_SEC[game]}
        lang={settings.itemLang}
        onStart={start}
        onResult={save}
        onEnd={(r) => {
          void session.current?.then((s) => finishSession(s))
          setResults(r)
        }}
      />
      <Confirm
        open={confirmEnd}
        title="Spiel beenden?"
        body="Deine bisherigen Antworten bleiben gespeichert und zählen in der Statistik."
        confirmLabel="Beenden"
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => void leave()}
      />
    </div>
  )
}
