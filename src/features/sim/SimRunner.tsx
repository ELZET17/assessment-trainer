/** Company test simulation: sections, timers, navigation rules and scoring from profiles.ts. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { checkAnswer } from '../../content/check'
import { resolveItem } from '../../content/items'
import { adaptiveNext, pickFrom, refForGen, weighted } from '../../content/picker'
import { getProfile, type Profile, type SectionSpec } from '../../content/profiles'
import { getGenerator } from '../../content/registry'
import { createRng, randomSeed, type Rng } from '../../content/rng'
import type { Answer, Difficulty, Item, ItemRef } from '../../content/types'
import { refKey } from '../../content/types'
import { saveAttempts } from '../../data/repo'
import type { Attempt, Session } from '../../data/types'
import { useSettings } from '../../state/settings'
import { Calculator } from '../../ui/Calculator'
import { ItemView } from '../../ui/ItemView'
import { Badge, Button, Confirm, fmtDuration, Icon } from '../../ui/kit'
import { finishSession, makeAttempt, startSession, useNow } from '../run/common'
import { GameSection, type GameResult } from './GameSection'

interface Slot {
  item: Item
  answer: Answer | null
  timeMs: number
}

function pickRef(rng: Rng, sec: SectionSpec, d: Difficulty, used: Set<string>): ItemRef | null {
  for (let i = 0; i < 30; i++) {
    const m = weighted(rng, sec.mix.map((x) => ({ item: x, w: x.weight })))
    const diff = m.d ?? d
    let ref: ItemRef | null
    if (m.bank) ref = pickFrom(m.bank, null, diff, { used, rng })
    else if (m.gen && getGenerator(m.gen)) ref = refForGen(m.gen, diff, rng)
    else ref = null
    if (ref && !used.has(refKey(ref))) {
      used.add(refKey(ref))
      return ref
    }
  }
  return null
}

export default function SimRunner() {
  const { profileId = '' } = useParams()
  const profile = getProfile(profileId) as Profile
  const nav = useNavigate()
  const { settings } = useSettings()
  const rng = useRef(createRng(randomSeed()))
  const used = useRef(new Set<string>())
  const [session, setSession] = useState<Session | null>(null)
  const [secIdx, setSecIdx] = useState(0)
  const [slots, setSlots] = useState<Slot[][]>([])
  const [pos, setPos] = useState(0)
  const [sectionEnds, setSectionEnds] = useState(0)
  const [shownAt, setShownAt] = useState(() => Date.now())
  const [diff, setDiff] = useState<Difficulty>(profile?.difficulty ?? 2)
  const [history, setHistory] = useState<boolean[]>([])
  const [calc, setCalc] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [finished, setFinished] = useState(false)
  const gameResults = useRef<GameResult[][]>([])
  const ending = useRef(false)
  // Ref (not state): the blocker must see the finish immediately, before React re-renders.
  const finishedRef = useRef(false)
  const total = !!profile?.totalTimeSec
  const sec = profile?.sections[secIdx]

  const makeItem = useCallback(
    (s: SectionSpec, d: Difficulty): Item | null => {
      const ref = pickRef(rng.current, s, d, used.current)
      return ref ? resolveItem(ref, settings.itemLang) : null
    },
    [settings.itemLang],
  )

  // Pre-build all sections for non-adaptive profiles; adaptive ones grow item by item.
  useEffect(() => {
    if (!profile || session) return
    const built: Slot[][] = profile.sections.map((s) => {
      if (s.game || s.count === null) return []
      const n = profile.adaptive ? 1 : s.count
      const list: Slot[] = []
      for (let i = 0; i < n; i++) {
        const it = makeItem(s, profile.difficulty)
        if (it) list.push({ item: it, answer: null, timeMs: 0 })
      }
      return list
    })
    setSlots(built)
    void startSession({
      mode: 'simulation',
      title: profile.name,
      profileId: profile.id,
      sections: profile.sections.map((s) => ({ id: s.id, title: s.title, planned: s.count, timeLimitSec: total ? null : s.timeLimitSec })),
    }).then((s) => {
      setSession(s)
      const now = Date.now()
      setSectionEnds(now + (total ? (profile.totalTimeSec as number) : profile.sections[0].timeLimitSec) * 1000)
      setShownAt(now)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => !finishedRef.current && !!session && currentLocation.pathname !== nextLocation.pathname)

  // Flattened view for the total-timer mode (Kearney): navigation across all sections.
  const flat = useMemo(() => slots.flatMap((list, si) => list.map((s, i) => ({ si, i, s }))), [slots])
  const curList = total ? flat.map((f) => f.s) : (slots[secIdx] ?? [])
  const current = curList[pos]

  const commitTime = useCallback(() => {
    if (!current) return
    const dt = Date.now() - shownAt
    setSlots((all) => {
      const copy = all.map((l) => l.slice())
      const loc = total ? flat[pos] : { si: secIdx, i: pos }
      if (loc && copy[loc.si]?.[loc.i]) copy[loc.si][loc.i] = { ...copy[loc.si][loc.i], timeMs: copy[loc.si][loc.i].timeMs + dt }
      return copy
    })
    setShownAt(Date.now())
  }, [current, shownAt, total, flat, pos, secIdx])

  const setAnswer = (a: Answer) => {
    setSlots((all) => {
      const copy = all.map((l) => l.slice())
      const loc = total ? flat[pos] : { si: secIdx, i: pos }
      if (loc) copy[loc.si][loc.i] = { ...copy[loc.si][loc.i], answer: a }
      return copy
    })
  }

  const finishAll = useCallback(async () => {
    if (!session || ending.current) return
    ending.current = true
    const attempts: Attempt[] = []
    profile.sections.forEach((s, si) => {
      if (s.game) {
        for (const g of gameResults.current[si] ?? []) attempts.push(makeAttempt(g.item, { mode: 'simulation', sessionId: session.id, answer: g.answer, timeMs: g.timeMs, points: g.correct ? profile.scoring.correct : profile.scoring.wrong }))
        return
      }
      for (const sl of slots[si] ?? []) {
        const res = sl.answer ? checkAnswer(sl.item, sl.answer) : null
        const points = !sl.answer ? profile.scoring.blank : res?.correct ? profile.scoring.correct : profile.scoring.wrong
        attempts.push(makeAttempt(sl.item, { mode: 'simulation', sessionId: session.id, answer: sl.answer, timeMs: sl.timeMs, points, result: res ?? undefined }))
      }
    })
    await saveAttempts(attempts)
    await finishSession(session)
    finishedRef.current = true
    setFinished(true)
    nav(`/sim/result/${session.id}`, { replace: true })
  }, [session, profile, slots, nav])

  const nextSection = useCallback(() => {
    if (total || secIdx + 1 >= profile.sections.length) {
      void finishAll()
      return
    }
    const ni = secIdx + 1
    setSecIdx(ni)
    setPos(0)
    setDiff(profile.difficulty)
    setHistory([])
    setSectionEnds(Date.now() + profile.sections[ni].timeLimitSec * 1000)
    setShownAt(Date.now())
  }, [total, secIdx, profile, finishAll])

  const now = useNow(250, !!session && !finished)
  const remaining = sectionEnds ? (sectionEnds - now) / 1000 : 0
  useEffect(() => {
    if (session && sectionEnds && remaining <= 0 && !finished && !ending.current) {
      if (sec?.game) return // GameSection reports its own end
      commitTime()
      nextSection()
    }
  }, [remaining, session, sectionEnds, finished, sec, commitTime, nextSection])

  const goNext = () => {
    if (!sec) return
    commitTime()
    // Adaptive: grow the section with the next item at the new difficulty.
    if (profile.adaptive && !total && sec.count !== null && curList.length < sec.count && pos === curList.length - 1) {
      const cur = curList[pos]
      const ok = cur.answer ? checkAnswer(cur.item, cur.answer).correct : false
      const h = [...history, ok]
      const d = adaptiveNext(diff, h)
      setHistory(h)
      setDiff(d)
      const it = makeItem(sec, d)
      if (it) setSlots((all) => all.map((l, si) => (si === secIdx ? [...l, { item: it, answer: null, timeMs: 0 }] : l)))
    }
    if (pos + 1 < (profile.adaptive && sec.count ? sec.count : curList.length)) setPos(pos + 1)
    else if (total) setConfirmEnd(true)
    else nextSection()
  }

  if (!profile) return <p className="p-6">Unbekanntes Profil.</p>
  if (!session || !sec) return <p className="muted p-6">Test wird vorbereitet …</p>

  const sectionTitle = total ? profile.sections[flat[pos]?.si ?? 0]?.title : sec.title
  const header = (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{profile.name}</div>
        <div className="muted truncate text-xs">
          {sectionTitle}
          {!sec.game && ` · Frage ${pos + 1} von ${total ? flat.length : (sec.count ?? curList.length)}`}
          {!total && profile.sections.length > 1 && ` · Teil ${secIdx + 1}/${profile.sections.length}`}
        </div>
      </div>
      <Badge tone={remaining < 60 ? 'bad' : 'neutral'}>
        <span className="tabnums">⏱ {fmtDuration(remaining)}</span>
      </Badge>
      {(total ? profile.sections[flat[pos]?.si ?? 0]?.calculator : sec.calculator) && (
        <Button variant="ghost" aria-label="Taschenrechner" onClick={() => setCalc((c) => !c)}>
          <Icon name="calc" />
        </Button>
      )}
      <Button variant="ghost" onClick={() => setConfirmEnd(true)}>
        Beenden
      </Button>
    </div>
  )

  const confirm = (
    <Confirm
      open={confirmEnd || blocker.state === 'blocked'}
      title={blocker.state === 'blocked' ? 'Test verlassen?' : 'Test jetzt abgeben?'}
      body={blocker.state === 'blocked' ? 'Der Test wird abgegeben und ausgewertet. Unbeantwortete Fragen zählen als leer.' : 'Unbeantwortete Fragen zählen als leer. Das kann nicht rückgängig gemacht werden.'}
      confirmLabel="Abgeben"
      danger
      onCancel={() => {
        setConfirmEnd(false)
        if (blocker.state === 'blocked') blocker.reset()
      }}
      onConfirm={() => {
        setConfirmEnd(false)
        if (blocker.state === 'blocked') blocker.reset()
        commitTime()
        void finishAll()
      }}
    />
  )

  if (sec.game) {
    return (
      <div>
        {header}
        <GameSection
          key={sec.id}
          game={sec.game}
          durationSec={sec.timeLimitSec}
          lang={settings.itemLang}
          onStart={(end) => setSectionEnds(end)}
          onEnd={(res) => {
            gameResults.current[secIdx] = res
            nextSection()
          }}
        />
        {confirm}
      </div>
    )
  }

  if (!current) return <p className="muted p-6">Lade Frage …</p>
  const answered = (s: Slot) => s.answer !== null
  return (
    <div>
      {header}
      {profile.allowBack && (
        <nav aria-label="Fragenübersicht" className="mb-3 flex flex-wrap gap-1">
          {curList.map((s, i) => (
            <button key={i} type="button" onClick={() => (commitTime(), setPos(i))} aria-label={`Frage ${i + 1}${answered(s) ? ', beantwortet' : ''}`} aria-current={i === pos} className={`tabnums h-11 w-11 rounded-lg border text-sm font-semibold ${i === pos ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]' : answered(s) ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
              {i + 1}
            </button>
          ))}
        </nav>
      )}
      <ItemView key={current.item.key} item={current.item} mode="draft" draft={current.answer} onDraft={setAnswer} />
      <div className="sticky bottom-0 mt-4 flex flex-wrap justify-end gap-2 bg-gradient-to-t from-[var(--bg)] py-3">
        {profile.allowBack && pos > 0 && (
          <Button onClick={() => (commitTime(), setPos(pos - 1))}>← Zurück</Button>
        )}
        {profile.allowSkip && !current.answer && <Button onClick={goNext}>Überspringen</Button>}
        <Button variant="primary" disabled={!profile.allowSkip && !current.answer} onClick={goNext}>
          {pos + 1 >= (total ? flat.length : (sec.count ?? curList.length)) ? (total || secIdx + 1 >= profile.sections.length ? 'Test abgeben' : 'Nächster Teil →') : 'Weiter →'}
        </Button>
      </div>
      {calc && <Calculator onClose={() => setCalc(false)} />}
      {confirm}
    </div>
  )
}
