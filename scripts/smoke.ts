/** Quick visual smoke run against a running server: node scripts/smoke.ts <baseUrl> <outDir> */
import { webkit } from '@playwright/test'
const base = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'gate-output/smoke'
const routes = (process.argv[4] ?? '#/,#/practice/numerical,#/run/training?cat=numerical&d=2,#/run/training?cat=inductive&d=2,#/sim/kearney-test,#/stats,#/academy/speed').split(',')
const browser = await webkit.launch()
for (const [name, vp] of [['iphone', { width: 393, height: 852 }], ['desktop', { width: 1440, height: 900 }]] as const) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: name === 'iphone', hasTouch: name === 'iphone' })
  const page = await ctx.newPage()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const r of routes) {
    await page.goto(base + r)
    await page.waitForTimeout(900)
    const file = `${out}/${name}-${r.replace(/[^a-z0-9]+/gi, '_')}.png`
    await page.screenshot({ path: file, fullPage: true })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    console.log(name, r, overflow ? 'HORIZONTAL-OVERFLOW' : 'ok')
  }
  if (errors.length) console.log('ERRORS', name, errors.slice(0, 5))
  await ctx.close()
}
await browser.close()
