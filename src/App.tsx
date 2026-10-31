import type { ComponentType } from 'react'
import { createHashRouter, RouterProvider, useLocation } from 'react-router'
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

const router = createHashRouter([
  {
    element: <Layout />,
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
      { path: 'render/:key', element: <RenderItem /> },
      { path: '*', element: <Home /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
