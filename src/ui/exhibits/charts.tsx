/**
 * Readable SVG charts (no chart library). Every value that a question needs
 * is printed as a label – no answer depends on reading pixels (rule 5).
 * Series are distinguished by colour AND pattern/marker (accessibility).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { fmt } from '../../content/format'
import type { BarExhibit, ComboExhibit, Lang, LineExhibit, PieExhibit, TableExhibit } from '../../content/types'

export function useWidth<T extends HTMLElement>(fallback = 340): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null)
  const [w, setW] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setW(Math.max(260, Math.floor(el.getBoundingClientRect().width)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']
const PATTERNS = ['solid', 'hatch', 'dots', 'cross', 'hlines', 'vlines'] as const

function Patterns({ id }: { id: string }) {
  return (
    <defs>
      {COLORS.map((c, i) => (
        <pattern key={i} id={`${id}-p${i}`} patternUnits="userSpaceOnUse" width="7" height="7">
          <rect width="7" height="7" fill={c} opacity={PATTERNS[i] === 'solid' ? 1 : 0.28} />
          {PATTERNS[i] === 'hatch' && <path d="M-1 8 L8 -1 M5 9 L9 5" stroke={c} strokeWidth="2" />}
          {PATTERNS[i] === 'dots' && <circle cx="3.5" cy="3.5" r="1.6" fill={c} />}
          {PATTERNS[i] === 'cross' && <path d="M0 0 L7 7 M7 0 L0 7" stroke={c} strokeWidth="1.4" />}
          {PATTERNS[i] === 'hlines' && <path d="M0 2 H7 M0 5.5 H7" stroke={c} strokeWidth="1.6" />}
          {PATTERNS[i] === 'vlines' && <path d="M2 0 V7 M5.5 0 V7" stroke={c} strokeWidth="1.6" />}
        </pattern>
      ))}
    </defs>
  )
}

function Swatch({ i, chartId, marker }: { i: number; chartId: string; marker?: boolean }) {
  return (
    <svg width="22" height="14" aria-hidden="true" className="shrink-0">
      <Patterns id={`${chartId}-sw${i}`} />
      {marker ? (
        <>
          <line x1="1" y1="7" x2="21" y2="7" stroke={COLORS[i]} strokeWidth="2.5" strokeDasharray={i === 1 ? '5 3' : i === 2 ? '2 2' : undefined} />
          <Marker i={i} x={11} y={7} />
        </>
      ) : (
        <rect x="1" y="1" width="20" height="12" rx="2" fill={`url(#${chartId}-sw${i}-p${i})`} stroke={COLORS[i]} />
      )}
    </svg>
  )
}

function Marker({ i, x, y }: { i: number; x: number; y: number }) {
  const c = COLORS[i]
  if (i === 1) return <rect x={x - 4} y={y - 4} width="8" height="8" fill={c} />
  if (i === 2) return <path d={`M${x} ${y - 5} L${x + 5} ${y + 4} L${x - 5} ${y + 4} Z`} fill={c} />
  return <circle cx={x} cy={y} r="4.2" fill={c} />
}

export function ChartFrame({ title, unit, legend, children }: { title: string; unit?: string; legend?: ReactNode; children: ReactNode }) {
  return (
    <figure className="m-0">
      <figcaption className="mb-2">
        <div className="text-[15px] leading-snug font-semibold">{title}</div>
        {unit && <div className="muted text-xs">{unit}</div>}
      </figcaption>
      {legend && <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">{legend}</div>}
      {children}
    </figure>
  )
}

function niceMax(v: number): number {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p
  return 10 * p
}

const approxTextW = (s: string, size: number) => s.length * size * 0.58

// --------------------------------------------------------------- table

export function TableView({ ex, lang, blank }: { ex: TableExhibit; lang: Lang; blank?: (r: number, c: number) => ReactNode }) {
  return (
    <figure className="m-0">
      <figcaption className="mb-2">
        <div className="text-[15px] leading-snug font-semibold">{ex.title}</div>
        {ex.unitNote && <div className="muted text-xs">{ex.unitNote}</div>}
      </figcaption>
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="tabnums w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              <th scope="col" className="px-2 py-2 text-left font-semibold">
                {ex.rowHeader ?? ''}
              </th>
              {ex.header.map((h) => (
                <th key={h} scope="col" className="px-2 py-2 text-right font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ex.rows.map((r, ri) => (
              <tr key={r.label + ri} className="border-t border-[var(--border)]">
                <th scope="row" className="px-2 py-2 text-left font-medium">
                  {r.label}
                </th>
                {r.cells.map((v, ci) => (
                  <td key={ci} className="px-2 py-2 text-right whitespace-nowrap">
                    {v === null ? (blank ? blank(ri, ci) : '–') : `${fmt(v, lang, ex.decimals[ci] ?? 0)}${ex.suffix?.[ci] ?? ''}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ex.footnote && <p className="muted mt-1 text-xs">{ex.footnote}</p>}
    </figure>
  )
}

// ----------------------------------------------------------------- bars

export function BarChart({ ex, lang, id }: { ex: BarExhibit; lang: Lang; id: string }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const nCat = ex.categories.length
  const nSer = ex.series.length
  const stacked = !!ex.stacked
  const totals = ex.categories.map((_, c) => ex.series.reduce((s, x) => s + x.values[c], 0))
  const maxV = niceMax(stacked ? Math.max(...totals) : Math.max(...ex.series.flatMap((s) => s.values)))
  const left = 8
  const right = 8
  const top = 22
  const bottom = 26
  const H = stacked ? 300 : 240
  const plotW = W - left - right
  const plotH = H - top - bottom
  const groupW = plotW / nCat
  const barW = stacked ? Math.min(64, groupW * 0.55) : Math.min(46, (groupW * 0.82) / nSer)
  const y = (v: number) => top + plotH - (v / maxV) * plotH
  const f = (v: number) => `${fmt(v, lang, ex.decimals)}${ex.suffix ?? ''}`
  const fs = W < 380 ? 11 : 12
  const legend = nSer > 1 ? ex.series.map((s, i) => (
    <span key={s.name} className="inline-flex items-center gap-1.5">
      <Swatch i={i} chartId={id} />
      {s.name}
    </span>
  )) : null
  return (
    <ChartFrame title={ex.title} unit={ex.unitNote} legend={legend}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ex.title} className="block">
          <Patterns id={id} />
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={left} x2={W - right} y1={y(maxV * t)} y2={y(maxV * t)} stroke="var(--border)" strokeDasharray="3 3" />
          ))}
          <line x1={left} x2={W - right} y1={y(0)} y2={y(0)} stroke="var(--muted)" />
          {ex.categories.map((cat, c) => {
            const gx = left + c * groupW
            if (stacked) {
              let acc = 0
              const bx = gx + (groupW - barW) / 2
              return (
                <g key={cat}>
                  {ex.series.map((s, i) => {
                    const v = s.values[c]
                    const y0 = y(acc)
                    acc += v
                    const y1 = y(acc)
                    const h = y0 - y1
                    const label = f(v)
                    const inside = h >= fs + 4 && approxTextW(label, fs) + 6 <= barW
                    return (
                      <g key={s.name}>
                        <rect x={bx} y={y1} width={barW} height={h} fill={i === 0 ? COLORS[0] : `url(#${id}-p${i})`} stroke={COLORS[i]} strokeWidth="1" />
                        {inside ? (
                          <>
                            <rect x={bx + barW / 2 - approxTextW(label, fs) / 2 - 3} y={y1 + h / 2 - fs / 2 - 2} width={approxTextW(label, fs) + 6} height={fs + 4} rx="3" fill="var(--surface)" opacity="0.9" />
                            <text x={bx + barW / 2} y={y1 + h / 2 + fs / 2 - 2} textAnchor="middle" fontSize={fs} fill="var(--text)">
                              {label}
                            </text>
                          </>
                        ) : (
                          <text x={bx + barW + 3} y={y1 + h / 2 + fs / 2 - 2} fontSize={fs - 1} fill="var(--text)">
                            {label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  {ex.showTotals && (
                    <text x={bx + barW / 2} y={y(totals[c]) - 6} textAnchor="middle" fontSize={fs} fontWeight="700" fill="var(--text)">
                      {f(totals[c])}
                    </text>
                  )}
                  <text x={gx + groupW / 2} y={H - 8} textAnchor="middle" fontSize={fs} fill="var(--muted)">
                    {cat}
                  </text>
                </g>
              )
            }
            const inner = barW * nSer
            const startX = gx + (groupW - inner) / 2
            return (
              <g key={cat}>
                {ex.series.map((s, i) => {
                  const v = s.values[c]
                  const bx = startX + i * barW
                  const label = f(v)
                  const vertical = approxTextW(label, fs) > (nSer === 1 ? groupW - 4 : barW + 2)
                  return (
                    <g key={s.name}>
                      <rect x={bx + 1} y={y(v)} width={barW - 2} height={y(0) - y(v)} fill={i === 0 ? COLORS[0] : `url(#${id}-p${i})`} stroke={COLORS[i]} />
                      {vertical ? (
                        <text transform={`translate(${bx + barW / 2 + fs / 2 - 1} ${y(v) - 4}) rotate(-90)`} fontSize={fs} fill="var(--text)">
                          {label}
                        </text>
                      ) : (
                        <text x={bx + barW / 2} y={y(v) - 4} textAnchor="middle" fontSize={fs} fill="var(--text)">
                          {label}
                        </text>
                      )}
                    </g>
                  )
                })}
                <text x={gx + groupW / 2} y={H - 8} textAnchor="middle" fontSize={fs} fill="var(--muted)">
                  {cat.length > 14 && W < 500 ? cat.slice(0, 12) + '…' : cat}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </ChartFrame>
  )
}

// ---------------------------------------------------------------- lines

export function LineChart({ ex, lang, id }: { ex: LineExhibit; lang: Lang; id: string }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const n = ex.categories.length
  const all = ex.series.flatMap((s) => s.values)
  const minV = Math.min(...all)
  const maxV = Math.max(...all)
  const pad = (maxV - minV) * 0.25 || maxV * 0.1 || 1
  const lo = Math.max(0, minV - pad)
  const hi = maxV + pad
  const H = 240
  const left = 14
  const right = 14
  const top = 26
  const bottom = 30
  const plotW = W - left - right
  const plotH = H - top - bottom
  const x = (i: number) => left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (v: number) => top + plotH - ((v - lo) / (hi - lo)) * plotH
  const fs = W < 380 ? 11 : 12
  const f = (v: number) => `${fmt(v, lang, ex.decimals)}${ex.suffix ?? ''}`
  const legend =
    ex.series.length > 0
      ? ex.series.map((s, i) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <Swatch i={i} chartId={id} marker />
            {s.name}
          </span>
        ))
      : null
  return (
    <ChartFrame title={ex.title} unit={ex.unitNote} legend={legend}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ex.title} className="block">
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1={left} x2={W - right} y1={top + plotH * t} y2={top + plotH * t} stroke="var(--border)" strokeDasharray="3 3" />
          ))}
          {ex.series.map((s, si) => (
            <polyline key={s.name} fill="none" stroke={COLORS[si]} strokeWidth="2.5" strokeDasharray={si === 1 ? '6 4' : si === 2 ? '2 3' : undefined} points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          ))}
          {ex.series.map((s, si) =>
            s.values.map((v, i) => {
              const others = ex.series.filter((_, k) => k !== si).map((o) => o.values[i])
              const below = others.some((o) => o > v)
              const ty = below ? y(v) + fs + 8 : y(v) - 9
              const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
              const tx = i === 0 ? x(i) - 6 : i === n - 1 ? x(i) + 6 : x(i)
              return (
                <g key={`${s.name}-${i}`}>
                  <Marker i={si} x={x(i)} y={y(v)} />
                  <text x={tx} y={ty} textAnchor={anchor} fontSize={fs} fontWeight="600" fill="var(--text)" stroke="var(--surface)" strokeWidth="3" paintOrder="stroke">
                    {f(v)}
                  </text>
                </g>
              )
            }),
          )}
          {ex.categories.map((c, i) => (
            <text key={c} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={fs} fill="var(--muted)">
              {c}
            </text>
          ))}
        </svg>
      </div>
    </ChartFrame>
  )
}

// ------------------------------------------------------------------ pie

export function PieChart({ ex, lang, id }: { ex: PieExhibit; lang: Lang; id: string }) {
  const total = ex.slices.reduce((s, x) => s + x.value, 0)
  const R = 80
  const cx = 100
  const cy = 100
  const angles = ex.slices.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + (s.value / total) * Math.PI * 2], [-Math.PI / 2])
  return (
    <ChartFrame title={ex.title} unit={ex.unitNote}>
      <div className="flex flex-wrap items-center gap-4">
        <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={ex.title} className="shrink-0">
          <Patterns id={id} />
          {ex.slices.map((s, i) => {
            const a0 = angles[i]
            const a1 = angles[i + 1]
            const large = a1 - a0 > Math.PI ? 1 : 0
            const d = `M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`
            return <path key={s.label} d={d} fill={`url(#${id}-p${i})`} stroke="var(--surface)" strokeWidth="1.5" />
          })}
        </svg>
        <ul className="m-0 list-none space-y-1.5 p-0 text-[14px]">
          {ex.slices.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <Swatch i={i} chartId={id} />
              <span>{s.label}</span>
              <span className="tabnums font-semibold">
                {fmt(s.value, lang, ex.decimals)}
                {ex.suffix}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  )
}

// ---------------------------------------------------------------- combo

export function ComboChart({ ex, lang, id }: { ex: ComboExhibit; lang: Lang; id: string }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const n = ex.categories.length
  const H = 300
  const left = 10
  const right = 10
  const top = 24
  const bottom = 28
  const plotW = W - left - right
  const groupW = plotW / n
  const barW = Math.min(44, groupW * 0.55)
  // Line in its own band above the bars – labels never collide.
  const lineBand = 80
  const gap = 26
  const barTop = top + lineBand + gap
  const barH = H - bottom - barTop
  const bMax = niceMax(Math.max(...ex.bars.values) * 1.05)
  const lMin = Math.min(...ex.line.values)
  const lMax = Math.max(...ex.line.values)
  const yb = (v: number) => barTop + barH - (v / bMax) * barH
  const yl = (v: number) => top + 14 + (lMax === lMin ? 0.5 : (lMax - v) / (lMax - lMin)) * (lineBand - 18)
  const cxOf = (i: number) => left + i * groupW + groupW / 2
  const fs = W < 380 ? 11 : 12
  const legend = (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Swatch i={0} chartId={id} />
        {ex.bars.name}
        {ex.barUnit && ex.barUnit !== ex.bars.name ? ` (${ex.barUnit})` : ''}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Swatch i={1} chartId={id} marker />
        {ex.line.name}
        {ex.lineUnit && ex.lineUnit !== ex.line.name ? ` (${ex.lineUnit})` : ''}
      </span>
    </>
  )
  return (
    <ChartFrame title={ex.title} legend={legend}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ex.title} className="block">
          <Patterns id={id} />
          <line x1={left} x2={W - right} y1={yb(0)} y2={yb(0)} stroke="var(--muted)" />
          {ex.bars.values.map((v, i) => {
            const label = fmt(v, lang, ex.barDecimals)
            const vertical = approxTextW(label, fs) > groupW - 4
            const by = yb(v)
            return (
              <g key={i}>
                <rect x={cxOf(i) - barW / 2} y={by} width={barW} height={yb(0) - by} fill={COLORS[0]} stroke={COLORS[0]} />
                {vertical ? (
                  <text transform={`translate(${cxOf(i) + fs / 2 - 1} ${yb(0) - 6}) rotate(-90)`} fontSize={fs} fill="var(--text)" stroke="var(--surface)" strokeWidth="3" paintOrder="stroke">
                    {label}
                  </text>
                ) : (
                  <text x={cxOf(i)} y={by - 5} textAnchor="middle" fontSize={fs} fill="var(--text)">
                    {label}
                  </text>
                )}
              </g>
            )
          })}
          <polyline fill="none" stroke={COLORS[1]} strokeWidth="2.5" strokeDasharray="6 4" points={ex.line.values.map((v, i) => `${cxOf(i)},${yl(v)}`).join(' ')} />
          {ex.line.values.map((v, i) => (
            <g key={i}>
              <Marker i={1} x={cxOf(i)} y={yl(v)} />
              <text x={cxOf(i)} y={yl(v) - 9} textAnchor="middle" fontSize={fs} fontWeight="600" fill="var(--text)" stroke="var(--surface)" strokeWidth="3" paintOrder="stroke">
                {fmt(v, lang, ex.lineDecimals)}
                {ex.lineSuffix ?? ''}
              </text>
            </g>
          ))}
          {ex.categories.map((c, i) => (
            <text key={c} x={cxOf(i)} y={H - 8} textAnchor="middle" fontSize={fs} fill="var(--muted)">
              {c}
            </text>
          ))}
        </svg>
      </div>
    </ChartFrame>
  )
}
