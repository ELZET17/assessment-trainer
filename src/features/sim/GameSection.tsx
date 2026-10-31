/** Aon game section: as many items as possible until the countdown ends, adaptive difficulty, no going back. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { checkAnswer } from '../../content/check'
import { adaptiveNext } from '../../content/picker'
import { getGenerator } from '../../content/registry'
import { randomSeed } from '../../content/rng'
import type { Answer, Difficulty, Item, Lang } from '../../content/types'
import { ItemView } from '../../ui/ItemView'
import { Badge, Button, Card } from '../../ui/kit'
import { useNow } from '../run/common'

export interface GameResult {
  item: Item
  answer: Answer
  correct: boolean
  timeMs: number
}

const GEN: Record<'switch' | 'digit' | 'grid', string> = { switch: 'aon.switch', digit: 'aon.digit', grid: 'aon.grid' }
const INTRO: Record<'switch' | 'digit' | 'grid', string> = {
  switch: 'Finde den Code des leeren Operators. Der Code gibt für jede Ausgangsposition an, von welcher Eingangsposition das Symbol kommt (z. B. 3142: Position 1 bekommt das 3. Symbol).',
  digit: 'Fülle die Kästchen mit den Ziffern 1–9 (jede höchstens einmal). Punkt vor Strich. Jede gültige Lösung zählt.',
  grid: 'Merke dir die Punkte im 4×4-Raster. Dazwischen beantwortest du Symmetrie- bzw. Drehungsfragen. Am Ende tippst du die Punkte in der richtigen Reihenfolge an.',
}

export function GameSection({ game, durationSec, lang, onStart, onEnd, startDifficulty = 1 }: { game: 'switch' | 'digit' | 'grid'; durationSec: number; lang: Lang; onStart?: (endsAt: number) => void; onEnd: (r: GameResult[]) => void; startDifficulty?: Difficulty }) {
  const gen = getGenerator(GEN[game])
  const [started, setStarted] = useState(false)
  const [item, setItem] = useState<Item | null>(null)
  const [draft, setDraft] = useState<Answer | null>(null)
  const [d, setD] = useState<Difficulty>(startDifficulty)
  const [shownAt, setShownAt] = useState(() => Date.now())
  const results = useRef<GameResult[]>([])
  const history = useRef<boolean[]>([])
  const ended = useRef(false)
  const [endsAt, setEndsAt] = useState(0)
  const [tally, setTally] = useState({ solved: 0, total: 0 })

  const newItem = useCallback(
    (diff: Difficulty) => {
      if (!gen) return
      setItem(gen.generate(randomSeed(), diff, lang))
      setDraft(null)
      setShownAt(Date.now())
    },
    [gen, lang],
  )

  // The countdown starts when the candidate presses "Start" (time spent on the intro is added back).
  const now = useNow(250, started)
  const remaining = (endsAt - now) / 1000
  useEffect(() => {
    if (started && remaining <= 0 && !ended.current) {
      ended.current = true
      onEnd(results.current)
    }
  }, [remaining, started, onEnd])

  const submit = (a: Answer) => {
    if (!item || ended.current) return
    const ok = checkAnswer(item, a).correct
    results.current.push({ item, answer: a, correct: ok, timeMs: Date.now() - shownAt })
    history.current.push(ok)
    setTally((t) => ({ solved: t.solved + (ok ? 1 : 0), total: t.total + 1 }))
    const nd = adaptiveNext(d, history.current)
    setD(nd)
    newItem(nd)
  }

  if (!started) {
    return (
      <Card className="mx-auto max-w-lg space-y-3">
        <h2 className="text-lg font-bold">{gen?.title}</h2>
        <p className="text-[15px]">{INTRO[game]}</p>
        <p className="muted text-sm">So viele Aufgaben wie möglich. Die Schwierigkeit steigt nach richtigen Antworten. Kein Zurückspringen.</p>
        <Button
          variant="primary"
          onClick={() => {
            const end = Date.now() + durationSec * 1000
            setEndsAt(end)
            onStart?.(end)
            setStarted(true)
            newItem(startDifficulty)
          }}
        >
          Start
        </Button>
      </Card>
    )
  }
  if (!item) return null
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Badge tone="accent">Stufe {d}</Badge>
        <span className="muted text-sm tabnums">
          Gelöst: {tally.solved} / {tally.total}
        </span>
      </div>
      <ItemView key={item.key + tally.total} item={item} mode="instant" draft={draft} onDraft={setDraft} onSubmit={submit} />
    </div>
  )
}
