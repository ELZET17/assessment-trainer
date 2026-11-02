import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIES } from '../../content/categories'
import { subTitle } from '../../content/items'
import { db } from '../../data/db'
import { mistakeBook } from '../../data/mistakes'
import { localDay } from '../../data/repo'
import { aggregate, byCategory, streak, weaknesses } from '../../data/stats'
import { useSettings } from '../../state/settings'
import { Card, Icon, LinkButton, pctText, Progress, Stat } from '../../ui/kit'
import { academyFor } from '../academy/lessons'

export default function Home() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  const { settings } = useSettings()
  const [today] = useState(() => localDay(Date.now()))
  const data = useMemo(() => {
    const list = attempts ?? []
    return {
      todayAgg: aggregate(list.filter((a) => a.day === today)),
      all: aggregate(list),
      cats: byCategory(list),
      streak: streak(list, today),
      weak: weaknesses(list),
      mistakes: mistakeBook(list).length,
    }
  }, [attempts, today])
  return (
    <div>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessment Trainer</h1>
          <p className="muted text-sm">Bain · BCG · Kearney · P&amp;G · Allianz · Deutsche Bank</p>
        </div>
        <Link to="/settings" aria-label="Einstellungen" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden">
          <Icon name="settings" />
        </Link>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Streak" value={`${data.streak} ${data.streak === 1 ? 'Tag' : 'Tage'}`} sub="Übungstage in Folge" />
        <Stat label="Heute" value={data.todayAgg.answered} sub={`Aufgaben · ${pctText(data.todayAgg.accuracy)}`} />
        <Stat label="Gesamt" value={pctText(data.all.accuracy)} sub={`${data.all.correct}/${data.all.answered} richtig`} />
        <Stat label="Fehlerheft" value={data.mistakes} sub="offene Aufgaben" />
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[15px] font-bold">
            <Icon name="bolt" /> Tägliches Quick-Set
          </div>
          <p className="muted text-sm">10 gemischte Fragen, gewichtet nach deinen Schwächen.</p>
          <LinkButton to="/run/quick" variant="primary" className="mt-auto">
            Starten
          </LinkButton>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[15px] font-bold">
            <Icon name="book" /> Fehlerheft
          </div>
          <p className="muted text-sm">{data.mistakes ? `${data.mistakes} Aufgaben warten. Raus nach 2× richtig in Folge.` : 'Noch keine Fehler gespeichert.'}</p>
          <LinkButton to="/mistakes" className="mt-auto">
            Öffnen
          </LinkButton>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[15px] font-bold">
            <Icon name="clock" /> Kopfrechen-Sprint
          </div>
          <p className="muted text-sm">60–120 Sekunden, so viele Aufgaben wie möglich – ohne Rechner.</p>
          <LinkButton to="/sprint" className="mt-auto">
            Sprint
          </LinkButton>
        </Card>
      </div>

      {data.weak.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-lg font-bold">Deine größten Schwächen</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {data.weak.map((w) => (
              <Card key={w.sub}>
                <div className="text-[15px] font-semibold">{subTitle(w.sub)}</div>
                <div className="muted mb-2 text-sm tabnums">
                  {pctText(w.accuracy)} bei {w.answered} Versuchen
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkButton to={`/run/training?cat=${w.category}&sub=${encodeURIComponent(w.sub)}&d=adaptive`} variant="primary">
                    Jetzt üben
                  </LinkButton>
                  <LinkButton to={`/academy/${academyFor(w.category)}`}>Strategie lesen</LinkButton>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-bold">Kategorien</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const agg = data.cats.get(c.id)
            return (
              <Link key={c.id} to={`/practice/${c.id}`} className="card flex min-h-20 flex-col gap-1.5 p-3 no-underline hover:bg-[var(--surface-2)]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">{c.letter}</span>
                  <span className="text-[15px] font-semibold text-[var(--text)]">{c.name}</span>
                </div>
                <span className="muted text-xs">Laut Recherche: {c.usedBy}</span>
                <div className="flex items-center gap-2">
                  <Progress value={agg?.accuracy ?? 0} label={`Trefferquote ${c.name}`} />
                  <span className="tabnums muted w-24 text-right text-xs">{agg?.answered ? `${pctText(agg.accuracy)} · ${agg.answered}` : 'noch offen'}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
      <p className="muted mt-6 text-xs">Ziel-Trefferquote: {settings.targetAccuracy} % · Fortschritt bleibt lokal auf diesem Gerät (Abgleich per Export/Import in den Einstellungen).</p>
    </div>
  )
}
