/** Answer widgets for all item types. All drag interactions use Pointer Events (touch + mouse). */
import { useEffect, useMemo, useRef, useState } from 'react'
import { fmt } from '../content/format'
import type { DigitEquation } from '../content/generators/aon/digitTypes'
import type { GridRound } from '../content/generators/aon/gridTypes'
import type { Answer, BarDragItem, Lang, McqOption, OrderItem } from '../content/types'
import { FigurePanel } from './exhibits/visual'
import { useWidth } from './exhibits/charts'
import { Button, Icon } from './kit'

// --------------------------------------------------------------------- MCQ

export interface Reveal {
  correct: number | null
}

export function McqOptions({ options, selected, onSelect, reveal, disabled }: { options: McqOption[]; selected: number | null; onSelect: (i: number) => void; reveal?: Reveal; disabled?: boolean }) {
  const withPanels = options.some((o) => o.panel)
  return (
    <div role="radiogroup" aria-label="Antwortoptionen" className={withPanels ? 'grid grid-cols-3 gap-2 sm:grid-cols-5' : 'grid gap-2'}>
      {options.map((o, i) => {
        const isSel = selected === i
        const isRight = reveal && reveal.correct === i
        const isWrongSel = reveal && isSel && reveal.correct !== i
        const state = isRight ? 'border-[var(--ok)] bg-[var(--ok-bg)]' : isWrongSel ? 'border-[var(--bad)] bg-[var(--bad-bg)]' : isSel ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSel}
            disabled={disabled}
            onClick={() => onSelect(i)}
            className={`relative flex min-h-12 items-center gap-3 rounded-xl border-2 px-3 py-2 text-left text-[15px] transition ${state} ${withPanels ? 'flex-col justify-center px-2' : ''}`}
          >
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSel ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--surface-2)] text-[var(--muted)]'}`}>{String.fromCharCode(65 + i)}</span>
            {o.panel ? (
              <span className="w-full max-w-[120px]">
                <FigurePanel panel={o.panel} label={`Option ${String.fromCharCode(65 + i)}`} />
              </span>
            ) : (
              <span className="tabnums min-w-0 flex-1 break-words">{o.text}</span>
            )}
            {isRight && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ok)]">
                <Icon name="check" size={16} />
                {withPanels ? '' : 'Richtig'}
              </span>
            )}
            {isWrongSel && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--bad)]">
                <Icon name="x" size={16} />
                {withPanels ? '' : 'Deine Antwort'}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ----------------------------------------------------------- numeric input

export function parseUserNumber(s: string): number | null {
  const t = s.trim().replace(/\s/g, '').replace(/[’']/g, '')
  if (!t) return null
  // Accept "1,234.5", "1.234,5", "12,5", "12.5"
  let norm: string
  const lastComma = t.lastIndexOf(',')
  const lastDot = t.lastIndexOf('.')
  if (lastComma > lastDot) norm = t.replace(/\./g, '').replace(',', '.')
  else norm = t.replace(/,/g, '')
  norm = norm.replace('−', '-')
  const v = Number(norm)
  return Number.isFinite(v) ? v : null
}

export function NumberEntry({ onSubmit, disabled, unit, label, autoFocus = true }: { onSubmit: (v: number) => void; disabled?: boolean; unit?: string; label: string; autoFocus?: boolean }) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (autoFocus && !disabled) ref.current?.focus({ preventScroll: true })
  }, [autoFocus, disabled])
  const v = parseUserNumber(text)
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (v !== null && !disabled) onSubmit(v)
      }}
    >
      <label className="sr-only" htmlFor="num-entry">
        {label}
      </label>
      <input ref={ref} id="num-entry" inputMode="decimal" autoComplete="off" enterKeyHint="done" disabled={disabled} value={text} onChange={(e) => setText(e.target.value)} className="tabnums min-h-12 w-full max-w-56 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-lg focus:border-[var(--accent)]" placeholder="Antwort" />
      {unit && <span className="muted text-sm">{unit}</span>}
      <Button variant="primary" type="submit" disabled={v === null || disabled}>
        Abgeben
      </Button>
    </form>
  )
}

// -------------------------------------------------------------- bar drag

