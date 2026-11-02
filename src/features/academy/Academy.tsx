import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getGenerator } from '../../content/registry'
import { checkAnswer } from '../../content/check'
import type { Answer } from '../../content/types'
import { useSettings } from '../../state/settings'
import { Explanation, ItemView, needsSubmitButton } from '../../ui/ItemView'
import { Button, Card, LinkButton, PageHeader, Rich } from '../../ui/kit'
import { LESSONS, type Block } from './lessons'

export function AcademyIndex() {
  return (
    <div>
      <PageHeader title="Strategie-Akademie" subtitle="Vorgehen, Fallen und Rechentricks – zum Durchlesen und Nachschlagen." />
      <div className="grid gap-3 md:grid-cols-2">
        {LESSONS.map((l) => (
          <Link key={l.id} to={`/academy/${l.id}`} className="card block p-4 no-underline hover:bg-[var(--surface-2)]">
            <div className="text-[16px] font-semibold text-[var(--text)]">{l.title}</div>
            <div className="muted text-sm">{l.summary}</div>
            <div className="muted mt-1 text-xs">{l.usedBy}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Example({ gen, d, seed, caption }: { gen: string; d: 1 | 2 | 3; seed: number; caption: string }) {
  const { settings } = useSettings()
  const g = getGenerator(gen)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [draft, setDraft] = useState<Answer | null>(null)
  const [show, setShow] = useState(false)
  if (!g) return null
  const item = g.generate(seed, d, settings.itemLang)
  const res = answer ? checkAnswer(item, answer) : null
  const revealed = !!answer || show
  return (
    <Card className="my-4 border-dashed">
      <div className="muted mb-2 text-xs font-bold tracking-wide uppercase">Beispiel · {caption}</div>
      <ItemView item={item} mode={needsSubmitButton(item) ? 'draft' : 'instant'} draft={answer ?? draft} onDraft={setDraft} onSubmit={setAnswer} revealed={revealed} />
      {!revealed && (
        <div className="mt-3 flex gap-2">
          {needsSubmitButton(item) && (
            <Button variant="primary" disabled={!draft} onClick={() => draft && setAnswer(draft)}>
              Prüfen
            </Button>
          )}
          <Button onClick={() => setShow(true)}>Schritt-für-Schritt-Lösung zeigen</Button>
        </div>
      )}
      {revealed && <Explanation item={item} correct={res ? res.correct : null} />}
    </Card>
  )
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'h':
      return <h2 className="mt-6 mb-2 text-lg font-bold">{b.text}</h2>
    case 'p':
      return (
        <p className="my-2 text-[15px] leading-relaxed">
          <Rich text={b.text} />
        </p>
      )
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul'
      return (
        <L className={`my-2 space-y-1.5 pl-5 text-[15px] leading-relaxed ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
          {b.items.map((x, i) => (
            <li key={i}>
              <Rich text={x} />
            </li>
          ))}
        </L>
      )
    }
    case 'table':
      return (
        <div className="my-3 overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-[var(--surface-2)]">
                {b.head.map((h, hi) => (
                  <th key={hi} scope="col" className="px-2.5 py-2 text-left align-top font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  {r.map((c, j) => (
                    <td key={j} className="tabnums px-2.5 py-2 align-top">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'tip':
      return (
        <div className="my-3 rounded-xl bg-[var(--accent-soft)] p-3 text-[15px]">
          <strong>Tipp: </strong>
          <Rich text={b.text} />
        </div>
      )
    case 'example':
      return <Example gen={b.gen} d={b.d} seed={b.seed} caption={b.caption} />
  }
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const l = LESSONS.find((x) => x.id === lessonId)
  if (!l) return <p>Lektion nicht gefunden.</p>
  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader title={l.title} subtitle={l.summary} back="/academy" />
      <p className="muted -mt-2 text-sm">Kommt laut Recherche vor bei: {l.usedBy}</p>
      {l.blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
      {l.practice && (
        <div className="mt-6">
          <LinkButton to={`/practice/${l.practice.cat}`} variant="primary">
            Jetzt üben →
          </LinkButton>
        </div>
      )}
    </article>
  )
}
