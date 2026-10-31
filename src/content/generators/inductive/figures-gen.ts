/**
 * Inductive reasoning: figure series, 3×3 matrices and odd-one-out.
 * Every candidate passes the independent ambiguity check (docs/decisions.md D11);
 * the answer key always comes from the generating rules.
 */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { Difficulty, Lang, McqItem } from '../../types'
import { canonPanel, oddCandidates, solveMatrix, solveSeries } from '../../validators/inductive'
import { RING, ROTATING, SIDES, STATIC_SHAPES, type FigEl, type Fill, type Panel, type Shape, type Size } from './figure'

const FILLS: Fill[] = ['empty', 'solid', 'striped', 'dotted']
const FILL_DE: Record<Fill, string> = { empty: 'leer', solid: 'schwarz', striped: 'gestreift', dotted: 'gepunktet' }
const SHAPE_DE: Record<Shape, string> = { circle: 'Kreis', square: 'Quadrat', triangle: 'Dreieck', pentagon: 'Fünfeck', hexagon: 'Sechseck', star: 'Stern', arrow: 'Pfeil', lshape: 'L-Form', cross: 'Kreuz', diamond: 'Raute' }
const SIZE_DE = ['klein', 'mittel', 'groß']
const deg = (k: number) => `${(((k % 8) + 8) % 8) * 45}°`
const dirDe = (k: number) => (k > 0 ? 'im Uhrzeigersinn' : 'gegen den Uhrzeigersinn')

const clone = (p: Panel): Panel => ({ els: p.els.map((e) => ({ ...e })), ticks: p.ticks, lines: p.lines ? p.lines.slice() : undefined })

function finishOptions(rng: Rng, correct: Panel, variants: { p: Panel; why: string }[]): { options: { panel: Panel; why: string }[]; correctIdx: number } | null {
  const seen = new Set([canonPanel(correct)])
  const opts: { panel: Panel; why: string }[] = [{ panel: correct, why: '' }]
  for (const v of variants) {
    if (opts.length >= 5) break
    const k = canonPanel(v.p)
    if (seen.has(k)) continue
    seen.add(k)
    opts.push({ panel: v.p, why: v.why })
  }
  if (opts.length < 5) return null
  const shuffled = rng.shuffle(opts)
  return { options: shuffled, correctIdx: shuffled.findIndex((o) => o.panel === correct) }
}

function item(def: GeneratorDef, seed: number, d: Difficulty, lang: Lang, layout: 'series' | 'matrix' | 'odd', panels: (Panel | null)[], opts: { panel: Panel; why: string }[], correct: number, steps: string[], shortcut: string, prompt: string): McqItem {
  return {
    ...core(def, seed, d, lang),
    type: 'mcq',
    exhibits: [{ kind: 'figures', layout, panels }],
    prompt,
    query: { family: 'figures', layout },
    options: opts.map((o) => ({ text: '', panel: o.panel })),
    correct,
    explanation: {
      steps,
      distractors: opts.map((o, i) => ({ o, i })).filter(({ i }) => i !== correct).map(({ o, i }) => `**${String.fromCharCode(65 + i)}**: ${o.why}`),
      shortcut,
    },
  }
}

// ------------------------------------------------------------------ series

type RuleKind = 'move' | 'rotate' | 'fill' | 'size' | 'ticks' | 'shape' | 'flip'

