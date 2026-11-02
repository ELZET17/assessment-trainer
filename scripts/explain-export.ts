/**
 * Gate 4 – exports 50 items WITH key and German explanation for an independent
 * review (every number recomputed). One item per generator (varying level),
 * plus verbal and critical-thinking items. Figure items get a screenshot.
 *
 * Usage: npx tsx scripts/explain-export.ts [baseUrl] → gate-output/g4/explanations.md
 */
import { webkit } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { CRITICAL_IDS, criticalItem, VERBAL_IDS, verbalItem } from '../src/content/banks'
import { GENERATORS } from '../src/content/registry'
import { deriveSeed } from '../src/content/rng'
import type { Difficulty, Item } from '../src/content/types'
import { describe, setMdLang } from './item-md'

const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const OUT = process.env.G4_OUT ?? 'gate-output/g4'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
setMdLang('de')

const browser = await webkit.launch()
const page = await (await browser.newContext({ viewport: { width: 900, height: 900 } })).newPage()
const md: string[] = []

function withKey(id: string, it: Item, image?: string): string {
  const { md: task, key } = describe(id, it, image)
  const ex = it.explanation
  return [
    task,
    '',
    `**Schlüssel (App):** ${JSON.stringify(key)}`,
    '',
    '**Erklärung (App):**',
    ...ex.steps.map((s) => `- ${s}`),
    ...(ex.shortcut ? ['', `**Abkürzung:** ${ex.shortcut}`] : []),
    ...(ex.distractors?.length ? ['', '**Falsche Optionen:**', ...ex.distractors.map((s) => `- ${s}`)] : []),
  ].join('\n')
}

let n = 0
for (const [i, gen] of GENERATORS.entries()) {
  const d = ((i % 3) + 1) as Difficulty
  const it = gen.generate(deriveSeed(Number(process.env.G4_SALT ?? 0x6a7e), gen.id, d, 0), d, 'de')
  const id = `${String(++n).padStart(2, '0')}-${gen.id}-L${d}`
  let image: string | undefined
  if (it.exhibits.some((e) => e.kind === 'figures') || (it.type === 'mcq' && it.options.some((o) => o.panel))) {
    image = `${id}.png`
    await page.goto(`${base}#/render/${encodeURIComponent(it.key)}?lang=de`)
    await page.waitForSelector('[data-testid=render-item]')
    await page.waitForTimeout(120)
    await page.screenshot({ path: `${OUT}/${image}`, fullPage: true })
  }
  md.push(withKey(id, it, image))
}
await browser.close()

setMdLang('en')
const pickEvery = <T,>(xs: T[], k: number) => xs.filter((_, i) => i % Math.floor(xs.length / k) === 0).slice(0, k)
const rest = 50 - n
for (const vid of pickEvery(VERBAL_IDS, Math.ceil(rest / 2))) md.push(withKey(`${String(++n).padStart(2, '0')}-${vid}`, verbalItem(vid, 'en')!))
for (const cid of pickEvery(CRITICAL_IDS, 50 - n)) md.push(withKey(`${String(++n).padStart(2, '0')}-${cid}`, criticalItem(cid, 'en')!))

writeFileSync(`${OUT}/explanations.md`, `# Gate 4 – ${n} Erklärungen zur Prüfung\n\n${md.join('\n\n---\n\n')}\n`)
console.log('items', n)
