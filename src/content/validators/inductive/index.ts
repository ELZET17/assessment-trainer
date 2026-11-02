/**
 * Independent solver for inductive figure items (quality rule 4).
 *
 * The panels are decomposed into attribute "tracks" (position, rotation,
 * fill, size, shape, tick count, line set). For each track a library of
 * simple rules is tried; every rule consistent with the visible panels
 * contributes a prediction. An item is only valid if every track has exactly
 * one predicted value and exactly one option equals the predicted panel.
 */
import { RING, ROTATING, SIDES, type FigEl, type Panel } from '../../generators/inductive/figure'
import type { PublicItem } from '../../types'
import { fail, mcq, type Validation } from '../result'

// ---------------------------------------------------------------- helpers

/** Canonical string for visual identity of a panel. */
export function canonPanel(p: Panel): string {
  const els = p.els
    .map((e) => {
      const rot = ROTATING.includes(e.shape) ? ((e.rot % 8) + 8) % 8 : 0
      const mir = e.shape === 'lshape' ? !!e.mirror : false
      return `${e.shape}/${e.cell}/${e.size}/${e.fill}/${rot}/${mir ? 1 : 0}`
    })
    .sort()
  const lines = (p.lines ?? []).slice().sort((a, b) => a - b)
  return `${els.join(';')}|${lines.join(',')}|${p.ticks ?? 0}`
}

type V = number | string
const mod = (x: number, m: number) => ((x % m) + m) % m

/** Next-value predictions for a categorical sequence. */
function predictCategorical(xs: V[]): Set<V> {
  const out = new Set<V>()
  const n = xs.length
  if (xs.every((x) => x === xs[0])) out.add(xs[0])
  if (n >= 4 && xs[0] !== xs[1] && xs.every((x, i) => x === xs[i % 2])) out.add(xs[n % 2])
  if (n >= 4 && new Set(xs.slice(0, 3)).size === 3 && xs.every((x, i) => x === xs[i % 3])) out.add(xs[n % 3])
  return out
}

/** Predictions for a numeric sequence; m = modulus (cyclic) or 0 for plain integers. */
function predictNumeric(xs: number[], m: number): Set<V> {
  const out = predictCategorical(xs)
  const n = xs.length
  const norm = (x: number) => (m ? mod(x, m) : x)
  const diffs = xs.slice(1).map((x, i) => norm(x - xs[i]))
  if (diffs.length >= 2 && diffs.every((d) => d === diffs[0]) && diffs[0] !== 0) out.add(norm(xs[n - 1] + diffs[0]))
  // second-order: the step changes by a constant
  if (diffs.length >= 3) {
    const raw = xs.slice(1).map((x, i) => x - xs[i])
    const steps = m ? raw.map((d) => (mod(d, m) > m / 2 ? mod(d, m) - m : mod(d, m))) : raw
    const dd = steps.slice(1).map((d, i) => d - steps[i])
    if (dd.every((x) => x === dd[0]) && dd[0] !== 0) out.add(norm(xs[n - 1] + steps[steps.length - 1] + dd[0]))
  }
  if (!m && out.size) for (const v of out) if ((v as number) < 0) out.delete(v)
  return out
}

function only<T>(s: Set<T>): T | null {
  return s.size === 1 ? [...s][0] : null
}

// ------------------------------------------------------------------ series

/** Match elements across panels: by unique shape, or a single element. */
function tracks(panels: Panel[]): FigEl[][] | null {
  if (panels.every((p) => p.els.length === 1)) return [panels.map((p) => p.els[0])]
  const shapes = panels[0].els.map((e) => e.shape).sort()
  for (const p of panels) {
    const s = p.els.map((e) => e.shape).sort()
    if (s.join() !== shapes.join() || new Set(s).size !== s.length) return null
  }
  return shapes.map((sh) => panels.map((p) => p.els.find((e) => e.shape === sh) as FigEl))
}

