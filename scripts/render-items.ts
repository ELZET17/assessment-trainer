/** Screenshots of one item per generator (or given keys) via /render/:key. Usage: tsx scripts/render-items.ts <base> <outDir> <iphone|desktop> [lang] [d] */
import { webkit } from '@playwright/test'
import { GENERATORS } from '../src/content/registry'
import { refKey } from '../src/content/types'
const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const out = process.argv[3] ?? 'gate-output/items'
const dev = process.argv[4] ?? 'iphone'
const lang = process.argv[5] ?? 'en'
const d = Number(process.argv[6] ?? 2) as 1 | 2 | 3
const filter = process.argv[7] ?? ''
const vp = dev === 'iphone' ? { width: 393, height: 852 } : { width: 1440, height: 900 }
const browser = await webkit.launch()
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: dev === 'iphone', hasTouch: dev === 'iphone' })
const page = await ctx.newPage()
for (const g of GENERATORS.filter((x) => x.id.includes(filter))) {
  const key = refKey({ kind: 'gen', gen: g.id, v: g.version, seed: 4242, d })
  await page.goto(`${base}#/render/${encodeURIComponent(key)}?lang=${lang}`)
  await page.waitForSelector('[data-testid=render-item]')
  await page.waitForTimeout(150)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  await page.screenshot({ path: `${out}/${dev}-${g.id}-d${d}.png`, fullPage: true })
  if (overflow) console.log('OVERFLOW', g.id)
}
await browser.close()
console.log('done')
