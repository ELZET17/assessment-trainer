import type { PublicItem } from '../types'
import { fail, type Validation } from './result'
import { validateAon } from './aon'
import { validateDeductive } from './deductive'
import { validateDiagrammatic } from './diagrammatic'
import { validateInductive } from './inductive'
import { validateInteractive } from './interactive'
import { validateNumerical } from './numerical'
import { validateSpeed } from './speed'

/** Dispatch to the independent validator of the item's category. */
export function validate(item: PublicItem): Validation {
  try {
    switch (item.category) {
      case 'speed':
        return validateSpeed(item)
      case 'numerical':
        return validateNumerical(item)
      case 'deductive':
        return validateDeductive(item)
      case 'inductive':
        return validateInductive(item)
      case 'diagrammatic':
        return validateDiagrammatic(item)
      case 'aon':
        return validateAon(item)
      case 'interactive':
        return validateInteractive(item)
      default:
        return fail(`no validator for category ${item.category}`)
    }
  } catch (e) {
    return fail(`validator crashed: ${(e as Error).message}`)
  }
}
