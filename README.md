# Assessment Trainer

Offline-fähige Übungs-App (PWA) für die kognitiven Online-Tests von Bain, BCG, Kearney, P&G, Allianz und Deutsche Bank. Läuft im Browser, als App im Mac-Dock (Safari) und auf dem iPhone-Homescreen – ohne Konto, ohne Server, ohne Tracking. Alle Daten bleiben lokal im Browser (IndexedDB) und lassen sich als JSON sichern.

**Live:** https://ELZET17.github.io/assessment-trainer/ · **Installation:** [docs/INSTALL.md](docs/INSTALL.md)

## Inhalte

| Kategorie | Was geübt wird |
|---|---|
| A Numerical Reasoning | Tabellen und Diagramme: Prozent, Prozentpunkte, Anteile, Verhältnisse, Wechselkurse, Durchschnitte, CAGR, Index, Hochrechnung |
| B Speed Math / Kopfrechnen | Kopfrechnen ohne Rechner, Prozent, Brüche, Überschlag, Dreisatz, Zahlenreihen, Gleichungen; Kopfrechen-Sprint mit freier Eingabe |
| C Inductive Reasoning | Figurenreihen, 3×3-Matrizen, Odd one out |
| D Deductive Reasoning | Syllogismen, Reihenfolgen, Sitzordnungen, Wenn-dann-Regeln, Wahr/Falsch/Nicht bestimmbar |
| E Verbal Reasoning | 40 Texte (15 auch auf Deutsch), 160 Aussagen – Wahr/Falsch/Nicht bestimmbar |
| F Critical Thinking | 60 Aufgaben im Watson-Glaser-Stil |
| G Diagrammatic Reasoning | Flussdiagramme mit Operatoren |
| H Aon-Spiele | Switch, Digit und Grid Challenge mit Countdown |
| I SHL interaktiv | Balken ziehen, Reihenfolge per Drag & Drop, Tabellenzelle befüllen |

Modi: Training (sofortige Erklärung), Drill auf Zeit, Test-Simulationen je Unternehmen (`src/content/profiles.ts`, mit Kennzeichnung offiziell/berichtet/Annahme), Fehlerheft, Quick-Set, adaptiver Modus, Statistik, Strategie-Akademie.

Alle generierten Aufgaben sind über `(Generator, Version, Seed, Stufe)` reproduzierbar und werden von einem unabhängigen Löser geprüft (genau eine richtige Antwort). Die Prüfung ist in [docs/qa-report.md](docs/qa-report.md) dokumentiert.

## Entwicklung

Voraussetzung: Node.js 24.

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build nach `dist/` (`BASE_PATH=/assessment-trainer/` für GitHub Pages) |
| `npm run typecheck` / `npm run lint` | TypeScript (strict) und ESLint |
| `npm test` | Unit-Tests (Datenlogik, Antwortprüfung, Akademie) |
| `npm run test:content` | Gate 2: jeder Generator × Stufe mit 2.000 Aufgaben gegen den unabhängigen Löser |
| `npm run test:e2e` | Playwright: WebKit iPhone (393×852) und Desktop (1440×900), Offline |

Deployment: GitHub Actions (`.github/workflows/deploy.yml`) führt alle Prüfungen aus und veröffentlicht nur bei Grün auf GitHub Pages.

## Dokumentation

- [docs/research.md](docs/research.md) – Recherche zu den Tests (mit Quellen und Stand)
- [docs/decisions.md](docs/decisions.md) – Architektur- und Inhaltsentscheidungen
- [docs/qa-report.md](docs/qa-report.md) – Prüf-Gates 1–10 mit Belegen
- [docs/INSTALL.md](docs/INSTALL.md) – Installation auf Mac und iPhone

Keine Firmenlogos, keine kopierten Testinhalte: Alle Aufgaben, Texte und Daten sind eigens für diese App geschrieben bzw. generiert. Die Namen der Unternehmen dienen nur der Zuordnung der Testformate.
