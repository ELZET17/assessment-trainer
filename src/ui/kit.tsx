/** Small, accessible UI primitives (44×44 pt touch targets). */
import { Fragment, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent hover:brightness-110',
  secondary: 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]',
  ghost: 'bg-transparent text-[var(--accent)] border-transparent hover:bg-[var(--surface-2)]',
  danger: 'bg-[var(--bad)] text-white border-transparent hover:brightness-110',
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${className}`}
    />
  )
}

export function LinkButton({ to, variant = 'secondary', className = '', children }: { to: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-[15px] font-semibold no-underline transition ${VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'ok' | 'bad' | 'warn' | 'accent' }) {
  const t = {
    neutral: 'bg-[var(--surface-2)] text-[var(--muted)]',
    ok: 'bg-[var(--ok-bg)] text-[var(--ok)]',
    bad: 'bg-[var(--bad-bg)] text-[var(--bad)]',
    warn: 'bg-[var(--warn-bg)] text-[var(--warn)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-xl bg-[var(--surface-2)] p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition ${o.value === value ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function PageHeader({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: string | true; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="mb-4 flex items-start gap-2">
      {back && (
        <button type="button" aria-label="Zurück" onClick={() => (back === true ? nav(-1) : nav(back))} className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[var(--accent)] hover:bg-[var(--surface-2)]">
          <Icon name="back" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl leading-tight font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="muted mt-1 text-sm">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card p-3">
      <div className="muted text-xs font-semibold tracking-wide uppercase">{label}</div>
      <div className="tabnums mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="muted mt-0.5 text-xs">{sub}</div>}
    </div>
  )
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
      <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${v}%` }} />
    </div>
  )
}

/** Renders **bold** and line breaks without dangerouslySetInnerHTML. */
export function Rich({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <Fragment key={j}>{part}</Fragment>))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}

export function Confirm({ open, title, body, confirmLabel, onConfirm, onCancel, danger }: { open: boolean; title: string; body: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onCancel}>
      <div ref={ref} tabIndex={-1} role="alertdialog" aria-modal="true" aria-label={title} className="card safe-bottom w-full max-w-md p-5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="muted mt-2 text-[15px]">{body}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel}>Abbrechen</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

const ICONS: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  practice: 'M4 5h16v4H4zM4 11h10v4H4zM4 17h13v3H4z',
  test: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 3',
  stats: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  academy: 'M2 8l10-5 10 5-10 5zM6 10.5V16c3 2 9 2 12 0v-5.5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-3 2-1-2-4-2 .5a7 7 0 0 0-1.6-1L16 4h-4l-.4 2.5a7 7 0 0 0-1.6 1L8 7 6 11l2 1v0l-2 1 2 4 2-.5a7 7 0 0 0 1.6 1L12 20h4l.4-2.5a7 7 0 0 0 1.6-1L20 17l2-4z',
  back: 'M15 5l-7 7 7 7',
  book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',
  check: 'M5 12l5 5L20 7',
  x: 'M6 6l12 12M18 6 6 18',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  flame: 'M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-6 6-6 9-1-1-2-2-2-4-2 2-2 4-2 6 0 5 4 8 8 8z',
  calc: 'M6 3h12v18H6zM9 7h6M9 12h1M14 12h1M9 16h1M14 16h1',
  clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  grid: 'M4 4h16v16H4zM4 12h16M12 4v16',
}

export function Icon({ name, size = 22 }: { name: keyof typeof ICONS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ''} />
    </svg>
  )
}

export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function pctText(v: number | null, digits = 0): string {
  return v === null ? '–' : `${v.toFixed(digits).replace('.', ',')} %`
}
