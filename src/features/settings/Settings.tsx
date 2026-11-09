import { useRef, useState } from 'react'
import { importMerge, ImportError, resetAll } from '../../data/repo'
import { saveBackupFile } from './backupFile'
import { useSettings } from '../../state/settings'
import { Button, Card, Confirm, PageHeader, Segmented } from '../../ui/kit'

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint && <span className="muted block text-xs">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
    </label>
  )
}

export default function Settings() {
  const { settings, update } = useSettings()
  const [msg, setMsg] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const doExport = async () => {
    const r = await saveBackupFile()
    if (r.kind === 'shared') setMsg(`Export geteilt: ${r.summary}.`)
    else if (r.kind === 'downloaded') setMsg(`Export erstellt: ${r.summary}.`)
  }

  const doImport = async (f: File) => {
    try {
      const json = JSON.parse(await f.text())
      const r = await importMerge(json)
      await useSettings.getState().load()
      setMsg(`Import zusammengeführt: ${r.addedAttempts} neue Antworten, ${r.skippedAttempts} bereits vorhanden, ${r.addedSessions} neue Sitzungen${r.invalidAttempts ? `, ${r.invalidAttempts} ungültige Einträge übersprungen` : ''}.`)
    } catch (e) {
      setMsg(e instanceof ImportError ? e.message : 'Die Datei konnte nicht gelesen werden.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Einstellungen" />
      <Card className="mb-4 space-y-4">
        <div>
          <div className="mb-1.5 text-sm font-semibold">Sprache der Aufgaben</div>
          <Segmented label="Sprache der Aufgaben" value={settings.itemLang} onChange={(v) => void update({ itemLang: v })} options={[{ value: 'en', label: 'Englisch' }, { value: 'de', label: 'Deutsch' }]} />
          <p className="muted mt-1 text-xs">Erklärungen und Akademie sind immer auf Deutsch. Gibt es eine Aufgabe nicht auf Deutsch, erscheint sie auf Englisch. Zahlen- und Figurenaufgaben sind sprachneutral.</p>
        </div>
        <div>
          <div className="mb-1.5 text-sm font-semibold">Darstellung</div>
          <Segmented label="Darstellung" value={settings.theme} onChange={(v) => void update({ theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Hell' }, { value: 'dark', label: 'Dunkel' }]} />
        </div>
        <div>
          <div className="mb-1.5 text-sm font-semibold">Kopfrechnen im Training</div>
          <Segmented label="Kopfrechnen im Training" value={settings.speedInput} onChange={(v) => void update({ speedInput: v })} options={[{ value: 'mcq', label: 'Multiple Choice' }, { value: 'free', label: 'Freie Eingabe' }]} />
        </div>
        <Toggle label="Taschenrechner standardmäßig öffnen" hint="Nur bei Aufgaben, in denen er erlaubt ist." checked={settings.calculatorDefault} onChange={(v) => void update({ calculatorDefault: v })} />
        <Toggle label="Ton" checked={settings.sound} onChange={(v) => void update({ sound: v })} />
        <Toggle label="Vibration" hint="Auf dem iPhone unterstützt Safari keine Vibration." checked={settings.haptics} onChange={(v) => void update({ haptics: v })} />
        <div>
          <label htmlFor="target" className="mb-1.5 block text-sm font-semibold">
            Ziel-Trefferquote: {settings.targetAccuracy} %
          </label>
          <input id="target" type="range" min={50} max={100} step={5} value={settings.targetAccuracy} onChange={(e) => void update({ targetAccuracy: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        </div>
      </Card>

      <Card className="mb-4 space-y-3">
        <h2 className="text-lg font-bold">Daten &amp; Abgleich</h2>
        <p className="muted text-sm">Dein Fortschritt liegt nur lokal auf diesem Gerät. Zum Abgleich zwischen Mac und iPhone: hier exportieren, Datei übertragen (z. B. AirDrop), auf dem anderen Gerät importieren. Der Import führt zusammen und überschreibt nichts.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => void doExport()}>
            Exportieren (JSON)
          </Button>
          <Button onClick={() => file.current?.click()}>Importieren …</Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Exportdatei auswählen"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void doImport(f)
              e.target.value = ''
            }}
          />
        </div>
        {msg && (
          <p role="status" className="rounded-xl bg-[var(--accent-soft)] p-3 text-sm">
            {msg}
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-bold">Zurücksetzen</h2>
        <p className="muted text-sm">Löscht alle Antworten, Sitzungen und Einstellungen auf diesem Gerät.</p>
        <Button variant="danger" onClick={() => setConfirm(true)}>
          Alle Daten zurücksetzen
        </Button>
      </Card>
      <Confirm
        open={confirm}
        title="Wirklich alle Daten löschen?"
        body="Das kann nicht rückgängig gemacht werden. Tipp: vorher exportieren."
        confirmLabel="Alles löschen"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          void resetAll().then(() => {
            void useSettings.getState().load()
            setMsg('Alle Daten wurden gelöscht.')
          })
        }}
      />
      <p className="muted mt-6 text-xs">Assessment Trainer · keine Logins, kein Tracking, keine Server. Aufgaben sind Originale, generiert und unabhängig geprüft.</p>
    </div>
  )
}