export function solveSeries(panels: Panel[]): string | null {
  const tr = tracks(panels)
  if (!tr) return null
  const els: FigEl[] = []
  for (const t of tr) {
    const shape = only(predictCategorical(t.map((e) => e.shape)))
    const inRing = t.every((e) => RING.includes(e.cell))
    const cell = inRing ? only(predictNumeric(t.map((e) => RING.indexOf(e.cell)), 8)) : only(predictCategorical(t.map((e) => e.cell)))
    const rotates = t.every((e) => ROTATING.includes(e.shape))
    const rot = rotates ? only(predictNumeric(t.map((e) => e.rot), 8)) : 0
    const size = only(predictNumeric(t.map((e) => e.size), 0))
    const fill = only(predictCategorical(t.map((e) => e.fill)))
    const mirror = t.every((e) => e.shape === 'lshape') ? only(predictCategorical(t.map((e) => (e.mirror ? 1 : 0)))) : 0
    if ([shape, cell, rot, size, fill, mirror].some((x) => x === null)) return null
    if ((size as number) < 0 || (size as number) > 2) return null
    els.push({
      shape: shape as FigEl['shape'],
      cell: inRing ? RING[cell as number] : (cell as number),
      rot: rot as number,
      size: size as FigEl['size'],
      fill: fill as FigEl['fill'],
      mirror: mirror === 1,
    })
  }
  const ticks = only(predictNumeric(panels.map((p) => p.ticks ?? 0), 0))
  if (ticks === null) return null
  const lines = only(predictCategorical(panels.map((p) => (p.lines ?? []).slice().sort((a, b) => a - b).join(','))))
  if (lines === null) return null
  return canonPanel({ els, ticks: ticks as number, lines: lines === '' ? [] : String(lines).split(',').map(Number) })
}

// ------------------------------------------------------------------ matrix

type Grid = (V | null)[][]

function predictMatrix(g: Grid, kind: 'cat' | 'num' | 'set', m = 0): Set<V> {
  const out = new Set<V>()
  const v = (r: number, c: number) => g[r][c] as V
  const rows = [0, 1]
  // constant per row / per column
  if (rows.every((r) => v(r, 0) === v(r, 1) && v(r, 1) === v(r, 2)) && v(2, 0) === v(2, 1)) out.add(v(2, 0))
  if ([0, 1].every((c) => v(0, c) === v(1, c) && v(1, c) === v(2, c)) && v(0, 2) === v(1, 2)) out.add(v(0, 2))
  // whole matrix constant (covered above) – distribution of three (Latin square) by rows / columns
  const latin = (line: (i: number) => V[], last: V[]) => {
    const s0 = new Set(line(0))
    if (s0.size !== 3) return
    if (![1].every((i) => new Set(line(i)).size === 3 && line(i).every((x) => s0.has(x)))) return
    if (last.length !== 2 || last[0] === last[1] || !last.every((x) => s0.has(x))) return
    out.add([...s0].find((x) => !last.includes(x)) as V)
  }
  latin((r) => [v(r, 0), v(r, 1), v(r, 2)], [v(2, 0), v(2, 1)])
  latin((c) => [v(0, c), v(1, c), v(2, c)], [v(0, 2), v(1, 2)])
  if (kind === 'num') {
    const norm = (x: number) => (m ? mod(x, m) : x)
    const k = norm((v(0, 1) as number) - (v(0, 0) as number))
    if (k !== 0 && [0, 1, 2].every((r) => norm((v(r, 1) as number) - (v(r, 0) as number)) === k) && [0, 1].every((r) => norm((v(r, 2) as number) - (v(r, 1) as number)) === k))
      out.add(norm((v(2, 1) as number) + k))
    const kc = norm((v(1, 0) as number) - (v(0, 0) as number))
    if (kc !== 0 && [0, 1, 2].every((c) => norm((v(1, c) as number) - (v(0, c) as number)) === kc) && [0, 1].every((c) => norm((v(2, c) as number) - (v(1, c) as number)) === kc))
      out.add(norm((v(1, 2) as number) + kc))
    // row sum: third = first + second (counts)
    if (!m && [0, 1].every((r) => (v(r, 2) as number) === (v(r, 0) as number) + (v(r, 1) as number))) out.add((v(2, 0) as number) + (v(2, 1) as number))
  }
  if (kind === 'set') {
    const bits = (x: V) => Number(x)
    const ops: ((a: number, b: number) => number)[] = [(a, b) => a ^ b, (a, b) => a | b, (a, b) => a & b]
    for (const op of ops) {
      if ([0, 1].every((r) => bits(v(r, 2)) === op(bits(v(r, 0)), bits(v(r, 1))))) out.add(op(bits(v(2, 0)), bits(v(2, 1))))
      if ([0, 1].every((c) => bits(v(2, c)) === op(bits(v(0, c)), bits(v(1, c))))) out.add(op(bits(v(0, 2)), bits(v(1, 2))))
    }
  }
  return out
}

