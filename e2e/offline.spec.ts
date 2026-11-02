import { expect, test } from '@playwright/test'

test('offline: training, simulation, dashboard and academy work without network', async ({ page, context }) => {
  await page.goto('#/')
  const supported = await page.evaluate(() => 'serviceWorker' in navigator)
  test.skip(!supported, 'This Playwright browser build has no service worker support; covered by the Chromium project.')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Assessment Trainer' })).toBeVisible()
  await page.goto('#/run/training?cat=numerical&d=2')
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await page.goto('#/sim/bain-sova')
  await page.getByRole('link', { name: 'Simulation starten' }).click()
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await page.goto('#/stats')
  await expect(page.getByRole('heading', { name: 'Statistik' })).toBeVisible()
  await page.goto('#/academy/speed')
  await expect(page.getByRole('heading', { name: 'Kopfrechnen & Speed Math' })).toBeVisible()
  // A cold reload of a deep link while offline is served by the service worker too.
  await page.goto('#/academy/numerical')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Numerical Reasoning' })).toBeVisible()
  await context.setOffline(false)
})
