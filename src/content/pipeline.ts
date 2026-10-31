import { createRng, deriveSeed, type Rng } from './rng'

/**
 * Deterministic retry loop: attempt i uses an Rng derived from (seed, i).
 * `build` returns null to reject a candidate (e.g. ugly numbers or an
 * ambiguity found by the validator filter, see docs/decisions.md D11).
 */
export function firstAccepted<T>(seed: number, build: (rng: Rng, attempt: number) => T | null, maxAttempts = 400): T {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rng = createRng(attempt === 0 ? seed : deriveSeed(seed, 'retry', attempt))
    const out = build(rng, attempt)
    if (out !== null) return out
  }
  throw new Error(`firstAccepted: no candidate accepted for seed ${seed}`)
}
