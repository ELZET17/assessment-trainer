/** Renders one item: exhibits, question and the matching answer widget. */
import { useEffect, useId, useState } from 'react'
import { fmt } from '../content/format'
import type { Answer, Exhibit, Item, Lang } from '../content/types'
import { BarDrag, DigitPad, DragOrder, GridRoundPlayer, McqOptions, NumberEntry } from './answers'
import { BarChart, ComboChart, LineChart, PieChart, TableView } from './exhibits/charts'
import { FiguresView, FlowView, SwitchView } from './exhibits/visual'
import { Button, Rich } from './kit'

export function ExhibitView({ ex, lang }: { ex: Exhibit; lang: Lang }) {
  const id = useId().replace(/:/g, '')
  switch (ex.kind) {
    case 'table':
      return <TableView ex={ex} lang={lang} />
    case 'bar':
      return <BarChart ex={ex} lang={lang} id={id} />
    case 'line':
      return <LineChart ex={ex} lang={lang} id={id} />
    case 'pie':
      return <PieChart ex={ex} lang={lang} id={id} />
    case 'combo':
      return <ComboChart ex={ex} lang={lang} id={id} />
    case 'text':
      return (
        <div className="card p-4">
          {ex.title && <div className="mb-2 text-[15px] font-semibold">{ex.title}</div>}
          <div className="text-[15px] leading-relaxed whitespace-pre-line">{ex.body}</div>
        </div>
      )
    case 'figures':
      return <FiguresView layout={ex.layout} panels={ex.panels} />
    case 'flow':
      return <FlowView flow={ex.flow} lang={lang} />
    case 'switch':
      return <SwitchView spec={ex.spec} lang={lang} />
  }
}

export interface ItemViewProps {
  item: Item
  /** 'instant': every answer action submits. 'draft': actions only update the draft (simulation). */
  mode: 'instant' | 'draft'
  draft?: Answer | null
  onDraft?: (a: Answer) => void
  onSubmit?: (a: Answer) => void
  /** After submission in training: show the key. */
  revealed?: boolean
  freeInput?: boolean
}

