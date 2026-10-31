/** Review of a finished drill or simulation: every item with the given answer and explanation. */
import { useState } from 'react'
import { DIFFICULTY_LABEL } from '../../content/categories'
import { subTitle } from '../../content/items'
import type { Item } from '../../content/types'
import type { Attempt } from '../../data/types'
import { Explanation, ItemView } from '../../ui/ItemView'
import { Badge, Button } from '../../ui/kit'

export interface ReviewEntry {
  item: Item
  attempt: Attempt
  section?: string
}

export function Review({ entries }: { entries: ReviewEntry[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <ol className="m-0 list-none space-y-2 p-0">
      {entries.map((e, i) => (
        <li key={e.attempt.id} className="card overflow-hidden">
          <button type="button" className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            <span className="tabnums muted w-8 text-sm font-bold">{i + 1}.</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{e.item.prompt}</span>
              <span className="muted block truncate text-xs">
                {e.section ? `${e.section} · ` : ''}
                {subTitle(e.item.sub)} · {DIFFICULTY_LABEL[e.item.difficulty]} · {(e.attempt.timeMs / 1000).toFixed(0)} s
              </span>
            </span>
            {!e.attempt.answered ? <Badge tone="warn">offen</Badge> : e.attempt.correct ? <Badge tone="ok">✓ richtig</Badge> : <Badge tone="bad">✗ falsch</Badge>}
          </button>
          {open === i && (
            <div className="border-t border-[var(--border)] p-3">
              <ItemView item={e.item} mode="draft" draft={e.attempt.answer ?? null} revealed />
              <Explanation item={e.item} correct={e.attempt.answered ? e.attempt.correct : false} />
              <Button className="mt-3" onClick={() => setOpen(null)}>
                Schließen
              </Button>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
