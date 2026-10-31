/**
 * Verbal Reasoning bank – original business passages written for this app.
 * Answers: T = follows from the text, F = contradicted by the text,
 * C = the text does not say (Cannot say). Every statement was solved blind in Gate 3.
 */
import type { VerbalPassage } from './types'
import { VERBAL_1 } from './verbal1'
import { VERBAL_2 } from './verbal2'
import { VERBAL_3 } from './verbal3'
import { VERBAL_4 } from './verbal4'

export const VERBAL: VerbalPassage[] = [...VERBAL_1, ...VERBAL_2, ...VERBAL_3, ...VERBAL_4]
