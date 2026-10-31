# Assessment Trainer – Projektleitfaden für Claude

## Ziel
Offline-fähige PWA zum Training kognitiver Online-Tests (Bain, BCG, Kearney, P&G, Allianz, Deutsche Bank). Läuft als Safari-Dock-App auf dem Mac und als Homescreen-App auf dem iPhone. UI, Erklärungen und Akademie auf Deutsch, Aufgaben standardmäßig Englisch (umschaltbar). **Eine falsche Musterlösung ist ein kritischer Fehler.**

Separates Projekt – das McKinsey-Solve-Projekt des Nutzers nie anfassen.

## Umgebung
- Repo: `~/Developer/assessment-trainer` (Symlink aus `Assessment Trainer/assessment-trainer` (Projektordner des Nutzers)). Grund: `:` im Originalpfad bricht npm (docs/decisions.md D3).
- Node/npm/gh liegen in `~/.local/node/bin` und `~/.local/bin` → jedem Shell-Befehl voranstellen:
  `export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"`

## Befehle
| Zweck | Befehl |
|---|---|
| Entwicklung | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit-Tests | `npm test` |
| Content-Gate (≥ 2.000 Items je Generator × Stufe) | `npm run test:content` |
| E2E (WebKit iPhone + Desktop) | `npm run test:e2e` |
| Screenshots Gate 6 | `npm run gate:screens` |
| Blind-Export Gate 3 | `npm run gate:blind` |
| Build | `npm run build` |
| Lighthouse | `npm run lighthouse` |
| Deploy | Push auf `main` → GitHub Actions → GitHub Pages (nur bei grünen Tests) |

## Architektur
- `src/content/` – reine Logik, kein React:
  - `rng.ts` (mulberry32), `types.ts` (Item-Modell), `registry.ts` (alle Generatoren), `check.ts` (Antwortprüfung)
  - `generators/<kategorie>/` – erzeugt Aufgabe + Schlüssel + deutsche Erklärung aus `(generatorId, version, seed, difficulty)`
  - `validators/<kategorie>/` – **unabhängiger** Löser, liest nur Stimulus + strukturierte Frage + Optionen, nie den Schlüssel
  - `banks/verbal`, `banks/critical` – handgeschriebene Items (Originaltexte)
  - `academy/` – Lektionen, `profiles.ts` – Test-Simulationsprofile (alle Parameter konfigurierbar)
- `src/data/` – Dexie-DB (Schema-Version + Migrationen), Export/Import, Statistik-Selektoren (alles aus `attempts` berechnet)
- `src/ui/` – SVG-Charts, Figuren, Antwort-Widgets, Rechner, Layout
- `src/features/` – Seiten: Home, Üben (Training/Drill), Simulation, Fehlerheft, Quick-Set, Sprint, Spiele, Statistik, Akademie, Einstellungen
- `tests/content/` – Property-Tests Generator vs. Validator; `e2e/` – Playwright

## Content-Qualitätsregeln (nicht verhandelbar)
1. Genau eine richtige Antwort pro MC-Item (Digit Challenge: jede gültige Lösung zählt). Automatisch geprüft.
2. Generator und Validator unabhängig implementiert; Abweichung = Test rot.
3. Numerik: Rundung explizit in der Frage; Optionen so weit auseinander, dass Rundung nie zwei Optionen richtig macht; Distraktoren aus realistischen Denkfehlern.
4. Muster-Items: Validator prüft Bibliothek alternativer einfacher Regeln; mehrdeutig → verwerfen, neu generieren.
5. Werte, die exakt gebraucht werden, stehen als Beschriftung im Diagramm/der Tabelle. Nie Pixel-Ablesen.
6. Erklärungen korrekt, Schritt für Schritt mit den echten Zahlen, mit Zeitspar-Trick.
7. Nur Originalaufgaben, nichts aus Prep-Material kopieren.
8. Schwierigkeit kalibriert (Speed Math ~20–25 s, Numerical ~60–80 s auf Test-Niveau).
- Jede Änderung an einem Generator erhöht dessen `version`, damit alte Fehlerheft-Einträge reproduzierbar bleiben (alte Version bleibt registriert, solange Attempts darauf zeigen – oder Migration).

## Definition of Done (Prüf-Gates, Belege in docs/qa-report.md)
1. Traceability: jede Anforderung → Umsetzung → Test → Status, keine offene Zeile.
2. Korrektheit: je Generator × Stufe ≥ 2.000 Items gegen Validator, 0 Abweichungen; Determinismus.
3. Blind-Lösen durch frischen Subagent (≥ 15 Items je Kategorie × Stufe, alle Bank-Items).
4. Didaktik: Akademie + 50 Erklärungen fachlich geprüft.
5. Realismus: Profile vs. docs/research.md.
6. UX: Screenshots iPhone 393×852 (WebKit) + Desktop 1440×900, hell + dunkel, selbst gesichtet.
7. Technik: tsc, ESLint, alle Tests grün; Build; Lighthouse Perf ≥ 90, A11y ≥ 95, BP ≥ 95; installierbar; offline.
8. Daten: 7/10 → 70 %; Persistenz; Export/Reset/Import identisch; kein Duplikat bei Doppelimport; Migration v1→v2.
9. Red Team (Subagent) + Regressionstests.
10. Code-Review (Subagent).
Rotes Gate → Ursache beheben → alle betroffenen Gates erneut. Erst wenn alle grün: Traceability ein letztes Mal.

## Konventionen
- TypeScript strict, keine `any`. Kein `dangerouslySetInnerHTML`. Keine externen Requests zur Laufzeit, kein Tracking.
- Erklärungen/Texte für den Nutzer auf Deutsch, Code-Bezeichner Englisch.
- Kleine, sinnvolle Commits.
