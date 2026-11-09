/** Simulation list, intro screen ("So sieht der echte Test aus") and result page. */
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { resolveItem } from '../../content/items'
import { getProfile, PROFILES, RD } from '../../content/profiles'
import type { Item } from '../../content/types'
import { db } from '../../data/db'
import { simulationResults } from '../../data/stats'
import { useSettings } from '../../state/settings'
import { Badge, Card, fmtDuration, LinkButton, PageHeader } from '../../ui/kit'
import { Review } from '../run/Review'

const STATUS_TONE = { offiziell: 'ok', berichtet: 'accent', Annahme: 'warn' } as const

export function SimIndex() {
  const sessions = useLiveQuery(() => db.sessions.where('mode').equals('simulation').toArray(), [])
  const attempts = useLiveQuery(() => db.attempts.where('mode').equals('simulation').toArray(), [])
  const results = useMemo(() => (sessions && attempts ? simulationResults(sessions, attempts, (s) => getProfile(s.profileId ?? '')?.scoring.correct ?? 1) : []), [sessions, attempts])
  const byCompany = PROFILES.reduce<Record<string, typeof PROFILES>>((acc, p) => ((acc[p.company] ??= []).push(p), acc), {})
  return (
    <div>
      <PageHeader title="Test-Simulationen" subtitle={`Vorkonfigurierte Durchgänge pro Unternehmen – Formate laut Recherche (Stand ${RD}), je Büro verschieden.`} />
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(byCompany).map(([company, list]) => (
          <Card key={company}>
            <h2 className="mb-2 text-lg font-bold">{company}</h2>
            <ul className="m-0 list-none space-y-2 p-0">
              {list.map((p) => {
                const last = results.find((r) => r.session.profileId === p.id)
                const minutes = Math.round((p.totalTimeSec ?? p.sections.reduce((s, x) => s + x.timeLimitSec, 0)) / 60)
                return (
                  <li key={p.id}>
                    <Link to={`/sim/${p.id}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2 no-underline hover:bg-[var(--surface-2)]">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-[var(--text)]">{p.name}</span>
                        <span className="muted block text-xs">
                          {p.provider} · ca. {minutes} Min. · {p.sections.length} Teil{p.sections.length > 1 ? 'e' : ''}
                        </span>
                      </span>
                      {last && (
                        <Badge tone="accent">
                          zuletzt {last.points}/{last.maxPoints}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SimIntro() {
  const { profileId = '' } = useParams()
  const p = getProfile(profileId)
  if (!p) return <p>Unbekanntes Profil.</p>
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={p.name} subtitle={`Anbieter: ${p.provider}`} back="/sim" />
      <Card className="mb-4">
        <h2 className="mb-2 text-base font-bold">So sieht der echte Test aus (laut Recherche, Stand {p.researchDate})</h2>
        <ul className="list-disc space-y-1 pl-5 text-[15px]">
          {p.info.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Card>
      <Card className="mb-4">
        <h2 className="mb-2 text-base font-bold">Ablauf dieser Simulation</h2>
        <ul className="m-0 list-none space-y-1 p-0 text-[15px]">
          {p.sections.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
              <span className="font-medium">{s.title}</span>
              <span className="muted tabnums">
                {s.count === null ? 'so viele wie möglich' : `${s.count} Fragen`}
                {!p.totalTimeSec && ` · ${fmtDuration(s.timeLimitSec)} Min.`}
                {s.calculator ? ' · Rechner' : ' · ohne Rechner'}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {p.totalTimeSec && <Badge tone="neutral">Gesamtzeit {fmtDuration(p.totalTimeSec)} Min.</Badge>}
          <Badge tone="neutral">{p.allowBack ? 'Zurückspringen erlaubt' : 'Kein Zurückspringen'}</Badge>
          <Badge tone="neutral">{p.allowSkip ? 'Überspringen erlaubt' : 'Antwort nötig zum Weitergehen'}</Badge>
          <Badge tone={p.scoring.wrong < 0 ? 'bad' : 'neutral'}>{p.scoring.wrong < 0 ? `Negativwertung +${p.scoring.correct}/${p.scoring.wrong}/${p.scoring.blank}` : 'Keine Negativwertung'}</Badge>
          {p.adaptive && <Badge tone="accent">Adaptiv</Badge>}
        </div>
      </Card>
      <Card className="mb-4">
        <h2 className="mb-2 text-base font-bold">Wie sicher sind diese Angaben?</h2>
        <ul className="m-0 list-none space-y-1.5 p-0 text-[14px]">
          {p.status.map((s) => (
            <li key={s.label} className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
              <span>
                {s.label}: {s.value}
              </span>
            </li>
          ))}
        </ul>
        <ul className="muted mt-3 list-disc pl-5 text-sm">
          {p.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
          <li>Formate variieren je Büro und Jahr – maßgeblich ist immer deine Einladung.</li>
        </ul>
      </Card>
      <LinkButton to={`/sim/run/${p.id}`} variant="primary" className="w-full sm:w-auto">
        Simulation starten
      </LinkButton>
    </div>
  )
}

export function SimResult() {
  const { sessionId = '' } = useParams()
  const { settings } = useSettings()
  // null = no such session (undefined = still loading).
  const session = useLiveQuery(async () => (await db.sessions.get(sessionId)) ?? null, [sessionId])
  const attempts = useLiveQuery(() => db.attempts.where('sessionId').equals(sessionId).toArray(), [sessionId])
  const profile = session?.profileId ? getProfile(session.profileId) : undefined
  const entries = useMemo(() => {
    if (!attempts) return []
    return attempts
      // Simulation order (section × 1000 + index); older data without seq falls back to the timestamp.
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0) || a.ts - b.ts)
      .map((a) => ({ attempt: a, item: resolveItem(a.ref, a.lang ?? settings.itemLang) as Item }))
      .filter((e) => e.item)
  }, [attempts, settings.itemLang])
  if (session === null) return <p className="muted p-6">Dieses Ergebnis gibt es nicht (mehr).</p>
  if (!session || !attempts) return <p className="muted p-6">Lade Ergebnis …</p>
  const [res] = simulationResults([session], attempts, () => profile?.scoring.correct ?? 1)
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ergebnis" subtitle={session.title} back="/sim" />
      <Card className="mb-4">
        {res ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <div className="muted text-xs font-semibold uppercase">Punkte</div>
              <div className="tabnums text-2xl font-bold">
                {res.points}
                <span className="muted text-base"> / {res.maxPoints}</span>
              </div>
            </div>
            <div>
              <div className="muted text-xs font-semibold uppercase">Richtig</div>
              <div className="tabnums text-2xl font-bold">{res.correct}</div>
            </div>
            <div>
              <div className="muted text-xs font-semibold uppercase">In der Zeit geschafft</div>
              <div className="tabnums text-2xl font-bold">
                {res.answered}
                {res.planned !== null && <span className="muted text-base"> / {res.planned}</span>}
              </div>
            </div>
            <div>
              <div className="muted text-xs font-semibold uppercase">Trefferquote</div>
              <div className="tabnums text-2xl font-bold">{res.answered ? Math.round((res.correct / res.answered) * 100) : 0} %</div>
            </div>
          </div>
        ) : (
          <p>Keine Auswertung verfügbar.</p>
        )}
        {profile && profile.scoring.wrong < 0 && <p className="muted mt-3 text-sm">Wertung: +{profile.scoring.correct} richtig, {profile.scoring.wrong} falsch, {profile.scoring.blank} leer.</p>}
      </Card>
      <h2 className="mb-2 text-lg font-bold">Alle Fragen</h2>
      <Review entries={entries} />
      <div className="mt-4 flex gap-2">
        <LinkButton to={`/sim/${session.profileId}`} variant="primary">
          Nochmal
        </LinkButton>
        <LinkButton to="/stats">Statistik</LinkButton>
      </div>
    </div>
  )
}
