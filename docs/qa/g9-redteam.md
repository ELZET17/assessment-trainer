# Gate 9 – Red-Team-Bericht (Assessment Trainer)

**Szenarien getestet: 12. Befunde: 21 (kritisch: 1, mittel: 5, gering: 15)**

Geprüft vom Red-Team-Subagent gegen Commit `249f132` (Production-Preview, neu gebaut am 09.11.2026), 194 Einzelprüfungen, fast alle auf WebKit iPhone 393×852 (Touch) und WebKit Desktop 1440×900, Offline zusätzlich Chromium. Skripte, JSON-Ergebnisse, Logs und Screenshots: `gate-output/g9/`. (Der Subagent durfte keine Dateien schreiben; dieser Bericht wurde aus seiner Rückmeldung übernommen und um die Nachprüfung ergänzt.)

## Kritisch

- **K1 – Drill: Antwort kurz vor Zeitablauf speichert doppelte bzw. widersprüchliche Attempts** (`s02b-drill-race.ts`, `s02-timers.ts` 2a, `s03-background.ts` 3d). In 1–4 von 4 Läufen je Offset 4–5 Attempts für 3 Aufgaben. Ursache: `busy` wurde vor dem Commit des Re-Renders zurückgesetzt, ein veralteter Effekt rief `end()` erneut auf.

## Mittel

- **M1 – Drill: Doppeltipp beantwortet auch die nächste Frage** (`s01-fastclicks.ts` 1g, 1i).
- **M2 – Drill-Abbruchdialog: zwei Buttons „Abbrechen“** (`s05c-back-clean.ts`).
- **M3 – Reload während einer Simulation: Neustart mit vollem Timer, kein Fortsetzen, verwaiste Sitzung ohne Ergebnisanzeige, keine Warnung** (`s03-background.ts` 3b, 3b2; Drill analog 3c).
- **M4 – Taschenrechner im iPhone-Querformat ragt aus dem Bildschirm, ✕ nicht erreichbar, verdeckt Timer und Tabelle** (`s04b-order-calc.ts` 4c).
- **M5 – Ziffern bei fokussiertem Taschenrechner beantworten die Frage** (`s09-keyboard.ts` 9c).

## Gering

G1 ungültige Deeplink-Parameter (`cat=foo`, `n=abc`, `sub=nope`) · G2 unbekannte Ergebnis-ID lädt endlos · G3 Sprint `sec=abc` zeigt NaN · G4 `#/run/game/foo` leer, ungültiges `d` · G5 P&G: Kopf-Timer läuft auf dem Spiel-Intro rot auf 0:00 · G6 BCG/Kearney: Doppeltipp auf „Weiter“ überspringt eine Frage · G7 Quick-Set: doppeltes „Weiter“ überspringt Plan-Items · G8 verwaiste Sitzungen mit Status `running` · G9 Import prüft `sessions[].sections` nicht · G10 Import übernimmt `settings` ungeprüft · G11 Import prüft `format`/`schemaVersion`-Typ nicht · G12 Rechner-Standard wirkt im Drill nicht · G13 zwei schnelle Einstellungsänderungen + Reload < 300 ms verlieren in Chromium die letzte Änderung · G14 Dev-Server (StrictMode) legt 2 Sitzungen pro Drill/Sprint an · G15 kein Einstellungs-Abgleich zwischen Tabs.

## Bestanden (Auszug)

Schnelle Klicks im Training, doppelter Sim-Start, Timer-Wechsel und Ablauf (inkl. Kearney-Gesamttimer, Digit, Sprint), Hintergrund 3 Min., Rotation mit Drag-Widgets, Zurück/Vor mit Blockern, leere Datenbank, **10.000 Attempts: Start 66 ms, Statistik ≤ 54 ms, Fehlerheft ≤ 309 ms, kein Freeze; 100.000 importierte Attempts: Statistik 568 ms**, Import-Angriffe (ungültige Dateien, Doppelimport, Prototype-Pollution, XSS-Strings inert), Tastatur, **Offline: 19/19 Routen kalt neu geladen** (WebKit + Chromium), Einstellungen, keine Konsolenfehler.

## Nachprüfung nach den Korrekturen (09.11.2026)

| Befund | Korrektur | Nachweis |
|---|---|---|
| K1 | Drill mit synchronem `ending`-Ref, Ergebnis-Ref und deterministischen IDs (Session + Position) | `s02b-drill-race.ts` erneut: **0/48 Läufe** mit doppelten/zusätzlichen Attempts; E2E „Antwort genau am Zeitlimit“ |
| M1, G6, G7 | 350 ms Eingabesperre nach Fragenwechsel (Drill, Simulation), Wiedereintrittssperre im Training | `s01-fastclicks.ts` 1g, 1i, 1k: PASS; E2E „Doppeltipp“ |
| M2 | Buttons „Weiter üben“ / „Drill abbrechen“ (Simulation: „Weiter im Test“, Spiel: „Weiter spielen“) | Code |
| M3, G8 | Warnung beim Neuladen/Schließen während Drill und Simulation; liegen gebliebene laufende Sitzungen werden beim nächsten Start als „abgebrochen“ geschlossen und erscheinen mit Teilergebnis in der Historie; Antworten waren bereits sofort gespeichert. Ein Fortsetzen ist bewusst nicht vorgesehen (D18). | Code, E2E „überlebt Reload“ |
| M4 | Rechner im Querformat unterhalb der Kopfzeile, begrenzte Höhe, scrollbar | E2E „Querformat: ✕ und Timer sichtbar“ |
| M5 | Rechner nimmt Tastatureingaben selbst an (Fokus im Panel, auch in Safari), Shortcuts ignorieren ihn | E2E „Ziffern gehen in den Rechner“ |
| G1–G4 | Deeplink-Parameter werden validiert (Fallback auf Standardwerte), unbekannte Ergebnis-ID mit Hinweis | Code |
| G5 | Spielabschnitt zeigt keinen Kopf-Timer vor dem Start | Code |
| G9–G11 | Import prüft Abschnitte, Format, Schema-Version; Einstellungen nur bekannte Felder mit gültigen Werten | Unit-Tests Import |
| G12 | Rechner-Standard im Drill | Code |
| G13–G15 | nicht behoben (Randfälle: Reload < 300 ms nach Einstellungsänderung in Chromium, StrictMode nur im Dev-Server, mehrere Tabs) – als bekannte Einschränkung dokumentiert | – |

Testartefakt (kein Befund): „1j2 back after double start“ – die vorherige History-Seite stammte von `page.goto`; mit sauberer History funktioniert der Blocker (`s05c`).
