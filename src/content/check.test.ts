import { describe, expect, it } from 'vitest'
import { checkAnswer } from './check'
import { gridChallenge } from './generators/aon/games'
import { digitChallenge } from './generators/aon/games'
import { generate } from './registry'

describe('checkAnswer', () => {
  it('accepts every valid digit solution, rejects repeats', () => {
    const it = digitChallenge.generate(7, 2, 'en')
    if (it.type !== 'digit') throw new Error('type')
    expect(checkAnswer(it, { type: 'digit', digits: it.sample }).correct).toBe(true)
    expect(checkAnswer(it, { type: 'digit', digits: it.sample.map(() => 1) }).correct).toBe(false)
  })
  it('grid gives partial credit', () => {
    const it = gridChallenge.generate(3, 1, 'en')
    if (it.type !== 'grid') throw new Error('type')
    const j = it.round.judgements.map((x) => x.answer ?? null)
    expect(checkAnswer(it, { type: 'grid', positions: it.round.dots, judgements: j })).toEqual({ correct: true, credit: 1 })
    const wrong = [...it.round.dots].reverse()
    expect(checkAnswer(it, { type: 'grid', positions: wrong, judgements: j }).correct).toBe(false)
  })
  it('free numeric input for speed math', () => {
    const it = generate('speed.mul', 5, 2, 'en')
    if (it.type !== 'mcq' || !it.free) throw new Error('type')
    expect(checkAnswer(it, { type: 'numeric', value: it.free.answer }).correct).toBe(true)
    expect(checkAnswer(it, { type: 'numeric', value: it.free.answer + 1 }).correct).toBe(false)
  })
})

describe('item references', () => {
  it('never substitutes an item from a different generator version', async () => {
    const { resolveItem, isReproducible } = await import('./items')
    const ref = { kind: 'gen' as const, gen: 'speed.mul', v: 99, seed: 1, d: 2 as const }
    expect(isReproducible(ref)).toBe(false)
    expect(resolveItem(ref, 'en')).toBeNull()
    expect(resolveItem({ ...ref, v: 1 }, 'en')).not.toBeNull()
  })
})

describe('adaptive staircase', () => {
  it('needs two fresh correct answers for every step up, one wrong for a step down', async () => {
    const { adaptiveLevel } = await import('./picker')
    expect(adaptiveLevel(1, [true])).toBe(1)
    expect(adaptiveLevel(1, [true, true])).toBe(2)
    expect(adaptiveLevel(1, [true, true, true])).toBe(2)
    expect(adaptiveLevel(1, [true, true, true, true])).toBe(3)
    expect(adaptiveLevel(3, [false])).toBe(2)
    expect(adaptiveLevel(2, [true, false, true])).toBe(1)
    expect(adaptiveLevel(1, [false, false])).toBe(1)
  })
})

describe('free number input', () => {
  it('accepts German/English formats and ignores typed units', async () => {
    const { parseUserNumber } = await import('../ui/answers')
    expect(parseUserNumber('12,5 %')).toBe(12.5)
    expect(parseUserNumber('€7.50')).toBe(7.5)
    expect(parseUserNumber('1.234,5')).toBe(1234.5)
    expect(parseUserNumber('−3')).toBe(-3)
    expect(parseUserNumber('abc')).toBeNull()
  })
})