const lineMask = (p: Panel) => (p.lines ?? []).reduce((a, l) => a | (1 << l), 0)

export function solveMatrix(cells: (Panel | null)[]): string | null {
  if (cells.length !== 9 || cells[8] !== null || cells.slice(0, 8).some((c) => !c || c.els.length !== 1)) return null
  const P = cells as Panel[]
  const grid = <T extends V>(f: (p: Panel) => T): Grid => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : f(P[r * 3 + c]))))
  const el = (p: Panel) => p.els[0]
  const pick = (s: Set<V>) => only(s)
  const shape = pick(predictMatrix(grid((p) => el(p).shape), 'cat'))
  const fill = pick(predictMatrix(grid((p) => el(p).fill), 'cat'))
  const size = pick(predictMatrix(grid((p) => el(p).size), 'num'))
  const cell = pick(predictMatrix(grid((p) => el(p).cell), 'cat'))
  const rotates = P.slice(0, 8).every((p) => ROTATING.includes(el(p).shape))
  const rot = rotates ? pick(predictMatrix(grid((p) => el(p).rot), 'num', 8)) : 0
  const ticks = pick(predictMatrix(grid((p) => p.ticks ?? 0), 'num'))
  const lines = pick(predictMatrix(grid(lineMask), 'set'))
  if ([shape, fill, size, cell, rot, ticks, lines].some((x) => x === null)) return null
  const ls: number[] = []
  for (let i = 0; i < 8; i++) if ((lines as number) & (1 << i)) ls.push(i)
  return canonPanel({ els: [{ shape: shape as FigEl['shape'], fill: fill as FigEl['fill'], size: size as FigEl['size'], cell: cell as number, rot: rot as number }], ticks: ticks as number, lines: ls })
}

// ---------------------------------------------------------- odd one out

type Feature = (p: Panel) => V

const row = (c: number) => Math.floor(c / 3)
const col = (c: number) => c % 3
const zone = (c: number) => (c === 4 ? 'centre' : c % 2 === 0 ? 'corner' : 'edge')
const sign = (x: number) => Math.sign(x)
const count = (p: Panel, f: (e: FigEl) => boolean) => p.els.filter(f).length
const allSame = (xs: V[]) => (xs.every((x) => x === xs[0]) ? 1 : 0)
const CONCAVE: FigEl['shape'][] = ['star', 'cross', 'arrow', 'lshape']

/**
 * Everything a candidate could notice when looking for the odd one out
 * (Gate 3 showed that a small library misses competing rules such as
 * "the only black diamond" or "the only pair in diagonal corners").
 */
export const ODD_FEATURES: Record<string, Feature> = {
  shapeSet: (p) => p.els.map((e) => e.shape).sort().join(','),
  elementCount: (p) => p.els.length,
  tickCount: (p) => p.ticks ?? 0,
  tickParity: (p) => (p.ticks ?? 0) % 2,
  solidCount: (p) => count(p, (e) => e.fill === 'solid'),
  emptyCount: (p) => count(p, (e) => e.fill === 'empty'),
  stripedCount: (p) => count(p, (e) => e.fill === 'striped'),
  dottedCount: (p) => count(p, (e) => e.fill === 'dotted'),
  fillSet: (p) => [...new Set(p.els.map((e) => e.fill))].sort().join(','),
  sameFill: (p) => allSame(p.els.map((e) => e.fill)),
  sizeSet: (p) => [...new Set(p.els.map((e) => e.size))].sort().join(','),
  sameSize: (p) => allSame(p.els.map((e) => e.size)),
  sameShape: (p) => allSame(p.els.map((e) => e.shape)),
  roundCount: (p) => count(p, (e) => e.shape === 'circle'),
  concaveCount: (p) => count(p, (e) => CONCAVE.includes(e.shape)),
  mirrored: (p) => count(p, (e) => e.shape === 'lshape' && !!e.mirror),
  sidesSum: (p) => p.els.reduce((s, e) => s + SIDES[e.shape], 0),
  sidesParity: (p) => p.els.reduce((s, e) => s + SIDES[e.shape], 0) % 2,
  centre: (p) => count(p, (e) => e.cell === 4),
  cornerCount: (p) => count(p, (e) => zone(e.cell) === 'corner'),
  edgeCount: (p) => count(p, (e) => zone(e.cell) === 'edge'),
  ...Object.fromEntries([0, 1, 2].flatMap((r) => [
    [`row${r}`, (p: Panel) => count(p, (e) => row(e.cell) === r)],
    [`col${r}`, (p: Panel) => count(p, (e) => col(e.cell) === r)],
  ])),
  arrangement: (p) => {
    if (p.els.length !== 2) return '-'
    const [a, b] = p.els
    const dr = row(a.cell) - row(b.cell)
    const dc = col(a.cell) - col(b.cell)
    return dr === 0 ? 'row' : dc === 0 ? 'col' : Math.abs(dr) === Math.abs(dc) ? 'diag' : 'other'
  },
  adjacent: (p) => (p.els.length === 2 ? (Math.max(Math.abs(row(p.els[0].cell) - row(p.els[1].cell)), Math.abs(col(p.els[0].cell) - col(p.els[1].cell))) === 1 ? 1 : 0) : '-'),
  lineCount: (p) => (p.lines ?? []).length,
}

