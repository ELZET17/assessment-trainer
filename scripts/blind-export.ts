/**
 * Gate 3 – blind-solving export. Writes the items as plain task descriptions
 * (no keys, no explanations) into gate-output/blind/<group>/items.md and the
 * keys into gate-output/blind-keys/<group>.json (never shown to the solvers).
 * Inductive items are rendered as screenshots via the running app.
 *
 * Usage: npx tsx scripts/blind-export.ts [baseUrl]
 */
import { webkit } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { CRITICAL_IDS, criticalItem, VERBAL_IDS, verbalItem } from '../src/content/banks'
import { fmt } from '../src/content/format'
import { generatorsFor } from '../src/content/registry'
import { deriveSeed } from '../src/content/rng'
import type { CategoryId, Difficulty, Exhibit, Item } from '../src/content/types'

const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const OUT = 'gate-output/blind'
const KEYS = 'gate-output/blind-keys'
rmSync(OUT, { recursive: true, force: true })
rmSync(KEYS, { recursive: true, force: true })
mkdirSync(KEYS, { recursive: true })

const PER_LEVEL = 15
const L = (i: number) => String.fromCharCode(65 + i)
const f = (v: number, d: number) => fmt(v, 'en', d)

function exhibitMd(ex: Exhibit): string {
  switch (ex.kind) {
    case 'table': {
      const head = `| ${ex.rowHeader ?? ''} | ${ex.header.join(' | ')} |\n|${'---|'.repeat(ex.header.length + 1)}`
      const rows = ex.rows.map((r) => `| ${r.label} | ${r.cells.map((c, i) => (c === null ? '?' : f(c, ex.decimals[i] ?? 0) + (ex.suffix?.[i] ?? ''))).join(' | ')} |`)
      return `**Table: ${ex.title}**${ex.unitNote ? ` (${ex.unitNote})` : ''}\n\n${head}\n${rows.join('\n')}${ex.footnote ? `\n\n_${ex.footnote}_` : ''}`
    }
    case 'bar':
    case 'line': {
      const kind = ex.kind === 'bar' ? (ex.stacked ? 'Stacked bar chart' : 'Bar chart') : 'Line chart'
      const head = `| | ${ex.categories.join(' | ')} |\n|${'---|'.repeat(ex.categories.length + 1)}`
      const rows = ex.series.map((s) => `| ${s.name} | ${s.values.map((v) => f(v, ex.decimals) + (ex.suffix ?? '')).join(' | ')} |`)
      const tot = ex.kind === 'bar' && ex.showTotals ? `\n| Total (shown above bars) | ${ex.categories.map((_, c) => f(ex.series.reduce((s, x) => s + x.values[c], 0), ex.decimals)).join(' | ')} |` : ''
      return `**${kind}: ${ex.title}**${ex.unitNote ? ` (${ex.unitNote})` : ''} – all values are labelled in the chart:\n\n${head}\n${rows.join('\n')}${tot}`
    }
    case 'pie':
      return `**Pie chart: ${ex.title}**\n\n${ex.slices.map((s) => `- ${s.label}: ${f(s.value, ex.decimals)}${ex.suffix}`).join('\n')}`
    case 'combo': {
      const head = `| | ${ex.categories.join(' | ')} |\n|${'---|'.repeat(ex.categories.length + 1)}`
      return `**Combined chart: ${ex.title}** (bars: ${ex.bars.name}; line: ${ex.line.name})\n\n${head}\n| ${ex.bars.name} (bars) | ${ex.bars.values.map((v) => f(v, ex.barDecimals)).join(' | ')} |\n| ${ex.line.name} (line) | ${ex.line.values.map((v) => f(v, ex.lineDecimals)).join(' | ')} |`
    }
    case 'text':
      return `${ex.title ? `**${ex.title}**\n\n` : ''}> ${ex.body.replace(/\n/g, '\n> ')}`
    case 'flow': {
      const row = (r: { input: string[]; ops: (string | null)[]; output: string[] | null }) => `${r.input.join('')} → ${r.ops.map((o) => `[${o ?? '?'}]`).join(' → ')} → ${r.output ? r.output.join('') : '?'}`
      const legend = ex.flow.legend.length ? `Operators:\n${ex.flow.legend.map((l) => `- ${l.symbol} = ${l.meaning}`).join('\n')}\n\n` : 'Operator meanings are NOT given – infer them from the examples. Different symbols always mean different operations.\n\n'
      return `**Flow chart** (each box applies its operation to the string from left to right)\n\n${legend}${ex.flow.examples.map((e, i) => `Example ${i + 1}: ${row(e)}`).join('\n')}${ex.flow.examples.length ? '\n' : ''}Question: ${row(ex.flow.question)}`
    }
    case 'switch':
      return `**Switch:** input row (positions 1–4): ${ex.spec.input.join(', ')}\n${ex.spec.switches.map((s, i) => `Operator ${i + 1}: ${s ? s.join('') : '???? (missing)'}`).join('\n')}\nOutput row: ${ex.spec.output.join(', ')}\n_Rule: code c1c2c3c4 means output position i receives the symbol that was at input position ci._`
    case 'figures':
      return '(figures – see screenshot)'
  }
}

function ascii(cells: number[], size: number): string {
  const s = new Set(cells)
  return Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => (s.has(r * size + c) ? '#' : '.')).join('')).join('\n')
}

