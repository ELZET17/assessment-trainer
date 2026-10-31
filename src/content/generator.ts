import { CATEGORY_BY_ID } from './categories'
import { refKey, type CategoryId, type Difficulty, type Item, type ItemType, type Lang } from './types'

export interface GeneratorDef {
  id: string
  /** Bump on any change that alters generated items (see CLAUDE.md). */
  version: number
  category: CategoryId
  /** German title of the subcategory. */
  title: string
  types: ItemType[]
  generate(seed: number, d: Difficulty, lang: Lang): Item
}

type CoreFields = Pick<Item, 'ref' | 'key' | 'category' | 'sub' | 'difficulty' | 'lang' | 'targetSec' | 'calculator'>

/** Common item fields for a generated item. */
export function core(
  def: Pick<GeneratorDef, 'id' | 'version' | 'category'>,
  seed: number,
  d: Difficulty,
  lang: Lang,
  targetSec?: number,
): CoreFields {
  const ref = { kind: 'gen' as const, gen: def.id, v: def.version, seed: seed >>> 0, d }
  const cat = CATEGORY_BY_ID[def.category]
  return {
    ref,
    key: refKey(ref),
    category: def.category,
    sub: def.id,
    difficulty: d,
    lang,
    targetSec: targetSec ?? cat.targetSec[d],
    calculator: cat.calculator === 'never' ? 'never' : 'allowed',
  }
}

/** Pick by language from a small EN/DE pair. */
export function tr(lang: Lang, en: string, de: string): string {
  return lang === 'de' ? de : en
}
