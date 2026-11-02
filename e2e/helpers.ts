import { expect, type Page } from '@playwright/test'
import { resolveItem } from '../src/content/items'
import { parseRefKey, type Item } from '../src/content/types'

export async function currentItem(page: Page): Promise<Item> {
  const el = page.locator('[data-item-key]').first()
  await expect(el).toBeVisible()
  const key = (await el.getAttribute('data-item-key')) as string
  const ref = parseRefKey(key)
  if (!ref) throw new Error(`bad key ${key}`)
  const item = resolveItem(ref, 'en')
  if (!item) throw new Error(`cannot resolve ${key}`)
  return item
}

/** Answers the current MCQ item right or wrong (key resolved independently in Node). */
export async function answerMcq(page: Page, right: boolean): Promise<void> {
  const item = await currentItem(page)
  if (item.type !== 'mcq') throw new Error(`expected mcq, got ${item.type}`)
  const idx = right ? item.correct : (item.correct + 1) % item.options.length
  await page.getByRole('radiogroup', { name: 'Antwortoptionen' }).getByRole('radio').nth(idx).click()
}

export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

export async function noHorizontalOverflow(page: Page): Promise<void> {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(over).toBeLessThanOrEqual(1)
}
