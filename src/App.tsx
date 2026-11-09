import type { ComponentType } from 'react'
import { useState } from 'react'
import { createHashRouter, RouterProvider, useLocation, useRouteError } from 'react-router'
import { saveBackupFile } from './features/settings/backupFile'
import { AcademyIndex, LessonPage } from './features/academy/Academy'
import Home from './features/home/Home'
import Mistakes from './features/mistakes/Mistakes'
import { CategoryPage, PracticeIndex } from './features/practice/Practice'
import RenderItem from './features/render/RenderItem'
import DrillRunner from './features/run/DrillRunner'
import { GameRun, SprintRun, SprintSetup } from './features/run/SprintAndGame'
import TrainingRunner from './features/run/TrainingRunner'
import Settings from './features/settings/Settings'
import { SimIndex, SimIntro, SimResult } from './features/sim/SimPages'
import SimRunner from './features/sim/SimRunner'
import Stats from './features/stats/Stats'
import Layout from './ui/Layout'

/** Remount session runners when only the query string changes (new session). */
function Fresh({ C }: { C: ComponentType }) {
  const loc = useLocation()
  return <C key={loc.pathname + loc.search} />
}

/**
 * Shown instead of a white screen if a page throws (e.g. unexpected stored data).
 * Inside the layout the navigation stays usable; in any case a backup can be saved
 * here – in the installed app there is no address bar to escape to.
 */
function ErrorPage() {
  const error = useRouteError()
  const [msg, setMsg] = useState<string | null>(null)
  const backup = async () => {
    try {
      const r = await saveBackupFile('assessment-trainer-sicherung')
      if (r.kind !== 'cancelled') setMsg(r.kind === 'shared' ? 'Sicherung geteilt.' : 'Sicherung als Download angeboten.')
    } catch {
      setMsg('Sicherung nicht möglich.')
    }
  }
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-xl font-bold">Hier ist etwas schiefgegangen</h1>
      <p className="muted mb-4 text-sm">{error instanceof Error ? error.message : 'Unbekannter Fehler.'} Deine gespeicherten Daten sind davon nicht betroffen.</p>
      <div className="flex flex-wrap gap-2">
        <a className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-contrast)]" href="#/">
          Zur Startseite
        </a>
        <a className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-4 font-semibold" href="#/settings">
          Einstellungen
        </a>
        <button type="button" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-4 font-semibold" onClick={() => void backup()}>
          Daten sichern (JSON)
        </button>
      </div>
      {msg && (
        <p role="status" className="muted mt-3 text-sm">
          {msg}
        </p>
      )}
    </div>
  )
}

const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        // Errors of a single page render inside the layout, so the navigation keeps working.
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home /> },
          { path: 'practice', element: <PracticeIndex /> },
          { path: 'practice/:cat', element: <CategoryPage /> },
          { path: 'run/drill', element: <Fresh C={DrillRunner} /> },
          { path: 'run/game/:game', element: <Fresh C={GameRun} /> },
          { path: 'run/:kind', element: <Fresh C={TrainingRunner} /> },
          { path: 'sim', element: <SimIndex /> },
          { path: 'sim/run/:profileId', element: <Fresh C={SimRunner} /> },
          { path: 'sim/result/:sessionId', element: <SimResult /> },
          { path: 'sim/:profileId', element: <SimIntro /> },
          { path: 'sprint', element: <SprintSetup /> },
          { path: 'sprint/run', element: <Fresh C={SprintRun} /> },
          { path: 'stats', element: <Stats /> },
          { path: 'mistakes', element: <Mistakes /> },
          { path: 'academy', element: <AcademyIndex /> },
          { path: 'academy/:lessonId', element: <LessonPage /> },
          { path: 'settings', element: <Settings /> },
          // QA route for blind-solving screenshots (scripts/blind-export.ts); not part of the production app.
          ...(import.meta.env.DEV ? [{ path: 'render/:key', element: <RenderItem /> }] : []),
          { path: '*', element: <Home /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
