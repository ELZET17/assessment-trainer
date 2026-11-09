/**
 * More inductive item families (added 11/2026 after feedback that the figure
 * items were too uniform): several independently moving elements, counting
 * series, analogies (A : B = C : ?) and matrices with several elements
 * (superimposition and counting). Every candidate passes the independent
 * solvers in validators/inductive; the key always comes from the generating rules.
 */
import { tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import { canonPanel, solveAnalogy, solveMatrixAll, solveSeriesAll } from '../../validators/inductive'
import { PACK, RING, STATIC_SHAPES, type FigEl, type Fill, type Panel, type Shape, type Size } from './figure'
import { clone, deg, dirDe, FILL_DE, finishOptions, item, SHAPE_DE } from './figures-gen'

const ringAt = (start: number, step: number, t: number) => RING[(((start + step * t) % 8) + 8) % 8]
const stepDe = (k: number) => (k === 0 ? 'bleibt an seinem Platz' : `wandert pro Schritt ${Math.abs(k)} Feld${Math.abs(k) > 1 ? 'er' : ''} ${dirDe(k)}`)
const PRONOUN: Record<Shape, string> = { circle: 'Der Kreis', square: 'Das Quadrat', triangle: 'Das Dreieck', pentagon: 'Das Fünfeck', hexagon: 'Das Sechseck', star: 'Der Stern', arrow: 'Der Pfeil', lshape: 'Die L-Form', cross: 'Das Kreuz', diamond: 'Die Raute' }
const PLURAL: Record<Shape, string> = { circle: 'Kreise', square: 'Quadrate', triangle: 'Dreiecke', pentagon: 'Fünfecke', hexagon: 'Sechsecke', star: 'Sterne', arrow: 'Pfeile', lshape: 'L-Formen', cross: 'Kreuze', diamond: 'Rauten' }
const letter = (i: number) => String.fromCharCode(65 + i)

// ---------------------------------------------------------- several elements

interface Mover {
  shape: Shape
  start: number
  step: number
  centre: boolean
  fills: Fill[]
  rotStep: number
  rot0: number
}

export const multiSeries: GeneratorDef = {
  id: 'ind.multi',
  version: 1,
  category: 'inductive',
  title: 'Reihen mit mehreren Elementen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const n = d === 3 ? 3 : 2
      const withArrow = d >= 2 && rng.chance(0.5)
      const shapes: Shape[] = rng.sample(STATIC_SHAPES, n)
      if (withArrow) shapes[n - 1] = 'arrow'
      const movers: Mover[] = shapes.map((shape, k) => {
        const centre = d === 3 && k === n - 1
        const cycle = d >= 2 && (k === 0 || (d === 3 && rng.chance(0.5)))
        return {
          shape,
          start: rng.int(0, 7),
          step: centre ? 0 : rng.pick([1, -1, 2, -2, 3, 1, -1]),
          centre,
          fills: cycle ? rng.sample(['empty', 'solid', 'striped'] as Fill[], rng.pick([2, 3])) : [rng.pick(['empty', 'solid', 'striped'] as Fill[])],
          rotStep: shape === 'arrow' ? rng.pick([2, -2, 1, 3]) : 0,
          rot0: shape === 'arrow' ? rng.int(0, 7) : 0,
        }
      })
      const ringMovers = movers.filter((m) => !m.centre)
      if (ringMovers.length >= 2 && ringMovers[0].step === ringMovers[1].step) return null
      const elAt = (m: Mover, t: number): FigEl => ({
        shape: m.shape,
        cell: m.centre ? 4 : ringAt(m.start, m.step, t),
        size: 1,
        fill: m.fills[t % m.fills.length],
        rot: m.shape === 'arrow' ? (((m.rot0 + m.rotStep * t) % 8) + 8) % 8 : 0,
      })
      const panelAt = (t: number): Panel => ({ els: movers.map((m) => elAt(m, t)), ticks: 0 })
      for (let t = 0; t <= 5; t++) {
        const cells = panelAt(t).els.map((e) => e.cell)
        if (new Set(cells).size !== cells.length) return null
      }
      const panels = [0, 1, 2, 3, 4].map(panelAt)
      const answer = panelAt(5)
      if (solveSeriesAll(panels) !== canonPanel(answer)) return null
      const variants: { p: Panel; why: string }[] = []
      const vary = (why: string, f: (p: Panel) => void) => {
        const p = clone(answer)
        f(p)
        variants.push({ p, why })
      }
      movers.forEach((m, k) => {
        const name = SHAPE_DE[m.shape]
        if (m.step !== 0) {
          vary(`${name}: ein Schritt zu wenig gewandert (steht noch wie in Feld 5).`, (p) => (p.els[k].cell = ringAt(m.start, m.step, 4)))
          vary(`${name}: in die falsche Richtung gewandert.`, (p) => (p.els[k].cell = ringAt(m.start, -m.step, 5)))
        }
        if (m.fills.length > 1) vary(`${name}: Füllung falsch – der Wechsel ${m.fills.map((f) => FILL_DE[f]).join(' → ')} wurde nicht fortgesetzt.`, (p) => (p.els[k].fill = m.fills[4 % m.fills.length]))
        else vary(`${name}: Füllung verändert – sie bleibt in der ganzen Reihe „${FILL_DE[m.fills[0]]}“.`, (p) => (p.els[k].fill = (['empty', 'solid', 'striped'] as Fill[]).find((f) => f !== m.fills[0]) as Fill))
        if (m.rotStep) vary(`${name}: Drehung falsch – ein Schritt zu wenig gedreht.`, (p) => (p.els[k].rot = (((p.els[k].rot - m.rotStep) % 8) + 8) % 8))
      })
      if (ringMovers.length >= 2)
        vary(`Die Positionen von ${SHAPE_DE[ringMovers[0].shape]} und ${SHAPE_DE[ringMovers[1].shape]} sind vertauscht.`, (p) => {
          const i = movers.indexOf(ringMovers[0])
          const j = movers.indexOf(ringMovers[1])
          const c = p.els[i].cell
          p.els[i].cell = p.els[j].cell
          p.els[j].cell = c
        })
      // Collisions in a distractor would hide an element – drop such variants.
      const ok = variants.filter((v) => new Set(v.p.els.map((e) => e.cell)).size === v.p.els.length)
      const built = finishOptions(rng, answer, rng.shuffle(ok))
      if (!built) return null
      const steps = movers.map((m) => {
        const parts = [m.centre ? `${PRONOUN[m.shape]} bleibt in der Mitte` : `${PRONOUN[m.shape]} ${stepDe(m.step)} am Rand entlang`]
        if (m.fills.length > 1) parts.push(`Füllung wechselt ${m.fills.map((f) => FILL_DE[f]).join(' → ')} → …`)
        if (m.rotStep) parts.push(`dreht sich pro Schritt um ${deg(Math.abs(m.rotStep))} ${dirDe(m.rotStep)}`)
        return `${parts.join('; ')}.`
      })
      steps.unshift('Jedes Element folgt seiner eigenen Regel – die Elemente einzeln verfolgen:')
      steps.push('Alle Regeln für Feld 6 anwenden → einzige passende Option.')
      return item(this, seed, d, lang, 'series', [...panels, null], built.options, built.correctIdx, steps, 'Nie alle Elemente gleichzeitig ansehen: Ein Element wählen, seine Regel über alle Felder bestimmen, Optionen streichen, die nicht passen – dann das nächste Element. Bei Bewegung am Rand die Felder im Uhrzeigersinn abzählen.', tr(lang, 'Which figure comes next in the series?', 'Welche Figur setzt die Reihe fort?'))
    })
  },
}

