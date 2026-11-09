# Gate 10 – Code-Review (Assessment Trainer)

**Dateien geprüft: 88. Befunde: 32 (kritisch: 1, mittel: 14, gering: 17)**

Stand: `main` @ `e912395` (02.11.2026, 14:22). Während des Reviews kamen drei Commits hinzu (`bcb4ed1`, `ebd7343`, `e912395`); alle Befunde wurden gegen `e912395` neu geprüft, Zeilennummern beziehen sich auf diesen Stand. Nicht geprüft: die danach entstandenen, noch nicht committeten Dateien `docs/qa-report.md` und `scripts/qa-evidence.py`.

Geprüft (vollständig oder in den relevanten Abschnitten gelesen): `CLAUDE.md`, `docs/decisions.md`, `package.json`, `vite.config.ts`, `index.html`, `eslint.config.js`, `tsconfig.app.json`, `playwright.config.ts`, `.github/workflows/deploy.yml`, `.gitignore`, `public/*` (6), `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/state/settings.ts`, `src/content/{rng,check,generator,pipeline,items,types,registry,picker,categories,format,profiles}.ts`, `src/content/banks/{index,types}.ts`, Generatoren (`speed/common`, `speed/misc`, `speed/percent`, `aon/games` + 3 Typdateien, `deductive/{puzzles,syllogism,rules}`, `diagrammatic/flow-gen`, `inductive/{figure,figures-gen}`, `interactive/shl`), Validatoren (`aon`, `interactive`, `deductive`, `inductive`, `index`), `src/data/*` (6), alle Dateien unter `src/features/*` und `src/ui/*`, `tests/content/{harness,gate2.test,properties.test}.ts`, `tests/sim.test.ts`, `src/content/check.test.ts`, `src/data/data.test.ts`, `e2e/{sim,offline}.spec.ts` (übrige E2E-Specs anhand ihrer Testfälle).

Zusätzlich verifiziert:
- **Build mit `BASE_PATH=/assessment-trainer/`** in ein Scratch-Verzeichnis: Icons, Manifest (`id`/`start_url`/`scope`), Skripte und SW-Scope sind korrekt präfixiert.
- **CSS-Kaskade** im gebauten CSS (`dist/assets/index-*.css`).
- **Service-Worker-Konfiguration** in `node_modules/vite-plugin-pwa/dist/index.js` und im erzeugten `sw.js`.
- **Inhaltsgleiche Wiederholungen** per Skript gemessen: 200 Drills × 20 Items je Generator × Stufe sowie 50 Läufe je Simulationsprofil.

Schweregrade: **kritisch** = falsches Ergebnis, Datenverlust oder Sicherheit · **mittel** = echter Fehler in einem Randfall oder erhebliches Wartungsrisiko · **gering** = Stil oder Aufräumen. „unbestätigt“ markiert Punkte, die nicht am laufenden Code nachgewiesen wurden.

---

## Kritisch

### K1 – Aon-Spiele: Antworten werden erst bei Zeitablauf übergeben, vorzeitiges Abgeben oder Verlassen verwirft sie (Simulation und Spielmodus)
- **Wo:**
  - `src/features/sim/GameSection.tsx:33` (Ergebnisse nur in `useRef`), `:52-57` (`onEnd` nur bei `remaining <= 0`)
  - `src/features/sim/SimRunner.tsx:129-132` (`finishAll` liest `gameResults.current[si]`), `:248-251` (wird erst in `onEnd` gesetzt), `:212-214` und `:229-234` (Kopfzeilen-Button „Beenden“ → Abgeben), `:97` (Blocker, gleicher Pfad)
  - `src/features/run/SprintAndGame.tsx:165-167` („← Beenden“ ist ein Link, speichert nichts), `:179-183`