/** Attributes of one particular shape – only meaningful if every panel contains that shape exactly once. */
const PER_SHAPE: Record<string, (e: FigEl) => V> = {
  fill: (e) => e.fill,
  solid: (e) => (e.fill === 'solid' ? 1 : 0),
  size: (e) => e.size,
  row: (e) => row(e.cell),
  col: (e) => col(e.cell),
  zone: (e) => zone(e.cell),
}

function featureColumns(panels: Panel[]): V[][] {
  const cols = Object.values(ODD_FEATURES).map((f) => panels.map(f))
  const shapes = [...new Set(panels.flatMap((p) => p.els.map((e) => e.shape)))]
  const common = shapes.filter((s) => panels.every((p) => count(p, (e) => e.shape === s) === 1))
  const of = (p: Panel, s: string) => p.els.find((e) => e.shape === s) as FigEl
  for (const s of common) for (const f of Object.values(PER_SHAPE)) cols.push(panels.map((p) => f(of(p, s))))
  // Relative position of two shapes that occur in every panel ("the hexagon is below the pentagon").
  for (const a of common)
    for (const b of common) {
      if (a >= b) continue
      cols.push(panels.map((p) => sign(row(of(p, a).cell) - row(of(p, b).cell))))
      cols.push(panels.map((p) => sign(col(of(p, a).cell) - col(of(p, b).cell))))
    }
  // Presence of a shape in four panels but not in the fifth ("all but D contain a hexagon"), and –
  // with several shapes per panel – in only one panel ("E is the only figure with a triangle").
  const multi = panels.every((p) => p.els.length >= 2)
  for (const s of shapes) {
    const has = panels.map((p) => (p.els.some((e) => e.shape === s) ? 1 : 0))
    const n = has.filter((h) => h === 1).length
    if (n === 4 || (multi && n === 1)) cols.push(has)
  }
  return cols
}

/** Indices singled out by some feature (exactly one panel differs, the other four agree). */
export function oddCandidates(panels: Panel[]): Set<number> {
  const out = new Set<number>()
  for (const vals of featureColumns(panels)) {
    for (let i = 0; i < vals.length; i++) {
      const others = vals.filter((_, j) => j !== i)
      if (others.every((x) => x === others[0]) && vals[i] !== others[0]) out.add(i)
    }
  }
  return out
}

// --------------------------------------------------------------- dispatch

export function validateInductive(item: PublicItem): Validation {
  if (item.type !== 'mcq') return fail('not mcq')
  const ex = item.exhibits[0]
  if (!ex || ex.kind !== 'figures') return fail('missing figures')
  if (ex.layout === 'odd') {
    const panels = item.options.map((o) => o.panel as Panel)
    if (panels.some((p) => !p)) return fail('odd: options without panels')
    const c = oddCandidates(panels)
    return c.size === 1 ? mcq([...c][0]) : fail(`odd one out: ${c.size} candidates`)
  }
  const predicted = ex.layout === 'series' ? solveSeries(ex.panels.filter((p): p is Panel => p !== null)) : solveMatrix(ex.panels)
  if (!predicted) return fail('no unique rule-based prediction')
  const hits = item.options.map((o, i) => (o.panel && canonPanel(o.panel) === predicted ? i : -1)).filter((i) => i >= 0)
  return hits.length === 1 ? mcq(hits[0]) : fail(`${hits.length} options equal the prediction`)
}
