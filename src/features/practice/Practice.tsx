import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CATEGORIES, CATEGORY_BY_ID, DIFFICULTY_LABEL } from '../../content/categories'
import { subsOf } from '../../content/items'
import type { CategoryId } from '../../content/types'
import { db } from '../../data/db'
import { byCategory, bySub } from '../../data/stats'
import { Card, LinkButton, PageHeader, pctText, Segmented } from '../../ui/kit'
import { academyFor } from '../academy/lessons'

export function PracticeIndex() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  const cats = useMemo(() => byCategory(attempts ?? []), [attempts])
  return (
    <div>
      <PageHeader title="Üben" subtitle="Wähle eine Kategorie – Training mit sofortigem Feedback oder Drill auf Zeit." />
      <div className="grid gap-3 md:grid-cols-2">
        {CATEGORIES.map((c) => {
          const a = cats.get(c.id)
          return (
            <Link key={c.id} to={`/practice/${c.id}`} className="card flex gap-3 p-4 no-underline hover:bg-[var(--surface-2)]">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent)]">{c.letter}</span>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold text-[var(--text)]">{c.name}</span>
                <span className="muted block text-sm">{c.description}</span>
                <span className="muted mt-1 block text-xs tabnums">{a?.answered ? `${pctText(a.accuracy)} richtig · ${a.answered} Aufgaben` : 'Noch nicht geübt'}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CategoryPage() {
  const { cat = 'speed' } = useParams() as { cat: CategoryId }
  const meta = CATEGORY_BY_ID[cat]
  const subs = subsOf(cat)
  const attempts = useLiveQuery(() => db.attempts.where('category').equals(cat).toArray(), [cat])
  const subStats = useMemo(() => bySub(attempts ?? []), [attempts])
  const [d, setD] = useState<'1' | '2' | '3' | 'adaptive'>('2')
  const [sub, setSub] = useState<string>('')
  const [n, setN] = useState<5 | 10 | 20>(10)
  if (!meta) return <p>Unbekannte Kategorie.</p>
  const q = `cat=${cat}${sub ? `&sub=${encodeURIComponent(sub)}` : ''}`
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={meta.name} subtitle={meta.description} back="/practice" />
      <p className="muted -mt-2 mb-4 text-sm">Kommt vor bei: {meta.usedBy}</p>
      <Card className="mb-4 space-y-4">
        <div>
          <div className="mb-1.5 text-sm font-semibold">Schwierigkeit</div>
          <Segmented
            label="Schwierigkeit"
            value={d}
            onChange={setD}
            options={[
              { value: '1', label: DIFFICULTY_LABEL[1] },
              { value: '2', label: DIFFICULTY_LABEL[2] },
              { value: '3', label: DIFFICULTY_LABEL[3] },
              { value: 'adaptive', label: 'Adaptiv' },
            ]}
          />
          <p className="muted mt-1 text-xs">Zielzeit auf Test-Niveau: ca. {meta.targetSec[2]} s pro Aufgabe.</p>
        </div>
        <div>
          <label htmlFor="sub" className="mb-1.5 block text-sm font-semibold">
            Unterkategorie
          </label>
          <select id="sub" value={sub} onChange={(e) => setSub(e.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3">
            <option value="">Alle gemischt</option>
            {subs.map((s) => {
              const st = subStats.get(s.id)
              return (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {st?.answered ? ` (${pctText(st.accuracy)}, ${st.answered})` : ''}
                </option>
              )
            })}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton to={`/run/training?${q}&d=${d}`} variant="primary">
            Training starten
          </LinkButton>
        </div>
        <p className="muted text-xs">Training: sofortiges Feedback mit ausführlicher Erklärung, Timer läuft zur Info mit.</p>
      </Card>
      <Card className="mb-4 space-y-3">
        <div className="text-[15px] font-semibold">Drill auf Zeit</div>
        <Segmented
          label="Anzahl Fragen"
          value={n}
          onChange={setN}
          options={[
            { value: 5, label: '5 Fragen' },
            { value: 10, label: '10 Fragen' },
            { value: 20, label: '20 Fragen' },
          ]}
        />
        <LinkButton to={`/run/drill?${q}&d=${d === 'adaptive' ? '2' : d}&n=${n}`}>Drill starten</LinkButton>
        <p className="muted text-xs">Zeitlimit = Summe der Zielzeiten. Feedback und Erklärungen am Ende.</p>
      </Card>
      {cat === 'aon' && (
        <Card className="mb-4 space-y-2">
          <div className="text-[15px] font-semibold">Spiel-Modus wie im echten Test</div>
          <p className="muted text-sm">Countdown, so viele Aufgaben wie möglich, Schwierigkeit steigt mit richtigen Antworten.</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton to="/run/game/switch">Switch (6 Min.)</LinkButton>
            <LinkButton to="/run/game/digit">Digit (5 Min.)</LinkButton>
            <LinkButton to="/run/game/grid">Grid (6 Min.)</LinkButton>
          </div>
        </Card>
      )}
      {cat === 'speed' && (
        <Card className="mb-4 space-y-2">
          <div className="text-[15px] font-semibold">Kopfrechen-Sprint</div>
          <p className="muted text-sm">Freie Eingabe, ohne Optionen – so viele Aufgaben wie möglich in 60–120 Sekunden.</p>
          <LinkButton to="/sprint">Zum Sprint</LinkButton>
        </Card>
      )}
      <LinkButton to={`/academy/${academyFor(cat)}`} variant="ghost">
        Strategie für {meta.name} lesen →
      </LinkButton>
    </div>
  )
}