- **Problem:** Solange ein Spielabschnitt läuft, liegen die gegebenen Antworten nur im Ref der `GameSection`. „Beenden“ → „Test jetzt abgeben?“ → „Abgeben“ (oder Zurück-Geste → Blocker → „Abgeben“) ruft `finishAll()` auf, bevor `onEnd` lief. Die Antworten des laufenden Spiels werden weder gewertet noch als Attempts gespeichert. Im Einzelspiel verwirft „← Beenden“ ohne Rückfrage alle Antworten; die Session bleibt `running`.
- **Szenario:** In der P&G-Simulation hat jemand in der Grid Challenge (Teil 3) sechs Runden gelöst und gibt nach 4 von 6 Minuten ab. Der Dialog sagt nur „Unbeantwortete Fragen zählen als leer“. Das Ergebnis enthält aber nur Switch und Digit; die sechs Grid-Antworten fehlen in Punkten, Statistik und Fehlerheft. Im Einzelspiel `/run/game/switch`: Nach 5 Minuten „← Beenden“ ist alles weg.
- **Fix:**
  - `GameSection` meldet jedes Ergebnis sofort, z. B. über `onResult(r)`, und `SimRunner` sammelt in `gameResults.current[secIdx]`, sodass `finishAll` immer den aktuellen Stand sieht.
  - `GameRun` speichert jede Antwort sofort per `saveAttempt` (wie der Drill) und schließt die Session beim Verlassen ab. „← Beenden“ bekommt eine Bestätigung.
  - E2E-Test: P&G-Simulation, im Spiel abgeben, dann Punkte prüfen.

---

## Mittel

### M1 – Simulation hält bis zum Abgeben alle Antworten nur im React-State
- **Wo:** `src/features/sim/SimRunner.tsx:36` (`slots`), `:125-145` (einziger Speicherpunkt), `:80-86` (Session `running`)
- **Problem:** Bei Reload, Absturz, iOS-Prozess-Kill im Hintergrund oder einem Service-Worker-Update mit Reload (siehe M6) gehen 30–60 Minuten Antworten komplett verloren. Die Session bleibt dauerhaft `running`; es gibt kein Fortsetzen.
- **Szenario:** Kearney-Simulation (60 Min.) auf dem iPhone. Nach 40 Minuten kommt ein Anruf, iOS beendet den Web-Prozess. Beim Zurückkehren lädt die App neu, und alle 30 Antworten sind weg.
- **Fix:** Jede Antwort sofort persistieren:
  - Upsert eines Attempts mit deterministischer ID `${sessionId}:${section}:${index}`; Punkte erst in `finishAll` setzen.
  - Alternativ einen Entwurf an der Session speichern und auf Home „Simulation fortsetzen / auswerten“ anbieten. Verwaiste `running`-Sessions beim Start abschließen.

### M2 – Bearbeitungszeit der zuletzt angezeigten Aufgabe geht beim Abgeben verloren
- **Wo:** `src/features/sim/SimRunner.tsx:104-114` (`commitTime` aktualisiert asynchron per `setSlots`), `:163-168` und `:229-233` (`commitTime(); nextSection()/finishAll()`), `:145` (`finishAll` schließt das alte `slots` ein), `:171-187` (letzte Aufgabe → `nextSection` → `finishAll`)
- **Problem:** `finishAll` sieht noch die `slots` vor dem Update durch `commitTime`. Die Zeit seit dem letzten Wechsel fließt nicht in `timeMs` ein.
- **Szenario:** In jeder Simulation: Frage 40 bei Kearney wird 3 Minuten bearbeitet, dann „Test abgeben“ → gespeichert wird `timeMs = 0`. Dasselbe gilt für die letzte Aufgabe jedes Tests bei Zeitablauf. „Ø Zeit“ und „Zeit / Ziel“ in der Statistik werden systematisch zu niedrig.
- **Fix:** Die Slots synchron fortschreiben (Ref-Spiegel `slotsRef`) oder `commitTime()` das aktualisierte Array zurückgeben lassen und dieses an `finishAll(finalSlots)` übergeben.

### M3 – Ergebnisseite der Simulation listet die Fragen in zufälliger Reihenfolge
- **Wo:** `src/features/sim/SimPages.tsx:125-132` (Abfrage nach `sessionId`, dann `sort` nach `ts`), `src/features/run/common.ts:9` (`ts = Date.now()` beim Erzeugen), `src/features/sim/SimRunner.tsx:128-140` (alle Attempts werden in einer Schleife innerhalb weniger Millisekunden erzeugt)
- **Problem:** Fast alle Attempts einer Simulation haben dasselbe `ts`. Die stabile Sortierung übernimmt deshalb die Index-Reihenfolge von IndexedDB, also nach zufälliger UUID. „Alle Fragen 1., 2., …“ entspricht nicht der Testreihenfolge, und Abschnitte werden gemischt. `section` wird an `Review` nicht übergeben.
- **Szenario:** BCG-CCA-Ergebnis: „1.“ ist in Wahrheit Frage 11, „2.“ ist Frage 3 – die Nachbesprechung passt nicht zur Erinnerung.
- **Fix:** Am Attempt `seq` (Position im Test) und `sectionId` speichern; da die Felder nicht indiziert sind, braucht es keine Schemaänderung. Danach sortieren und `section` an `Review` übergeben. Alternativ `ts = startedAt + index`.

