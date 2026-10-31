import { create } from 'zustand'
import { loadSettings, storeSettings } from '../data/repo'
import { DEFAULT_SETTINGS, type Settings } from '../data/types'

interface SettingsState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<Settings>) => Promise<void>
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  async load() {
    const s = await loadSettings()
    set({ settings: s, loaded: true })
    applyTheme(s.theme)
  },
  async update(patch) {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    applyTheme(next.theme)
    await storeSettings(next)
  },
}))

const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

export function applyTheme(pref: Settings['theme']): void {
  if (typeof document === 'undefined') return
  const dark = pref === 'dark' || (pref === 'system' && !!media?.matches)
  document.documentElement.classList.toggle('dark', dark)
  const meta = document.querySelectorAll('meta[name="theme-color"]')
  meta.forEach((m) => m.setAttribute('content', dark ? '#0b1220' : '#f5f7fa'))
}

media?.addEventListener('change', () => applyTheme(useSettings.getState().settings.theme))
