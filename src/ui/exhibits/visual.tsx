/** Figures (inductive), flow charts (diagrammatic) and switch rows (Aon), all as SVG/HTML. */
import { useId, type ReactNode } from 'react'
import type { FlowRow, FlowSpec } from '../../content/generators/diagrammatic/flow'
import type { FigEl, Panel, Shape } from '../../content/generators/inductive/figure'
import type { SwitchSpec, SwitchSymbol } from '../../content/generators/aon/switchTypes'

// ---------------------------------------------------------------- shapes

const poly = (n: number, r = 1, phase = -Math.PI / 2) =>
  Array.from({ length: n }, (_, i) => `${(r * Math.cos(phase + (i * 2 * Math.PI) / n)).toFixed(3)},${(r * Math.sin(phase + (i * 2 * Math.PI) / n)).toFixed(3)}`).join(' ')

const STAR = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 1 : 0.45
  const a = -Math.PI / 2 + (i * Math.PI) / 5
  return `${(r * Math.cos(a)).toFixed(3)},${(r * Math.sin(a)).toFixed(3)}`
}).join(' ')

const SHAPE_POINTS: Record<Exclude<Shape, 'circle'>, string> = {
  square: '-0.8,-0.8 0.8,-0.8 0.8,0.8 -0.8,0.8',
  diamond: '0,-1 1,0 0,1 -1,0',
  triangle: '0,-0.95 0.95,0.75 -0.95,0.75',
  pentagon: poly(5),
  hexagon: poly(6, 1, 0),
  star: STAR,
  cross: '-0.3,-1 0.3,-1 0.3,-0.3 1,-0.3 1,0.3 0.3,0.3 0.3,1 -0.3,1 -0.3,0.3 -1,0.3 -1,-0.3 -0.3,-0.3',
  arrow: '0,-1 0.72,-0.2 0.28,-0.2 0.28,1 -0.28,1 -0.28,-0.2 -0.72,-0.2',
  lshape: '-0.7,-1 -0.2,-1 -0.2,0.5 0.7,0.5 0.7,1 -0.7,1',
}

function FigDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-striped`} patternUnits="userSpaceOnUse" width="4.5" height="4.5" patternTransform="rotate(45)">
        <rect width="4.5" height="4.5" fill="var(--fig-bg)" />
        <line x1="0" y1="0" x2="0" y2="4.5" stroke="var(--fig)" strokeWidth="1.8" />
      </pattern>
      <pattern id={`${id}-dotted`} patternUnits="userSpaceOnUse" width="4.5" height="4.5">
        <rect width="4.5" height="4.5" fill="var(--fig-bg)" />
        <circle cx="2.25" cy="2.25" r="1.05" fill="var(--fig)" />
      </pattern>
    </defs>
  )
}

const SIZE_SCALE = [9, 13.5, 18]

/** Scales a unit polygon in user space (not via transform) so fill patterns keep their size. */
const scalePoints = (pts: string, s: number) =>
  pts
    .split(' ')
    .map((p) => p.split(',').map((v) => (Number(v) * s).toFixed(2)).join(','))
    .join(' ')

function Element({ el, id, big }: { el: FigEl; id: string; big?: boolean }) {
  const cx = big ? 60 : (el.cell % 3) * 40 + 20
  const cy = big ? 58 : Math.floor(el.cell / 3) * 40 + 20
  const s = SIZE_SCALE[el.size] * (big ? 2.1 : 1)
  const fill = el.fill === 'solid' ? 'var(--fig)' : el.fill === 'empty' ? 'var(--fig-bg)' : `url(#${id}-${el.fill})`
  const t = `translate(${cx} ${cy}) rotate(${(el.rot % 8) * 45}) scale(${el.mirror ? -1 : 1} 1)`
  const common = { fill, stroke: 'var(--fig)', strokeWidth: 2, strokeLinejoin: 'round' as const }
  return <g transform={t}>{el.shape === 'circle' ? <circle r={0.92 * s} {...common} /> : <polygon points={scalePoints(SHAPE_POINTS[el.shape], s)} {...common} />}</g>
}

const LINE_COORDS: [number, number, number, number][] = [
  [6, 6, 114, 6],
  [114, 6, 114, 114],
  [6, 114, 114, 114],
  [6, 6, 6, 114],
  [6, 6, 114, 114],
  [114, 6, 6, 114],
  [6, 60, 114, 60],
  [60, 6, 60, 114],
]

export function FigurePanel({ panel, label }: { panel: Panel | null; label?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 120 132" className="block h-auto w-full rounded-lg border border-[var(--border)] bg-[var(--fig-bg)]" role="img" aria-label={label ?? (panel ? 'Figur' : 'Fehlende Figur')}>
      <FigDefs id={id} />
      {panel === null ? (
        <text x="60" y="76" textAnchor="middle" fontSize="44" fontWeight="700" fill="var(--muted)">
          ?
        </text>
      ) : (
        <>
          {(panel.lines ?? []).map((l) => {
            const [x1, y1, x2, y2] = LINE_COORDS[l]
            return <line key={l} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fig)" strokeWidth="3.2" strokeLinecap="round" />
          })}
          {panel.els.map((el, i) => (
            <Element key={i} el={el} id={id} big={panel.els.length === 1 && el.cell === 4 && (panel.lines ?? []).length === 0} />
          ))}
          {Array.from({ length: panel.ticks ?? 0 }, (_, i) => {
            const n = panel.ticks ?? 0
            const x = 60 - ((n - 1) * 9) / 2 + i * 9
            return <line key={i} x1={x} y1={120} x2={x} y2={129} stroke="var(--fig)" strokeWidth="2.6" strokeLinecap="round" />
          })}
        </>
      )}
    </svg>
  )
}