export const series: GeneratorDef = {
  id: 'ind.series',
  version: 1,
  category: 'inductive',
  title: 'Figurenreihen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const nRules = d
      const pool: RuleKind[] = ['move', 'rotate', 'fill', 'size', 'ticks', 'shape', 'flip']
      const rules = rng.sample(pool, nRules)
      if (rules.includes('rotate') && rules.includes('shape')) return null
      if (rules.includes('flip') && rules.includes('shape')) return null
      const hasNoise = d === 3
      if (hasNoise && rules.includes('shape')) return null
      const needsRot = rules.includes('rotate') || rules.includes('flip')
      const shape: Shape = rules.includes('flip') ? 'lshape' : needsRot ? rng.pick(ROTATING) : rng.pick(STATIC_SHAPES)
      // Parameters
      const moveStep = rng.pick([1, 2, -1, 3])
      const rotStep = rng.pick([1, 2, -2, 3, -1])
      const fillCycle = rng.sample(FILLS, rng.pick([2, 3]))
      const sizeCycle: Size[] = rng.pick([[0, 1, 2], [0, 2], [2, 1, 0]] as Size[][])
      const tickStart = rng.int(0, 2)
      const tickStep = rng.pick([1, 2])
      const shapeCycle = rng.sample(STATIC_SHAPES, 3)
      const start = rng.int(0, 7)
      const fixedCell = hasNoise || rules.includes('move') ? RING[start] : rng.chance(0.5) ? 4 : RING[start]
      const baseFill = rng.pick(FILLS)
      const baseSize: Size = rng.pick([1, 2] as Size[])
      const baseRot = rng.int(0, 7)
      const noise: FigEl = { shape: rng.pick(STATIC_SHAPES.filter((s) => s !== shape && !shapeCycle.includes(s))), cell: 4, size: 0, fill: rng.pick(FILLS), rot: 0 }
      const panelAt = (t: number): Panel => {
        const el: FigEl = {
          shape: rules.includes('shape') ? shapeCycle[t % 3] : shape,
          cell: rules.includes('move') ? RING[(((start + moveStep * t) % 8) + 8) % 8] : fixedCell,
          size: rules.includes('size') ? sizeCycle[t % sizeCycle.length] : baseSize,
          fill: rules.includes('fill') ? fillCycle[t % fillCycle.length] : baseFill,
          rot: needsRot ? (rules.includes('rotate') ? (((baseRot + rotStep * t) % 8) + 8) % 8 : baseRot) : 0,
          mirror: rules.includes('flip') ? t % 2 === 1 : false,
        }
        const p: Panel = { els: hasNoise ? [el, { ...noise }] : [el], ticks: rules.includes('ticks') ? tickStart + tickStep * t : 0 }
        return p
      }
      const panels = [0, 1, 2, 3, 4].map(panelAt)
      const answer = panelAt(5)
      if ((answer.ticks ?? 0) > 9) return null
      // Ambiguity filter: the independent solver must reach exactly our answer.
      if (solveSeries(panels) !== canonPanel(answer)) return null
      // Distractors: change exactly one attribute.
      const main = (p: Panel) => p.els[0]
      const variants: { p: Panel; why: string }[] = []
      const vary = (why: string, f: (p: Panel) => void) => {
        const p = clone(answer)
        f(p)
        variants.push({ p, why })
      }
      if (rules.includes('move')) vary('Position stimmt nicht – ein Schritt zu wenig gewandert.', (p) => (main(p).cell = RING[(((start + moveStep * 4) % 8) + 8) % 8]))
      if (rules.includes('move')) vary('Position stimmt nicht – in die falsche Richtung gewandert.', (p) => (main(p).cell = RING[(((start + moveStep * 4 - moveStep) % 8) + 8) % 8]))
      if (rules.includes('rotate')) vary('Drehung stimmt nicht – ein Schritt zu wenig gedreht.', (p) => (main(p).rot = (((main(p).rot - rotStep) % 8) + 8) % 8))
      if (rules.includes('rotate')) vary('Drehung stimmt nicht – in die falsche Richtung gedreht.', (p) => (main(p).rot = (((main(p).rot - 2 * rotStep) % 8) + 8) % 8))
      if (rules.includes('fill')) vary('Füllung stimmt nicht – der Füllungswechsel wurde nicht fortgesetzt.', (p) => (main(p).fill = fillCycle[4 % fillCycle.length]))
      if (rules.includes('size')) vary('Größe stimmt nicht.', (p) => (main(p).size = sizeCycle[4 % sizeCycle.length]))
      if (rules.includes('ticks')) vary('Anzahl der Striche stimmt nicht.', (p) => (p.ticks = (p.ticks ?? 0) - tickStep))
      if (rules.includes('ticks')) vary('Anzahl der Striche stimmt nicht.', (p) => (p.ticks = (p.ticks ?? 0) + 1))
      if (rules.includes('shape')) vary('Form stimmt nicht – der Formzyklus wurde nicht fortgesetzt.', (p) => (main(p).shape = shapeCycle[4 % 3]))
      if (rules.includes('flip')) vary('Spiegelung stimmt nicht – die Figur wechselt jedes Mal zwischen normal und gespiegelt.', (p) => (main(p).mirror = !main(p).mirror))
      // Generic one-attribute variants on the stable attributes as well.
      vary('Füllung verändert, obwohl sie gleich bleibt bzw. anders wechselt.', (p) => (main(p).fill = FILLS.find((f) => f !== main(p).fill && !fillCycle.includes(f)) ?? FILLS.find((f) => f !== main(p).fill) ?? 'empty'))
      vary('Größe verändert.', (p) => (main(p).size = main(p).size === 2 ? 1 : 2))
      if (needsRot) vary('Ausrichtung falsch.', (p) => (main(p).rot = (main(p).rot + 4) % 8))
      if (hasNoise) vary('Das Element in der Mitte bleibt in der Reihe unverändert – hier wurde es verändert.', (p) => (p.els[1].fill = FILLS.find((f) => f !== p.els[1].fill) ?? 'empty'))
      const built = finishOptions(rng, answer, rng.shuffle(variants.slice(0, -2)).concat(variants.slice(-2)))
      if (!built) return null
      const steps: string[] = []
      if (rules.includes('move')) steps.push(`Position: Die Figur wandert pro Schritt ${Math.abs(moveStep)} Feld${Math.abs(moveStep) > 1 ? 'er' : ''} ${dirDe(moveStep)} am Rand entlang.`)
      if (rules.includes('rotate')) steps.push(`Drehung: pro Schritt ${deg(Math.abs(rotStep))} ${dirDe(rotStep)}.`)
      if (rules.includes('fill')) steps.push(`Füllung wechselt zyklisch: ${fillCycle.map((f) => FILL_DE[f]).join(' → ')} → …`)
      if (rules.includes('size')) steps.push(`Größe wechselt zyklisch: ${sizeCycle.map((s) => SIZE_DE[s]).join(' → ')} → …`)
      if (rules.includes('ticks')) steps.push(`Striche unten: ${tickStart} und dann jeweils +${tickStep}.`)
      if (rules.includes('shape')) steps.push(`Form wechselt zyklisch: ${shapeCycle.map((s) => SHAPE_DE[s]).join(' → ')} → …`)
      if (rules.includes('flip')) steps.push('Die L-Form wird bei jedem Schritt gespiegelt (normal ↔ gespiegelt).')
      if (hasNoise) steps.push(`Das kleine Element in der Mitte (${SHAPE_DE[noise.shape]}) bleibt immer gleich – es ist nur Ablenkung.`)
      steps.push('Alle Regeln für Feld 6 anwenden → einzige passende Option.')
      return item(this, seed, d, lang, 'series', [...panels, null], built.options, built.correctIdx, steps, 'Checkliste: 1. Anzahl der Elemente, 2. Position, 3. Drehung, 4. Füllung, 5. Größe, 6. abwechselnde Muster. Jede Regel einzeln prüfen und dann Optionen ausschließen, die eine Regel verletzen.', tr(lang, 'Which figure comes next in the series?', 'Welche Figur setzt die Reihe fort?'))
    })
  },
}