// ---------------------------------------------------------- counting series

interface Counter {
  shape: Shape
  counts: number[]
  fills: Fill[]
  desc: string
}

const packed = (cs: { shape: Shape; n: number; fill: Fill }[], size: Size): Panel => {
  const total = cs.reduce((s, c) => s + c.n, 0)
  const cells = PACK[total]
  // More than 9 elements cannot be drawn – an empty panel is filtered out by the caller.
  if (!cells) return { els: [], ticks: 0 }
  const els: FigEl[] = []
  let k = 0
  for (const c of cs) for (let i = 0; i < c.n; i++) els.push({ shape: c.shape, fill: c.fill, size, cell: cells[k++], rot: 0 })
  return { els, ticks: 0 }
}

export const countSeries: GeneratorDef = {
  id: 'ind.count',
  version: 1,
  category: 'inductive',
  title: 'Reihen: Anzahl der Elemente',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      // Count sequences for t = 0..5 (index 5 = answer).
      const seqs = (): { counts: number[]; desc: string } => {
        const kind = d === 1 ? 'prog' : rng.pick(['prog', 'prog', 'alt', 'cycle3'] as const)
        if (kind === 'prog') {
          const k = rng.pick([1, -1])
          const s = k > 0 ? rng.int(1, 9 - 5 * k) : rng.int(1 - 5 * k, 9)
          return { counts: [0, 1, 2, 3, 4, 5].map((t) => s + k * t), desc: `${k > 0 ? '+' : '−'}${Math.abs(k)} pro Schritt` }
        }
        if (kind === 'alt') {
          const [a, b] = rng.sample([1, 2, 3, 4, 5, 6], 2)
          return { counts: [0, 1, 2, 3, 4, 5].map((t) => (t % 2 ? b : a)), desc: `abwechselnd ${a} und ${b}` }
        }
        const v = rng.sample([1, 2, 3, 4, 5, 6], 3)
        return { counts: [0, 1, 2, 3, 4, 5].map((t) => v[t % 3]), desc: `wiederholt ${v.join(', ')}` }
      }
      const nShapes = d === 3 ? 2 : 1
      const shapes = rng.sample(STATIC_SHAPES.filter((s) => s !== 'star'), nShapes)
      const counters: Counter[] = shapes.map((shape, i) => {
        const s = seqs()
        const cycle = d >= 2 && i === 0 && rng.chance(d === 2 ? 0.6 : 0.5)
        return { shape, counts: s.counts, desc: s.desc, fills: cycle ? rng.sample(['empty', 'solid', 'striped'] as Fill[], 2) : [rng.pick(['empty', 'solid', 'striped'] as Fill[])] }
      })
      if (counters.some((c) => c.counts.some((x) => x < 1))) return null
      if ([0, 1, 2, 3, 4, 5].some((t) => counters.reduce((s, c) => s + c.counts[t], 0) > 9)) return null
      // Both shapes must not just mirror each other (that would hide which rule belongs to which).
      if (d === 3 && counters[0].counts.join() === counters[1].counts.join()) return null
      const size: Size = 1
      const panelAt = (t: number, override?: (c: Counter, i: number) => { n?: number; fill?: Fill }) =>
        packed(
          counters.map((c, i) => {
            const o = override?.(c, i) ?? {}
            return { shape: c.shape, n: o.n ?? c.counts[t], fill: o.fill ?? c.fills[t % c.fills.length] }
          }),
          size,
        )
      const panels = [0, 1, 2, 3, 4].map((t) => panelAt(t))
      const answer = panelAt(5)
      if (solveSeriesAll(panels) !== canonPanel(answer)) return null
      const variants: { p: Panel; why: string }[] = []
      const add = (why: string, p: Panel) => {
        if (p.els.length >= 1 && p.els.length <= 9) variants.push({ p, why })
      }
      counters.forEach((c, i) => {
        const name = PLURAL[c.shape]
        add(`${name}: Anzahl ${c.counts[5] + 1} statt ${c.counts[5]}.`, panelAt(5, (_, j) => (j === i ? { n: c.counts[5] + 1 } : {})))
        if (c.counts[5] > 1) add(`${name}: Anzahl ${c.counts[5] - 1} statt ${c.counts[5]}.`, panelAt(5, (_, j) => (j === i ? { n: c.counts[5] - 1 } : {})))
        add(`${name}: Anzahl wie in Feld 5 – die Regel wurde nicht fortgesetzt.`, panelAt(5, (_, j) => (j === i ? { n: c.counts[4] } : {})))
        const wrongFill = c.fills.length > 1 ? c.fills[4 % c.fills.length] : (['empty', 'solid', 'striped'] as Fill[]).find((f) => f !== c.fills[0]) as Fill
        add(c.fills.length > 1 ? `${name}: Füllung falsch – sie wechselt jedes Mal (${c.fills.map((f) => FILL_DE[f]).join(' ↔ ')}).` : `${name}: Füllung verändert – sie bleibt immer „${FILL_DE[c.fills[0]]}“.`, panelAt(5, (_, j) => (j === i ? { fill: wrongFill } : {})))
      })
      counters.forEach((c, i) => {
        const name = PLURAL[c.shape]
        add(`${name}: Anzahl ${c.counts[5] + 2} statt ${c.counts[5]}.`, panelAt(5, (_, j) => (j === i ? { n: c.counts[5] + 2 } : {})))
        if (c.counts[5] > 2) add(`${name}: Anzahl ${c.counts[5] - 2} statt ${c.counts[5]}.`, panelAt(5, (_, j) => (j === i ? { n: c.counts[5] - 2 } : {})))
      })
      if (d === 3) add('Die Anzahlen der beiden Formen sind vertauscht.', panelAt(5, (_, j) => ({ n: counters[1 - j].counts[5] })))
      const other = rng.pick(STATIC_SHAPES.filter((x) => x !== 'star' && !shapes.includes(x)))
      add(`Form verändert – es sind immer ${PLURAL[shapes[0]]}.`, packed(counters.map((c, i) => ({ shape: i === 0 ? other : c.shape, n: c.counts[5], fill: c.fills[5 % c.fills.length] })), size))
      // Prefer the rule-related distractors (first entries), then fill up with the generic ones.
      const built = finishOptions(rng, answer, rng.shuffle(variants.slice(0, 5)).concat(rng.shuffle(variants.slice(5))))
      if (!built) return null
      const steps = counters.map((c) => `${PLURAL[c.shape]}: ${c.counts.slice(0, 5).join(' → ')} (${c.desc}) → **${c.counts[5]}**${c.fills.length > 1 ? `; Füllung wechselt ${c.fills.map((f) => FILL_DE[f]).join(' ↔ ')}` : ''}.`)
      steps.unshift('Hier zählt nur die ANZAHL der Elemente (die Anordnung ergibt sich aus der Anzahl).')
      return item(this, seed, d, lang, 'series', [...panels, null], built.options, built.correctIdx, steps, 'Bei vielen gleichen Elementen sofort zählen und die Zahlen notieren (z. B. 2-3-4-5-6). Zahlenfolgen erkennst du schneller als Bilder: +1, −2, abwechselnd, 3er-Zyklus.', tr(lang, 'Which figure comes next in the series?', 'Welche Figur setzt die Reihe fort?'))
    })
  },
}

