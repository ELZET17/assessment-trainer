import { describe, expect, it } from 'vitest'
import { CRITICAL_IDS, criticalItem, VERBAL_IDS, verbalHasGerman, verbalItem } from '../../src/content/banks'
import { CRITICAL } from '../../src/content/banks/critical'
import { CRITICAL_OPTIONS } from '../../src/content/banks/types'
import { VERBAL } from '../../src/content/banks/verbal'

describe('Verbal bank (requirement 5.1 E / 7)', () => {
  it('has ≥ 40 passages and ≥ 120 statements with unique ids', () => {
    expect(VERBAL.length).toBeGreaterThanOrEqual(40)
    expect(VERBAL_IDS.length).toBeGreaterThanOrEqual(120)
    expect(new Set(VERBAL_IDS).size).toBe(VERBAL_IDS.length)
  })
  it('passages have 120–200 words and 3–4 statements', () => {
    for (const p of VERBAL) {
      const w = p.text.en.split(/\s+/).length
      expect(w, p.id).toBeGreaterThanOrEqual(120)
      expect(w, p.id).toBeLessThanOrEqual(200)
      expect(p.statements.length).toBeGreaterThanOrEqual(3)
      expect(p.statements.length).toBeLessThanOrEqual(4)
    }
  })
  it('has German versions for ≥ 15 passages (complete: title, text, statements)', () => {
    const de = VERBAL.filter((p) => p.text.de && p.title.de && p.statements.every((s) => s.text.de))
    expect(de.length).toBeGreaterThanOrEqual(15)
    expect(VERBAL_IDS.filter(verbalHasGerman).length).toBeGreaterThanOrEqual(60)
  })
  it('uses all three answers in reasonable proportions and every reason cites the text', () => {
    const st = VERBAL.flatMap((p) => p.statements)
    for (const a of ['T', 'F', 'C'] as const) expect(st.filter((s) => s.answer === a).length).toBeGreaterThan(st.length * 0.2)
    for (const s of st) expect(s.reason.length, s.id).toBeGreaterThan(20)
  })
  it('builds items in both languages', () => {
    for (const id of VERBAL_IDS) {
      const en = verbalItem(id, 'en')
      const de = verbalItem(id, 'de')
      expect(en?.options.length).toBe(3)
      expect(de?.correct).toBe(en?.correct)
    }
  })
})

describe('Critical thinking bank', () => {
  it('has ≥ 60 items, ≥ 12 per type, valid answer indices', () => {
    expect(CRITICAL.length).toBeGreaterThanOrEqual(60)
    expect(new Set(CRITICAL_IDS).size).toBe(CRITICAL_IDS.length)
    for (const t of ['inference', 'assumption', 'deduction', 'interpretation', 'evaluation'] as const) expect(CRITICAL.filter((c) => c.type === t).length).toBeGreaterThanOrEqual(12)
    for (const c of CRITICAL) {
      expect(c.answer).toBeGreaterThanOrEqual(0)
      expect(c.answer).toBeLessThan(CRITICAL_OPTIONS[c.type].en.length)
      expect(criticalItem(c.id, 'en')?.correct).toBe(c.answer)
    }
  })
})