// ------------------------------------------------------------------ matrix

type MAttr = 'shape' | 'fill' | 'size' | 'ticks' | 'rot' | 'lines'

const LINE_SETS = [1, 2, 4, 8, 16, 32, 64, 128]

export const matrix: GeneratorDef = {
  id: 'ind.matrix',
  version: 1,
  category: 'inductive',
  title: '3×3-Matrizen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const attrs = rng.sample(['shape', 'fill', 'size', 'ticks', 'rot', 'lines'] as MAttr[], d === 1 ? 1 : d === 2 ? 2 : 3)
      if (attrs.includes('rot') && attrs.includes('shape')) return null
      const useRot = attrs.includes('rot')
      const baseShape: Shape = useRot ? rng.pick(ROTATING) : rng.pick(STATIC_SHAPES)
      const shapes = rng.sample(STATIC_SHAPES, 3)
      const fills = rng.sample(FILLS, 3)
      const sizes: Size[] = rng.shuffle([0, 1, 2] as Size[])
      const latin = (r: number, c: number, perm: number[][]) => perm[r][c]
      // Two different Latin squares (row-permutations of 0,1,2) per attribute.
      const mkLatin = () => {
        const p0 = rng.shuffle([0, 1, 2])
        const shift = rng.pick([1, 2])
        return [0, 1, 2].map((r) => [0, 1, 2].map((c) => p0[(c + r * shift) % 3]))
      }
      const L: Record<string, number[][]> = { shape: mkLatin(), fill: mkLatin(), size: mkLatin(), ticks: mkLatin() }
      const tickMode = rng.pick(['latin', 'prog', 'sum'] as const)
      const tickVals = rng.sample([1, 2, 3, 4], 3)
      const tickStep = rng.pick([1, 2])
      const rotStep = rng.pick([2, 1, -2])
      const rotRowBase = [rng.int(0, 7), rng.int(0, 7), rng.int(0, 7)]
      const lineOp = rng.pick(['xor', 'or'] as const)
      const lineBase = Array.from({ length: 3 }, () => [rng.sample(LINE_SETS, 2).reduce((a, b) => a | b, 0), rng.sample(LINE_SETS, 2).reduce((a, b) => a | b, 0)])
      const constFill = rng.pick(FILLS)
      const constSize: Size = rng.pick([1, 2] as Size[])
      const cellAt = (r: number, c: number): Panel => {
        const ticks = !attrs.includes('ticks')
          ? 0
          : tickMode === 'latin'
            ? tickVals[latin(r, c, L.ticks)]
            : tickMode === 'prog'
              ? 1 + r + tickStep * c
              : c < 2
                ? 1 + ((r * 2 + c * 3) % 4)
                : 1 + ((r * 2) % 4) + 1 + ((r * 2 + 3) % 4)
        let mask = 0
        if (attrs.includes('lines')) {
          const [a, b] = lineBase[r]
          mask = c === 0 ? a : c === 1 ? b : lineOp === 'xor' ? a ^ b : a | b
        }
        const lines: number[] = []
        for (let i = 0; i < 8; i++) if (mask & (1 << i)) lines.push(i)
        return {
          els: [
            {
              shape: attrs.includes('shape') ? shapes[latin(r, c, L.shape)] : baseShape,
              cell: 4,
              size: attrs.includes('size') ? sizes[latin(r, c, L.size)] : constSize,
              fill: attrs.includes('fill') ? fills[latin(r, c, L.fill)] : constFill,
              rot: useRot ? (((rotRowBase[r] + rotStep * c) % 8) + 8) % 8 : 0,
            },
          ],
          ticks,
          lines,
        }
      }
      const cells = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => cellAt(r, c)))
      const answer = cells[8]
      if (attrs.includes('lines') && (answer.lines ?? []).length === 0) return null
      const shown: (Panel | null)[] = [...cells.slice(0, 8), null]
      if (solveMatrix(shown) !== canonPanel(answer)) return null
      const variants: { p: Panel; why: string }[] = [
        { p: clone(cells[5]), why: 'Kopie des Feldes darüber – die Zeilenregel wurde nicht angewendet.' },
        { p: clone(cells[7]), why: 'Kopie des Feldes links daneben.' },
      ]
      const vary = (why: string, f: (p: Panel) => void) => {
        const p = clone(answer)
        f(p)
        variants.push({ p, why })
      }
      if (attrs.includes('shape')) vary('Form falsch: In jeder Zeile kommt jede Form genau einmal vor.', (p) => (p.els[0].shape = shapes[latin(2, 0, L.shape)]))
      if (attrs.includes('fill')) vary('Füllung falsch: In jeder Zeile kommt jede Füllung genau einmal vor.', (p) => (p.els[0].fill = fills[latin(2, 1, L.fill)]))
      if (attrs.includes('size')) vary('Größe falsch.', (p) => (p.els[0].size = sizes[latin(2, 0, L.size)]))
      if (attrs.includes('ticks')) vary('Anzahl der Striche falsch.', (p) => (p.ticks = (p.ticks ?? 0) + 1))
      if (attrs.includes('rot')) vary('Drehung falsch.', (p) => (p.els[0].rot = (p.els[0].rot + 4) % 8))
      if (attrs.includes('lines')) vary(lineOp === 'xor' ? 'Linien falsch: Gemeinsame Linien der ersten beiden Felder verschwinden (nur Linien, die in genau einem Feld vorkommen, bleiben).' : 'Linien falsch: Alle Linien der ersten beiden Felder werden übernommen.', (p) => {
        const [a, b] = lineBase[2]
        const m = lineOp === 'xor' ? a | b : a ^ b
        p.lines = LINE_SETS.map((x, i) => (m & x ? i : -1)).filter((i) => i >= 0)
      })
      vary('Füllung verändert, obwohl sie konstant ist bzw. nicht passt.', (p) => (p.els[0].fill = FILLS.find((f) => f !== p.els[0].fill) ?? 'empty'))
      vary('Größe verändert.', (p) => (p.els[0].size = p.els[0].size === 2 ? 1 : 2))
      const built = finishOptions(rng, answer, variants)
      if (!built) return null
      const steps: string[] = ['Jede Zeile folgt denselben Regeln:']
      if (attrs.includes('shape')) steps.push(`Form: ${shapes.map((s) => SHAPE_DE[s]).join(', ')} – in jeder Zeile genau einmal.`)
      if (attrs.includes('fill')) steps.push(`Füllung: ${fills.map((f) => FILL_DE[f]).join(', ')} – in jeder Zeile genau einmal.`)
      if (attrs.includes('size')) steps.push('Größe: klein, mittel, groß – in jeder Zeile genau einmal.')
      if (attrs.includes('ticks'))
        steps.push(tickMode === 'latin' ? `Striche: ${tickVals.join(', ')} – in jeder Zeile genau einmal.` : tickMode === 'prog' ? `Striche: von links nach rechts jeweils +${tickStep}.` : 'Striche: Feld 3 = Feld 1 + Feld 2.')
      if (attrs.includes('rot')) steps.push(`Drehung: von links nach rechts jeweils ${deg(Math.abs(rotStep))} ${dirDe(rotStep)}.`)
      if (attrs.includes('lines')) steps.push(lineOp === 'xor' ? 'Linien: Feld 3 enthält die Linien, die in GENAU EINEM der ersten beiden Felder vorkommen (gemeinsame verschwinden).' : 'Linien: Feld 3 enthält alle Linien aus Feld 1 und Feld 2 zusammen.')
      steps.push('Regeln auf die dritte Zeile anwenden → fehlendes Feld.')
      return item(this, seed, d, lang, 'matrix', shown, built.options, built.correctIdx, steps, 'Zeilenweise UND spaltenweise prüfen. Typische Regeln: jedes Merkmal einmal pro Zeile (Verteilung), Fortschreitung (+1, +45°) oder Überlagerung (Feld 1 + Feld 2, gemeinsame Linien fallen weg). Optionen, die eine Kopie eines Nachbarfeldes sind, sind fast immer falsch.', tr(lang, 'Which figure completes the matrix?', 'Welche Figur vervollständigt die Matrix?'))
    })
  },
}

