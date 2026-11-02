/**
 * Gate 3 – compares the blind solvers' answers with the keys.
 * Usage: npx tsx scripts/blind-compare.ts → gate-output/blind-report.md
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { DigitEquation } from '../src/content/generators/aon/digitTypes'
import { digitValid } from '../src/content/validators/aon'

type Key = { key: unknown; itemKey: string; gen?: string }
const lines: string[] = ['# Gate 3 – Blind-Lösen: Abgleich', '']
let totalItems = 0
let totalMismatch = 0
let totalNotes = 0

const norm = (x: unknown) => (typeof x === 'string' ? x.trim().toLowerCase() : x)

function agrees(key: unknown, ans: unknown): boolean {
  if (typeof key === 'string') return typeof ans === 'string' && ans.trim().toUpperCase().startsWith(key)
  if (Array.isArray(key)) {
    if (!Array.isArray(ans) || ans.length !== key.length) return false
    if (typeof key[0] === 'boolean') return key.every((k, i) => (norm(ans[i]) === 'yes') === k)
    return key.every((k, i) => norm(k) === norm(ans[i]))
  }
  const k = key as { value?: number; tolerance?: number; equation?: DigitEquation }
  if (k.equation) return Array.isArray(ans) && digitValid(k.equation, ans.map(Number))
  if (typeof k.value === 'number') return typeof Number(ans) === 'number' && Math.abs(Number(ans) - k.value) <= (k.tolerance ?? 0) + 1e-6
  return false
}

for (const g of readdirSync('gate-output/blind').sort()) {
  const keyFile = `gate-output/blind-keys/${g}.json`
  const ansFile = `gate-output/blind/${g}/answers.json`
  if (!existsSync(ansFile)) {
    lines.push(`## ${g}`, '', '_Noch keine Antworten._', '')
    continue
  }
  const keys = JSON.parse(readFileSync(keyFile, 'utf8')) as Record<string, Key>
  const raw = JSON.parse(readFileSync(ansFile, 'utf8')) as { answers: Record<string, unknown>; notes?: Record<string, string> }
  const ids = Object.keys(keys)
  const mism = ids.filter((id) => !agrees(keys[id].key, raw.answers[id]))
  const notes = Object.entries(raw.notes ?? {})
  totalItems += ids.length
  totalMismatch += mism.length
  totalNotes += notes.length
  lines.push(`## ${g}`, '', `${ids.length} Items · Übereinstimmung ${ids.length - mism.length}/${ids.length} · Abweichungen ${mism.length} · Hinweise ${notes.length}`, '')
  for (const id of mism) lines.push(`- **Abweichung ${id}** (${keys[id].itemKey}): Schlüssel ${JSON.stringify(keys[id].key)} · Löser ${JSON.stringify(raw.answers[id])}${raw.notes?.[id] ? ` · Hinweis: ${raw.notes[id]}` : ''}`)
  for (const [id, n] of notes) if (!mism.includes(id)) lines.push(`- Hinweis ${id} (${keys[id]?.itemKey}): ${n}`)
  lines.push('')
}
lines.splice(2, 0, `**Gesamt:** ${totalItems} Items, ${totalMismatch} Abweichungen, ${totalNotes} Hinweise.`, '')
writeFileSync('gate-output/blind-report.md', lines.join('\n'))
console.log(lines.slice(0, 4).join('\n'))