export function FiguresView({ layout, panels }: { layout: 'series' | 'matrix' | 'odd'; panels: (Panel | null)[] }) {
  if (layout === 'matrix') {
    return (
      <div className="mx-auto grid max-w-[420px] grid-cols-3 gap-2">
        {panels.map((p, i) => (
          <FigurePanel key={i} panel={p} label={p ? `Feld ${i + 1}` : 'Fehlendes Feld'} />
        ))}
      </div>
    )
  }
  if (layout === 'odd') return null
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {panels.map((p, i) => (
        <div key={i}>
          <FigurePanel panel={p} label={p ? `Figur ${i + 1}` : 'Gesuchte Figur'} />
          <div className="muted mt-1 text-center text-xs tabnums">{i + 1}</div>
        </div>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ flow

function Chars({ s, dim }: { s: string[] | null; dim?: boolean }) {
  if (!s) return <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border-2 border-dashed border-[var(--accent)] px-3 text-lg font-bold text-[var(--accent)]">?</span>
  return (
    <span className="inline-flex gap-1">
      {s.map((c, i) => (
        <span key={i} className={`inline-flex h-9 w-8 items-center justify-center rounded-md border border-[var(--border)] font-mono text-lg font-bold ${dim ? 'bg-[var(--surface-2)]' : 'bg-[var(--surface)]'}`}>
          {c}
        </span>
      ))}
    </span>
  )
}

function OpBox({ sym }: { sym: string | null }) {
  return (
    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl ${sym === null ? 'border-dashed border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--text)]'}`} aria-label={sym === null ? 'fehlender Operator' : `Operator ${sym}`}>
      {sym ?? '?'}
    </span>
  )
}

function FlowLine({ row, title }: { row: FlowRow; title: ReactNode }) {
  return (
    <div className="card p-3">
      <div className="muted mb-2 text-xs font-semibold uppercase">{title}</div>
      <div className="flex flex-wrap items-center gap-2">
        <Chars s={row.input} />
        {row.ops.map((o, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="muted">
              →
            </span>
            <OpBox sym={o} />
          </span>
        ))}
        <span aria-hidden="true" className="muted">
          →
        </span>
        <Chars s={row.output} dim />
      </div>
    </div>
  )
}

export function FlowView({ flow, lang }: { flow: FlowSpec; lang: 'en' | 'de' }) {
  return (
    <div className="space-y-2">
      {flow.legend.length > 0 && (
        <div className="card p-3">
          <div className="muted mb-2 text-xs font-semibold uppercase">{lang === 'de' ? 'Operatoren' : 'Operators'}</div>
          <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
            {flow.legend.map((l) => (
              <li key={l.symbol} className="flex items-center gap-2 text-[14px]">
                <OpBox sym={l.symbol} />
                <span>{l.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {flow.examples.map((r, i) => (
        <FlowLine key={i} row={r} title={`${lang === 'de' ? 'Beispiel' : 'Example'} ${i + 1}`} />
      ))}
      <FlowLine row={flow.question} title={lang === 'de' ? 'Aufgabe' : 'Question'} />
    </div>
  )
}

// ---------------------------------------------------------------- switch

export function SwitchSymbolIcon({ s, size = 34 }: { s: SwitchSymbol; size?: number }) {
  const shape: Record<SwitchSymbol, ReactNode> = {
    circle: <circle cx="20" cy="20" r="14" />,
    square: <rect x="7" y="7" width="26" height="26" />,
    triangle: <polygon points="20,5 35,33 5,33" />,
    diamond: <polygon points="20,4 36,20 20,36 4,20" />,
    star: <polygon points={STAR.split(' ').map((p) => p.split(',').map((v) => 20 + Number(v) * 16).join(',')).join(' ')} />,
    cross: <polygon points="15,5 25,5 25,15 35,15 35,25 25,25 25,35 15,35 15,25 5,25 5,15 15,15" />,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={s} className="block">
      <g fill="var(--fig)" stroke="var(--fig)" strokeWidth="1.5">
        {shape[s]}
      </g>
    </svg>
  )
}

function SymbolRow({ row, label }: { row: SwitchSymbol[]; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-label={label}>
      {row.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <SwitchSymbolIcon s={s} />
          <span className="muted text-[11px] tabnums">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

export function SwitchView({ spec, lang }: { spec: SwitchSpec; lang: 'en' | 'de' }) {
  return (
    <div className="card mx-auto max-w-sm space-y-2 p-4">
      <SymbolRow row={spec.input} label={lang === 'de' ? 'Eingang' : 'Input'} />
      {spec.switches.map((c, i) => (
        <div key={i} className="flex flex-col items-center">
          <span aria-hidden="true" className="muted">
            ↓
          </span>
          <span className={`inline-flex h-11 min-w-28 items-center justify-center rounded-lg border-2 px-3 font-mono text-xl font-bold tracking-[0.3em] ${c === null ? 'border-dashed border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--text)]'}`}>
            {c === null ? '????' : c.join('')}
          </span>
        </div>
      ))}
      <div className="flex justify-center">
        <span aria-hidden="true" className="muted">
          ↓
        </span>
      </div>
      <SymbolRow row={spec.output} label={lang === 'de' ? 'Ausgang' : 'Output'} />
    </div>
  )
}
