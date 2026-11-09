# QA-Bericht – Prüf-Gates 1–10

Stand: 02.11.2026 · Repo: `assessment-trainer` · Alle Befehle aus dem Repo-Verzeichnis, Node 24.
Rohbelege (Antwortdateien der Prüfer, Screenshots, Lighthouse-JSON) liegen lokal unter `gate-output/` (nicht im Repo, weil groß); die Auswertungen und Kontaktbögen sind unter [`docs/qa/`](qa/) eingecheckt. Jeder gefundene und behobene Fehler steht mit Ursache im [Fehlerprotokoll](#fehlerprotokoll) am Ende.

| Gate | Perspektive | Ergebnis | Fehler gefunden / behoben |
|---|---|---|---|
| 1 | Anforderungs-Abgleich | grün: alle 37 Zeilen der Traceability-Tabelle erfüllt und belegt, Abschluss-Durchgang am 09.11.2026 | – |
| 2 | Korrektheit (automatisiert) | grün: 39 Generatoren × 3 Stufen × 2.000 Aufgaben = 234.000 Aufgaben gegen unabhängige Löser, 0 Abweichungen; Determinismus; fast-check | 4 / 4 |
| 3 | Blind-Lösen (Subagents) | grün: 4 Runden, 1.045 blind gelöste Aufgaben; seit Runde 1 keine Abweichung vom Schlüssel | 6 Abweichungen + 79 Hinweise / alle bearbeitet |
| 4 | Didaktik & Akademie (Subagent) | grün nach 2 Runden: Runde 2 mit 0 kritischen Befunden, alle 50 Schlüssel und alle Akademie-Rechnungen richtig; mittlere Befunde behoben | 3 krit. + 30 mittel / alle |
| 5 | Realismus (Subagent) | grün nach 2 Runden: Runde 2 mit 0 kritischen Befunden; mittlere Befunde behoben | 4 krit. + 19 mittel / alle |
| 6 | UX beide Geräte | grün: 27 Screens × iPhone/Desktop × hell/dunkel gesichtet, 0 px Überlauf, keine Touch-Ziele < 44 px | 5 / 5 |
| 7 | Technik | grün: tsc, ESLint, 241 Unit-/Property-/Content-Tests, 44 E2E-Tests, Build, Lighthouse ≥ 96/100/100, Offline | 3 / 3 |
| 8 | Daten & Statistik | grün: 7/10 → 7/10 und 70 %, Reload/neuer Tab, Export→Reset→Import identisch, Doppelimport ohne Duplikate, Migration v1→v2 | 0 |
| 9 | Red Team (Subagent) | grün nach Korrektur: kritischer und alle mittleren Befunde behoben und mit den Prüfer-Skripten nachgeprüft | 1 krit. + 5 mittel + 12 gering / alle außer 3 geringen |
| 10 | Code-Review (Subagent) | grün nach 2 Runden: Runde 2 ohne kritischen Befund, alle mittleren behoben | 1 krit. + 17 mittel / alle |

Nicht vollständig prüfbar: **echtes iPhone-Verhalten**. Auf diesem Mac gibt es kein Xcode, also keinen iOS-Simulator. iPhone wurde mit Playwright-WebKit (393×852, Touch, iPhone-User-Agent, Device-Scale 3) emuliert – das ist dieselbe Engine wie Safari, aber kein echtes Gerät (Homescreen-Start, echte Safe Areas, Vibration). Nach dem Deploy bitte einmal auf dem iPhone installieren und kurz durchklicken.

---

## Gate 1 – Anforderungs-Abgleich (Traceability)

Quelle: Master-Prompt Abschnitte 1–7. „Test“ nennt den Nachweis; E2E = `e2e/*.spec.ts`, Content = `tests/content/*`, Unit = `src/**/*.test.ts`, `tests/*.test.ts`.

| # | Anforderung | Umsetzung | Nachweis | Status |
|---|---|---|---|---|
| 1.1 | Separates Projekt, McKinsey-Projekt unberührt | Repo `~/Developer/assessment-trainer` (D3), Symlink im Ordner „Assessment Trainer“ | Repo-Pfad; McKinsey-Projekt nie geöffnet | ✅ |
| 1.2 | Mac-Dock + iPhone-Homescreen, offline | PWA (D1), `vite-plugin-pwa`, Manifest, apple-touch-icon | E2E `smoke` (Manifest/Icons/Meta), `offline` (WebKit + Chromium); Live-Test nach Deploy | ✅ |
| 1.3 | UI/Erklärungen/Akademie Deutsch, Items Englisch, Schalter DE | `itemLang` in Einstellungen; DE-Texte in Generatoren und 15 Verbal-Texten (D13) | Determinismus-Test EN/DE gleicher Schlüssel; E2E `smoke` | ✅ |
| 2.1 | Plan Mode, Plan vorgelegt | Plan genehmigt am 31.10.2026 | Session | ✅ |
| 2.2 | CLAUDE.md mit Ziel, Architektur, Befehlen, Regeln, DoD | `CLAUDE.md` | Datei | ✅ |
| 2.3 | Task-Liste | App-Task-Liste während der Arbeit | Session | ✅ |
| 2.4 | Subagents mit frischem Kontext, Blind-Löser ohne Schlüssel | Gates 3, 4, 5, 9, 10 | Abschnitte unten | ✅ |
| 2.5 | Nur echte Nutzerentscheidungen fragen, Rest in decisions.md | `docs/decisions.md` D1–D17; gefragt: GitHub-Name, Sichtbarkeit | Datei | ✅ |
| 2.6 | Kleine Commits | `git log` | Repo | ✅ |
| 3.1 | Recherche je Firma, offiziell vs. berichtet, Quellen, Datum | `docs/research.md` (Stand 02.11.2026) | Gate 5 (2 Runden) | ✅ |
| 3.2 | Parameter konfigurierbar in `profiles.ts` | `src/content/profiles.ts` (10 Profile) | Gate 5; `tests/sim.test.ts` | ✅ |
| 3.3 | Keine kopierten Aufgaben | Alle Items generiert bzw. selbst geschrieben | Gate 3/4 (Originalität), Abschnitt 12 | ✅ |
| 4.1 | PWA, GitHub Pages, keine externen Requests, Fonts lokal | Systemschrift (D7), HashRouter (D6), Pages-Workflow | Gate 10 (keine externen Requests), Lighthouse | ✅ (live seit 09.11.2026) |
| 5.1 | 9 Kategorien, je 3 Stufen + adaptiv, deutsche Erklärung mit Weg, Distraktoren, Shortcut | `src/content/generators/**`, `banks/**`; Adaptiv-Treppe `adaptiveNext` | Gate 2 (Struktur: Erklärung vorhanden), Gate 4 | ✅ |
| 5.1A | Numerical: Tabelle, Balken, gestapelt, Linie, Kreis, kombiniert, 2 Exhibits; alle Fragetypen inkl. Median/Modus/Spannweite, Einheiten-Fallen, Cannot say; 5 Optionen; Rechner-Overlay | `generators/numerical/*`, `ui/exhibits/charts.tsx`, `ui/Calculator.tsx` | Gate 2/3; Screens | ✅ |
| 5.1B | Speed Math / Kopfrechnen, Rechner immer aus | 12 Generatoren `speed.*`, Sprint mit freier Eingabe | Gate 2/3; E2E | ✅ |
| 5.1C | Inductive: Reihen, Matrizen, Odd one out, Regelbausteine, SVG programmatisch | `generators/inductive/*`, `ui/exhibits/visual.tsx` | Gate 2 (Mehrdeutigkeit), Gate 3 (4 Runden, Screenshots) | ✅ |
| 5.1D | Deductive mit Solver/Brute Force | `validators/deductive` (Venn, Permutationen, Wahrheitstafeln) | Gate 2/3 | ✅ |
| 5.1E | Verbal ≥ 40 Texte EN, ≥ 15 DE, 120–200 Wörter, 3–4 Aussagen, Begründung mit Satzverweis, Fallen | `banks/verbal1–4.ts`: 40 Texte, 160 Aussagen, 15 DE | `tests/content/banks.test.ts`; Gate 3 (jedes Item) | ✅ |
| 5.1F | Critical Thinking, 5 Teilbereiche | `banks/critical.ts`: 60 Items | `banks.test.ts`; Gate 3 (jedes Item) | ✅ |
| 5.1G | Diagrammatic Flussdiagramme | `generators/diagrammatic/*` | Gate 2/3 | ✅ |
| 5.1H | Aon Switch/Digit/Grid mit Countdown, kein Zurück, adaptiv; Digit jede Lösung | `generators/aon/*`, `features/run/SprintAndGame.tsx`, `features/sim/GameSection.tsx` | Gate 2/3; E2E `interaction` (Digit) | ✅ |
| 5.1I | SHL interaktiv ≥ 2 Formate, Touch | Balken ziehen, Drag & Drop, Tabellenzelle | E2E `interaction` (Touch-Pointer) | ✅ |
| 5.2 | Training, Drill, Simulation mit Info-Screen und Varianz-Hinweis, Fehlerheft (Seed, raus nach 2× richtig), Quick-Set | `features/run/*`, `features/sim/*`, `data/mistakes.ts` | E2E `data`, `sim`; Property-Test Fehlerheft | ✅ |
| 5.3 | Dashboard: richtig/gesamt, %, Ø Zeit vs. Ziel, Verlauf 7/30/alle, Simulations-Historie inkl. Negativwertung, Schwächen-Top-3 (≥ 10), Streak; alles aus Rohdaten | `data/stats.ts`, `features/stats/Stats.tsx`, `features/home/Home.tsx` | Gate 8; Unit `data.test.ts` inkl. fast-check | ✅ |
| 5.4 | Akademie je Kategorie: was/wo, Checkliste, Fallen mit interaktiven Beispielen, Shortcuts, Verbal-Logik, Venn, Aon, Taktik, „Jetzt üben“ | `features/academy/lessons.ts` (10 Lektionen, 13 Generator-Beispiele) | Gate 4 (2 Runden); `tests/academy.test.ts` | ✅ |
| 5.5 | Einstellungen (Sprache, Theme, Rechner, Ton/Vibration, Ziel), Export/Import mit Merge per ID, Reset mit Bestätigung | `features/settings/Settings.tsx`, `data/repo.ts` | Gate 8; Unit `data.test.ts` | ✅ |
| 5.6 | Mobile-first, Desktop 2-spaltig, Safe Areas, 44 pt, kein Zoom, Tastatur 1–5/A–E/Enter, Dark Mode, Farbe nie einziges Merkmal | `ui/Layout.tsx`, `ItemView` (lg: 2 Spalten), `index.css` | Gate 6 (Audit), E2E `interaction` (Tastatur, Dark Mode), Lighthouse A11y 100 | ✅ |
| 6.1 | Vite + React + TS strict, Tailwind, Zustand, Dexie, vite-plugin-pwa | `package.json`, `tsconfig*.json` | `npm run typecheck` | ✅ |
| 6.2 | Eigene SVG-Charts/-Figuren | `ui/exhibits/*` | Code | ✅ |
| 6.3 | Seeded RNG, Reproduzierbarkeit (generatorId, version, seed, difficulty) | `content/rng.ts`, `ItemRef`; Versionsprüfung in `resolveItem` (D17) | Determinismus- + fast-check-Tests; Unit „never substitutes …“ | ✅ |
| 6.4 | Trennung generators/validators/banks/profiles/features | Verzeichnisstruktur | Gate 10 | ✅ |
| 6.5 | Schema-Version + Migrationen | `data/db.ts` `SCHEMAS`, `migrateExport` | Unit Migration v1→v2 | ✅ |
| 6.6 | Vitest + fast-check, Playwright WebKit Desktop + iPhone 393×852, Lighthouse | `tests/**`, `e2e/**`, `scripts/lighthouse.sh` (D8) | Gate 7 | ✅ |
| 7.1 | Generatoren mit 3 spürbar verschiedenen Stufen | Stufen je Generator | Gate 3 (Stufe 1–3 je 15 Items) | ✅ |
| 7.2 | Verbal ≥ 40 Texte/≥ 120 Aussagen, CT ≥ 60 | 40/160, 60 | `banks.test.ts` | ✅ |
| 7.3 | Simulationen ohne Wiederholung durchspielbar | `pickForSection` (used-Set, Bank ohne Zurücklegen) | `tests/sim.test.ts` (alle Profile, 5 Seeds) | ✅ |

---

## Gate 2 – Korrektheit (automatisiert)

```bash
npm run test:content    # 39 Generatoren × 3 Stufen × 2.000 Items + Determinismus + fast-check
```

- **234.000 Aufgaben** gegen unabhängige Löser (`src/content/validators/**`), die nur die öffentliche Aufgabe sehen (`toPublic` entfernt den Schlüssel): 0 Abweichungen, 0 Items mit ≠ 1 richtiger Option, 0 mehrdeutige Muster, 0 Abstürze.
- Determinismus: gleicher Seed → identische Aufgabe (je Generator 4 feste Seeds × 3 Stufen, dazu fast-check mit 300 zufälligen Seeds); EN und DE haben denselben Schlüssel.
- Property-Based (fast-check, `tests/content/properties.test.ts`): je Generator 150 zufällige (Seed, Stufe, Sprache)-Kombinationen gegen den Löser.
- Gefundene Fehler (alle behoben): Rundungs-Epsilon, Präzision im Löser, Rundungsgrenzen, Grid-Symmetrie (siehe Protokoll).

## Gate 3 – Blind-Lösen

Export ohne Schlüssel: `scripts/blind-export.ts` (Figuren als Screenshots), Abgleich: `scripts/blind-compare.ts`. Jede Runde mit frischen Subagents, die nur die Aufgabendatei lesen durften.

| Runde | Umfang | Abweichungen vom Schlüssel | Hinweise | Folge |
|---|---|---|---|---|
| 1 | 535 Items: je Kategorie × Stufe 15 (A–D, G–I) + **jedes** Verbal- (160) und CT-Item (60) | 6 (5 Verbal, 1 CT) | 44 | Items überarbeitet, Generatoren entschärft |
| 2 | 229 Items: neue Seeds für A/B/D + alle geänderten Verbal-/CT-Items | 0 | 10 | Formulierungen |
| 3 | 236 Items: neue Seeds A/B/C + geänderte Verbal-/CT-Items | 0 | 15 | Figuren-Darstellung, Logik-Trivialität |
| 4 | 45 Figuren-Items nach Darstellungs-Änderung | 0 | 10 | nur Lesbarkeit (kleine Figuren in Eckfeldern), keine konkurrierende Regel mehr |

Die 6 Abweichungen in Runde 1 waren keine falschen Schlüssel im engeren Sinn, sondern zwei vertretbare Lesarten (z. B. „subject to approval“, „up to 20“). Alle wurden umformuliert und in Runde 2/3 ohne Abweichung erneut gelöst. Berichte: [`docs/qa/blind-report-r1.md`](qa/blind-report-r1.md) bis `r4`.

## Gate 4 – Didaktik & Akademie

Subagent mit 50 Aufgaben inkl. Schlüssel und Erklärung (`scripts/explain-export.ts`, Figuren als PNG) und allen Akademie-Texten; jede Zahl mit Python nachgerechnet.

- Runde 1: alle 50 Schlüssel richtig; 3 kritische Befunde (Syllogismus-Begründung „kann wahr sein“ bei widersprüchlicher Option; zwei falsche Herkunftsangaben „laut Berichten“) und 18 mittlere (Distraktor-Begründungen, Abkürzungen). Alle behoben, dazu systemische Korrekturen (Begründungen werden vom Löser bestimmt bzw. aus den tatsächlichen Werten berechnet).
- Runde 2 (neue Stichprobe von 50): **0 kritisch**, alle Schlüssel und alle Akademie-Rechnungen richtig; 12 mittlere Befunde (itemgenaue Abkürzungen, Qualifizierer) behoben.
- Abweichung vom Master-Prompt dokumentiert (D14): Kearney-Rate-Taktik „keine Frage leer lassen“, weil schon blindes Raten bei +5/−1 einen positiven Erwartungswert hat.

Berichte: [`docs/qa/g4-review-r1.md`](qa/g4-review-r1.md), [`docs/qa/g4-review-r2.md`](qa/g4-review-r2.md).

## Gate 5 – Realismus

- Runde 1: 4 kritische Befunde – Kearney-Rechner (Quelle sagt „Assume no calculator“), Kearney-Rate-Empfehlung, Allianz-Quelle als „offiziell“ (tatsächlich FAQ auf Drittportal, nur Ausbildung/duales Studium), Zurück-Label in der Akademie. Ich habe die Quellen selbst nachgeprüft (02.11.2026) und Profile, Akademie und research.md korrigiert; neues Profil „Deutsche Bank – Numerical“.
- Runde 2: **0 kritisch**; 3 mittlere Befunde behoben (Kearney-Teile „Tabellen“/„Grafiken“ ziehen jetzt nur passende Exhibits; früher gesehene Texte werden in Simulationen zuletzt gezogen; BCG-Qualifizierer in der Akademie).
- Nicht prüfbar: bain.com, kearney.com und hackingthecaseinterview.com blockieren automatische Abrufe; die Bain-Angaben bleiben deshalb „berichtet“.

Berichte: [`docs/qa/g5-review-r1.md`](qa/g5-review-r1.md), [`docs/qa/g5-review-r2.md`](qa/g5-review-r2.md).

## Gate 6 – UX auf beiden Geräten

```bash
npx tsx scripts/screens.ts http://127.0.0.1:5173/   # 27 Screens × iPhone/Desktop × hell/dunkel
```

- iPhone: WebKit 393×852, Touch, DPR 2; Desktop: WebKit 1440×900. Screens: Home, Üben, Kategorie, je Kategorie ein Item, Feedback falsch, Reihenfolge, Balken, Drill, Simulation (Intro, laufend, Ergebnis nach Timer-Ablauf per `page.clock`), Switch, Digit, Statistik, Fehlerheft, Akademie, Lektion, Einstellungen, Sprint.
- Automatischer Audit (`gate-output/screens/audit.md`): horizontaler Überlauf 0 px auf allen Screens; keine interaktiven Elemente unter 44×44 px.
- Selbst gesichtet (Kontaktbögen in [`docs/qa/`](qa/)): nichts abgeschnitten, Diagramme ohne Scrollen lesbar, Dark Mode vollständig. Behoben: zu niedrige Auswahlfelder (WebKit), Link < 44 px, deaktivierter Abgeben-Button bei Reihenfolge, Figuren am Rand abgeschnitten, unterschiedlicher Maßstab Reihe/Optionen.
- Drag & Drop per Touch: E2E `interaction` mit Touch-Pointer-Events (iPhone-Projekt).

## Gate 7 – Technische Qualität

```bash
npm run typecheck && npm run lint && npx vitest run && npm run build && npx playwright test
scripts/lighthouse.sh http://127.0.0.1:4174/
```

| Prüfung | Ergebnis |
|---|---|
| `tsc -b` (strict) | 0 Fehler |
| ESLint | 0 Fehler, 0 Warnungen |
| Vitest | 241 Tests grün (Unit, fast-check, Content/Gate 2, Simulation) |
| Playwright | 44 grün, 1 übersprungen (Tastaturtest nur Desktop) – WebKit iPhone + Desktop, Offline zusätzlich in Chromium; davon 11 Regressionstests aus Gate 9/10 |
| Build | erfolgreich, Service Worker + Precache |
| Lighthouse Start (mobil/desktop, auch live) | Performance 100/100, Accessibility 100/100, Best Practices 100/100, SEO 100/100 |
| Lighthouse Unterseiten (mobil) | Simulation 96/100/100, Training Induktiv 96/100/100, Statistik 96/100/100, Einstellungen 100/100/100, Akademie 100/100/100 |
| PWA installierbar | Lighthouse 12 hat keine PWA-Kategorie mehr (D8) → per E2E geprüft: Manifest (standalone, Icons 192/512/maskable), apple-touch-icon, iOS-Meta-Tags, Service Worker kontrolliert die Seite |
| Offline | E2E `offline`: Netz aus, Reload → Training, Simulation, Statistik, Akademie, Deep-Link-Reload funktionieren (WebKit und Chromium) |

## Gate 8 – Daten & Statistik

- E2E `data.spec.ts` (iPhone + Desktop): 7 von 10 richtig in Numerical → Dashboard zeigt 7/10 und 70 %; Daten nach Reload und in neuem Tab vorhanden; Export → Reset → Import ergibt identischen Zustand; zweiter Import erzeugt keine Duplikate; falsche Antworten landen im Fehlerheft.
- Unit `src/data/data.test.ts`: Statistik nur aus Rohdaten (inkl. fast-check: Trefferquote = richtig ÷ beantwortet für beliebige Folgen), Fehlerheft-Regel „raus nach 2× richtig in Folge“ (fast-check), Simulationsergebnis mit Negativwertung, Streak, Schwächen-Ranking (≥ 10 Versuche), **Migration v1 → Test-Schema v2 ohne Datenverlust**, Export-Format-Prüfung.

## Gate 9 – Red Team

Ein Subagent hat in 12 Szenariogruppen mit 194 Einzelprüfungen (WebKit iPhone mit Touch und Desktop, offline zusätzlich Chromium) versucht, die App zu brechen – mit eigenen Playwright-Skripten, direktem Lesen und Befüllen der IndexedDB und Uhr-Manipulation (`page.clock`).

- **Befunde:** 1 kritisch (Drill: Antwort genau beim Zeitablauf wurde doppelt gespeichert), 5 mittel (Doppeltipp im Drill, zwei gleich beschriftete Buttons, Reload in einer Simulation, Taschenrechner im iPhone-Querformat, Ziffern bei offenem Rechner), 15 gering.
- **Behoben:** alle kritischen und mittleren sowie G1–G12; mit den Original-Skripten des Prüfers nachgeprüft (Drill-Race: 0 von 48 Läufen fehlerhaft) und mit E2E-Regressionstests abgesichert (`e2e/regression.spec.ts`).
- **Bestanden u. a.:** 10.000 Antworten – Start 66 ms, Statistik ≤ 54 ms, Fehlerheft ≤ 309 ms, kein Ruckeln; 100.000 importierte Antworten – Statistik 568 ms. Offline 19/19 Routen. Import-Angriffe (Prototype-Pollution, Skript-Strings) wirkungslos. Rotation mit Drag-Widgets. Keine Konsolenfehler.
- **Bekannte Einschränkungen (gering, nicht behoben):** Einstellungsänderung und Reload innerhalb von 300 ms können in Chromium die letzte Änderung verlieren; keine Synchronisation zwischen mehreren offenen Tabs; im Entwicklungsserver (StrictMode) entstehen doppelte Sitzungen (nicht in der veröffentlichten App).

Bericht inkl. Nachprüfung: [`docs/qa/g9-redteam.md`](qa/g9-redteam.md).

## Gate 10 – Code-Review

Zwei Runden mit frischen Subagents, die den gesamten Code gelesen und jeden Befund am Code belegt haben.

- **Runde 1** (88 Dateien): 1 kritischer Befund – Antworten in Aon-Spielen gingen beim vorzeitigen Beenden verloren – und 14 mittlere (Simulation speicherte erst beim Abgeben, Zeit der letzten Aufgabe ging verloren, Ergebnisliste unsortiert, adaptive Stufung zu schnell, inhaltsgleiche Wiederholungen, Service-Worker-Updates kamen nicht an, Import kaum geprüft, Versionierung nicht erzwungen, Ordnungsrätsel-Schlüssel mit dem Validator berechnet, CSS-Layer, globale Tastenkürzel, Grid-Timer, „Nochmal“ wirkungslos, Rechner-Einstellung wirkungslos). Alle behoben, mit Unit- und E2E-Regressionstests (`e2e/regression.spec.ts`, `tests/sim.test.ts`, Golden-Test).
- **Runde 2** (52 Dateien): **0 kritisch**; 11 von 15 Runde-1-Befunden vollständig, 4 teilweise behoben; 3 neue mittlere Befunde (nie angezeigte Reihenfolge-Aufgaben zählten als beantwortet, Fehlerseite ohne Ausweg in der installierten App, Export auf iOS ohne Fallback). Alle behoben (D18–D21), Reste der teilweise behobenen Punkte ebenfalls (Drill-Rechner, Import-Felder, Golden-Test mit 25 Seeds).
- Bestätigt: kein `Math.random` in Generatoren, Validatoren lesen keine Schlüssel, keine externen Requests, kein `dangerouslySetInnerHTML`, Negativwertung korrekt, Import idempotent, Base-Path im Build korrekt.
- Verbleibend (gering, dokumentiert): Ein Update aus einem zweiten geöffneten Fenster kann einen laufenden Test im ersten neu laden (Antworten bleiben gespeichert); abgebrochene Simulationen bleiben als „laufend“ markiert; Bundle 870 kB (277 kB gzip) ohne Code-Splitting.

Berichte: [`docs/qa/g10-code-review.md`](qa/g10-code-review.md), [`docs/qa/g10-code-review-r2.md`](qa/g10-code-review-r2.md).

## Deployment

- Repo: https://github.com/ELZET17/assessment-trainer (öffentlich). Commits mit neutraler GitHub-Adresse, ohne lokale Pfade.
- Workflow `.github/workflows/deploy.yml`: Typecheck → ESLint → Unit-Tests → Content-Tests (Gate 2, Golden-Test) → Playwright E2E (WebKit + Chromium) → Build mit `BASE_PATH=/assessment-trainer/` → GitHub Pages. Der Deploy-Job hängt vom Test-Job ab: veröffentlicht wird nur bei Grün. Alle Läufe am 09.11.2026 grün.
- **Live-URL:** https://elzet17.github.io/assessment-trainer/
- **Live-Test (Playwright gegen die Produktions-URL, 09.11.2026):** alle 44 E2E-Tests grün (iPhone-WebKit, Desktop-WebKit, Offline zusätzlich Chromium) – Seite lädt, Manifest gültig (standalone, Icons, apple-touch-icon), Service Worker aktiv und kontrolliert die Seite, offline neu geladen funktionieren Training, Simulation, Statistik und Akademie; Datenfluss Gate 8 und alle Regressionstests auch live.
- **Lighthouse gegen die Live-URL:** Start mobil und desktop je 100/100/100/100; Simulation 97/100/100, Training Induktiv 98/100/100, Statistik 92/100/100, Einstellungen 100/100/100 (Performance/Accessibility/Best Practices).
- Anleitung für Mac und iPhone: [`docs/INSTALL.md`](INSTALL.md).

---

## Fehlerprotokoll

Alle gefundenen Fehler mit Ursache und Behebung (aus `docs/qa-log.md`):

| Datum | Gate | Fund | Ursache | Behebung |
|---|---|---|---|---|
| 31.10.2026 | G2 | `speed.units` d3: Optionen wie „1,080,000,003.08“ | `roundTo` addierte einen relativen Epsilon von 1e-9 → bei Werten ~1e9 um +1 verschoben | Epsilon auf 1e-12 relativ reduziert |
| 31.10.2026 | G2 | `speed.mul` d3: mehrere Optionen „passen“ (63.00 vs. 63.10) | Validator nutzte benötigte statt angezeigte Nachkommastellen | Validator nutzt angezeigte Präzision der Optionen |
| 31.10.2026 | G2 | Numerical: Ergebnisse genau auf Rundungsgrenze (z. B. 18,75 → 1 NKS) | Generator prüfte Rundungsgrenzen nicht | `numMcq`/`numericMcq` verwerfen Kandidaten auf Rundungsgrenzen |
| 31.10.2026 | G2 | `aon.grid`: 87 von 3.000 Durchgängen mit falschem Symmetrie-Schlüssel | Asymmetrie-Erzeugung konnte dieselbe Zelle zweimal kippen → wieder symmetrisch | Zwei *verschiedene* Zellen kippen (`rng.sample`) |
| 31.10.2026 | Review | Numerical-Distraktor „0,00“ bei Einheitenaufgaben | Theme mit zu kleinen Werten (Tsd. Stück) | Einheiten-Generator nur noch mit Kosten-Theme, Ergebnis ≥ 1 |
| 31.10.2026 | Review | Extremwert-Frage „kleinste absolute Veränderung“ mehrdeutig (Betrag vs. negativster Wert) | Formulierung | Nur noch „größter Zuwachs“; „kleinster“ nur für Niveauwerte |
| 31.10.2026 | G7/E2E | Nach automatischer Abgabe (Zeitablauf) blieb die Simulation hängen | `useBlocker` las den Zustand `finished` vor dem Re-Render → eigene Weiterleitung zum Ergebnis wurde blockiert | Ref `finishedRef` wird vor der Navigation gesetzt (Simulation und Drill); Regressionstest `e2e/sim.spec.ts` |
| 31.10.2026 | E2E | Balken ziehen reagierte nicht auf synthetische Touch-Events | `setPointerCapture` warf vor dem Setzen des Werts | Wert zuerst setzen, Capture in try/catch; Regressionstest `e2e/interaction.spec.ts` |
| 31.10.2026 | Review | „costs for Rent was …“ / „die Kosten … verändert sich“ | Verb-Kongruenz bei Plural-Themen | Plural-Verben für das Kosten-Theme (EN/DE) |
| 31.10.2026 | G6 | Figuren: Muster sahen wie „halb gefüllt“ aus, Formen sehr klein | Füllmuster wurden über `transform: scale` mitskaliert | Punkte im Nutzerkoordinatensystem skaliert, größere Formen, Einzelfiguren in Matrizen vergrößert |
| 31.10.2026 | G6 | Kombi-Diagramm: Linienwerte überlagerten Balkenbeschriftungen | gemeinsamer Zeichenbereich | Linie in eigenem Band über den Balken |
| 31.10.2026 | Smoke | Trainings-Route zeigte nach Wechsel der Kategorie die alte Aufgabe | Komponente wurde bei geändertem Query-String nicht neu gemountet | `Fresh`-Wrapper mit `key = pathname + search` |
| 31.10.2026 | Review | Verbal v22-2 hatte falschen Schlüssel (F statt T) | Schreibfehler beim Erstellen | korrigiert (11 von 42 = 26,2 % > 25 %) |
| 02.11.2026 | G7 Lighthouse | Kontrast 2,4 : 1 bei primären/roten Buttons (dunkle Schrift auf Blau/Rot) | Basis-CSS `button { color: inherit; font-size: 16px }` lag außerhalb der Tailwind-Layer und überschrieb Utility-Klassen | Regeln in `@layer base` verschoben; Eingabefelder behalten 16 px (kein iOS-Zoom) |
| 02.11.2026 | G3 Blind | Verbal v21-2, v29-4, v35-3, v36-1, v36-4 und CT c02 vom Blind-Löser anders beantwortet; weitere 11 Items als „vertretbar mehrdeutig“ markiert | Formulierungen ließen zwei Lesarten zu („subject to approval“, „up to“ vs. „at least“, Schließungen nicht erwähnt, „600 largest“) | Texte/Aussagen präzisiert (Genehmigung ausdrücklich ausstehend, Schließungen genannt, saubere C-Aussagen), c02/c15 ersetzt, c10 Basis präzisiert |
| 02.11.2026 | G3 Blind | Numerical L3: „average annual rate“ mehrdeutig (CAGR vs. absoluter Zuwachs); „costs … it“ | Formulierung | „compound annual growth rate (CAGR)“ ausdrücklich, Plural-Pronomen |
| 02.11.2026 | G3 Blind | Lösungsbuchstaben gehäuft auf C (38 von 90) | Numerische Optionen aufsteigend sortiert, Distraktoren meist beidseitig | Ziel-Rang der richtigen Option zufällig gleichverteilt; Distraktoren nach Seite kontingentiert |
| 02.11.2026 | G3 Blind | SHL-Tabellenzelle: Anteil per Division (22,2) vs. 100 % minus Rest (22,3) | Rundung der übrigen Anteile | Nur Datensätze, bei denen beide Wege übereinstimmen |
| 02.11.2026 | G3 Blind | SHL-Tabellenzelle aus gerundeter Veränderung: mehrere ganze Zahlen passen | Veränderung nur auf 1 NKS angezeigt | Toleranz = Rundungsintervall der angezeigten Veränderung |
| 02.11.2026 | G3 Blind | Umsatz/Gewinn-Tabelle in „TWh“ o. Ä. | Einheit vom Datensatz-Theme übernommen | Margen-Reihenfolge nur mit Umsatz-Theme |
| 02.11.2026 | G3 Blind | Logik: Frage teils direkt durch einen Hinweis beantwortet; Namen nicht genannt; „clockwise“ nicht definiert | Generator prüfte Trivialität nicht | Trivialitätsfilter (ein Hinweis allein darf die Frage nicht entscheiden), Namen im Intro, Uhrzeigersinn definiert |
| 02.11.2026 | G6 | Auswahlfelder (select) nur 23 px hoch, Link in Statistik < 44 px | WebKit ignoriert `min-height` bei select | feste Höhe `h-11`, Link als Block mit 44 px |
| 02.11.2026 | G6 | Reihenfolge-Aufgabe: Abgeben erst nach einer Verschiebung möglich | Kein Start-Entwurf | Angezeigte Reihenfolge gilt als Start-Antwort (Training/Drill) |
| 02.11.2026 | G3 Blind (C) | Odd one out L1/L2: konkurrierende Regeln („einzige schwarze Raute“, „einziges Paar diagonal“, „Sechseck unter Fünfeck“, „einzige runde Form“, Ausreißer bei der Strichzahl) | Merkmalsbibliothek des Prüfers zu klein; Ablenk-Merkmale zufällig 4:1 verteilt | Prüfer kennt jetzt Füllung/Größe/Lage je Form, Zeilen/Spalten, Ecken/Kanten, Anordnung und relative Lage von Paaren, runde/konkave Formen, Formpräsenz; Generator verteilt Ablenk-Merkmale 3:2, Paare nebeneinander, gerade Strichzahlen 2/4/6 mit ungerader dazwischen; Regeltyp fest pro Seed |
| 02.11.2026 | G3 Blind (C) | Matrix: ein Feld ohne Linien wurde groß gezeichnet, alle anderen klein | Vergrößerung pro Feld statt pro Aufgabe entschieden | Einheitlicher Maßstab für alle Felder und Optionen einer Aufgabe (`largeFigures`) |
| 02.11.2026 | G3 Blind (C) | Figuren am Feldrand abgeschnitten; Kreuz berührt die Strichleiste; L-Form auf Linienkreuzung kaum lesbar; 5–8 Striche schwer zu zählen | Größe 2 + Drehung über die Zellgrenze; Strichleiste ohne Abstand | Größen 8,5/12,5/16,5, L-Form auf Radius 1 normiert, eigene Strichleiste unterhalb, Striche in Vierergruppen mit Lücke, Hintergrund-Halo um Figuren |
| 02.11.2026 | G3 Runde 2 | „unit sales … changes“, „passenger numbers … was“ | Englische Kongruenz aus dem deutschen Plural-Flag abgeleitet | eigenes `enPlural` je Thema |
| 02.11.2026 | G3 Runde 2 | „grows at the same percentage rate“ bei sinkenden Werten | Verb unabhängig von der Richtung | „falls/sinkt“ bei Rückgang (auch CAGR-Frage) |
| 02.11.2026 | G3 Runde 2 | Kopfrechnen: „revenue of 960 million“ ohne Einheit | Einheit fehlte | „960 million euros … in euros“ |
| 02.11.2026 | G3 Runde 2 | Logik L1: Optionen nennen Ereignisse, die in den Aussagen nicht vorkommen | dritte Variable nur für Distraktoren | L1 nur mit den zwei eingeführten Ereignissen |
| 02.11.2026 | G3 Runde 2 | Diagramm L1: „last row“ bei nur einer Zeile | Text für Varianten mit Beispielen | „What is the output?“ ohne Beispiele |
| 02.11.2026 | G3 Runde 2 | Verbal v21-3 („at least 70 %“ vs. „all“), v36-4 (andere Schließungen nicht ausgeschlossen), CT c10 (Preis vorher/nachher nicht fix) | Restmehrdeutigkeit | Aussagen/Stimulus präzisiert; dazu v03-4, v10, v22-4 (Preis −2 % → Umsatz +3,9 %), v34-2, v36-3 aus Runde-1-Hinweisen |
| 02.11.2026 | G5 | Kearney: Rechner „erlaubt (Annahme)“, Akademie empfahl Raten erst nach Ausschluss | Quelle (StrategyCase) falsch wiedergegeben – dort „Assume no calculator“ und „nie leer lassen“ (selbst nachgeprüft 02.11.2026) | Kearney ohne Rechner (berichtet), Abschnitte 8/6/6/8/6/6 laut StrategyCase, Rate-Folgerung „keine Frage leer lassen“ in Profil, Akademie und research.md |
| 02.11.2026 | G5 | Allianz „14 Tage“ als offiziell | FAQ auf Drittportal, nur Ausbildung/duales Studium (nachgeprüft) | Status „berichtet“ mit Zielgruppe |
| 02.11.2026 | G5 | Zurück/Kein-Zurück, Rechner, Adaptivität, Negativwertung teils ohne Label oder falsch als „laut Berichten“ | Labels unvollständig | Alle Parameter mit offiziell/berichtet/Annahme; neues Profil „Deutsche Bank – Numerical“; Caveats zu Bain TG (32 statt 45–52 Min.), P&G (17 Min. Spielzeit), BCG (kein Verbal), Kearney (3-Options-Verbal, Data Sufficiency fehlt); „Kommt laut Recherche vor bei“ korrigiert |
| 02.11.2026 | G4 | Syllogismus/Regeln: widersprüchliche Optionen als „kann wahr sein“ bzw. „folgt nicht zwingend“ begründet | Vorlage unterschied nicht zwischen unmöglich und möglich | Begründung per Löser: „widerspricht“ (Negation folgt), „kann wahr sein“ (konsistent) oder „folgt nicht zwingend“ |
| 02.11.2026 | G4 | Distraktor-Begründungen „Übertrag vergessen“ ohne Übertrag, „Rechenfehler“ ohne Inhalt, falsche %-Angaben | Pauschale Vorlagen | Überträge/Borgen nur, wo sie vorkommen; „Rechenfehler“ wird konkret (Richtung, Abstand, Faktor) aus den gerundeten Werten berechnet |
| 02.11.2026 | G4 | Abkürzungen: Divisor-Hinweis, Stammbrüche ohne 1/7, „um wie viel größer“, Wechselkurs, Digit | Vorlagen zu allgemein bzw. falsch | itemspezifische Abkürzungen |
| 02.11.2026 | G4 | Akademie: Herkunftsangaben („laut Berichten“) teils falsch, Bain-TG-Zeit/Frage, Switch-Tipp bei fehlendem 1. Schalter | Ungenaue Formulierungen | korrigiert |
| 02.11.2026 | G4 | CAGR-Flughafen mit 455–781 Mio. Passagieren | Basiswerte ignorierten Themenbereich | Basis aus dem Wertebereich des Themas |
| 02.11.2026 | G4 | Logik-Erklärungen springen zu „einzige Anordnung“ | keine Zwischenschritte | Schritte mit vom Löser gezählten verbleibenden Anordnungen; Grammatik „kamen genau 2 Personen“ |
| 02.11.2026 | G4 Runde 2 | Restliche Begründungen/Abkürzungen nicht itemgenau (Quadrate „Übertrag doppelt“, Einheiten-Faktor 1.000, Zahlenreihen-Prüfreihenfolge ohne Potenzen, %-Überschlag „schließt drei Optionen aus“, Verhältnis „Werte von 2024“ bei nur einem Jahr im Diagramm, CAGR-Näherung „etwas kleiner“, Projektion „doppelt quadriert“, Switch-Beispiel) | Vorlagen allgemein formuliert | itemgenaue Texte; „falsches Jahr“ nur, wenn das Jahr sichtbar ist |
| 02.11.2026 | G4 Runde 2 | Akademie: Kearney-Taktik setzt Zurückspringen voraus; „Jede Regel streicht eine Option“; usedBy ohne Herkunft | ungenau | Taktik abhängig von Zurück-Möglichkeit; Checkliste korrigiert; „Laut Recherche:“ vor jeder Zuordnung |
| 02.11.2026 | G5 Runde 2 | Kearney „Case: Grafiken“ zu 69 % Tabellen | Generatoren wählen den Exhibit-Typ zufällig | Mix-Filter `exhibit: 'table' | 'chart'`, Test |
| 02.11.2026 | G5 Runde 2 | Dieselben 5 CT-Inference-Items in 82–87 % aller Kearney-Läufe | Simulation übergab keine früher gesehenen Bank-Items | Simulation lädt früher beantwortete Bank-IDs und zieht sie zuletzt; Test |
| 02.11.2026 | G5 Runde 2 | Sova-Caveat, Bain-Dauer und BCG-Büros mit zu starker/ungenauer Quellenangabe | Formulierung | an research.md angeglichen |
| 02.11.2026 | G3 Runde 3 | Logik L1: Aussage = wörtlich eine Prämisse; Diagramm: zwei Operatoren heben sich auf; CAGR-Frage „keep growing“ bei Rückgang im letzten Jahr; Personalkosten unplausibel klein | Filter fehlten | Trivialitätsfilter auch auf L1, Ausgabe ≠ Eingabe, neutrale CAGR-Formulierung, Kostenkategorie „Reisen“ statt „Personal“ |
| 02.11.2026 | eigene Prüfung | Fehlerheft-Eintrag würde nach einem Generator-Update stillschweigend eine andere Aufgabe zeigen | `resolveItem` ignorierte die gespeicherte Version | Version wird geprüft, nicht reproduzierbare Einträge werden ausgelassen; Test |
| 02.11.2026 | G3 Runde 3 (C) | Optionen ca. 12 % kleiner gezeichnet als Reihe/Matrix → Größenvergleich irreführend; Punkt-Füllung auf kleinen Formen kaum erkennbar; Formen knapp am Rand; „einzige Figur mit Dreieck/Raute“ als Konkurrenzregel bei Seitensummen | Panelbreite je Layout verschieden; Muster zu fein; Präsenz-Merkmal nur „fehlt in einer“ | Gemeinsame Panelbreite `--fig-w` für Reihe, Matrix und Optionen (100/120/136 px), dichteres Punktmuster, Größen 10/13,5/17 mit mehr Randabstand, Merkmal „nur eine Figur enthält Form X“ bei Feldern mit mehreren Formen |
| 02.11.2026 | G10 | **kritisch:** Aon-Spiele – Antworten gingen beim vorzeitigen Abgeben/Verlassen verloren | Ergebnisse nur im Speicher, erst bei Zeitablauf übergeben | Jede Antwort wird sofort gespeichert (`onResult`, deterministische IDs); Einzelspiel mit Bestätigung beim Beenden; E2E-Regressionstest |
| 02.11.2026 | G10 | Simulation speicherte erst beim Abgeben; letzte Bearbeitungszeit ging verloren; Ergebnisliste in Zufallsreihenfolge | State-only, asynchrone Updates, gleiche Zeitstempel | Sofortiges Upsert je Antwort (ID Session+Position), synchroner Slot-Ref, Feld `seq`; E2E „überlebt Reload“, „Testreihenfolge“ |
| 02.11.2026 | G10 | Adaptive Stufung zu schnell (Stufe 1→3 nach 3 statt 4 richtigen) | Serie nach Stufenwechsel nicht zurückgesetzt | `adaptiveLevel` spielt die Historie ab; Unit-Test |
| 02.11.2026 | G10 | Gleiche Aufgabe mehrfach (kleine Wertebereiche, verschiedene Seeds) | Wiederholungsschutz nur über Seed | Inhaltsschlüssel (`contentKey`) in allen Auswahlwegen und Spielen; Tests |
| 02.11.2026 | G10 | Service Worker aktivierte Updates nie selbst | `injectRegister: false` ohne `skipWaiting` | Prompt-Modus, Update wird außerhalb laufender Tests angewandt, stündliche Prüfung |
| 02.11.2026 | G10 | Import prüfte kaum Felder; Fehler legten Seiten lahm | Nur id/itemKey/ts geprüft, kein `errorElement` | Feldweise Prüfung, Duplikate je Datei entfernt, Fehlerseite; Unit-Tests |
| 02.11.2026 | G10 | Fehlerheft zählte nach Versionswechsel nicht übbare Einträge; Item-Änderungen ohne Versionssprung möglich | – | Nicht reproduzierbare Einträge verlassen das Heft; Golden-Test Seed → Item-Hash |
| 02.11.2026 | G10 | Ordnungsrätsel: Schlüssel mit dem Validator-Löser berechnet | Verstoß gegen Regel 2 | Eigener Backtracking-Löser im Generator (`arrange.ts`) |
| 02.11.2026 | G10 | `.card`/`.muted`/`.safe-*` überstimmten Tailwind (Feedback-Farben, Padding fehlten) | Klassen außerhalb eines Cascade-Layers | `@layer components`; Safe Areas explizit für Inhalt und Aktionsleisten |
| 02.11.2026 | G10 | Tastenkürzel beantworteten Akademie-Beispiele gleichzeitig und wirkten hinter Dialogen | globaler Listener | nur aktive Aufgabe, nicht bei Modals/Eingabefeldern/Tastenwiederholung |
| 02.11.2026 | G10 | Grid-Urteil ohne Zeitlimit; „Nochmal“ wirkungslos; Rechner-Einstellung wirkungslos | Effekt ohne Deps; gleicher Route-Key; Einstellung nie gelesen | behoben; Rechner verdeckt keine Buttons mehr, Standard „aus“ |
| 02.11.2026 | G10 | Freitext lehnte „12,5 %“ ab; Export auf iOS unsicher; QA-Route im Produktivbundle | – | Einheiten werden ignoriert; Teilen-Dialog auf Touch-Geräten; `/render` nur im Dev-Modus |
| 09.11.2026 | G10 Runde 2 | Nie angezeigte Reihenfolge-Aufgaben zählten in Simulationen als beantwortet; Fehlerseite ohne Ausweg in der installierten App; iOS-Export ohne Fallback; Drill ignorierte Rechner-Einstellung | Startantwort beim Aufbau gesetzt; Fehlerseite an der Wurzel; – | Startreihenfolge erst beim Anzeigen (D21, E2E); Fehlerseite im Layout mit „Daten sichern“; Download-Fallback; Drill-Rechner |
| 09.11.2026 | G9 | **kritisch:** Drill – Antwort genau beim Zeitablauf speicherte doppelte/widersprüchliche Einträge | Guard wurde vor dem Re-Render zurückgesetzt | Synchroner `ending`-Ref, Ergebnis-Ref, deterministische IDs; Nachprüfung 0/48 Läufe; E2E |
| 09.11.2026 | G9 | Doppeltipp beantwortete die nächste Frage (Drill), übersprang Fragen (Simulation, Quick-Set) | keine Eingabesperre | 350 ms Sperre nach Fragenwechsel, Wiedereintrittssperre; E2E |
| 09.11.2026 | G9 | Reload in Simulation/Drill: Neustart ohne Warnung, Sitzung blieb „laufend“ | – | Warnung beim Verlassen, alte Sitzungen werden als „abgebrochen“ geschlossen und mit Teilergebnis angezeigt |
| 09.11.2026 | G9 | Taschenrechner im iPhone-Querformat nicht schließbar; Ziffern bei offenem Rechner beantworteten Fragen | feste Position ohne Höhenlimit; Rechner ohne Tastatur | Querformat-Layout; Rechner mit Tastatureingabe und eigenem Fokus; E2E |
| 09.11.2026 | G9 | Abbruchdialog mit zwei „Abbrechen“; ungültige Deeplinks; Spiel-Intro mit rotem Timer; Import prüfte Abschnitte/Format/Einstellungen nicht | – | eindeutige Buttons; Parameter-Validierung; Timer erst ab Spielstart; Import-Prüfung erweitert; Unit-Tests |
| 09.11.2026 | G10 Runde 3 | Drill hing, wenn das Speichern fehlschlug (Speicher voll); Simulation ebenso | kein try/finally, Guard blieb gesetzt | Drill zeigt Ergebnis mit Hinweis, Simulation erlaubt erneutes Abgeben mit Warnung |
| 09.11.2026 | G10 Runde 3 | Kleinere Punkte: Rechner-Toggle blockierte Tastenkürzel, Enter auf Rechner-Buttons, „zuletzt“ zeigte abgebrochene Läufe, Uhr auf dem ersten Spiel-Intro, Deeplink-Lücken und leerer Drill, Sicherung auf iPhone, Doppeltipp im Training, automatisch geöffneter Rechner nahm Eingabefeld den Fokus | – | alle behoben; gemeinsamer Export-Helfer (Teilen/Download) |
