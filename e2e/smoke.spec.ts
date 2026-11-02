import { expect, test } from '@playwright/test'
import { collectErrors, noHorizontalOverflow } from './helpers'

const ROUTES = ['#/', '#/practice', '#/practice/numerical', '#/practice/aon', '#/sim', '#/sim/kearney-test', '#/stats', '#/mistakes', '#/academy', '#/academy/speed', '#/academy/tactics', '#/settings', '#/sprint']

test('all main screens render without errors or horizontal scrolling', async ({ page }) => {
  const errors = collectErrors(page)
  for (const r of ROUTES) {
    await page.goto(r)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1').first()).toBeVisible()
    await noHorizontalOverflow(page)
  }
  expect(errors).toEqual([])
})

test('every category starts a training item', async ({ page }) => {
  const errors = collectErrors(page)
  for (const cat of ['numerical', 'speed', 'inductive', 'deductive', 'verbal', 'critical', 'diagrammatic', 'aon', 'interactive']) {
    await page.goto(`#/run/training?cat=${cat}&d=2`)
    await expect(page.locator('[data-item-key]').first()).toBeVisible()
    await noHorizontalOverflow(page)
  }
  expect(errors).toEqual([])
})

test('PWA manifest, icons and iOS meta tags are present', async ({ page, request }) => {
  await page.goto('#/')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const manifest = await (await request.get(href as string)).json()
  expect(manifest.display).toBe('standalone')
  expect(manifest.name).toBe('Assessment Trainer')
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
  expect(sizes).toContain('192x192')
  expect(sizes).toContain('512x512')
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  const touch = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
  expect((await request.get(touch as string)).status()).toBe(200)
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
})