export function BarDrag({ item, value, onChange, disabled, lang, reveal }: { item: BarDragItem; value: number | null; onChange: (v: number) => void; disabled?: boolean; lang: Lang; reveal?: number }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const c = item.chart
  const H = 280
  const left = 36
  const top = 24
  const bottom = 30
  const plotH = H - top - bottom
  const n = c.categories.length
  const groupW = (W - left - 8) / n
  const barW = Math.min(52, groupW * 0.6)
  const y = (v: number) => top + plotH - ((v - c.min) / (c.max - c.min)) * plotH
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const current = value ?? c.min
  const setFromY = (clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const py = clientY - rect.top
    const raw = c.min + ((top + plotH - py) / plotH) * (c.max - c.min)
    const snapped = Math.round(raw / c.step) * c.step
    onChange(Math.max(c.min, Math.min(c.max, snapped)))
  }
  const f = (v: number) => fmt(v, lang, c.decimals)
  return (
    <div>
      <div className="muted mb-1 text-xs">{c.unit}</div>
      <div ref={ref} className="w-full">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block select-none"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => {
            if (disabled) return
            dragging.current = true
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
            setFromY(e.clientY)
          }}
          onPointerMove={(e) => dragging.current && !disabled && setFromY(e.clientY)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          role="img"
          aria-label="Balkendiagramm – letzten Balken auf den richtigen Wert ziehen"
        >
          <line x1={left} x2={W - 8} y1={y(c.min)} y2={y(c.min)} stroke="var(--muted)" />
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={left} x2={W - 8} y1={y(c.min + (c.max - c.min) * t)} y2={y(c.min + (c.max - c.min) * t)} stroke="var(--border)" strokeDasharray="3 3" />
              <text x={left - 4} y={y(c.min + (c.max - c.min) * t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
                {f(c.min + (c.max - c.min) * t)}
              </text>
            </g>
          ))}
          {c.categories.map((cat, i) => {
            const v = i === c.target ? current : c.values[i]
            const cx = left + i * groupW + groupW / 2
            const isTarget = i === c.target
            return (
              <g key={cat}>
                {v !== null && (
                  <>
                    <rect x={cx - barW / 2} y={y(v)} width={barW} height={y(c.min) - y(v)} rx="3" fill={isTarget ? 'var(--accent)' : 'var(--c1)'} opacity={isTarget ? 0.85 : 0.55} stroke={isTarget ? 'var(--accent)' : 'none'} strokeDasharray={isTarget ? '4 3' : undefined} />
                    <text x={cx} y={y(v) - 6} textAnchor="middle" fontSize="12" fontWeight={isTarget ? 700 : 500} fill="var(--text)">
                      {f(v)}
                    </text>
                  </>
                )}
                {isTarget && <rect x={cx - barW / 2 - 6} y={y(v ?? c.min) - 10} width={barW + 12} height={20} rx="6" fill="var(--accent)" opacity="0.18" />}
                {isTarget && reveal !== undefined && <line x1={cx - barW / 2 - 8} x2={cx + barW / 2 + 8} y1={y(reveal)} y2={y(reveal)} stroke="var(--ok)" strokeWidth="3" />}
                <text x={cx} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--muted)">
                  {cat}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="muted mt-1 text-xs">Den gestrichelten Balken nach oben/unten ziehen oder mit − / + einstellen.</p>
      <div className="mt-2 flex items-center gap-2">
        <Button aria-label="Wert verringern" disabled={disabled} onClick={() => onChange(Math.max(c.min, current - c.step))}>
          −
        </Button>
        <span className="tabnums min-w-24 text-center text-lg font-bold" aria-live="polite">
          {value === null ? '–' : f(current)}
        </span>
        <Button aria-label="Wert erhöhen" disabled={disabled} onClick={() => onChange(Math.min(c.max, current + c.step))}>
          +
        </Button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ drag order

const ROW_H = 56

export function DragOrder({ item, order, onChange, disabled, reveal }: { item: OrderItem; order: number[]; onChange: (o: number[]) => void; disabled?: boolean; reveal?: boolean }) {
  const [drag, setDrag] = useState<{ idx: number; startY: number; dy: number } | null>(null)
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return
    const next = order.slice()
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    onChange(next)
  }
  return (
    <ol className="m-0 list-none space-y-2 p-0" aria-label="Reihenfolge">
      {order.map((entry, pos) => {
        const isDrag = drag?.idx === pos
        const ok = reveal ? item.correctOrder[pos] === entry : undefined
        return (
          <li
            key={entry}
            className={`flex h-12 items-center gap-2 rounded-xl border-2 bg-[var(--surface)] pr-1 pl-2 ${isDrag ? 'z-10 border-[var(--accent)] shadow-lg' : ok === true ? 'border-[var(--ok)]' : ok === false ? 'border-[var(--bad)]' : 'border-[var(--border)]'}`}
            style={isDrag ? { transform: `translateY(${drag.dy}px)`, position: 'relative' } : undefined}
          >
            <span className="tabnums muted w-6 text-center text-sm font-bold">{pos + 1}.</span>
            <span
              className="flex min-h-11 flex-1 cursor-grab items-center text-[15px] font-medium select-none"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                if (disabled) return
                ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
                setDrag({ idx: pos, startY: e.clientY, dy: 0 })
              }}
              onPointerMove={(e) => {
                if (!drag || drag.idx !== pos) return
                const dy = e.clientY - drag.startY
                const steps = Math.round(dy / ROW_H)
                if (steps !== 0) {
                  const to = Math.max(0, Math.min(order.length - 1, pos + steps))
                  if (to !== pos) {
                    move(pos, to)
                    setDrag({ idx: to, startY: drag.startY + (to - pos) * ROW_H, dy: dy - (to - pos) * ROW_H })
                    return
                  }
                }
                setDrag({ ...drag, dy })
              }}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}
            >
              <span aria-hidden="true" className="muted mr-2">
                ⋮⋮
              </span>
              {item.entries[entry]}
              {ok === true && <span className="ml-2 text-[var(--ok)]">✓</span>}
              {ok === false && <span className="ml-2 text-[var(--bad)]">✗</span>}
            </span>
            <button type="button" aria-label={`${item.entries[entry]} nach oben`} disabled={disabled || pos === 0} onClick={() => move(pos, pos - 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg disabled:opacity-30">
              ↑
            </button>
            <button type="button" aria-label={`${item.entries[entry]} nach unten`} disabled={disabled || pos === order.length - 1} onClick={() => move(pos, pos + 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg disabled:opacity-30">
              ↓
            </button>
          </li>
        )
      })}
    </ol>
  )
}

// ------------------------------------------------------------------ digit

export function DigitPad({ eq, onSubmit, disabled, hint }: { eq: DigitEquation; onSubmit: (digits: number[]) => void; disabled?: boolean; hint?: string }) {
  const n = useMemo(() => [...eq.lhs, ...eq.rhs].filter((t) => t.t === 'slot').length, [eq])
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(n).fill(null))
  const [active, setActive] = useState(0)
  useEffect(() => {
    setSlots(Array(n).fill(null))
    setActive(0)
  }, [eq, n])
  const put = (d: number) => {
    if (disabled) return
    const next = slots.slice()
    const existing = next.indexOf(d)
    if (existing >= 0) next[existing] = null
    next[active] = d
    setSlots(next)
    const empty = next.findIndex((x) => x === null)
    setActive(empty >= 0 ? empty : active)
  }
  let k = 0
  const render = (toks: DigitEquation['lhs']) =>
    toks.map((t, i) => {
      if (t.t === 'slot') {
        const idx = k++
        return (
          <button key={i} type="button" aria-label={`Feld ${idx + 1}`} onClick={() => setActive(idx)} className={`inline-flex h-12 w-11 items-center justify-center rounded-lg border-2 text-2xl font-bold tabnums ${active === idx ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
            {slots[idx] ?? ''}
          </button>
        )
      }
      return (
        <span key={i} className="px-1 text-2xl font-semibold">
          {t.t === 'num' ? t.v : t.op === '*' ? '×' : t.op === '-' ? '−' : '+'}
        </span>
      )
    })
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {render(eq.lhs)}
        <span className="px-2 text-2xl font-semibold">=</span>
        {render(eq.rhs)}
      </div>
      {hint && <p className="muted text-center text-sm">{hint}</p>}
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <Button key={d} disabled={disabled} onClick={() => put(d)} className={`h-12 text-xl ${slots.includes(d) ? 'opacity-40' : ''}`}>
            {d}
          </Button>
        ))}
        <Button
          disabled={disabled}
          onClick={() => {
            const next = slots.slice()
            next[active] = null
            setSlots(next)
          }}
        >
          ⌫
        </Button>
        <Button variant="primary" className="col-span-2" disabled={disabled || slots.some((x) => x === null)} onClick={() => onSubmit(slots as number[])}>
          Abgeben
        </Button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ grid

function MiniGrid({ size, cells, cellPx = 22 }: { size: number; cells: number[]; cellPx?: number }) {
  const set = new Set(cells)
  return (
    <div className="inline-grid gap-[2px] rounded-md bg-[var(--border)] p-[2px]" style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)` }}>
      {Array.from({ length: size * size }, (_, i) => (
        <div key={i} style={{ width: cellPx, height: cellPx }} className={set.has(i) ? 'bg-[var(--fig)]' : 'bg-[var(--fig-bg)]'} />
      ))}
    </div>
  )
}

export function GridRoundPlayer({ round, onDone, showMs = 1500 }: { round: GridRound; onDone: (a: Extract<Answer, { type: 'grid' }>) => void; showMs?: number }) {
  const n = round.dots.length
  const [phase, setPhase] = useState<{ k: 'dot' | 'judge' | 'recall'; i: number }>({ k: 'dot', i: 0 })
  const [judgements, setJudgements] = useState<(boolean | null)[]>([])
  const [taps, setTaps] = useState<number[]>([])
  useEffect(() => {
    if (phase.k !== 'dot') return
    const t = setTimeout(() => setPhase({ k: 'judge', i: phase.i }), showMs)
    return () => clearTimeout(t)
  }, [phase, showMs])
  const judge = (v: boolean | null) => {
    const next = [...judgements, v]
    setJudgements(next)
    setPhase(phase.i + 1 < n ? { k: 'dot', i: phase.i + 1 } : { k: 'recall', i: 0 })
  }
  useEffect(() => {
    if (phase.k !== 'judge') return
    const t = setTimeout(() => judge(null), 8000)
    return () => clearTimeout(t)
  })
  const tap = (cell: number) => {
    if (taps.includes(cell)) return
    const next = [...taps, cell]
    setTaps(next)
    if (next.length === n) onDone({ type: 'grid', positions: next, judgements })
  }
  const j = round.judgements[phase.i]
  return (
    <div className="mx-auto max-w-sm text-center">
      {phase.k === 'dot' && (
        <>
          <p className="muted mb-3 text-sm">
            Punkt {phase.i + 1} von {n} merken
          </p>
          <div className="mx-auto grid w-64 grid-cols-4 gap-1.5">
            {Array.from({ length: 16 }, (_, c) => (
              <div key={c} className="flex aspect-square items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
                {c === round.dots[phase.i] && <span className="h-8 w-8 rounded-full bg-[var(--accent)]" aria-label="Punkt" />}
              </div>
            ))}
          </div>
        </>
      )}
      {phase.k === 'judge' && j && (
        <>
          <p className="mb-3 text-[15px] font-semibold">{j.kind === 'symmetry' ? 'Ist das Muster spiegelsymmetrisch (senkrechte Achse)?' : 'Ist die rechte Figur dieselbe Figur, nur gedreht?'}</p>
          <div className="flex items-center justify-center gap-4">
            {j.kind === 'symmetry' ? (
              <MiniGrid size={j.size} cells={j.cells} />
            ) : (
              <>
                <MiniGrid size={j.size} cells={j.a} cellPx={20} />
                <MiniGrid size={j.size} cells={j.b} cellPx={20} />
              </>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="primary" onClick={() => judge(true)}>
              {j.kind === 'symmetry' ? 'Symmetrisch' : 'Dieselbe'}
            </Button>
            <Button onClick={() => judge(false)}>{j.kind === 'symmetry' ? 'Nicht symmetrisch' : 'Gespiegelt'}</Button>
          </div>
        </>
      )}
      {phase.k === 'recall' && (
        <>
          <p className="mb-3 text-[15px] font-semibold">
            Tippe die {n} Punkte in der richtigen Reihenfolge an ({taps.length}/{n})
          </p>
          <div className="mx-auto grid w-64 grid-cols-4 gap-1.5">
            {Array.from({ length: 16 }, (_, c) => (
              <button key={c} type="button" aria-label={`Feld ${c + 1}`} onClick={() => tap(c)} className={`flex aspect-square items-center justify-center rounded-md border-2 text-sm font-bold ${taps.includes(c) ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
                {taps.includes(c) ? taps.indexOf(c) + 1 : ''}
              </button>
            ))}
          </div>
          {taps.length > 0 && (
            <Button className="mt-3" onClick={() => setTaps(taps.slice(0, -1))}>
              Letzten zurücknehmen
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export { MiniGrid }
