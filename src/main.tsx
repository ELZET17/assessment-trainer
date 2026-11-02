import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { applyTheme, useSettings } from './state/settings'

applyTheme('system')
void useSettings.getState().load()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Updates (e.g. a corrected explanation) are applied as soon as no test or training is running:
  // immediately on non-run pages, otherwise at the next navigation away from the run.
  const busy = () => /^#\/(run|sim\/run|sprint\/run)/.test(window.location.hash)
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      const apply = () => {
        if (busy()) return
        window.removeEventListener('hashchange', apply)
        void updateSW(true)
      }
      window.addEventListener('hashchange', apply)
      apply()
    },
    onRegisteredSW(_url, reg) {
      // Installed apps stay open for days: look for a new version every hour and when brought to the front.
      if (!reg) return
      setInterval(() => void reg.update(), 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void reg.update())
    },
  })
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