### M4 – Adaptive Treppe steigt nach dem ersten Aufstieg bei jeder weiteren richtigen Antwort erneut
- **Wo:** `src/content/picker.ts:16-22`. Aufrufer: `src/features/run/TrainingRunner.tsx:130-134`, `src/features/sim/GameSection.tsx:63-67`, `src/features/sim/SimRunner.tsx:175-181`
- **Problem:** `adaptiveNext` wertet die letzten zwei Einträge der gesamten Historie aus, ohne den Zähler nach einem Stufenwechsel zurückzusetzen. Dokumentiert ist „2 richtig in Folge → schwerer“.
- **Szenario:** Start auf Stufe 1, Folge [richtig, richtig] → Stufe 2. Die nächste richtige Antwort gibt [r, r, r] → sofort Stufe 3, also nach 3 statt 4 richtigen. Das gilt für Training (adaptiv), die Aon-Spiele und das DB-Profil „adaptiv“.
- **Fix:** Die Serie seit dem letzten Wechsel zählen (State `streak`, nach jedem Wechsel auf 0) oder `adaptiveNext` nur die Antworten seit dem letzten Wechsel übergeben. Ein Unit-Test fehlt bisher.

### M5 – „Ohne Wiederholung“ wird nur über den Seed-Schlüssel geprüft; inhaltsgleiche Aufgaben kommen in einer Sitzung mehrfach vor (gemessen)
- **Wo:** `src/content/picker.ts:42-64` (Duplikatprüfung über `g:<gen>@v:d:seed`), `src/features/run/{TrainingRunner.tsx:80, DrillRunner.tsx:40-48, SprintAndGame.tsx:48-60}`, `src/features/sim/GameSection.tsx:39-47` (gar keine `used`-Menge)
- **Problem:** Verschiedene Seeds erzeugen bei kleinen Parameterräumen identische Aufgaben, inklusive Optionsreihenfolge.
- **Messung** – Anteil der 20-Item-Drills mit mindestens einer identischen Aufgabe:

  | Generator | Stufe 1 | Stufe 2 | Stufe 3 |
  |---|---|---|---|
  | `aon.digit` | 199/200 | 180/200 | 137/200 |
  | `speed.squares` | 182/200 | 102/200 | – |
  | `speed.fraction` | 114/200 | 75/200 | – |
  | `speed.units` | – | – | 105/200 |
  | `speed.sequence` | – | – | 42/200 |

  In der BCG-Cognitive-Simulation (80 Fragen) enthalten 6 von 50 Läufen eine Frage doppelt.
- **Szenario:** In der Digit Challenge (5 Minuten) kommt dieselbe Gleichung zwei- bis dreimal; im Quadratzahl-Drill steht „17²“ zweimal.
- **Fix:** Einen Inhaltsschlüssel aus Prompt, Exhibits, Optionstexten bzw. Panels und Gleichung als Hash bilden, in `used` führen und bei Kollision neu ziehen (alle Modi inkl. `GameSection`). Optional die Parameterräume der genannten Generatoren vergrößern.

### M6 – Service Worker aktiviert neue Versionen nie selbst (`autoUpdate` wirkt nicht)
- **Wo:** `vite.config.ts:15-16` (`registerType: 'autoUpdate'`, `injectRegister: false`), `src/main.tsx:11-13`, `node_modules/vite-plugin-pwa/dist/index.js:874-877` (`skipWaiting`/`clientsClaim` werden nur bei `injectRegister` `'auto'`/`null` gesetzt)
- **Problem:** Das erzeugte `sw.js` ruft `skipWaiting()` nur bei der Nachricht `SKIP_WAITING` auf. Der Client läuft im autoUpdate-Modus und sendet diese Nachricht nie. Neue Deploys bleiben im Zustand „waiting“, bis alle Fenster bzw. die Standalone-App vollständig geschlossen sind. Auf iOS und bei der Dock-App kann das Tage dauern.
- **Szenario:** Eine korrigierte falsche Musterlösung wird deployt; die App auf dem Mac-Dock bleibt geöffnet und liefert weiter die alte Lösung.
- **Fix:** `workbox: { skipWaiting: true, clientsClaim: true }` explizit setzen und in `registerSW` `onNeedReload` nutzen. Den Reload aufschieben, solange eine Session läuft (sonst entsteht M1), und dann einen Hinweis „Update bereit“ zeigen. Alternativ `registerType: 'prompt'` mit Banner außerhalb von Sessions. E2E-Test für das Update ergänzen.

