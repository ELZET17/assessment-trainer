/** Saves all progress as a JSON file: share sheet on touch devices (iPhone/iPad app), download elsewhere. */
import { exportAll } from '../../data/repo'

export type BackupOutcome = { kind: 'shared' | 'downloaded'; summary: string } | { kind: 'cancelled' }

export async function saveBackupFile(prefix = 'assessment-trainer'): Promise<BackupOutcome> {
  const data = await exportAll()
  const name = `${prefix}-${new Date().toISOString().slice(0, 10)}.json`
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })
  const file = new File([blob], name, { type: 'application/json' })
  const summary = `${data.attempts.length} Antworten, ${data.sessions.length} Sitzungen`
  // iPhone/iPad (home-screen app): the share sheet is the reliable way to save or AirDrop the file.
  // On the Mac (no touch) a normal download is more convenient.
  if (navigator.maxTouchPoints > 0 && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Assessment Trainer – Export' })
      return { kind: 'shared', summary }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return { kind: 'cancelled' }
      // e.g. NotAllowedError (user activation expired): fall back to the download below.
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return { kind: 'downloaded', summary }
}
