import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { applyTheme, useSettings } from './state/settings'

applyTheme('system')
void useSettings.getState().load()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
