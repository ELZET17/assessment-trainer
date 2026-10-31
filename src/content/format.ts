import type { Lang } from './types'

const cache = new Map<string, Intl.NumberFormat>()

function formatter(lang: Lang, decimals: number, grouping: boolean): Intl.NumberFormat {
  const key = `${lang}|${decimals}|${grouping}`
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    })
    cache.set(key, f)
  }
  return f
}

/** Locale number with fixed decimals: en "1,234.5", de "1.234,5". */
export function fmt(n: number, lang: Lang, decimals = 0, grouping = true): string {
  const s = formatter(lang, decimals, grouping).format(roundTo(n, decimals))
  return s.replace('-', '−')
}

/** Like fmt but drops trailing zeros up to maxDecimals ("12.5", "12", "12.25"). */
export function fmtAuto(n: number, lang: Lang, maxDecimals = 2): string {
  for (let d = 0; d <= maxDecimals; d++) {
    if (Math.abs(roundTo(n, d) - n) < 1e-9) return fmt(n, lang, d)
  }
  return fmt(n, lang, maxDecimals)
}

export function pct(n: number, lang: Lang, decimals = 0): string {
  return lang === 'de' ? `${fmt(n, lang, decimals)} %` : `${fmt(n, lang, decimals)}%`
}

export function pctAuto(n: number, lang: Lang, maxDecimals = 2): string {
  const s = fmtAuto(n, lang, maxDecimals)
  return lang === 'de' ? `${s} %` : `${s}%`
}

export function signed(s: string, n: number): string {
  return n > 0 ? `+${s}` : s
}

/** Round half away from zero on the decimal representation. */
export function roundTo(x: number, dp: number): number {
  const f = 10 ** dp
  const y = Math.abs(x) * f
  // Guard against binary artefacts like 1.005 * 100 = 100.49999999999999.
  const r = Math.round(y + 1e-12 * Math.max(1, y))
  return (Math.sign(x) * r) / f || 0
}

/** True if x lies (numerically) on a rounding boundary at dp decimals. */
export function onRoundingBoundary(x: number, dp: number): boolean {
  const y = Math.abs(x) * 10 ** dp
  const frac = y - Math.floor(y)
  return Math.abs(frac - 0.5) < 1e-6
}

/** Join list in prose: "A, B and C" / "A, B und C". */
export function joinList(items: string[], lang: Lang): string {
  if (items.length <= 1) return items.join('')
  const and = lang === 'de' ? 'und' : 'and'
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const