function describe(id: string, it: Item, image?: string): { md: string; key: unknown } {
  const parts = [`### ${id}`, '']
  if (image) parts.push(`Screenshot: ${image}`, '')
  for (const ex of it.exhibits) if (ex.kind !== 'figures') parts.push(exhibitMd(ex), '')
  parts.push(`**Question:** ${it.prompt}`)
  if (it.hint) parts.push(`_${it.hint}_`)
  let key: unknown
  switch (it.type) {
    case 'mcq':
      if (!image || !it.options.some((o) => o.panel)) parts.push('', ...it.options.map((o, i) => `${L(i)}) ${o.text}`))
      parts.push('', 'Answer format: one letter.')
      key = L(it.correct)
      break
    case 'bar':
      parts.push('', `Bar chart (${it.chart.unit}): ${it.chart.categories.map((c, i) => `${c}: ${it.chart.values[i] === null ? '? (bar to set)' : f(it.chart.values[i] as number, it.chart.decimals)}`).join(', ')}. Steps of ${it.chart.step}.`, 'Answer format: the value to set.')
      key = { value: it.answer, tolerance: it.chart.step / 2 }
      break
    case 'order':
      parts.push('', `Items to order: ${it.entries.join(', ')}`, 'Answer format: list of item names in order.')
      key = it.correctOrder.map((i) => it.entries[i])
      break
    case 'tablefill':
      parts.push('', exhibitMd(it.table), '', 'Answer format: a number.')
      key = { value: it.answer, tolerance: it.tolerance }
      break
    case 'digit': {
      const show = (t: typeof it.equation.lhs) => t.map((x) => (x.t === 'slot' ? '□' : x.t === 'num' ? String(x.v) : x.op === '*' ? '×' : x.op === '-' ? '−' : '+')).join(' ')
      parts.push('', `Equation: ${show(it.equation.lhs)} = ${show(it.equation.rhs)}`, 'Answer format: the digits for the boxes, left to right (any valid solution counts).')
      key = { equation: it.equation }
      break
    }
    case 'grid':
      parts.push('', 'Only answer the judgement tasks (the memory part cannot be tested in text).')
      it.round.judgements.forEach((j, i) =>
        parts.push(
          '',
          j.kind === 'symmetry'
            ? `Judgement ${i + 1}: Is this pattern mirror-symmetric about its vertical axis?\n\`\`\`\n${ascii(j.cells, j.size)}\n\`\`\``
            : `Judgement ${i + 1}: Is the right shape the same shape as the left one, only rotated (yes) – or is it mirrored (no)?\nLeft:\n\`\`\`\n${ascii(j.a, j.size)}\n\`\`\`\nRight:\n\`\`\`\n${ascii(j.b, j.size)}\n\`\`\``,
        ),
      )
      parts.push('', 'Answer format: list of yes/no, one per judgement.')
      key = it.round.judgements.map((j) => j.answer)
      break
    case 'numeric':
      parts.push('', 'Answer format: a number.')
      key = { value: it.answer, tolerance: it.tolerance }
      break
  }
  return { md: parts.join('\n'), key }
}

const groups: { name: string; cats: CategoryId[]; images?: boolean }[] = [
  { name: 'A-speed-numerical', cats: ['speed', 'numerical'] },
  { name: 'B-deductive-diagrammatic', cats: ['deductive', 'diagrammatic'] },
  { name: 'C-inductive', cats: ['inductive'], images: true },
  { name: 'D-aon-interactive', cats: ['aon', 'interactive'] },
]

const browser = await webkit.launch()
const page = await (await browser.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 })).newPage()

for (const g of groups) {
  const dir = `${OUT}/${g.name}`
  mkdirSync(dir, { recursive: true })
  const md: string[] = []
  const keys: Record<string, unknown> = {}
  for (const cat of g.cats) {
    const gens = generatorsFor(cat)
    for (const d of [1, 2, 3] as Difficulty[]) {
      for (let i = 0; i < PER_LEVEL; i++) {
        const gen = gens[i % gens.length]
        const seed = deriveSeed(0xb1d0, gen.id, d, i)
        const it = gen.generate(seed, d, 'en')
        const id = `${cat}-L${d}-${String(i + 1).padStart(2, '0')}`
        let image: string | undefined
        if (g.images) {
          image = `${id}.png`
          await page.goto(`${base}#/render/${encodeURIComponent(it.key)}?lang=en`)
          await page.waitForSelector('[data-testid=render-item]')
          await page.waitForTimeout(120)
          await page.screenshot({ path: `${dir}/${image}`, fullPage: true })
        }
        const r = describe(id, it, image)
        md.push(r.md)
        keys[id] = { key: r.key, itemKey: it.key, gen: gen.id }
      }
    }
  }
  writeFileSync(`${dir}/items.md`, `# Blind solving – ${g.name}\n\nSolve every task. Use only the information given here (and the screenshots).\n\n${md.join('\n\n---\n\n')}\n`)
  writeFileSync(`${KEYS}/${g.name}.json`, JSON.stringify(keys, null, 1))
  console.log(g.name, Object.keys(keys).length)
}
await browser.close()

// Banks: every item.
for (const [name, ids, make] of [
  ['E-verbal', VERBAL_IDS, verbalItem],
  ['F-critical', CRITICAL_IDS, criticalItem],
] as const) {
  const dir = `${OUT}/${name}`
  mkdirSync(dir, { recursive: true })
  const md: string[] = []
  const keys: Record<string, unknown> = {}
  for (const id of ids) {
    const it = make(id, 'en')
    if (!it) continue
    const r = describe(id, it)
    md.push(r.md)
    keys[id] = { key: r.key, itemKey: it.key }
  }
  writeFileSync(`${dir}/items.md`, `# Blind solving – ${name}\n\nSolve every task using only the text given.\n\n${md.join('\n\n---\n\n')}\n`)
  writeFileSync(`${KEYS}/${name}.json`, JSON.stringify(keys, null, 1))
  console.log(name, Object.keys(keys).length)
}