### M7 – Import prüft nur `id`/`itemKey`/`ts`; ein fehlerhafter Datensatz legt Kernseiten dauerhaft lahm
- **Wo:**
  - `src/data/repo.ts:53-63` (Validierung), `:72-84` (`bulkAdd`)
  - Absturzstellen: `src/features/run/TrainingRunner.tsx:69` (`a.ref.kind`), `src/features/sim/SimRunner.tsx:68` (`a.ref.kind` im asynchronen Effekt), `src/content/items.ts:8-10` (`isReproducible(undefined)`), `src/features/mistakes/Mistakes.tsx:29` und `src/features/stats/Stats.tsx:184` (`CATEGORY_BY_ID[x].name`)
  - `src/App.tsx:23-48` (kein `errorElement`)
- **Problem:** `ref`, `category`, `day`, `answered`, `correct`, `mode`, Sessions und Settings werden unvalidiert übernommen. Doppelte IDs innerhalb einer Datei (z. B. zwei Exporte von Hand zusammengefügt) lösen in `bulkAdd` einen `ConstraintError` aus, und der gesamte Import bricht mit „Die Datei konnte nicht gelesen werden.“ ab.
- **Szenario:** Eine Exportdatei aus einer späteren App-Version mit neuer Kategorie, aber unveränderter `schemaVersion`, oder eine bearbeitete Datei mit einem Attempt ohne `ref` wird importiert. Danach:
  - Training wirft beim ersten Item einen TypeError,
  - die Simulation hängt bei „Test wird vorbereitet …“ (unbehandelte Rejection),
  - Fehlerheft und Statistik zeigen die React-Router-Fehlerseite.

  Einziger Ausweg ist „Alle Daten zurücksetzen“.
- **Fix:**
  - Jeden Attempt vollständig validieren: Kategorie in `CATEGORY_BY_ID`, `ref`-Form und `refKey(ref) === itemKey`, `mode`, Booleans und Zahlen, `day` als `YYYY-MM-DD`. Ungültige Einträge überspringen und zählen; Sessions und Settings ebenso prüfen.
  - IDs innerhalb der Datei deduplizieren.
  - `errorElement` mit „Daten exportieren / zurücksetzen“ ergänzen.

### M8 – Versionierung der Generatoren ist nicht durchsetzbar, und das Fehlerheft zählt nicht mehr übbare Einträge
- **Wo:**
  - `src/data/mistakes.ts:20-41`, `src/features/home/Home.tsx:26`, `src/features/mistakes/Mistakes.tsx:11,23` (zählen alle Einträge)
  - `src/features/run/TrainingRunner.tsx:55` (übt nur `isReproducible`)
  - Generatoren nutzen Validatoren als Annahmefilter: `generators/inductive/figures-gen.ts:10`, `deductive/puzzles.ts:6`, `deductive/rules.ts:6`, `deductive/syllogism.ts:5`, `diagrammatic/flow-gen.ts:10`, `speed/sequence.ts:7`
  - `src/content/picker.ts:48,54` (Bank-Version hart `@1`/`v: 1` statt `BANK_VERSION`)
  - `src/content/registry.ts:82-87` (`fromRef`/`outdated` ungenutzt)
- **Problem:**
  - Nach dem ersten Versions-Bump (D17) bleiben alte Fehlerheft-Einträge für immer in Zähler und Liste („Alle 12 üben“), lassen sich aber weder üben noch abbauen. „Fehlerheft üben“ meldet dann „Dein Fehlerheft ist leer“, während Home „12 offene Aufgaben“ zeigt.
  - Weil Generatoren Validator-Funktionen und gemeinsame Module (`options.ts`, `format.ts`, Themes/Datasets) zur Annahme nutzen, ändert sich die Aufgabe zu einem Seed auch ohne Änderung am Generator-Code. Ein Beispiel ist `e912395`: Die geänderte `featureColumns` in `validators/inductive/index.ts:247-257` ändert, welche Odd-one-out-Kandidaten angenommen werden. Die Pflicht zum Versions-Bump wird dabei nicht bemerkt, und nach dem Release zeigt das Fehlerheft still eine andere Aufgabe.
  - Bank-Texte haben keine wirksame Versionierung.
