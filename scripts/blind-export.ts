/**
 * Gate 3 – blind-solving export. Writes the items as plain task descriptions
 * (no keys, no explanations) into gate-output/blind/<group>/items.md and the
 * keys into gate-output/blind-keys/<group>.json (never shown to the solvers).
 * Inductive items are rendered as screenshots via the running app.
 *
 * Usage: npx tsx scripts/blind-export.ts [baseUrl]
 * Env (later rounds): BLIND_ROUND=2 (output suffix), BLIND_SALT (fresh seeds),
 * BLIND_GROUPS=A-speed-numerical,… and BANK_IDS=v05,c10,… (id prefixes) to limit the export,
 * BLIND_GENS=ind.multi,… and BLIND_PER_LEVEL=12 to check newly added generators only.
 */
import { webkit } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { CRITICAL_IDS, criticalItem, VERBAL_IDS, verbalItem } from '../src/content/banks'
import { generatorsFor } from '../src/content/registry'
import { deriveSeed } from '../src/content/rng'
import type { CategoryId, Difficulty } from '../src/content/types'
import { describe } from './item-md'

const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const ROUND = process.env.BLIND_ROUND ?? ''
const OUT = `gate-output/blind${ROUND}`
const KEYS = `gate-output/blind${ROUND}-keys`
const SALT = Number(process.env.BLIND_SALT ?? 0xb1d0)
const ONLY_GROUPS = process.env.BLIND_GROUPS?.split(',')
const BANK_IDS = process.env.BANK_IDS?.split(',')
rmSync(OUT, { recursive: true, force: true })
rmSync(KEYS, { recursive: true, force: true })
mkdirSync(KEYS, { recursive: true })

const PER_LEVEL = Number(process.env.BLIND_PER_LEVEL ?? 15)
/** Optional: only these generators (e.g. BLIND_GENS=ind.multi,ind.count after adding new ones). */
const ONLY_GENS = process.env.BLIND_GENS?.split(',')
const groups: { name: string; cats: CategoryId[]; images?: boolean }[] = [
  { name: 'A-speed-numerical', cats: ['speed', 'numerical'] },
  { name: 'B-deductive-diagrammatic', cats: ['deductive', 'diagrammatic'] },
  { name: 'C-inductive', cats: ['inductive'], images: true },
  { name: 'D-aon-interactive', cats: ['aon', 'interactive'] },
]

const browser = await webkit.launch()
const page = await (await browser.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 })).newPage()

for (const g of groups) {
  if (ONLY_GROUPS && !ONLY_GROUPS.includes(g.name)) continue
  const dir = `${OUT}/${g.name}`
  mkdirSync(dir, { recursive: true })
  const md: string[] = []
  const keys: Record<string, unknown> = {}
  for (const cat of g.cats) {
    const gens = generatorsFor(cat).filter((x) => !ONLY_GENS || ONLY_GENS.includes(x.id))
    if (!gens.length) continue
    for (const d of [1, 2, 3] as Difficulty[]) {
      for (let i = 0; i < PER_LEVEL; i++) {
        const gen = gens[i % gens.length]
        const seed = deriveSeed(SALT, gen.id, d, i)
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
  if (ONLY_GROUPS && !ONLY_GROUPS.includes(name)) continue
  const dir = `${OUT}/${name}`
  mkdirSync(dir, { recursive: true })
  const md: string[] = []
  const keys: Record<string, unknown> = {}
  for (const id of ids) {
    if (BANK_IDS && !BANK_IDS.some((p) => id === p || id.startsWith(`${p}-`))) continue
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
