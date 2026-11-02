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
  }
  await page.clock.fastForward(61 * 60 * 1000)
  await expect(page).toHaveURL(/sim\/result\//)
  const list = (await attempts(page)).filter((a) => a.mode === 'simulation')
  expect(list.length).toBe(40)
  const seqs = list.map((a) => a.seq as number).sort((a, b) => a - b)
  expect(new Set(seqs).size).toBe(40)
  await expect(page.getByRole('listitem').first()).toContainText('1.')
})
