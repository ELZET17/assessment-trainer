/** Markdown rendering of items for review exports (Gate 3 blind solving, Gate 4 explanation review). */
import { fmt } from '../src/content/format'
import type { Exhibit, Item, Lang } from '../src/content/types'

let lang: Lang = 'en'
export const setMdLang = (l: Lang) => {
  lang = l
}
const L = (i: number) => String.fromCharCode(65 + i)
const f = (v: number, d: number) => fmt(v, lang, d)

export function exhibitMd(ex: Exhibit): string {
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

export function describe(id: string, it: Item, image?: string): { md: string; key: unknown } {
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

