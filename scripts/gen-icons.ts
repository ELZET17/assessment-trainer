/**
 * Renders the app icon SVG to the PNG sizes needed for the PWA manifest and iOS
 * (apple-touch-icon). Uses Playwright's Chromium, so no native image library is needed.
 * Run: npx tsx scripts/gen-icons.ts
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg', 'utf8')
// Maskable icons need ~20 % safe padding; iOS ignores transparency → full-bleed square.
const square = svg.replace('rx="112"', 'rx="0"')
const maskable = square.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -64 640 640"><rect x="-64" y="-64" width="640" height="640" fill="#1e3a5f"/>')

const targets: [string, string, number][] = [
  ['public/pwa-192x192.png', svg, 192],
  ['public/pwa-512x512.png', svg, 512],
  ['public/maskable-512x512.png', maskable, 512],
  ['public/apple-touch-icon.png', square, 180],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [file, src, size] of targets) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0;background:transparent">${src.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`)
  writeFileSync(file, await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }))
  console.log('wrote', file)
}
await browser.close()
