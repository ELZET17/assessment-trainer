/** Statistics dashboard – everything computed from raw attempts (src/data/stats.ts). */
import { useLiveQuery } from 'dexie-react-hooks'
import { Fragment, useMemo, useState } from 'react'
import { CATEGORIES, CATEGORY_BY_ID } from '../../content/categories'
import { subTitle } from '../../content/items'
import { getProfile } from '../../content/profiles'
import type { CategoryId } from '../../content/types'
import { db } from '../../data/db'
import { localDay } from '../../data/repo'
import { aggregate, byCategory, bySub, inRange, simulationResults, streak, trend, weaknesses } from '../../data/stats'
import { useWidth } from '../../ui/exhibits/charts'
import { Badge, Card, LinkButton, PageHeader, pctText, Segmented, Stat } from '../../ui/kit'
import { academyFor } from '../academy/lessons'

function TrendChart({ rows }: { rows: { day: string; accuracy: number; answered: number }[] }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const H = 200
  const l = 34
  const r = 10
  const t = 12
  const b = 26
  const pw = W - l - r
  const ph = H - t - b
  const x = (i: number) => l + (rows.length === 1 ? pw / 2 : (i / (rows.length - 1)) * pw)
  const y = (v: number) => t + ph - (v / 100) * ph
  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Verlauf der Trefferquote" className="block">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={l} x2={W - r} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray="3 3" />
            <text x={l - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v} %
            </text>
          </g>
        ))}
        {rows.length > 0 && <polyline fill="none" stroke="var(--c1)" strokeWidth="2.5" points={rows.map((p, i) => `${x(i)},${y(p.accuracy)}`).join(' ')} />}
        {rows.map((p, i) => (
          <circle key={p.day} cx={x(i)} cy={y(p.accuracy)} r="3.5" fill="var(--c1)">
            <title>{`${p.day}: ${Math.round(p.accuracy)} % (${p.answered})`}</title>
          </circle>
        ))}
        {rows.length > 0 && (
          <>
            <text x={l} y={H - 6} fontSize="11" fill="var(--muted)">
              {rows[0].day.slice(5).split('-').reverse().join('.')}
            </text>
            <text x={W - r} y={H - 6} fontSize="11" textAnchor="end" fill="var(--muted)">
              {rows[rows.length - 1].day.slice(5).split('-').reverse().join('.')}
            </text>
            <text x={x(rows.length - 1)} y={y(rows[rows.length - 1].accuracy) - 8} fontSize="12" fontWeight="700" textAnchor="end" fill="var(--text)">
              {Math.round(rows[rows.length - 1].accuracy)} %
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

export default function Stats() {
  const all = useLiveQuery(() => db.attempts.toArray(), [])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const [range, setRange] = useState<'7' | '30' | 'all'>('30')
  const [trendCat, setTrendCat] = useState<CategoryId | ''>('')
  const [open, setOpen] = useState<CategoryId | null>(null)
  const [today] = useState(() => localDay(Date.now()))
  const d = useMemo(() => {
    const list = inRange(all ?? [], range)
    return {
      total: aggregate(list),
      cats: byCategory(list),
      subs: bySub(list),
      trend: trend(list, trendCat || undefined),
      weak: weaknesses(all ?? []),
      streak: streak(all ?? [], today),
      sims: simulationResults(sessions ?? [], all ?? [], (s) => getProfile(s.profileId ?? '')?.scoring.correct ?? 1),
    }
  }, [all, sessions, range, trendCat, today])
  if (!all) return <p className="muted p-6">Lade Statistik …</p>
  return (
    <div>
      <PageHeader title="Statistik" subtitle="Alle Werte werden direkt aus deinen gespeicherten Antworten berechnet." />
      <div className="mb-4 max-w-sm">
        <Segmented label="Zeitraum" value={range} onChange={setRange} options={[{ value: '7', label: '7 Tage' }, { value: '30', label: '30 Tage' }, { value: 'all', label: 'Alles' }]} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Beantwortet" value={d.total.answered} sub={`${d.total.attempts - d.total.answered} offen gelassen`} />
        <Stat label="Richtig" value={`${d.total.correct}/${d.total.answered}`} sub={pctText(d.total.accuracy)} />
        <Stat label="Ø Zeit" value={d.total.avgTimeSec === null ? '–' : `${d.total.avgTimeSec.toFixed(1).replace('.', ',')} s`} sub={d.total.avgTargetSec ? `Ziel Ø ${Math.round(d.total.avgTargetSec)} s` : undefined} />
        <Stat label="Streak" value={`${d.streak}`} sub="Tage in Folge" />
      </div>

      <section className="mb-5">
        <h2 className="mb-2 text-lg font-bold">Nach Kategorie</h2>
        <div className="card overflow-hidden">
          <table className="tabnums w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-[var(--surface-2)] text-left">
                <th scope="col" className="px-3 py-2">
                  Kategorie
                </th>
                <th scope="col" className="px-2 py-2 text-right">
                  Richtig
                </th>
                <th scope="col" className="px-2 py-2 text-right">
                  Quote
                </th>
                <th scope="col" className="hidden px-2 py-2 text-right sm:table-cell">
                  Ø Zeit / Ziel
                </th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c) => {
                const a = d.cats.get(c.id)
                const subs = [...d.subs.entries()].filter(([, v]) => v.category === c.id)
                return (
                  <Fragment key={c.id}>
                    <tr className="border-t border-[var(--border)]">
                      <th scope="row" className="px-3 py-2 text-left font-medium">
                        <button type="button" className="min-h-11 text-left font-semibold" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)} disabled={!subs.length}>
                          {subs.length ? (open === c.id ? '▾ ' : '▸ ') : ''}
                          {c.name}
                        </button>
                      </th>
                      <td className="px-2 py-2 text-right" data-testid={`cat-${c.id}-count`}>
                        {a ? `${a.correct}/${a.answered}` : '–'}
                      </td>
                      <td className="px-2 py-2 text-right" data-testid={`cat-${c.id}-acc`}>
                        {a ? pctText(a.accuracy) : '–'}
                      </td>
                      <td className="hidden px-2 py-2 text-right sm:table-cell">{a?.avgTimeSec != null ? `${a.avgTimeSec.toFixed(0)} s / ${Math.round(a.avgTargetSec ?? 0)} s` : '–'}</td>
                    </tr>
                    {open === c.id &&
                      subs.map(([sub, v]) => (
                        <tr key={sub} className="border-t border-[var(--border)] bg-[var(--surface-2)]/50">
                          <td className="py-2 pr-2 pl-8 text-[13px]">{subTitle(sub)}</td>
                          <td className="px-2 py-2 text-right text-[13px]">
                            {v.correct}/{v.answered}
                          </td>
                          <td className="px-2 py-2 text-right text-[13px]">{pctText(v.accuracy)}</td>
                          <td className="hidden px-2 py-2 text-right text-[13px] sm:table-cell">{v.avgTimeSec != null ? `${v.avgTimeSec.toFixed(0)} s / ${Math.round(v.avgTargetSec ?? 0)} s` : '–'}</td>
                        </tr>
                      ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Verlauf der Trefferquote</h2>
            <select aria-label="Kategorie für den Verlauf" value={trendCat} onChange={(e) => setTrendCat(e.target.value as CategoryId | '')} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-sm">
              <option value="">Alle Kategorien</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {d.trend.length ? <TrendChart rows={d.trend} /> : <p className="muted text-sm">Noch keine Daten im Zeitraum.</p>}
        </Card>
        <Card>
          <h2 className="mb-2 text-lg font-bold">Schwächen-Ranking</h2>
          {d.weak.length === 0 ? (
            <p className="muted text-sm">Erscheint, sobald eine Unterkategorie mindestens 10 Versuche hat.</p>
          ) : (
            <ol className="m-0 list-none space-y-2 p-0">
              {d.weak.map((w, i) => (
                <li key={w.sub} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {i + 1}. {subTitle(w.sub)}
                    </span>
                    <Badge tone="bad">{pctText(w.accuracy)}</Badge>
                  </div>
                  <div className="muted text-xs">
                    {CATEGORY_BY_ID[w.category].name} · {w.answered} Versuche
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <LinkButton to={`/run/training?cat=${w.category}&sub=${encodeURIComponent(w.sub)}&d=adaptive`} variant="primary">
                      Jetzt üben
                    </LinkButton>
                    <LinkButton to={`/academy/${academyFor(w.category)}`}>Strategie lesen</LinkButton>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Test-Simulationen</h2>
        {d.sims.length === 0 ? (
          <p className="muted text-sm">Noch keine Simulation abgeschlossen.</p>
        ) : (
          <div className="card overflow-hidden">
            <table className="tabnums w-full border-collapse text-[14px]">
              <thead>
                <tr className="bg-[var(--surface-2)] text-left">
                  <th className="px-3 py-2">Test</th>
                  <th className="px-2 py-2 text-right">Punkte</th>
                  <th className="px-2 py-2 text-right">Geschafft</th>
                </tr>
              </thead>
              <tbody>
                {d.sims.map((s) => (
                  <tr key={s.session.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      <a href={`#/sim/result/${s.session.id}`} className="font-medium text-[var(--accent)]">
                        {s.session.title}
                      </a>
                      <div className="muted text-xs">{new Date(s.session.startedAt).toLocaleString('de-CH')}</div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {s.points}/{s.maxPoints}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {s.answered}
                      {s.planned !== null ? `/${s.planned}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
