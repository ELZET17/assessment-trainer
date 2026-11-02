/**
 * Error book ("Fehlerheft"), derived purely from attempts: an item is in the
 * book if it was ever answered wrongly and has not been answered correctly
 * twice in a row since its last wrong answer.
 */
import { isReproducible } from '../content/items'
import type { ItemRef } from '../content/types'
import type { Attempt } from './types'

export interface MistakeEntry {
  itemKey: string
  ref: ItemRef
  category: Attempt['category']
  sub: string
  lastWrong: number
  wrongCount: number
  /** Correct answers in a row since the last wrong one (0 or 1). */
  streak: number
}

export function mistakeBook(attempts: Attempt[]): MistakeEntry[] {
  const byItem = new Map<string, Attempt[]>()
  for (const a of attempts) {
    if (!a.answered) continue
    const l = byItem.get(a.itemKey)
    if (l) l.push(a)
    else byItem.set(a.itemKey, [a])
  }
  const out: MistakeEntry[] = []
  for (const [key, list] of byItem) {
    list.sort((a, b) => a.ts - b.ts)
    let lastWrongIdx = -1
    list.forEach((a, i) => !a.correct && (lastWrongIdx = i))
    if (lastWrongIdx < 0) continue
    const after = list.slice(lastWrongIdx + 1)
    const streak = after.filter((a) => a.correct).length
    if (streak >= 2) continue
    const last = list[lastWrongIdx]
    // After a generator update the old task cannot be shown again (D17) – it leaves the book.
    if (!isReproducible(last.ref)) continue
    out.push({ itemKey: key, ref: last.ref, category: last.category, sub: last.sub, lastWrong: last.ts, wrongCount: list.filter((a) => !a.correct).length, streak })
  }
  return out.sort((a, b) => b.lastWrong - a.lastWrong)
}