// ------------------------------------------------------------------ analogy

type Tf = 'rot' | 'mirror' | 'fill' | 'size' | 'move' | 'ticks' | 'lines' | 'shape'
const LINE_IDS = [0, 1, 2, 3, 4, 5, 6, 7]
/** No dotted fill in analogies: on the small shapes it is hard to tell from white (Gate 3 round 5). */
const AFILLS: Fill[] = ['empty', 'solid', 'striped']
const LINE_DE = ['obere Kante', 'rechte Kante', 'untere Kante', 'linke Kante', 'Diagonale ↘', 'Diagonale ↙', 'waagerechte Mittellinie', 'senkrechte Mittellinie']

export const analogy: GeneratorDef = {
  id: 'ind.analogy',
  version: 1,
  category: 'inductive',
  title: 'Analogien (A : B = C : ?)',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const tfs = rng.sample(['rot', 'mirror', 'fill', 'size', 'move', 'ticks', 'lines', 'shape'] as Tf[], d)
      const has = (t: Tf) => tfs.includes(t)
      if (has('mirror') && (has('rot') || has('shape'))) return null
      if (has('rot') && has('shape')) return null
      if (has('move') && has('lines')) return null
      // Moving + turning/mirroring looks like a turn or mirror image of the whole panel (Gate 3 round 5).
      if (has('move') && (has('rot') || has('mirror') || has('size'))) return null
      const rotating = has('rot') || has('mirror')
      const pickShape = (): Shape => (has('mirror') ? 'lshape' : rotating ? rng.pick(['arrow', 'lshape'] as Shape[]) : rng.pick(STATIC_SHAPES))
      const rotFor = () => (has('mirror') ? rng.pick([0, 4]) : rotating ? rng.int(0, 7) : 0)
      const mkEl = (cell: number): FigEl => ({ shape: pickShape(), cell, size: has('size') ? rng.pick([0, 1, 2] as Size[]) : rng.pick([1, 2] as Size[]), fill: rng.pick(AFILLS), rot: rotFor() })
      const ringStartA = rng.int(0, 7)
      const ringStartC = rng.int(0, 7)
      const A: Panel = { els: [mkEl(has('move') ? RING[ringStartA] : 4)], ticks: has('ticks') ? rng.int(1, 5) : 0, lines: has('lines') ? rng.sample(LINE_IDS, rng.pick([1, 2])) : [] }
      const C: Panel = { els: [mkEl(has('move') ? RING[ringStartC] : 4)], ticks: has('ticks') ? rng.int(1, 5) : 0, lines: has('lines') ? rng.sample(LINE_IDS, rng.pick([1, 2, 3])) : [] }
      const a = A.els[0]
      const c = C.els[0]
      if (has('move')) {
        a.size = Math.min(a.size, 1) as Size
        c.size = Math.min(c.size, 1) as Size
      }
      // Categorical changes need C to share A's value (otherwise "becomes X" and "swap" disagree).
      if (has('fill')) c.fill = a.fill
      if (has('shape')) c.shape = a.shape
      if (has('mirror')) c.mirror = a.mirror = rng.chance(0.5)
      const B = clone(A)
      const D = clone(C)
      const b = B.els[0]
      const dd = D.els[0]
      const desc: string[] = []
      if (has('rot')) {
        const k = rng.pick([2, -2, 4, 1, -1])
        b.rot = (((a.rot + k) % 8) + 8) % 8
        dd.rot = (((c.rot + k) % 8) + 8) % 8
        desc.push(`Drehung um ${deg(Math.abs(k))}${Math.abs(k) === 4 ? '' : ` ${dirDe(k)}`}`)
      }
      if (has('mirror')) {
        b.mirror = !a.mirror
        dd.mirror = !c.mirror
        desc.push('Spiegelung (links ↔ rechts)')
      }
      if (has('fill')) {
        const f = rng.pick(AFILLS.filter((x) => x !== a.fill))
        b.fill = f
        dd.fill = f
        desc.push(`Füllung wird „${FILL_DE[f]}“`)
      }
      if (has('shape')) {
        const s = rng.pick(STATIC_SHAPES.filter((x) => x !== a.shape))
        b.shape = s
        dd.shape = s
        desc.push(`${SHAPE_DE[a.shape]} wird zu ${SHAPE_DE[s]}`)
      }
      if (has('size')) {
        // Always small ↔ large: a single size step was hard to see (Gate 3 round 6).
        const k = rng.pick([2, -2])
        a.size = c.size = (k > 0 ? 0 : 2) as Size
        b.size = (a.size + k) as Size
        dd.size = (c.size + k) as Size
        if (b.size < 0 || b.size > 2 || dd.size < 0 || dd.size > 2) return null
        if (has('move') && (b.size > 1 || dd.size > 1)) return null
        desc.push(k > 0 ? 'wird groß (vorher klein)' : 'wird klein (vorher groß)')
      }
      if (has('move')) {
        const k = rng.pick([1, -1, 2, -2, 3])
        b.cell = ringAt(ringStartA, k, 1)
        dd.cell = ringAt(ringStartC, k, 1)
        desc.push(`wandert ${Math.abs(k)} Feld${Math.abs(k) > 1 ? 'er' : ''} ${dirDe(k)}`)
      }
      if (has('ticks')) {
        const k = rng.pick([1, 2, -1, 3])
        B.ticks = (A.ticks ?? 0) + k
        D.ticks = (C.ticks ?? 0) + k
        if ((B.ticks ?? 0) < 0 || (D.ticks ?? 0) < 0 || (B.ticks ?? 0) > 8 || (D.ticks ?? 0) > 8) return null
        desc.push(`${k > 0 ? '+' : '−'}${Math.abs(k)} Strich${Math.abs(k) > 1 ? 'e' : ''} unten`)
      }
      if (has('lines')) {
        const addLine = rng.chance(0.5)
        const al = A.lines ?? []
        const cl = C.lines ?? []
        if (addLine) {
          const l = rng.pick(LINE_IDS.filter((x) => !al.includes(x) && !cl.includes(x)))
          if (l === undefined) return null
          B.lines = [...al, l]
          D.lines = [...cl, l]
          desc.push(`die Linie „${LINE_DE[l]}“ kommt hinzu`)
        } else {
          const common = al.filter((x) => cl.includes(x))
          if (!common.length) return null
          const l = rng.pick(common)
          B.lines = al.filter((x) => x !== l)
          D.lines = cl.filter((x) => x !== l)
          desc.push(`die Linie „${LINE_DE[l]}“ verschwindet`)
        }
      }
      // C must differ visibly from A, else the answer is just a copy of B.
      if (canonPanel(A) === canonPanel(C) || canonPanel(D) === canonPanel(B)) return null
      const variants: { p: Panel; why: string }[] = [
        { p: clone(B), why: 'Das ist B – die Veränderung muss auf C angewendet werden, nicht übernommen.' },
        { p: clone(C), why: 'Unverändertes C – die Veränderung von A zu B fehlt.' },
      ]
      const vary = (why: string, f: (p: Panel) => void) => {
        const p = clone(D)
        f(p)
        variants.push({ p, why })
      }
      const e = (p: Panel) => p.els[0]
      if (has('rot')) {
        vary('Drehung in die falsche Richtung.', (p) => (e(p).rot = (((2 * c.rot - dd.rot) % 8) + 8) % 8))
        vary('Drehung fehlt.', (p) => (e(p).rot = c.rot))
      }
      if (has('mirror')) vary('Spiegelung fehlt – nur gedreht.', (p) => ((e(p).mirror = c.mirror), (e(p).rot = (c.rot + 4) % 8)))
      if (has('fill')) vary('Füllung nicht verändert.', (p) => (e(p).fill = c.fill))
      if (has('shape')) vary('Form nicht verändert.', (p) => (e(p).shape = c.shape))
      if (has('size')) vary('Größe nicht verändert.', (p) => (e(p).size = c.size))
      if (has('move')) {
        vary('In die falsche Richtung gewandert.', (p) => (e(p).cell = RING[(((2 * RING.indexOf(c.cell) - RING.indexOf(dd.cell)) % 8) + 8) % 8]))
        vary('Position nicht verändert.', (p) => (e(p).cell = c.cell))
      }
      if (has('ticks')) {
        vary('Anzahl der Striche nicht verändert.', (p) => (p.ticks = C.ticks))
        vary('Anzahl der Striche falsch.', (p) => (p.ticks = (D.ticks ?? 0) + 1))
      }
      if (has('lines')) vary('Linien nicht verändert.', (p) => (p.lines = (C.lines ?? []).slice()))
      if (!has('fill')) vary('Füllung verändert, obwohl sie von A zu B gleich bleibt.', (p) => (e(p).fill = rng.pick(AFILLS.filter((x) => x !== dd.fill))))
      const built = finishOptions(rng, D, rng.shuffle(variants.slice(2)).concat(variants.slice(0, 2)).slice(0, 8))
      if (!built) return null
      // Independent check: exactly one option fits any consistent reading of A → B.
      const cands = solveAnalogy([A, B, C])
      const hits = built.options.map((o, i) => (cands.has(canonPanel(o.panel)) ? i : -1)).filter((i) => i >= 0)
      if (hits.length !== 1 || hits[0] !== built.correctIdx) return null
      const steps = [
        `Von A zu B: ${desc.join(', ')}.`,
        ...(desc.length > 1 ? ['Jede Veränderung einzeln auf C anwenden – alles andere bleibt wie in C.'] : ['Dieselbe Veränderung auf C anwenden – alles andere bleibt wie in C.']),
        `Gesuchte Figur: **${letter(built.correctIdx)}**.`,
      ]
      return item(this, seed, d, lang, 'analogy', [A, B, C, null], built.options, built.correctIdx, steps, 'Erst die Veränderung von A nach B in Worten festhalten („dreht 90° nach rechts, wird schwarz“), dann Punkt für Punkt auf C anwenden. Die Optionen „B“ und „C unverändert“ sind die typischen Köder.', tr(lang, 'A is to B as C is to …?', 'A verhält sich zu B wie C zu …?'))
    })
  },
}

