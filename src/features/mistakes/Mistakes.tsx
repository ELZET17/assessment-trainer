import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { CATEGORY_BY_ID } from '../../content/categories'
import { subTitle } from '../../content/items'
import { db } from '../../data/db'
import { mistakeBook } from '../../data/mistakes'
import { Badge, Card, LinkButton, PageHeader } from '../../ui/kit'

export default function Mistakes() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  const book = useMemo(() => mistakeBook(attempts ?? []), [attempts])
  const byCat = book.reduce<Record<string, typeof book>>((acc, m) => ((acc[m.category] ??= []).push(m), acc), {})
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Fehlerheft" subtitle="Alle falsch beantworteten Aufgaben – exakt reproduzierbar. Eine Aufgabe verlässt das Heft nach zweimal richtig in Folge." />
      {book.length === 0 ? (
        <Card>
          <p>Keine offenen Fehler. 🎉</p>
        </Card>
      ) : (
        <>
          <LinkButton to="/run/mistakes" variant="primary" className="mb-4">
            Alle {book.length} üben
          </LinkButton>
          <div className="space-y-4">
            {Object.entries(byCat).map(([cat, list]) => (
              <Card key={cat}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">{CATEGORY_BY_ID[cat as keyof typeof CATEGORY_BY_ID].name}</h2>
                  <LinkButton to={`/run/mistakes?cat=${cat}`}>{list.length} üben</LinkButton>
                </div>
                <ul className="m-0 list-none space-y-1 p-0">
                  {list.map((m) => (
                    <li key={m.itemKey} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] py-2 text-[14px] first:border-0">
                      <span>{subTitle(m.sub)}</span>
                      <span className="flex gap-1.5">
                        <Badge tone="bad">{m.wrongCount}× falsch</Badge>
                        <Badge tone={m.streak ? 'ok' : 'neutral'}>{m.streak}/2 richtig in Folge</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