- **Fix:**
  - Golden-/Snapshot-Test: Hash der Items je Generator × Stufe × N Seeds (EN und DE). Ändert sich ein Hash ohne `version`-Bump, wird der Test rot.
  - Nicht reproduzierbare Einträge in Home und Fehlerheft getrennt ausweisen („Aufgabe wurde überarbeitet“), nicht als offen zählen. Oder alte Generator-Versionen registriert lassen (Registry nach `id@v`), wie CLAUDE.md es verlangt.
  - Im Picker `BANK_VERSION`/`refKey` verwenden.

### M9 – `ded.tfc` und `ded.ordering` („must“): Der Schlüssel wird mit den Validator-Funktionen berechnet, Gate 2 prüft diese Items gegen sich selbst
- **Wo:**
  - `src/content/generators/deductive/puzzles.ts:6` (Import `solveOrdering`/`factHolds`/`clueHolds`), `:255` (`buildPuzzle`), `:364-368` (`must`/`could`/`never` aus `p.sols` + `factHolds`), `:435-441` (T/F/C-Klasse `cls()` aus Validator-Lösungen)
  - `src/content/validators/deductive/index.ts:129-175, 199-210` (Validator nutzt dieselben Funktionen)
- **Problem:** Das widerspricht D11 („Schlüssel stammt immer aus der Konstruktion des Generators, nie aus dem Validator“) und Regel 2 („unabhängig implementiert“). Ein Fehler in `solveOrdering`, `clueHolds` oder `factHolds` (z. B. Wrap-around bei `gap` am runden Tisch) erzeugt falsche Schlüssel, und Gate 2 bleibt trotzdem grün. Auch die Zuordnung Hinweistext ↔ Semantik (`texts().clue/fact`) prüft nur Gate 3 stichprobenartig. Stichprobe: Die heutigen Semantiken von `justBefore`, `gap`, „gegenüber“ und `notEnd` stimmen mit den Texten überein – das ist kein nachgewiesener Fehler, sondern eine Lücke in der Absicherung.
- **Fix:** Den Schlüssel aus der Konstruktion ableiten, oder für Gate 2 einen zweiten, unabhängig implementierten Löser einsetzen: anderer Algorithmus (z. B. Constraint-Propagation), der idealerweise die gerenderten EN-Hinweistexte zurückparst.

### M10 – Klassen ohne Cascade-Layer (`.card`, `.safe-top`, `.safe-bottom`, `.muted`) überstimmen alle Tailwind-Utilities
- **Wo:** `src/index.css:114-130` (außerhalb von `@layer`; Tailwind v4 legt Utilities in `@layer utilities` – im gebauten CSS geprüft)
- **Problem:** CSS ohne Layer gewinnt unabhängig von der Spezifität. Betroffen:
  - **Sprint** (`SprintAndGame.tsx:108`): Der grüne/rote Rahmen als Richtig/Falsch-Feedback erscheint nie, weil `.card{border:…}` gewinnt.
  - **Erklärung** (`ItemView.tsx:189`): Rahmen nie 2 px und nie grün/rot.
  - **Akademie** (`Academy.tsx:39`): `border-dashed` geht verloren.
  - **Karten**: `hover:bg-*` wirkt auf Home, Üben und Akademie nicht.
  - **Seitenrand oben** (`Layout.tsx:41`): `pt-4`/`lg:pt-8` werden durch `padding-top: env(safe-area-inset-top)` ersetzt – auf Mac/Desktop 0 px.
  - **Dialoge** (`kit.tsx:126`, `Calculator.tsx:56`): Der untere Innenabstand von `p-5`/`p-3` ist auf Geräten ohne Home-Indikator 0.
- **Fix:** Diese Klassen in `@layer components` legen oder per `@utility` definieren. Abstände mit `max(1rem, env(safe-area-inset-top))` setzen. Danach die Gate-6-Screenshots wiederholen.

