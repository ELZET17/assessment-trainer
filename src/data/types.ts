import type { Answer, CategoryId, Difficulty, ItemRef, Lang } from '../content/types'

export type Mode = 'training' | 'drill' | 'simulation' | 'mistakes' | 'quick' | 'sprint' | 'game'

export interface Attempt {
  id: string
  /** Epoch ms when the answer was given (or the item expired). */
  ts: number
  /** Local calendar day YYYY-MM-DD (for streaks and trends). */
  day: string
  itemKey: string
  ref: ItemRef
  category: CategoryId
  sub: string
  difficulty: Difficulty
  mode: Mode
  sessionId: string
  /** false = skipped or time ran out. */
  answered: boolean
  correct: boolean
  /** 0..1 partial credit (Grid Challenge); equals correct ? 1 : 0 otherwise. */
  credit: number
  /** Points under the simulation's scoring scheme (e.g. +5 / −1 / 0). */
  points?: number
  timeMs: number
  targetSec: number
  lang: Lang
  answer?: Answer
  /** Position within its session (simulation order: section × 1000 + index). */
  seq?: number
}

export interface SessionSection {
  id: string
  title: string
  planned: number | null
  timeLimitSec: number | null
}

export interface Session {
  id: string
  mode: Mode
  title: string
  startedAt: number
  endedAt?: number
  status: 'running' | 'finished' | 'aborted'
  profileId?: string
  category?: CategoryId
  sub?: string
  difficulty?: Difficulty | 'adaptive'
  sections?: SessionSection[]
}

export type ThemePref = 'system' | 'light' | 'dark'

export interface Settings {
  id: 'settings'
  itemLang: Lang
  theme: ThemePref
  calculatorDefault: boolean
  sound: boolean
  haptics: boolean
  targetAccuracy: number
  /** Speed math in training: multiple choice or free-text input. */
  speedInput: 'mcq' | 'free'
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  itemLang: 'en',
  theme: 'system',
  calculatorDefault: true,
  sound: false,
  haptics: true,
  targetAccuracy: 80,
  speedInput: 'mcq',
}

export interface ExportFile {
  app: 'assessment-trainer'
  format: 1
  schemaVersion: number
  exportedAt: string
  attempts: Attempt[]
  sessions: Session[]
  settings: Settings | null
}
