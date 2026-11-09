import { expect, test } from '@playwright/test'
import { answerMcq } from './helpers'

test('simulation: timer expiry auto-submits and shows the result with negative marking', async ({ page }) => {
  await page.clock.install()
  await page.goto('#/sim/kearney-test')
  await expect(page.getByText('So sieht der echte Test aus')).toBeVisible()
  await page.getByRole('link', { name: 'Simulation starten' }).click()
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await expect(page.getByText(/Frage 1 von 40/)).toBeVisible()
  // One right, one wrong, then let the clock run out.
  await answerMcq(page, true)
  await page.getByRole('button', { name: /Weiter/ }).click()
  await answerMcq(page, false)
  await page.getByRole('button', { name: /Weiter/ }).click()
  await page.clock.fastForward(61 * 60 * 1000)
  await expect(page).toHaveURL(/sim\/result\//)
  await expect(page.getByText('Ergebnis')).toBeVisible()
  // +5 −1 = 4 points out of 200
  await expect(page.getByText('/ 200')).toBeVisible()
  await expect(page.locator('text=4').first()).toBeVisible()
})

test('simulation: browser back asks for confirmation', async ({ page }) => {
  await page.goto('#/sim')
  await page.goto('#/sim/run/bain-sova')
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('alertdialog', { name: 'Test verlassen?' })).toBeVisible()
  await page.getByRole('button', { name: 'Weiter im Test' }).click()
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
})

test('simulation without skipping requires an answer before moving on', async ({ page }) => {
  // Bain Sova has no ordering items (those count as answered once shown).
  await page.goto('#/sim/run/bain-sova')
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Weiter/ })).toBeDisabled()
})
