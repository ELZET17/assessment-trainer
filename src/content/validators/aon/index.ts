/** Independent solvers for the Aon games (switch permutation, digit equations, grid judgements). */
import type { DigitEquation, DigitToken } from '../../generators/aon/digitTypes'
import type { PublicItem } from '../../types'
import { fail, mcq, type Validation } from '../result'

// ------------------------------------------------------------------ switch

function permute<T>(row: T[], code: number[]): T[] {
  const out: T[] = []
  for (let i = 0; i < code.length; i++) out.push(row[code[i] - 1])
  return out
}
function unpermute<T>(row: T[], code: number[]): T[] {
  const out: T[] = new Array(code.length)
  for (let i = 0; i < code.length; i++) out[code[i] - 1] = row[i]
  return out
}

function validateSwitch(item: PublicItem): Validation {
  const ex = item.exhibits[0]
  if (!ex || ex.kind !== 'switch' || item.type !== 'mcq') return fail('bad switch item')
  const { input, switches, output } = ex.spec
  const m = switches.indexOf(null)
  if (m < 0 || switches.filter((s) => s === null).length !== 1) return fail('exactly one missing switch expected')
  let before = input.slice()
  for (let i = 0; i < m; i++) before = permute(before, switches[i] as number[])
  let after = output.slice()
  for (let i = switches.length - 1; i > m; i--) after = unpermute(after, switches[i] as number[])
  if (new Set(before).size !== before.length) return fail('symbols not distinct')
  const code = after.map((s) => before.indexOf(s) + 1)
  if (code.some((c) => c === 0)) return fail('symbols inconsistent')
  const hits = item.options.map((o, i) => (o.text === code.join('') ? i : -1)).filter((i) => i >= 0)
  return hits.length === 1 ? mcq(hits[0]) : fail(`${hits.length} matching codes`)
}

// ------------------------------------------------------------------- digit

function evaluate(tokens: DigitToken[], digits: number[], offset: number): number {
  // Shunting into sum of products.
  let sum = 0
  let sign = 1
  let prod = 1
  let k = offset
  let expectOperand = true
  for (const t of tokens) {
    if (expectOperand) {
      prod *= t.t === 'slot' ? digits[k++] : t.t === 'num' ? t.v : NaN
      expectOperand = false
    } else if (t.t === 'op') {
      if (t.op === '*') {
        expectOperand = true
      } else {
        sum += sign * prod
        sign = t.op === '+' ? 1 : -1
        prod = 1
        expectOperand = true
      }
    }
  }
  return sum + sign * prod
}

const slots = (ts: DigitToken[]) => ts.filter((t) => t.t === 'slot').length

/** Is `digits` a valid filling of the equation (digits 1–9, no repeats, equation true)? */
export function digitValid(eq: DigitEquation, digits: number[]): boolean {
  const n = slots(eq.lhs) + slots(eq.rhs)
  if (digits.length !== n) return false
  if (digits.some((x) => !Number.isInteger(x) || x < 1 || x > 9)) return false
  if (new Set(digits).size !== n) return false
  return evaluate(eq.lhs, digits, 0) === evaluate(eq.rhs, digits, slots(eq.lhs))
}

export function countDigitSolutions(eq: DigitEquation): number {
  const n = slots(eq.lhs) + slots(eq.rhs)
  let count = 0
  const rec = (acc: number[]) => {
    if (acc.length === n) {
      if (digitValid(eq, acc)) count++
      return
    }
    for (let x = 1; x <= 9; x++) if (!acc.includes(x)) rec([...acc, x])
  }
  rec([])
  return count
}

// -------------------------------------------------------------------- grid

function symmetric(cells: number[], size: number): boolean {
  const set = new Set(cells)
  return cells.every((x) => set.has(Math.floor(x / size) * size + (size - 1 - (x % size))))
}

function canon(cells: [number, number][]): string {
  const r0 = Math.min(...cells.map((c) => c[0]))
  const c0 = Math.min(...cells.map((c) => c[1]))
  return cells
    .map(([r, c]) => `${r - r0}:${c - c0}`)
    .sort()
    .join('|')
}

function sameUpToRotation(a: number[], b: number[], size: number): boolean {
  let cur: [number, number][] = a.map((x) => [Math.floor(x / size), x % size])
  const target = canon(b.map((x) => [Math.floor(x / size), x % size]))
  for (let i = 0; i < 4; i++) {
    if (canon(cur) === target) return true
    cur = cur.map(([r, c]) => [c, -r])
  }
  return false
}

function validateGrid(item: PublicItem): Validation {
  if (item.type !== 'grid') return fail('not grid')
  const { dots, judgements } = item.round
  if (new Set(dots).size !== dots.length || dots.some((x) => x < 0 || x > 15)) return fail('bad dots')
  if (judgements.length !== dots.length) return fail('judgement count mismatch')
  return {
    ok: true,
    solution: {
      kind: 'grid',
      judgements: judgements.map((j) => (j.kind === 'symmetry' ? symmetric(j.cells, j.size) : sameUpToRotation(j.a, j.b, j.size))),
    },
  }
}

export function validateAon(item: PublicItem): Validation {
  if (item.sub === 'aon.switch') return validateSwitch(item)
  if (item.sub === 'aon.digit') {
    if (item.type !== 'digit') return fail('not digit')
    const n = countDigitSolutions(item.equation)
    return n >= 1 ? { ok: true, solution: { kind: 'digit', solutions: n } } : fail('no solution')
  }
  if (item.sub === 'aon.grid') return validateGrid(item)
  return fail(`unknown aon game ${item.sub}`)
}
