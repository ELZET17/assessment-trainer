/** Gate 4 support: every arithmetic claim in the academy is recomputed here. */
import { describe, expect, it } from 'vitest'
import { LESSONS } from '../src/features/academy/lessons'
import { getGenerator } from '../src/content/registry'

const close = (a: number, b: number, tol = 0.05) => Math.abs(a - b) <= tol

describe('academy arithmetic', () => {
  it('fraction table', () => {
    const t: [number, number][] = [[1 / 2, 50], [1 / 3, 33.3], [2 / 3, 66.7], [1 / 4, 25], [3 / 4, 75], [1 / 5, 20], [1 / 6, 16.7], [5 / 6, 83.3], [1 / 7, 14.3], [1 / 8, 12.5], [3 / 8, 37.5], [5 / 8, 62.5], [7 / 8, 87.5], [1 / 9, 11.1], [1 / 11, 9.1], [1 / 12, 8.3], [1 / 16, 6.25], [1 / 20, 5]]
    for (const [f, p] of t) expect(close(f * 100, p)).toBe(true)
  })
  it('multiplication and division tricks', () => {
    expect(48 * 5).toBe(480 / 2)
    expect(36 * 25).toBe(3600 / 4)
    expect(24 * 125).toBe(24000 / 8)
    expect(37 * 9).toBe(370 - 37)
    expect(43 * 11).toBe(473)
    expect(78 * 11).toBe(858)
    expect(47 * 23).toBe(940 + 141)
    expect(49 * 18).toBe(50 * 18 - 18)
    expect(52 * 48).toBe(2500 - 4)
    expect(53 * 53).toBe(2500 + 300 + 9)
    expect(65 * 65).toBe(4225)
    expect(97 * 94).toBe(100 * (100 - 3 - 6) + 3 * 6)
    expect(340 / 5).toBe(68)
    expect(850 / 25).toBe(34)
    expect(3000 / 125).toBe(24)
    expect(1872 / 24).toBe(1872 / 8 / 3)
    expect(1872 / 8).toBe(234)
    expect(84 / 0.25).toBe(336)
  })
  it('percent claims', () => {
    expect(close(0.35 * 260, 3 * 26 + 13, 1e-9)).toBe(true)
    expect(0.08 * 50).toBe(0.5 * 8)
    expect(close(0.16 * 25, 0.25 * 16, 1e-9)).toBe(true)
    expect(close(1.2 * 0.8, 0.96, 1e-9)).toBe(true)
    expect(150 / 1.25).toBe(120)
    expect((92 - 80) / 80).toBe(0.15)
  })
  it('big numbers, estimation, rule of 72', () => {
    expect(4500 * 2000).toBe(9_000_000)
    expect(2.4e9 / 300_000).toBe(8000)
    expect(48 * 52).toBe(2496)
    expect(4800 / 50).toBe(96)
    expect(close(4870 / 52, 93.7)).toBe(true)
    expect(close(Math.log(2) / Math.log(1.08), 9, 0.1)).toBe(true)
  })
  it('numerical formula examples', () => {
    expect((10 * 4 + 30 * 8) / 40).toBe(7)
    expect((5 + 8) / 2).toBe(6.5)
    expect(47 - 12).toBe(35)
    expect(close(Math.sqrt(1.21) - 1, 0.1, 1e-9)).toBe(true)
    expect(250 * 1.12).toBe(280)
    expect(close(115.5 / 105 - 1, 0.1, 1e-9)).toBe(true)
    expect(close(200 * 1.1, 220, 1e-9)).toBe(true)
    expect(30 / 120).toBe(0.25)
  })
  it('time per question and guessing expected values', () => {
    expect(1800 / 80).toBe(22.5)
    expect(3600 / 40).toBe(90)
    expect(2160 / 24).toBe(90)
    expect(close((1 / 5) * 5 - (4 / 5) * 1, 0.2, 1e-9)).toBe(true)
    expect(close((1 / 4) * 5 - (3 / 4) * 1, 0.5, 1e-9)).toBe(true)
  })
  it('every interactive example references an existing generator', () => {
    for (const l of LESSONS) for (const b of l.blocks) if (b.t === 'example') expect(getGenerator(b.gen), b.gen).toBeTruthy()
  })
})
