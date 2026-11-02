/**
 * Generator-side solver for ordering/seating puzzles. Deliberately a separate
 * implementation from validators/deductive (backtracking over seats instead of
 * permutations of people), so that Gate 2 compares two independent solvers (rule 2, D11).
 */
import type { Clue, Fact } from '../../validators/deductive'

/** Ring or line distance between two seats. */
function gapBetween(s: number, t: number, n: number, ring: boolean): number {
  const straight = s > t ? s - t : t - s
  return ring && n - straight < straight ? n - straight : straight
}

function directlyAfter(s: number, t: number, n: number, ring: boolean): boolean {
  return ring ? t === (s + 1 === n ? 0 : s + 1) : t === s + 1
}

/** `seat[p]` = seat of person p. */
export function clueTrue(c: Clue, seat: number[], ring: boolean): boolean {
  const n = seat.length
  if (c.t === 'pos') return seat[c.a] === c.k
  if (c.t === 'notPos') return seat[c.a] !== c.k
  if (c.t === 'notEnd') return seat[c.a] > 0 && seat[c.a] < n - 1
  if (c.t === 'before') return seat[c.a] < seat[c.b]
  if (c.t === 'justBefore') return directlyAfter(seat[c.a], seat[c.b], n, ring)
  if (c.t === 'adjacent') return gapBetween(seat[c.a], seat[c.b], n, ring) === 1
  if (c.t === 'notAdjacent') return gapBetween(seat[c.a], seat[c.b], n, ring) !== 1
  return gapBetween(seat[c.a], seat[c.b], n, ring) === c.n + 1
}

export function factTrue(f: Fact, seat: number[], ring: boolean): boolean {
  const n = seat.length
  if (f.t === 'at') return seat[f.a] === f.k
  if (f.t === 'before') return seat[f.a] < seat[f.b]
  if (f.t === 'adjacent') return gapBetween(seat[f.a], seat[f.b], n, ring) === 1
  return directlyAfter(seat[f.a], seat[f.b], n, ring)
}

/** All seatings (seat per person) that satisfy every clue, by backtracking over persons. */
export function arrangements(n: number, clues: Clue[], ring: boolean): number[][] {
  const out: number[][] = []
  const seat = new Array<number>(n).fill(-1)
  const taken = new Array<boolean>(n).fill(false)
  const place = (p: number) => {
    if (p === n) {
      if (clues.every((c) => clueTrue(c, seat, ring))) out.push(seat.slice())
      return
    }
    for (let s = 0; s < n; s++) {
      if (taken[s]) continue
      taken[s] = true
      seat[p] = s
      place(p + 1)
      taken[s] = false
    }
    seat[p] = -1
  }
  place(0)
  return out
}
