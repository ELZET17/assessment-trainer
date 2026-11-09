import { expect, test } from '@playwright/test'
import { answerMcq } from './helpers'

test('Gate 8: 7 of 10 correct in Numerical → dashboard shows 7/10 and 70 %; data survives reload, new tab, export/reset/import', async ({ page, context }, info) => {
  await page.goto('#/run/training?cat=numerical&d=2')
  for (let i = 0; i < 10; i++) {
    await answerMcq(page, i < 7)
    await expect(page.getByRole('region', { name: 'Lösungserklärung' })).toBeVisible()
    await page.getByRole('button', { name: /Weiter/ }).click()
    // Taps in the first 350 ms after "Weiter" are ignored on purpose (double-tap protection).
    await page.waitForTimeout(400)
  }
  await page.goto('#/stats')
  await expect(page.getByTestId('cat-numerical-count')).toHaveText('7/10')
  await expect(page.getByTestId('cat-numerical-acc')).toHaveText('70 %')

  // Reload and a fresh tab in the same browser profile.
  await page.reload()
  await expect(page.getByTestId('cat-numerical-count')).toHaveText('7/10')
  const tab = await context.newPage()
  await tab.goto('#/stats')
  await expect(tab.getByTestId('cat-numerical-count')).toHaveText('7/10')
  await tab.close()

  // Export → reset → import → identical; second import adds nothing.
  // (The touch path uses the share sheet; the test checks the download fallback.)
  await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true }))
  await page.goto('#/settings')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Exportieren/ }).click()])
  const file = info.outputPath('export.json')
  await download.saveAs(file)
  await page.getByRole('button', { name: 'Alle Daten zurücksetzen' }).click()
  await page.getByRole('button', { name: 'Alles löschen' }).click()
  await page.goto('#/stats')
  await expect(page.getByTestId('cat-numerical-count')).toHaveText('–')
  await page.goto('#/settings')
  await page.locator('input[type=file]').setInputFiles(file)
  await expect(page.getByRole('status')).toContainText('10 neue Antworten')
  await page.locator('input[type=file]').setInputFiles(file)
  await expect(page.getByRole('status')).toContainText('0 neue Antworten, 10 bereits vorhanden')
  await page.goto('#/stats')
  await expect(page.getByTestId('cat-numerical-count')).toHaveText('7/10')
  await expect(page.getByTestId('cat-numerical-acc')).toHaveText('70 %')
})

test('wrong answers land in the error book and can be practised', async ({ page }) => {
  await page.goto('#/run/training?cat=speed&d=1')
  await answerMcq(page, false)
  await page.getByRole('button', { name: /Weiter/ }).click()
  await page.goto('#/mistakes')
  await expect(page.getByText('1× falsch')).toBeVisible()
  await page.getByRole('link', { name: /Alle 1 üben/ }).click()
  await answerMcq(page, true)
  await expect(page.getByText('✓ Richtig')).toBeVisible()
})