export function ItemView({ item, mode, draft = null, onDraft, onSubmit, revealed = false, freeInput = false }: ItemViewProps) {
  const lang = item.lang
  const act = (a: Answer) => {
    if (revealed) return
    if (mode === 'draft') onDraft?.(a)
    else onSubmit?.(a)
  }
  // Keyboard: 1–5 / A–E choose an option.
  useEffect(() => {
    if (item.type !== 'mcq' || revealed || (freeInput && item.free)) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      let i = -1
      if (/^[1-9]$/.test(k)) i = Number(k) - 1
      else if (/^[a-h]$/.test(k)) i = k.charCodeAt(0) - 97
      if (i >= 0 && i < item.options.length) {
        e.preventDefault()
        act({ type: 'mcq', choice: i })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const exhibits = item.exhibits
  const twoCol = exhibits.length > 0 && item.type !== 'grid' && item.type !== 'digit'
  const question = (
    <div className="space-y-3">
      <p className="text-[17px] leading-snug font-semibold">{item.prompt}</p>
      {item.hint && <p className="muted text-sm">{item.hint}</p>}
      <Answer item={item} draft={draft} act={act} revealed={revealed} freeInput={freeInput} lang={lang} />
    </div>
  )
  if (!twoCol) {
    return (
      <div className="space-y-4" data-item-key={item.key}>
        {item.type === 'tablefill' && <TableView ex={item.table} lang={lang} blank={(r, c) => (r === item.blank.row && c === item.blank.col ? <span className="font-bold text-[var(--accent)]">?</span> : null)} />}
        {question}
      </div>
    )
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start" data-item-key={item.key}>
      <div className="min-w-0 space-y-4 lg:sticky lg:top-4">
        {exhibits.map((ex, i) => (
          <ExhibitView key={i} ex={ex} lang={lang} />
        ))}
      </div>
      <div className="min-w-0">{question}</div>
    </div>
  )
}

function Answer({ item, draft, act, revealed, freeInput, lang }: { item: Item; draft: Answer | null; act: (a: Answer) => void; revealed: boolean; freeInput: boolean; lang: Lang }) {
  const [order, setOrder] = useState<number[]>(() => (item.type === 'order' ? (draft?.type === 'order' ? draft.order : item.entries.map((_, i) => i)) : []))
  const [bar, setBar] = useState<number | null>(draft?.type === 'numeric' ? draft.value : null)
  useEffect(() => {
    if (item.type === 'order') setOrder(draft?.type === 'order' ? draft.order : item.entries.map((_, i) => i))
    setBar(draft?.type === 'numeric' ? draft.value : null)
    // reset when the item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key])
  switch (item.type) {
    case 'mcq':
      if (freeInput && item.free) {
        return revealed ? (
          <p className="text-[15px]">
            Richtige Antwort: <strong>{item.options[item.correct].text}</strong>
          </p>
        ) : (
          <NumberEntry label="Antwort" onSubmit={(v) => act({ type: 'numeric', value: v })} />
        )
      }
      return <McqOptions options={item.options} selected={draft?.type === 'mcq' ? draft.choice : null} onSelect={(i) => act({ type: 'mcq', choice: i })} reveal={revealed ? { correct: item.correct } : undefined} disabled={revealed} />
    case 'numeric':
    case 'tablefill':
      return revealed ? (
        <p className="text-[15px]">
          Richtige Antwort: <strong className="tabnums">{fmt(item.answer, lang, item.decimals)}</strong>
        </p>
      ) : (
        <NumberEntry label="Wert" onSubmit={(v) => act({ type: 'numeric', value: v })} />
      )
    case 'bar':
      return (
        <div className="space-y-3">
          <BarDrag
            item={item}
            value={bar}
            lang={lang}
            disabled={revealed}
            reveal={revealed ? item.answer : undefined}
            onChange={(v) => {
              setBar(v)
              if (item && !revealed) act({ type: 'numeric', value: v })
            }}
          />
          {revealed && (
            <p className="text-[15px]">
              Richtiger Wert: <strong className="tabnums">{fmt(item.answer, lang, item.chart.decimals)}</strong> (grüne Linie)
            </p>
          )}
        </div>
      )
    case 'order':
      return (
        <DragOrder
          item={item}
          order={order}
          disabled={revealed}
          reveal={revealed}
          onChange={(o) => {
            setOrder(o)
            act({ type: 'order', order: o })
          }}
        />
      )
    case 'digit':
      return <DigitPad eq={item.equation} disabled={revealed} onSubmit={(digits) => act({ type: 'digit', digits })} />
    case 'grid':
      return revealed ? null : <GridRoundPlayer key={item.key} round={item.round} onDone={(a) => act(a)} />
  }
}

/** For item types whose widget does not submit by itself (bar, order) in instant mode. */
export function needsSubmitButton(item: Item): boolean {
  return item.type === 'bar' || item.type === 'order'
}

export function Explanation({ item, correct }: { item: Item; correct: boolean | null }) {
  return (
    <section aria-label="Lösungserklärung" className={`card mt-4 border-2 p-4 ${correct === null ? '' : correct ? 'border-[var(--ok)]' : 'border-[var(--bad)]'}`}>
      {correct !== null && <div className={`mb-2 text-lg font-bold ${correct ? 'text-[var(--ok)]' : 'text-[var(--bad)]'}`}>{correct ? '✓ Richtig' : '✗ Leider falsch'}</div>}
      <h3 className="mb-2 text-sm font-bold tracking-wide uppercase">Lösungsweg</h3>
      <ol className="m-0 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed">
        {item.explanation.steps.map((s, i) => (
          <li key={i}>
            <Rich text={s} />
          </li>
        ))}
      </ol>
      {item.explanation.shortcut && (
        <div className="mt-3 rounded-xl bg-[var(--accent-soft)] p-3 text-[15px]">
          <strong>⚡ Zeitspar-Trick: </strong>
          <Rich text={item.explanation.shortcut} />
        </div>
      )}
      {item.explanation.distractors && item.explanation.distractors.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--accent)]">Warum die anderen Optionen falsch sind</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px]">
            {item.explanation.distractors.map((d, i) => (
              <li key={i}>
                <Rich text={d} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

export function SubmitBar({ onSubmit, disabled }: { onSubmit: () => void; disabled?: boolean }) {
  return (
    <div className="mt-4">
      <Button variant="primary" onClick={onSubmit} disabled={disabled}>
        Antwort abgeben
      </Button>
    </div>
  )
}