### M11 – Globale Tastenkürzel (1–9 / A–H) wirken auf jedes gemountete MCQ-Item und auch hinter Dialogen
- **Wo:** `src/ui/ItemView.tsx:58-74` (`window`-Listener je `ItemView`, Effekt ohne Deps, kein `e.repeat`)
- **Problem:** Jedes MCQ-`ItemView` registriert einen eigenen globalen Listener.
- **Szenario (Mac):**
  - Akademie „Numerical“ (2 Beispiele) oder „Deductive“ (3): Taste „1“ beantwortet alle Beispiele gleichzeitig mit A.
  - Drill mit offenem Dialog „Drill abbrechen?“: Taste „b“ gibt die Aufgabe hinter dem Dialog mit B ab.
  - Gedrückt gehaltene Taste beantwortet mehrere Drill-Aufgaben nacheinander.
- **Fix:** Kürzel nur für das aktive Runner-Item (Prop `shortcuts`); ignorieren, wenn ein `[aria-modal="true"]` offen ist oder `e.repeat` gesetzt ist; in der Akademie keine globalen Kürzel.

### M12 – Grid Challenge: Das 8-Sekunden-Timeout der Urteilsaufgabe feuert nie
- **Wo:** `src/ui/answers.tsx:379-383` (Effekt ohne Deps). Die Eltern rendern per `useNow` alle 250–500 ms neu: `GameSection.tsx:50`, `TrainingRunner.tsx:150`, `DrillRunner.tsx:102`.
- **Problem:** Jedes Re-Render räumt den Timer ab und startet ihn neu, sodass `judge(null)` nie ausgelöst wird.
- **Szenario:** Wer bei der Symmetrie- oder Drehungsfrage beliebig lange wartet, kann die Punktfolge ungestört memorieren. Das ist realitätsfern; das Timeout ist faktisch toter Code.
- **Fix:** Deps `[phase.k, phase.i]`, `judge` über einen Ref aufrufen bzw. Deadline einmal je Phase setzen.

### M13 – „Nochmal“ im Einzelspiel ist wirkungslos
- **Wo:** `src/features/run/SprintAndGame.tsx:154-156` (Link auf denselben Pfad), `src/App.tsx:18-21` (`Fresh` keyt nur auf `pathname + search`)
- **Problem:** Gleicher Pfad und gleiche Query → kein Remount; `results` bleibt gesetzt, der Ergebnisbildschirm bleibt stehen.
- **Fix:** `loc.key` in den `Fresh`-Key aufnehmen (nur bei Runner-Routen) oder mit Nonce navigieren (`?r=<Date.now()>`).

### M14 – Einstellung „Taschenrechner standardmäßig öffnen“ hat keine Wirkung
- **Wo:** `src/features/settings/Settings.tsx:65`, `src/data/types.ts:58,70` (Default `true`). `calculatorDefault` wird nirgends gelesen; `calc` startet immer mit `false`: `TrainingRunner.tsx:46`, `DrillRunner.tsx:34`, `SimRunner.tsx:42`.
- **Szenario:** Die Einstellung steht standardmäßig auf „an“, trotzdem öffnet sich der Rechner nie automatisch.
- **Fix:** `calc` aus `settings.calculatorDefault && item/section erlaubt` initialisieren oder die Einstellung entfernen.

---

## Gering

- **G1 – Ticker rendert ganze Runner neu.** `useNow` (`run/common.ts:45-58`) rendert Training, Drill, Simulation und Spiele 2–4× pro Sekunde komplett neu, inklusive `ItemView` (SVG-Charts, Figuren). Der Tastatur-Effekt (`ItemView.tsx:59`) meldet sich dabei jedes Mal neu an. Fix: Countdown als eigene kleine Komponente, `ItemView` mit `memo` und stabilen Callbacks.
- **G2 – Volle Tabellenscans.**
  - Training abonniert `db.attempts.toArray()` live (`TrainingRunner.tsx:37`) und liest nach jeder gespeicherten Antwort die gesamte Tabelle neu.
  - Home, Üben, Statistik und Fehlerheft scannen ebenfalls komplett; der Simulationsstart lädt alle Attempts (`SimRunner.tsx:66`).
  - `exhibitFits` (`picker.ts:75-79`) erzeugt jedes Kandidaten-Item zusätzlich auf Englisch.

  Bei vielen tausend Attempts wird das auf dem iPhone spürbar. Fix: gesehene Bank-IDs einmalig bzw. per Index laden; Aggregation nicht bei jedem Schreibvorgang.
