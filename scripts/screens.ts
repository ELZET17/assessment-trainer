/**
 * Gate 6 – screenshots of all main screens on iPhone (393×852, WebKit, touch)
 * and desktop (1440×900), light and dark. Also checks for horizontal overflow
 * and touch targets smaller than 44×44 px.
 * Usage: npx tsx scripts/screens.ts [baseUrl]
 */
import { webkit, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolveItem } from '../src/content/items'
import { parseRefKey } from '../src/content/types'

const base = process.argv[2] ?? 'http://127.0.0.1:5173/'
const OUT = 'gate-output/screens'
mkdirSync(OUT, { recursive: true })
const report: string[] = []

async function answer(page: Page, right: boolean) {
  const key = (await page.locator('[data-item-key]').first().getAttribute('data-item-key')) as string
  const item = resolveItem(parseRefKey(key)!, 'en')!
  if (item.type !== 'mcq') return
  const idx = right ? item.correct : (item.correct + 1) % item.options.length
  await page.getByRole('radiogroup', { name: 'Antwortoptionen' }).getByRole('radio').nth(idx).click()
}

async function audit(page: Page, name: string) {
  const res = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth
    const small: string[] = []
    document.querySelectorAll('button, a, [role=radio], input, select').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || (el as HTMLElement).closest('.sr-only')) return
      if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'range' || el.type === 'file')) return
      if (r.height < 43.5 || r.width < 43.5) small.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`)
    })
    return { overflow, small: small.slice(0, 8) }
  })
  report.push(`- ${name}: overflow ${res.overflow}px${res.small.length ? ` · kleine Ziele: ${res.small.join('; ')}` : ''}`)
}

const browser = await webkit.launch()
for (const [dev, vp] of [
  ['iphone', { width: 393, height: 852 }],
  ['desktop', { width: 1440, height: 900 }],
] as const) {
  for (const scheme of ['light', 'dark'] as const) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dev === 'iphone' ? 2 : 1, isMobile: dev === 'iphone', hasTouch: dev === 'iphone', colorScheme: scheme })
    const page = await ctx.newPage()
    const shot = async (name: string, full = true) => {
      await page.waitForTimeout(250)
      await page.screenshot({ path: `${OUT}/${dev}-${scheme}-${name}.png`, fullPage: full })
      if (scheme === 'light') await audit(page, `${dev} ${name}`)
    }
    // Build up some history first (for dashboard, mistakes, streak).
    await page.goto(`${base}#/run/training?cat=numerical&d=2`)
    for (let i = 0; i < 6; i++) {
      await answer(page, i % 3 !== 0)
      await page.getByRole('button', { name: /Weiter/ }).click()
      await page.waitForTimeout(400) // double-tap protection window
    }
    await page.goto(`${base}#/`)
    await shot('01-home')
    await page.goto(`${base}#/practice`)
    await shot('02-practice')
    await page.goto(`${base}#/practice/numerical`)
    await shot('03-category')
    for (const cat of ['numerical', 'speed', 'inductive', 'deductive', 'verbal', 'critical', 'diagrammatic', 'aon', 'interactive']) {
      await page.goto(`${base}#/run/training?cat=${cat}&d=2`)
      await page.locator('[data-item-key]').first().waitFor()
      await shot(`10-item-${cat}`)
    }
    await page.goto(`${base}#/run/training?cat=numerical&d=3`)
    await answer(page, false)
    await shot('11-feedback-wrong')
    await page.goto(`${base}#/run/training?cat=interactive&sub=int.order&d=2`)
    await shot('12-interactive-order')
    await page.goto(`${base}#/run/training?cat=interactive&sub=int.bar&d=2`)
    await shot('13-interactive-bar')
    await page.goto(`${base}#/run/drill?cat=speed&d=2&n=5`)
    await page.locator('[data-item-key]').first().waitFor()
    await shot('20-drill')
    await page.goto(`${base}#/sim/kearney-test`)
    await shot('30-sim-intro')
    await page.clock.install()
    await page.goto(`${base}#/sim/run/kearney-test`)
    await page.locator('[data-item-key]').first().waitFor()
    await answer(page, true)
    await shot('31-sim-running', false)
    await page.clock.fastForward(61 * 60 * 1000)
    await page.waitForURL(/sim\/result/)
    await shot('32-sim-result')
    await page.goto(`${base}#/run/game/switch`)
    await page.getByRole('button', { name: 'Start' }).click()
    await shot('40-game-switch', false)
    await page.goto(`${base}#/run/game/digit`)
    await page.getByRole('button', { name: 'Start' }).click()
    await shot('41-game-digit', false)
    await page.goto(`${base}#/stats`)
    await shot('50-stats')
    await page.goto(`${base}#/mistakes`)
    await shot('51-mistakes')
    await page.goto(`${base}#/academy`)
    await shot('60-academy')
    await page.goto(`${base}#/academy/speed`)
    await shot('61-lesson-speed')
    await page.goto(`${base}#/settings`)
    await shot('70-settings')
    await page.goto(`${base}#/sprint`)
    await shot('71-sprint')
    await ctx.close()
  }
}
await browser.close()
writeFileSync(`${OUT}/audit.md`, `# Gate 6 – Audit (Überlauf, Touch-Ziele)\n\n${report.join('\n')}\n`)
console.log(report.filter((r) => /overflow [1-9]|kleine/.test(r)).join('\n') || 'no overflow, no small targets')
