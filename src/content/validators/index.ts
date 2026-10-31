import type { PublicItem } from '../types'
import { fail, type Validation } from './result'
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
      default:
        return fail(`no validator for category ${item.category}`)
    }
  } catch (e) {
    return fail(`validator crashed: ${(e as Error).message}`)
  }
}