- **G3 – Simulation: Ausgangszustand und Rücknahme.** Reihenfolge-Items starten ohne Entwurf (`SimRunner.tsx:272`), anders als Training und Drill (`TrainingRunner.tsx:88-89`, `DrillRunner.tsx:96-100`). Eine bereits richtige Reihenfolge braucht einen Scheinzug, sonst zählt sie als leer bzw. „Weiter“ bleibt gesperrt. Außerdem lässt sich eine gewählte Option nicht zurücknehmen (Kearney −1).
- **G4 – Importierte Einstellungen.** Sie werden nur in die DB geschrieben (`repo.ts:81`), nicht in den Zustand-Store (`state/settings.ts`). Wirksam erst nach Neustart; die nächste Änderung in den Einstellungen überschreibt sie mit Defaults + Patch.
- **G5 – Verwaiste Sessions.** Sessions bleiben `running`:
  - `GameRun` legt schon beim Mount eine an (`SprintAndGame.tsx:138-140`).
  - Sprint und Training werden beim Verlassen nicht abgeschlossen, Training auch nicht, wenn der Plan endet (`TrainingRunner.tsx:75-79`).
  - Läuft beim offenen Abbruch-Dialog des Drills die Zeit ab, überschreibt „Abbrechen“ den Status `finished` danach mit `aborted` (`DrillRunner.tsx:181-188`).
- **G6 – Freitext-Eingabe.** `parseUserNumber` (`answers.tsx:65-77`) lehnt „12,5 %“, „€7.50“ oder „12 Mrd“ ab; der Button bleibt ohne Hinweis gesperrt. „1,234“ wird bei EN-Items als 1,234 gelesen, also eins Komma zwei drei vier. Der Sprint enthält `speed.units` mit Ergebnissen bis 10¹¹, die als Ziffernfolge eingetippt werden müssen.
- **G7 – Safe Areas.** Die Sticky-Aktionsleisten im Fokusmodus (`TrainingRunner.tsx:233`, `SimRunner.tsx:273`) und `main` haben kein `env(safe-area-inset-bottom)`. Im Querformat (`orientation: 'any'`) fehlen seitliche Insets.
- **G8 – Barrierefreiheit.**
  - `role="radiogroup"` ohne Pfeiltasten und roving tabindex (`kit.tsx:47-64`, `answers.tsx:20-35`).
  - `Confirm` ohne Focus-Trap, Fokus-Rückgabe und `aria-describedby` (`kit.tsx:118-138`).
  - Fragenübersicht: beantwortet/unbeantwortet visuell nur über Farbe (`SimRunner.tsx:266`).
  - Grid-Recall-Felder: `aria-label` verdeckt die Tap-Reihenfolge (`answers.tsx:435`).
- **G9 – Toter Code und irreführende Stellen.**
  - `registry.ts`: `generate` und `fromRef` sind ungenutzt.
  - `ItemView.tsx`: `SubmitBar` (`:221`) ungenutzt; doppelter bzw. verwaister JSDoc an `:175-176`.
  - `db.ts:4` verweist auf ein nicht existierendes `src/data/db.test.ts`.
  - `games.ts:270`: `rng.int(1, 3)` steht in der Schleifenbedingung und wird pro Iteration neu gezogen (deterministisch, aber irreführend).
  - `Math.random` in `SprintAndGame.tsx:50` (UI, erlaubt, aber uneinheitlich zu `randomSeed`).
- **G10 – Doppelte Precache-Einträge.** `includeAssets` plus `globPatterns` (`vite.config.ts:17,37`) führen zu doppelten Einträgen für `favicon.svg` und `apple-touch-icon.png` (gleiche Revision, daher harmlos). `includeAssets` streichen.
- **G11 – Fehlerpfade ohne Behandlung.**
  - `firstAccepted` wirft nach 400 Versuchen (`pipeline.ts:14`); `resolveItem` wird in den Runnern und im asynchronen Simulationsstart ohne `try/catch` aufgerufen.
  - `void saveAttempt(...)` im Sprint und `saveAttempts` im Spiel verschlucken DB-Fehler (Quota, `VersionError` nach Rollback).

  Ob ein realer Seed die Ausnahme auslöst: unbestätigt.
