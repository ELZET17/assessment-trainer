# QA-Bericht – Prüf-Gates 1–10

Stand: 02.11.2026 · Repo: `assessment-trainer` · Alle Befehle aus dem Repo-Verzeichnis, Node 24.
Rohbelege (Antwortdateien der Prüfer, Screenshots, Lighthouse-JSON) liegen lokal unter `gate-output/` (nicht im Repo, weil groß); die Auswertungen und Kontaktbögen sind unter [`docs/qa/`](qa/) eingecheckt. Jeder gefundene und behobene Fehler steht mit Ursache im [Fehlerprotokoll](#fehlerprotokoll) am Ende.

| Gate | Perspektive | Ergebnis | Fehler gefunden / behoben |
|---|---|---|---|
| 1 | Anforderungs-Abgleich | GATE1_RESULT | – |
| 2 | Korrektheit (automatisiert) | grün: 39 Generatoren × 3 Stufen × 2.000 Aufgaben = 234.000 Aufgaben gegen unabhängige Löser, 0 Abweichungen; Determinismus; fast-check | 4 / 4 |
| 3 | Blind-Lösen (Subagents) | GATE3_RESULT | GATE3_COUNT |
| 4 | Didaktik & Akademie (Subagent) | grün nach 2 Runden: Runde 2 mit 0 kritischen Befunden, alle 50 Schlüssel und alle Akademie-Rechnungen richtig; mittlere Befunde behoben | 3 krit. + 30 mittel / alle |
| 5 | Realismus (Subagent) | grün nach 2 Runden: Runde 2 mit 0 kritischen Befunden; mittlere Befunde behoben | 4 krit. + 19 mittel / alle |
| 6 | UX beide Geräte | grün: 27 Screens × iPhone/Desktop × hell/dunkel gesichtet, 0 px Überlauf, keine Touch-Ziele < 44 px | 5 / 5 |
| 7 | Technik | grün: tsc, ESLint, TESTCOUNT Unit-/Property-/Content-Tests, 28 E2E-Tests, Build, Lighthouse ≥ 96/100/100, Offline | 3 / 3 |
| 8 | Daten & Statistik | grün: 7/10 → 7/10 und 70 %, Reload/neuer Tab, Export→Reset→Import identisch, Doppelimport ohne Duplikate, Migration v1→v2 | 0 |
| 9 | Red Team (Subagent) | GATE9_RESULT | GATE9_COUNT |
| 10 | Code-Review (Subagent) | GATE10_RESULT | GATE10_COUNT |

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
| 4.1 | PWA, GitHub Pages, keine externen Requests, Fonts lokal | Systemschrift (D7), HashRouter (D6), Pages-Workflow | Gate 10 (keine externen Requests), Lighthouse | DEPLOY_STATUS |
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
| 4 | 45 Figuren-Items nach Darstellungs-Änderung | GATE3_R4 | | |

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
| Vitest | TESTCOUNT Tests grün (Unit, fast-check, Content/Gate 2, Simulation) |
| Playwright | 28 grün, 1 übersprungen (Tastaturtest nur Desktop) – WebKit iPhone + Desktop, Offline zusätzlich in Chromium |
| Build | erfolgreich, Service Worker + Precache |
| Lighthouse Start (mobil/desktop) | Performance 100/100, Accessibility 100/100, Best Practices 100/100, SEO 100/100 |
| Lighthouse Unterseiten (mobil) | Simulation 96/100/100, Training Induktiv 96/100/100, Statistik 96/100/100, Einstellungen 100/100/100, Akademie 100/100/100 |
| PWA installierbar | Lighthouse 12 hat keine PWA-Kategorie mehr (D8) → per E2E geprüft: Manifest (standalone, Icons 192/512/maskable), apple-touch-icon, iOS-Meta-Tags, Service Worker kontrolliert die Seite |
| Offline | E2E `offline`: Netz aus, Reload → Training, Simulation, Statistik, Akademie, Deep-Link-Reload funktionieren (WebKit und Chromium) |

## Gate 8 – Daten & Statistik

- E2E `data.spec.ts` (iPhone + Desktop): 7 von 10 richtig in Numerical → Dashboard zeigt 7/10 und 70 %; Daten nach Reload und in neuem Tab vorhanden; Export → Reset → Import ergibt identischen Zustand; zweiter Import erzeugt keine Duplikate; falsche Antworten landen im Fehlerheft.
- Unit `src/data/data.test.ts`: Statistik nur aus Rohdaten (inkl. fast-check: Trefferquote = richtig ÷ beantwortet für beliebige Folgen), Fehlerheft-Regel „raus nach 2× richtig in Folge“ (fast-check), Simulationsergebnis mit Negativwertung, Streak, Schwächen-Ranking (≥ 10 Versuche), **Migration v1 → Test-Schema v2 ohne Datenverlust**, Export-Format-Prüfung.

## Gate 9 – Red Team

GATE9_SECTION

## Gate 10 – Code-Review

GATE10_SECTION

## Deployment

DEPLOY_SECTION

---

## Fehlerprotokoll

FEHLERPROTOKOLL