// ------------------------------------------------------- matrices (multi)

const maskEls = (mask: number, shape: Shape, fill: Fill, size: Size): FigEl[] => {
  const els: FigEl[] = []
  for (let c = 0; c < 9; c++) if (mask & (1 << c)) els.push({ shape, fill, size, cell: c, rot: 0 })
  return els
}
const popcount = (m: number) => m.toString(2).split('1').length - 1
const randMask = (rng: { sample: <T>(xs: T[], k: number) => T[] }, k: number) => rng.sample([0, 1, 2, 3, 4, 5, 6, 7, 8], k).reduce((a, c) => a | (1 << c), 0)

type SetOp = 'or' | 'xor' | 'and' | 'minus'
const OPS: Record<SetOp, (a: number, b: number) => number> = { or: (a, b) => a | b, xor: (a, b) => a ^ b, and: (a, b) => a & b, minus: (a, b) => a & ~b }
const OP_DE: Record<SetOp, string> = {
  or: 'Feld 3 = Feld 1 + Feld 2: alle Elemente beider Felder zusammen (Überlagerung).',
  xor: 'Feld 3 = Elemente, die in GENAU EINEM der ersten beiden Felder vorkommen – gemeinsame verschwinden.',
  and: 'Feld 3 = nur die Elemente, die in BEIDEN ersten Feldern an derselben Stelle stehen.',
  minus: 'Feld 3 = Feld 1 minus Feld 2: Elemente aus Feld 1, die in Feld 2 NICHT vorkommen.',
}

