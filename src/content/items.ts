/** Unified access to generated and bank items. */
import { criticalItem, verbalItem } from './banks'
import type { CriticalType, VerbalTrap } from './banks/types'
import { getGenerator, GENERATORS } from './registry'
import { toPublic, type CategoryId, type Item, type ItemRef, type Lang } from './types'

/**
 * What a candidate sees, independent of seed and ids: two different seeds can produce
 * the same task (small domains such as squares at level 1) – this key catches that.
 */
export function contentKey(item: Item): string {
  const pub = toPublic(item) as unknown as Record<string, unknown>
  for (const k of ['ref', 'key', 'query']) delete pub[k]
  return `c:${JSON.stringify(pub)}`
}

/** Can this stored reference still be reproduced exactly (same generator version)? */
export function isReproducible(ref: ItemRef): boolean {
  return ref.kind === 'bank' || getGenerator(ref.gen)?.version === ref.v
}

export function resolveItem(ref: ItemRef, lang: Lang): Item | null {
  if (ref.kind === 'gen') {
    const g = getGenerator(ref.gen)
    // A different generator version would produce a different item for the same seed – never substitute it.
    return g && g.version === ref.v ? g.generate(ref.seed, ref.d, lang) : null
  }
  return ref.bank === 'verbal' ? verbalItem(ref.id, lang) : criticalItem(ref.id, lang)
}

const VERBAL_SUBS: Record<VerbalTrap, string> = {
  'prior-knowledge': 'Falle: Vorwissen',
  'some-all': 'Falle: einige vs. alle',
  causation: 'Falle: Kausalität',
  temporal: 'Falle: Zeitbezug',
  paraphrase: 'Umformulierungen',
  negation: 'Verneinungen',
  comparison: 'Vergleiche',
  quantity: 'Zahlen & Mengen',
  none: 'Direkter Textabgleich',
}

const CRITICAL_SUBS: Record<CriticalType, string> = {
  inference: 'Inference (Schlussfolgerung)',
  assumption: 'Recognition of Assumptions',
  deduction: 'Deduction',
  interpretation: 'Interpretation',
  evaluation: 'Evaluation of Arguments',
}

export function subTitle(sub: string): string {
  const g = getGenerator(sub)
  if (g) return g.title
  if (sub.startsWith('verbal.')) return VERBAL_SUBS[sub.slice(7) as VerbalTrap] ?? sub
  if (sub.startsWith('critical.')) return CRITICAL_SUBS[sub.slice(9) as CriticalType] ?? sub
  return sub
}

/** Subcategories offered for a category (generators or bank subtypes). */
export function subsOf(category: CategoryId): { id: string; title: string }[] {
  if (category === 'verbal') return Object.entries(VERBAL_SUBS).map(([k, t]) => ({ id: `verbal.${k}`, title: t }))
  if (category === 'critical') return Object.entries(CRITICAL_SUBS).map(([k, t]) => ({ id: `critical.${k}`, title: t }))
  return GENERATORS.filter((g) => g.category === category).map((g) => ({ id: g.id, title: g.title }))
}
