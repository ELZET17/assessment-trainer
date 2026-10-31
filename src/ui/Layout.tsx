import { NavLink, Outlet, useLocation } from 'react-router'
import { Icon } from './kit'

type NavItem = { to: string; label: string; icon: string; end?: boolean }

const NAV: NavItem[] = [
  { to: '/', label: 'Start', icon: 'home', end: true },
  { to: '/practice', label: 'Üben', icon: 'practice' },
  { to: '/sim', label: 'Tests', icon: 'test' },
  { to: '/stats', label: 'Statistik', icon: 'stats' },
  { to: '/academy', label: 'Akademie', icon: 'academy' },
]

const DESKTOP_EXTRA: NavItem[] = [
  { to: '/mistakes', label: 'Fehlerheft', icon: 'book' },
  { to: '/settings', label: 'Einstellungen', icon: 'settings' },
]

/** Full-screen routes (sessions) hide the navigation to keep focus. */
const FOCUS = [/^\/run\//, /^\/sim\/run\//, /^\/sprint\/run/, /^\/render\//]

export default function Layout() {
  const loc = useLocation()
  const focus = FOCUS.some((r) => r.test(loc.pathname))
  return (
    <div className="min-h-full lg:flex">
      {!focus && (
        <nav aria-label="Hauptnavigation" className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[var(--surface)] lg:p-4">
          <div className="mb-6 px-2">
            <div className="text-lg font-bold">Assessment Trainer</div>
            <div className="muted text-xs">Kognitive Online-Tests</div>
          </div>
          {[...NAV, ...DESKTOP_EXTRA].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold no-underline ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}>
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>
      )}
      <main className={`safe-top mx-auto w-full min-w-0 px-4 pt-4 ${focus ? 'max-w-[1400px] pb-6' : 'max-w-6xl pb-28 lg:pb-10'} lg:px-8 lg:pt-8`}>
        <Outlet />
      </main>
      {!focus && (
        <nav aria-label="Hauptnavigation" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold no-underline ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                <Icon name={n.icon} size={22} />
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