// ------------------------------------------------------------- odd one out

type OddRule = 'shape' | 'mirror' | 'solid' | 'parity' | 'sides'

export const oddOneOut: GeneratorDef = {
  id: 'ind.odd',
  version: 1,
  category: 'inductive',
  title: 'Odd one out',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const rule: OddRule = d === 1 ? rng.pick(['shape', 'solid']) : d === 2 ? rng.pick(['mirror', 'solid', 'parity']) : rng.pick(['mirror', 'parity', 'sides'])
      const odd = rng.int(0, 4)
      const cells = rng.shuffle([0, 1, 2, 3, 5, 6, 7, 8])
      const panels: Panel[] = []
      let why = ''
      let ruleText = ''
      const balancedFill = () => rng.shuffle(['empty', 'empty', 'striped', 'striped', rng.pick(['empty', 'striped'])] as Fill[])
      if (rule === 'shape') {
        const [a, b] = rng.sample(STATIC_SHAPES, 2)
        const fills = balancedFill()
        for (let i = 0; i < 5; i++) panels.push({ els: [{ shape: i === odd ? b : a, cell: cells[i], size: rng.pick([1, 2] as Size[]), fill: fills[i], rot: 0 }], ticks: 0 })
        ruleText = `Vier Figuren zeigen die Form „${SHAPE_DE[a]}“, eine zeigt die Form „${SHAPE_DE[b]}“. Position, Größe und Füllung variieren nur als Ablenkung.`
        why = `Zeigt ebenfalls die Form „${SHAPE_DE[a]}“.`
      } else if (rule === 'mirror') {
        const rots = rng.sample([0, 1, 2, 3, 4, 5, 6, 7], 5)
        for (let i = 0; i < 5; i++) panels.push({ els: [{ shape: 'lshape', cell: 4, size: 2, fill: 'empty', rot: rots[i], mirror: i === odd }], ticks: 0 })
        ruleText = 'Vier Figuren sind dieselbe L-Form, nur gedreht. Die gesuchte Figur ist gespiegelt – sie lässt sich durch keine Drehung auf die anderen bringen.'
        why = 'Lässt sich durch Drehung auf die anderen L-Formen bringen.'
      } else if (rule === 'solid') {
        // Four panels contain exactly one black element, one panel contains two (or none).
        const pairShapes = rng.sample(STATIC_SHAPES, 2)
        for (let i = 0; i < 5; i++) {
          const solidN = i === odd ? rng.pick([0, 2]) : 1
          const fills: Fill[] = solidN === 2 ? ['solid', 'solid'] : solidN === 1 ? rng.shuffle(['solid', rng.pick(['empty', 'striped'] as Fill[])]) : ['empty', 'striped']
          const [c1, c2] = rng.sample([0, 2, 6, 8], 2)
          panels.push({ els: [{ shape: pairShapes[0], cell: c1, size: 1, fill: fills[0], rot: 0 }, { shape: pairShapes[1], cell: c2, size: 1, fill: fills[1], rot: 0 }], ticks: 0 })
        }
        ruleText = 'In vier Feldern ist genau eine Figur schwarz gefüllt; im gesuchten Feld nicht.'
        why = 'Enthält genau eine schwarze Figur – wie die Mehrheit.'
      } else if (rule === 'parity') {
        for (let i = 0; i < 5; i++) {
          const base = rng.pick([2, 4, 6])
          const ticks = i === odd ? base + rng.pick([-1, 1]) : base
          panels.push({ els: [{ shape: rng.pick(STATIC_SHAPES), cell: cells[i], size: 1, fill: rng.pick(['empty', 'striped'] as Fill[]), rot: 0 }], ticks })
        }
        ruleText = 'Vier Felder haben eine gerade Anzahl Striche, das gesuchte eine ungerade.'
        why = 'Gerade Anzahl Striche – wie die Mehrheit.'
      } else {
        // Total number of sides: four panels share the same sum.
        const combos: [Shape, Shape][] = []
        for (const a of STATIC_SHAPES) for (const b of STATIC_SHAPES) if (a < b && SIDES[a] > 0 && SIDES[b] > 0 && SIDES[a] + SIDES[b] <= 12) combos.push([a, b])
        const sums = [...new Set(combos.map(([a, b]) => SIDES[a] + SIDES[b]))]
        const target = rng.pick(sums.filter((s) => combos.filter(([a, b]) => SIDES[a] + SIDES[b] === s).length >= 3))
        const good = combos.filter(([a, b]) => SIDES[a] + SIDES[b] === target)
        const bad = combos.filter(([a, b]) => SIDES[a] + SIDES[b] !== target && Math.abs(SIDES[a] + SIDES[b] - target) <= 2)
        if (good.length < 3 || bad.length === 0) return null
        for (let i = 0; i < 5; i++) {
          const [a, b] = i === odd ? rng.pick(bad) : rng.pick(good)
          const [c1, c2] = rng.sample([0, 2, 6, 8], 2)
          panels.push({ els: [{ shape: a, cell: c1, size: 1, fill: 'empty', rot: 0 }, { shape: b, cell: c2, size: 1, fill: 'empty', rot: 0 }], ticks: 0 })
        }
        ruleText = `Die Seitenzahlen der beiden Figuren ergeben in vier Feldern zusammen ${target}; im gesuchten Feld nicht.`
        why = `Seitensumme ${target} – wie die Mehrheit.`
      }
      const c = oddCandidates(panels)
      if (c.size !== 1 || !c.has(odd)) return null
      if (new Set(panels.map(canonPanel)).size !== 5) return null
      const opts = panels.map((p, i) => ({ panel: p, why: i === odd ? '' : why }))
      return item(this, seed, d, lang, 'odd', [], opts, odd, [ruleText, `Gesuchte Figur: **${String.fromCharCode(65 + odd)}**`], 'Erst nach dem offensichtlichsten Unterschied suchen (Form, Farbe, Anzahl), dann nach versteckten: Spiegelung statt Drehung, gerade/ungerade, Summen von Ecken oder Seiten.', tr(lang, 'Which figure is the odd one out?', 'Welche Figur passt nicht zu den anderen?'))
    })
  },
}