export const matrixMulti: GeneratorDef = {
  id: 'ind.matrix2',
  version: 1,
  category: 'inductive',
  title: 'Matrizen: Anzahl & Überlagerung',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const mode = rng.pick(['super', 'count'] as const)
      const fills3 = rng.sample(['empty', 'solid', 'striped'] as Fill[], 3)
      const latin = () => {
        const p0 = rng.shuffle([0, 1, 2])
        const shift = rng.pick([1, 2])
        return [0, 1, 2].map((r) => [0, 1, 2].map((c) => p0[(c + r * shift) % 3]))
      }
      const LF = latin()
      const LS = latin()
      const LC = latin()
      const fillRule = d === 3
      const constFill: Fill = rng.pick(['solid', 'empty', 'striped'] as Fill[])
      const fillAt = (r: number, c: number) => (fillRule ? fills3[LF[r][c]] : constFill)
      let cells: Panel[]
      const steps: string[] = []
      const variants: { p: Panel; why: string }[] = []
      if (mode === 'super') {
        const op: SetOp = d === 1 ? rng.pick(['or', 'xor']) : rng.pick(['and', 'minus', 'xor', 'or'])
        const shape: Shape = rng.pick(['circle', 'square', 'diamond', 'triangle'] as Shape[])
        const size: Size = fillRule ? 1 : 0
        const masks = [0, 1, 2].map(() => {
          const a = randMask(rng, rng.int(2, 5))
          const b = randMask(rng, rng.int(2, 5))
          return [a, b, OPS[op](a, b)]
        })
        if (masks.some(([a, b, c]) => c === 0 || a === b || popcount(c) > 8)) return null
        cells = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ els: maskEls(masks[r][c], shape, fillAt(r, c), size), ticks: 0, lines: [] })))
        const [a2, b2] = masks[2]
        const f = fillAt(2, 2)
        for (const o of ['or', 'xor', 'and', 'minus'] as SetOp[]) {
          const m = OPS[o](a2, b2)
          if (o !== op && m !== 0) variants.push({ p: { els: maskEls(m, shape, f, size), ticks: 0, lines: [] }, why: `Falsche Verknüpfung: ${OP_DE[o]}` })
        }
        const mb = b2 & ~a2
        if (mb) variants.push({ p: { els: maskEls(mb, shape, f, size), ticks: 0, lines: [] }, why: 'Feld 2 minus Feld 1 – die Reihenfolge ist umgekehrt.' })
        steps.push('In jeder Zeile entsteht Feld 3 aus Feld 1 und Feld 2:', OP_DE[op])
      } else {
        const kind = d === 1 ? 'latin' : rng.pick(['latin', 'prog', 'sum'] as const)
        const vals = rng.sample([1, 2, 3, 4, 5], 3)
        const k = rng.pick([1, 2])
        const base = [0, 1, 2].map(() => rng.int(1, 9 - 2 * k))
        const sumA = [0, 1, 2].map(() => [rng.int(1, 4), rng.int(1, 4)])
        const countAt = (r: number, c: number) => (kind === 'latin' ? vals[LC[r][c]] : kind === 'prog' ? base[r] + k * c : c < 2 ? sumA[r][c] : sumA[r][0] + sumA[r][1])
        const shapeRule = d >= 2
        const shapes3 = rng.sample(STATIC_SHAPES.filter((s) => s !== 'star'), 3)
        const constShape: Shape = rng.pick(STATIC_SHAPES.filter((s) => s !== 'star'))
        const shapeAt = (r: number, c: number) => (shapeRule ? shapes3[LS[r][c]] : constShape)
        const mk = (n: number, shape: Shape, fill: Fill): Panel => ({ els: PACK[n].map((cell) => ({ shape, fill, size: 1 as Size, cell, rot: 0 })), ticks: 0, lines: [] })
        // The first two rows must show the rule in different numbers (else "Feld 3 = 2 × Feld 1" etc. hide it).
        const row = (r: number) => [0, 1, 2].map((c) => countAt(r, c)).join()
        if (row(0) === row(1)) return null
        if (kind === 'sum' && sumA[0][0] === sumA[0][1] && sumA[1][0] === sumA[1][1]) return null
        cells = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => mk(countAt(r, c), shapeAt(r, c), fillAt(r, c))))
        const n = countAt(2, 2)
        const s = shapeAt(2, 2)
        const f = fillAt(2, 2)
        if (n + 1 <= 9) variants.push({ p: mk(n + 1, s, f), why: `Anzahl falsch: ${n + 1} statt ${n}.` })
        if (n > 1) variants.push({ p: mk(n - 1, s, f), why: `Anzahl falsch: ${n - 1} statt ${n}.` })
        if (shapeRule) variants.push({ p: mk(n, shapes3[LS[2][0]], f), why: 'Form falsch: In jeder Zeile kommt jede Form genau einmal vor.' })
        else variants.push({ p: mk(n, rng.pick(STATIC_SHAPES.filter((x) => x !== s && x !== 'star')), f), why: `Form falsch: In allen Feldern steht ${SHAPE_DE[s]}.` })
        steps.push(
          kind === 'latin'
            ? `Anzahl: ${vals.join(', ')} – in jeder Zeile kommt jede Anzahl genau einmal vor.`
            : kind === 'prog'
              ? `Anzahl: von links nach rechts jeweils +${k}.`
              : 'Anzahl: Feld 3 = Feld 1 + Feld 2.',
        )
        if (shapeRule) steps.push(`Form: ${shapes3.map((x) => SHAPE_DE[x]).join(', ')} – in jeder Zeile genau einmal.`)
      }
      const answer = cells[8]
      if (answer.els.length === 0) return null
      if (fillRule) {
        steps.push(`Füllung: ${fills3.map((x) => FILL_DE[x]).join(', ')} – in jeder Zeile genau einmal.`)
        const wrong = fills3[LF[2][0]]
        variants.push({ p: { ...clone(answer), els: answer.els.map((x) => ({ ...x, fill: wrong })) }, why: 'Füllung falsch: In jeder Zeile kommt jede Füllung genau einmal vor.' })
      }
      variants.push({ p: clone(cells[5]), why: 'Kopie des Feldes darüber – die Zeilenregel wurde nicht angewendet.' }, { p: clone(cells[7]), why: 'Kopie des Feldes links daneben.' })
      const shown: (Panel | null)[] = [...cells.slice(0, 8), null]
      if (solveMatrixAll(shown) !== canonPanel(answer)) return null
      const built = finishOptions(rng, answer, variants)
      if (!built) return null
      steps.push('Regeln auf die dritte Zeile anwenden → fehlendes Feld.')
      return item(this, seed, d, lang, 'matrix', shown, built.options, built.correctIdx, steps, 'Bei vielen kleinen Elementen: Zeile 1 als „Rechnung“ lesen. Bleibt in Feld 3 alles stehen (ODER), verschwinden gemeinsame (XOR), bleiben nur gemeinsame (UND) oder wird abgezogen (Feld 1 − Feld 2)? Mit Zeile 2 bestätigen. Bei gleichen Elementen einfach zählen.', tr(lang, 'Which figure completes the matrix?', 'Welche Figur vervollständigt die Matrix?'))
    })
  },
}