- **G12 – QA-Route im Produktivbundle.** `/render/:key?reveal=1` (`App.tsx:44`, `RenderItem.tsx`) zeigt Lösungen per URL; unschädlich, aber unnötig.
- **G13 – Gemeinsamer Origin auf GitHub Pages.** Alle Projektseiten desselben Accounts auf `<user>.github.io` teilen den Origin, also auch die IndexedDB `assessment-trainer`. Hinweis; ggf. Custom Domain.
- **G14 – Bundle-Größe.** Ein Chunk mit 868 kB (277 kB gzip) inklusive aller Banken, Generatoren und Akademie. Route-Splitting würde den Start auf dem iPhone verkürzen.
- **G15 – Export auf iOS (unbestätigt).** Export per `<a download>` und Blob-URL (`Settings.tsx:24-36`) im iOS-Standalone-Modus ist ungetestet; `revokeObjectURL` nach 1 s. Die Erfolgsmeldung erscheint unabhängig vom Ergebnis. Web Share API (`navigator.share({ files })`) als primären Weg erwägen.
- **G16 – Kleinigkeiten.**
  - `today` wird per `useState` eingefroren (`Home.tsx:17`, `Stats.tsx:67`) und ist über Mitternacht veraltet.
  - P&G-Simulation: `GameSection` startet immer auf Stufe 1 statt `profile.difficulty` (`SimRunner.tsx:242-252`).
  - `toLocaleString('de-CH')` in `Stats.tsx:220`.
- **G17 – Testlücken.**
  - Kein Unit-Test für `adaptiveNext` (M4).
  - Keine E2E-Tests für Simulation mit Spielabschnitt und vorzeitigem Abgeben (K1), Reihenfolge der Ergebnisliste (M3), Inhalts-Duplikate (M5) und SW-Update (M6).
  - E2E baut mit `base: '/'`; das deployte Artefakt mit `BASE_PATH` wird nicht getestet.
  - Gate 2 (2.000 je Stufe) läuft nur auf EN; DE nur gemischt in 150 Property-Läufen je Generator.
  - Kein Golden-/Snapshot-Test Seed → Item (M8).

---

## Geprüft ohne Befund (Auszug)

- **Determinismus:** Kein `Math.random`, `Date` oder `crypto` in `src/content` außer `randomSeed()` (nur UI-Seeds). mulberry32/FNV-Seeds; Wiederholungsschleife deterministisch über `(seed, attempt)`. Determinismus-Tests: `gate2.test.ts:19-37`, `properties.test.ts`.
- **Unabhängigkeit:** Validatoren importieren keine Schlüssel. Importiert werden nur Typen und die Figur-Formkonstanten `RING`/`ROTATING`/`SIDES`; gegen den Renderer abgeglichen: Pfeil 7, L 6, Kreuz 12, Stern 10 Ecken. `toPublic` entfernt `correct`/`answer`/`correctOrder`/`sample`/`explanation`/`free` und die Grid-Urteile. (Ausnahme: M9.)
- **`check.ts`:**
  - Alle Item-Typen abgedeckt.
  - Bar-Toleranz `step/2` passt zur Snap-Logik (Achse ab 0, Werte Vielfache von `step`).
  - Digit über den unabhängigen Löser (jede gültige Lösung zählt).
  - Grid mit Teilpunkten.
- **Punkte und Statistik:**
  - Negativwertung +5/−1/0 und Maximum 200 korrekt (`stats.ts:116-133`, E2E `sim.spec.ts`).
  - `stats.ts` und `mistakes.ts` sind reine Funktionen über `attempts`; Fehlerheft-Regel per Property-Test abgesichert.
- **Datenhaltung:**
  - Import idempotent per ID in einer Transaktion, Reset in einer Transaktion, Migration v1→v2 getestet.
  - Doppel-Submits durch `busy`/`submitting`/`ending`-Refs verhindert.
  - Drill und Training speichern jede Antwort sofort.
- **Sicherheit:**
  - Kein `dangerouslySetInnerHTML` (zusätzlich per ESLint-Regel verboten); `Rich` erzeugt nur Text und `<strong>`; importierte Strings werden von React escaped.
  - Keine externen Requests zur Laufzeit (Systemschrift, kein CDN, keine Analytics); der SW cacht nur eigene Assets, `navigateFallback` ist `index.html`.
- **Timer und Aufräumen:**
  - Absolute Deadlines plus `visibilitychange`, daher robust gegen Hintergrund-Drosselung.
  - Intervalle, Listener und ResizeObserver werden aufgeräumt.
  - Blocker für Drill und Simulation vorhanden.
- **PWA:** Manifest (192/512/maskable, `standalone`, `start_url`/`scope`/`id` = Base), `apple-touch-icon` und Base-Präfixe im Build mit `BASE_PATH` korrekt. HashRouter funktioniert bei Deep-Links offline (E2E `offline.spec.ts`).
