/**
 * Seeded randomness. Every generated item is a pure function of
 * (generatorId, version, seed, difficulty), so all randomness must flow
 * through an Rng created here – never Math.random().
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number
  /** Uniform integer in [min, max] (inclusive). */
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
  /** k distinct elements in random order. */
  sample<T>(items: readonly T[], k: number): T[]
  chance(p: number): boolean
  /** Independent child stream; the same label always yields the same stream. */
  fork(label: string | number): Rng
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a 32-bit hash, used to derive seeds from strings. */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function deriveSeed(seed: number, ...parts: (string | number)[]): number {
  return hashString(`${seed >>> 0}|${parts.join('|')}`)
}

export function createRng(seed: number): Rng {
  const next = mulberry32(seed)
  const rng: Rng = {
    next,
    int(min, max) {
      if (max < min) throw new Error(`rng.int: empty range ${min}..${max}`)
      return min + Math.floor(next() * (max - min + 1))
    },
    pick(items) {
      if (items.length === 0) throw new Error('rng.pick: empty list')
      return items[Math.floor(next() * items.length)]
    },
    shuffle(items) {
      const out = items.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    sample(items, k) {
      if (k > items.length) throw new Error('rng.sample: k too large')
      return rng.shuffle(items).slice(0, k)
    },
    chance(p) {
      return next() < p
    },
    fork(label) {
      return createRng(deriveSeed(seed, 'fork', label))
    },
  }
  return rng
}

/** Random 32-bit seed for new items (UI only – content code receives seeds). */
export function randomSeed(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]
}
