import { expect, test } from '@playwright/test'
import { currentItem } from './helpers'

test('keyboard: 1–5 answers, Enter continues (desktop)', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'keyboard shortcuts are a desktop feature')
  await page.goto('#/run/training?cat=speed&d=1')
  const first = await currentItem(page)
  await page.keyboard.press('2')
  await expect(page.getByRole('region', { name: 'Lösungserklärung' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(async () => expect((await currentItem(page)).key).not.toBe(first.key)).toPass()
})

test('drag & drop ordering works with touch pointer events', async ({ page }) => {
  await page.goto('#/run/training?cat=interactive&sub=int.order&d=1')
  const list = page.getByRole('list', { name: 'Reihenfolge' })
  await expect(list).toBeVisible()
  const firstText = await list.locator('li').first().innerText()
  const handle = list.locator('li').first().locator('span[style*="touch-action"]')
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await handle.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, isPrimary: true })
  for (let dy = 10; dy <= 120; dy += 10) await handle.dispatchEvent('pointermove', { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y + dy, isPrimary: true })
  await list.locator('li').nth(2).dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y + 120, isPrimary: true })
  await expect(list.locator('li').first()).not.toHaveText(firstText)
})

test('bar drag snaps to the grid and can be submitted', async ({ page }) => {
  await page.goto('#/run/training?cat=interactive&sub=int.bar&d=1')
  const svg = page.getByRole('img', { name: /letzten Balken/ })
  await expect(svg).toBeVisible()
  const box = (await svg.boundingBox())!
  await svg.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: box.x + box.width - 30, clientY: box.y + box.height * 0.4, isPrimary: true })
  await svg.dispatchEvent('pointerup', { pointerId: 2, pointerType: 'touch', clientX: box.x + box.width - 30, clientY: box.y + box.height * 0.4, isPrimary: true })
  await page.getByRole('button', { name: 'Antwort abgeben' }).click()
  await expect(page.getByRole('region', { name: 'Lösungserklärung' })).toBeVisible()
})

test('digit challenge accepts a valid solution', async ({ page }) => {
  await page.goto('#/run/training?cat=aon&sub=aon.digit&d=1')
  const item = await currentItem(page)
  if (item.type !== 'digit') throw new Error('expected digit')
  for (const d of item.sample) await page.getByRole('button', { name: String(d), exact: true }).click()
  await page.getByRole('button', { name: 'Abgeben' }).click()
  await expect(page.getByText('✓ Richtig')).toBeVisible()
})

test('theme switch to dark mode applies', async ({ page }) => {
  await page.goto('#/settings')
  await page.getByRole('radio', { name: 'Dunkel' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})
