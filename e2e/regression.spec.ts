/** Gate 9/10 regressions: answers must never be lost, results keep the test order. */
import { expect, test, type Page } from '@playwright/test'
import { answerMcq } from './helpers'

async function attempts(page: Page): Promise<{ mode: string; sessionId: string; seq?: number; answered: boolean }[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('assessment-trainer')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const tx = req.result.transaction('attempts', 'readonly')
          const all = tx.objectStore('attempts').getAll()
          all.onsuccess = () => resolve(all.result)
        }
      }),
  )
}

test('Aon game: answers given before "Beenden" are saved', async ({ page }) => {
  await page.goto('#/run/game/switch')
  await page.getByRole('button', { name: 'Start' }).click()
  for (let i = 0; i < 2; i++) {
    await page.getByRole('radiogroup', { name: 'Antwortoptionen' }).getByRole('radio').first().click()
  }
  await page.getByRole('button', { name: /Beenden/ }).click()
  await page.getByRole('button', { name: 'Beenden', exact: true }).last().click()
  await expect(page).toHaveURL(/practice\/aon/)
  await expect.poll(async () => (await attempts(page)).filter((a) => a.mode === 'game').length).toBe(2)
})

test('simulation: an answer is saved immediately and survives a reload', async ({ page }) => {
  await page.goto('#/sim/run/bcg-cognitive')
  await answerMcq(page, true)
  await expect.poll(async () => (await attempts(page)).filter((a) => a.mode === 'simulation' && a.answered).length).toBe(1)
  await page.reload()
  await expect.poll(async () => (await attempts(page)).filter((a) => a.mode === 'simulation' && a.answered).length).toBe(1)
})

test('simulation result lists the questions in test order', async ({ page }) => {
  await page.clock.install()
  await page.goto('#/sim/run/kearney-test')
  for (let i = 0; i < 3; i++) {
    await answerMcq(page, i !== 1)
    await page.getByRole('button', { name: /Weiter/ }).click()
    await page.waitForTimeout(400) // double-tap protection window
  }
  await page.clock.fastForward(61 * 60 * 1000)
  await expect(page).toHaveURL(/sim\/result\//)
  const list = (await attempts(page)).filter((a) => a.mode === 'simulation')
  expect(list.length).toBe(40)
  const seqs = list.map((a) => a.seq as number).sort((a, b) => a - b)
  expect(new Set(seqs).size).toBe(40)
  await expect(page.getByRole('listitem').first()).toContainText('1.')
})

test('simulation: items never reached stay blank (also drag-and-drop ordering items)', async ({ page }) => {
  await page.clock.install()
  await page.goto('#/sim/run/bcg-cca')
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  await page.clock.fastForward(21 * 60 * 1000)
  await expect(page).toHaveURL(/sim\/result\//)
  const list = (await attempts(page)).filter((a) => a.mode === 'simulation')
  expect(list.length).toBe(15)
  // Only the first, displayed item may count (an ordering item shows a valid start order).
  expect(list.filter((a) => a.answered).length).toBeLessThanOrEqual(1)
})

test('drill: a double tap answers only the current question', async ({ page }) => {
  await page.goto('#/run/drill?cat=speed&d=1&n=10')
  const opt = page.getByRole('radiogroup', { name: 'Antwortoptionen' }).getByRole('radio').first()
  await opt.click()
  await page.waitForTimeout(120)
  await opt.click({ force: true })
  await expect(page.getByText('Frage 2 von 10')).toBeVisible()
  await expect.poll(async () => (await attempts(page)).filter((a) => a.mode === 'drill').length).toBe(1)
})

test('drill: an answer exactly at the time limit is stored once, every item exactly once', async ({ page }) => {
  await page.clock.install()
  await page.goto('#/run/drill?cat=speed&d=1&n=3')
  await expect(page.locator('[data-item-key]').first()).toBeVisible()
  // Jump to the last moment, answer, let the timer fire.
  const text =
    (await page
      .getByText(/⏱ \d+:\d\d/)
      .first()
      .textContent()) ?? ''
  const [, m, sec] = /(\d+):(\d\d)/.exec(text) as RegExpExecArray
  await page.clock.fastForward((Number(m) * 60 + Number(sec)) * 1000 - 150)
  await page.getByRole('radiogroup', { name: 'Antwortoptionen' }).getByRole('radio').first().click()
  await page.clock.runFor(2000)
  await expect(page.getByText('Drill-Ergebnis')).toBeVisible()
  const list = (await attempts(page)).filter((a) => a.mode === 'drill')
  expect(list.length).toBe(3)
  expect(new Set(list.map((a) => a.seq)).size).toBe(3)
})

test('calculator: typed digits go to the calculator, not to the answer options', async ({ page }) => {
  await page.goto('#/run/drill?cat=numerical&d=1&n=5')
  await page.getByRole('button', { name: 'Taschenrechner' }).click()
  const calc = page.getByRole('dialog', { name: 'Taschenrechner' })
  await calc.getByRole('button', { name: '7', exact: true }).click()
  await page.keyboard.type('25')
  await expect(calc.locator('[aria-live="polite"]')).toHaveText('725')
  await expect(page.getByText('Frage 1 von 5')).toBeVisible()
})

test('calculator in iPhone landscape keeps the close button and the timer visible', async ({ page }) => {
  await page.setViewportSize({ width: 852, height: 393 })
  await page.goto('#/run/drill?cat=numerical&d=2&n=5')
  await page.getByRole('button', { name: 'Taschenrechner' }).click()
  const close = page.getByRole('button', { name: 'Taschenrechner schließen' })
  const box = await close.boundingBox()
  expect(box && box.y >= 0).toBe(true)
  const calcBox = await page.getByRole('dialog', { name: 'Taschenrechner' }).boundingBox()
  const timer = await page.getByText(/⏱/).first().boundingBox()
  expect(calcBox && timer && calcBox.y > timer.y + timer.height).toBe(true)
})
