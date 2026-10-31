/** Runtime answer checking for every item type. */
import type { Answer, Item } from './types'
import { digitValid } from './validators/aon'

export interface CheckResult {
  correct: boolean
  /** 0..1 partial credit (Grid Challenge); otherwise 1 or 0. */
  credit: number
}

const R = (correct: boolean): CheckResult => ({ correct, credit: correct ? 1 : 0 })

export function checkAnswer(item: Item, answer: Answer): CheckResult {
  switch (item.type) {
    case 'mcq':
      if (answer.type === 'mcq') return R(answer.choice === item.correct)
      if (answer.type === 'numeric' && item.free) return R(Math.abs(answer.value - item.free.answer) <= item.free.tolerance)
      return R(false)
    case 'numeric':
    case 'tablefill':
      return R(answer.type === 'numeric' && Math.abs(answer.value - item.answer) <= item.tolerance)
    case 'bar':
      return R(answer.type === 'numeric' && Math.abs(answer.value - item.answer) < item.chart.step / 2)
    case 'order':
      return R(answer.type === 'order' && answer.order.length === item.correctOrder.length && answer.order.every((x, i) => x === item.correctOrder[i]))
    case 'digit':
      return R(answer.type === 'digit' && digitValid(item.equation, answer.digits))
    case 'grid': {
      if (answer.type !== 'grid') return R(false)
      const dots = item.round.dots
      const posHits = dots.filter((d, i) => answer.positions[i] === d).length
      const judg = item.round.judgements
      const judgHits = judg.filter((j, i) => answer.judgements[i] === j.answer).length
      const credit = 0.7 * (posHits / dots.length) + 0.3 * (judgHits / judg.length)
      return { correct: posHits === dots.length && judgHits >= judg.length - 1, credit }
    }
  }
}
