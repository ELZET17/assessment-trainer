# Gate 10 – Code-Review, Runde 2 (Assessment Trainer)

**Dateien geprüft: 52. Befunde: 15 (kritisch: 0, mittel: 3, gering: 12)**

Stand: `main` @ `249f132` (02.11.2026, 20:11). Arbeitsbaum: nur `docs/qa-log.md` uncommittet geändert (nicht Teil des Reviews).

**Grundlage.** Gelesen wurden:
- `CLAUDE.md`, `docs/decisions.md`, der Bericht aus Runde 1, die Diffs von `2fb48fa`, `8fcb4e7` und `249f132`.
- Vollständig: `SimRunner`, `SprintAndGame`, `GameSection`, `picker`, `items`, `main.tsx`, `vite.config.ts`, `repo.ts`, `db.ts`, `App.tsx`, `index.css`, `Layout`, `Calculator`, `arrange.ts`, `common.ts`, `Review`, `mistakes.ts`, `Mistakes`, `check.ts`, `state/settings.ts`, `Settings`.
- In den relevanten Abschnitten: `ItemView`, `answers` (Zahleneingabe, Balken, Reihenfolge, Grid), `kit` (Confirm), `TrainingRunner`, `DrillRunner`, `SimPages`, `stats.ts`, `Home`, `Stats`, `profiles`, `shl.ts` (int.order), `validators/deductive` (Reihenfolge-Löser), `puzzles.ts` (Diff).
- Tests und Werkzeuge: `scripts/golden.ts`, `tests/content/golden.test.ts`, `tests/sim.test.ts`, `e2e/regression.spec.ts`, `e2e/data.spec.ts` (Diff), `.github/workflows/deploy.yml`, `playwright.config.ts`, `scripts/blind-export.ts` (Kopf).
- `node_modules/vite-plugin-pwa/dist/client/build/register.js` (v2.0.0).

**Selbst ausgeführt:**
- `tsc -b` und `eslint .` ohne Fehler; `npm test` grün (197 Tests); `golden.test.ts` grün (0,3 s).
- Build mit `BASE_PATH=/assessment-trainer/` in ein Scratch-Verzeichnis: `sw.js` enthält nur `SKIP_WAITING → skipWaiting()`, kein `clientsClaim`.
- Scratch-Skripte:
  - Inhaltsdomänen je Speed-/Aon-Generator × Stufe (1.500 Seeds).
  - Füllgrad von 40er-Drills über `pickFrom`.
  - Laufzeit der Simulationsauswahl für alle Profile (≤ 11 ms pro Lauf in Node, keine `null`-Picks).
- E2E (Playwright) nicht ausgeführt, weil der Build in das Repo schreiben würde.

Schweregrade: **kritisch** = falsches Ergebnis, Datenverlust oder Sicherheit · **mittel** = echter Fehler in einem Randfall oder erhebliches Risiko · **gering** = Stil oder Aufräumen. „unbestätigt“ = nicht am laufenden Code nachgewiesen.

---

## Runde-1-Befunde

| # | Status | Beleg |
|---|---|---|
| K1 Spielantworten gehen bei vorzeitigem Abgeben/Verlassen verloren | **behoben** | `GameSection.tsx:82-88` meldet jedes Ergebnis per `onResult`. `SimRunner.tsx:285-288` sammelt es in `gameResults.current[secIdx]` und speichert es sofort (ID `…:g{si}:{k}`); `finishAll` (`:165-168`) liest diesen Stand. Einzelspiel: `SprintAndGame.tsx:152-154` speichert jede Antwort, „← Beenden“ bestätigt (`:183-186`, `:209-216`) und schließt die Session `aborted` (`:155-159`). E2E `regression.spec.ts:20-30`. Es fehlt nur ein E2E für „Simulation mit Spielabschnitt abgeben“. |
| M1 Simulation hält Antworten nur im State | **behoben** (Kern) | `persist` (`SimRunner.tsx:122-130`) macht bei jeder Antwort (`:152`) und jedem Positionswechsel (`:141`) einen Upsert mit deterministischer ID `${session}:${si}:${i}`. E2E Reload `regression.spec.ts:32-38`. Rest: kein Fortsetzen; verwaiste `running`-Sessions → G-N8. |
| M2 Zeit der letzten Aufgabe geht verloren | **behoben** | Synchroner Spiegel `slotsRef` (`:39-46`); `finishAll` liest `slotsRef.current` (`:170`). |
| M3 Ergebnisliste in Zufallsreihenfolge | **behoben** | `seq = si·1000 + i` (`:117`, `:157`); Sortierung nach `seq`, dann `ts` (`SimPages.tsx:131`); E2E `regression.spec.ts:40-53`. Rest: `section` wird weiterhin nicht an `Review` übergeben → G-N13. |
| M4 Adaptive Treppe steigt zu schnell | **behoben** | `adaptiveLevel` setzt `run` nach jedem Wechsel zurück (`picker.ts:21-34`); Unit-Test `check.test.ts`. Alle drei Aufrufer übergeben Start und gesamte Historie. |
| M5 Inhaltsgleiche Wiederholungen | **behoben** | `contentKey` (`items.ts:11-15`) wird geprüft in `pickFrom` (`picker.ts:76-80`), `pickForSection` (`:110-116`) und `GameSection` (`:57-64`); Tests `sim.test.ts:48-75`. Die Doppelzählung in `pickForSection` ist unkritisch, weil `bank` nur `verbal`/`critical` sein kann und dieser Zweig keinen `contentKey` setzt. Rest: sehr kleine Domänen → G-N14. |
| M6 SW aktiviert neue Versionen nie | **behoben** | `registerType: 'prompt'`; `updateSW(true)` nur außerhalb von `#/run`, `#/sim/run` und `#/sprint/run`, sonst beim nächsten `hashchange` (`main.tsx:14-25`). Stündliches `reg.update()` und `reg.update()` bei `visibilitychange`. `sw.js` geprüft. Rest: Mehrfenster-Fall → G-N5. |
| M7 Import-Validierung, fehlende Fehlerseite | **teilweise** | Attempts werden feldweise geprüft, Sessions grob; IDs werden innerhalb der Datei dedupliziert; ungültige Einträge werden gezählt (`repo.ts:52-107`); `errorElement` (`App.tsx:23-40`). Offen: Die Fehlerseite ist im Standalone-Modus eine Sackgasse (→ **M-N2**). `answer`, `session.sections` und die Werte der Einstellungen bleiben ungeprüft; `refKey(ref) === itemKey` wird nicht geprüft (→ G-N7). |
| M8 Versionierung nicht durchsetzbar, Fehlerheft zählt Unübbares | **teilweise** | `mistakeBook` lässt nicht reproduzierbare Einträge weg (`mistakes.ts:39-40`), Home und Fehlerheft sind damit konsistent. Golden-Test (`scripts/golden.ts`, `tests/content/golden.test.ts`) läuft in CI über `test:content`. Offen: Bank-Version ist weiter hart `@1` (`picker.ts:60`, `:152`); der Golden-Test nutzt nur 3 Seeds je Stufe (→ G-N6, G-N13). |
| M9 `ded.ordering`/`ded.tfc` prüfen sich selbst | **behoben** | Eigener Löser `generators/deductive/arrange.ts` (Backtracking über Sitzplätze); `puzzles.ts` importiert vom Validator nur noch Typen. Semantik Zeile für Zeile verglichen (`justBefore` inkl. Ring, `gap` = Abstand n+1 mit Ring-Minimum, `notEnd`, `adjacent`, `before`): identisch zu `validators/deductive/index.ts:129-163`. Hinweis: Die Zuordnung Hinweistext ↔ Semantik prüft weiterhin nur Gate 3. |
| M10 Ungelayerte Klassen überstimmen Utilities | **behoben** | `@layer components` (`index.css:110-129`); `main` mit expliziten Safe-Area-Abständen (`Layout.tsx:41`); Kalender und Rechner ohne `.safe-bottom`. Rest: kosmetisch → G-N11. |
| M11 Globale Tastenkürzel | **behoben** | Prop `keyboard` (Akademie `false`); Kürzel aus bei `e.repeat`, Modifiern, Eingabefeldern und offenem `[aria-modal="true"]` (`ItemView.tsx:61-81`). Der Rechner hat keine eigene Tastatureingabe, daher kein Konflikt. |
| M12 Grid-Timeout feuert nie | **behoben** | Deps `[phase.k, phase.i]` und Aufruf über `judgeRef` (`answers.tsx:384-393`). |
| M13 „Nochmal“ im Einzelspiel wirkungslos | **behoben** | Rundenzähler als Key (`SprintAndGame.tsx:132-137`). |
| M14 Rechner-Einstellung wirkungslos | **teilweise** | Training (`TrainingRunner.tsx:142-148`) und Simulation (`SimRunner.tsx:220-224`) beachten sie, der Default ist jetzt `false`. **Drill nicht:** `DrillRunner.tsx:34` startet weiter mit `false`, ohne Effekt (→ G-N4). |

---

## Neue Befunde

### Mittel

#### M-N1 – Simulation: Nie angezeigte Reihenfolge-Aufgaben zählen als beantwortet (meist falsch) und landen im Fehlerheft
- **Wo:**
  - `src/features/sim/SimRunner.tsx:27` (`initialAnswer`)
  - `:84`, `:213` (Slots starten mit `answer = Identität`)
  - `:113-118` (`slotAttempt`: `answer ≠ null` → gewertet)
  - `src/features/run/common.ts:22-24` (`answered: o.answer !== null`)
  - `src/data/mistakes.ts:24-41` (jeder beantwortete Fehler kommt ins Heft)
- **Problem:** Der Fix für G3 aus Runde 1 setzt die angezeigte Reihenfolge schon beim Aufbau des Tests als Antwort. Anders als in Training und Drill gibt es in der Simulation keinen Abgabeschritt; der Slot gilt sofort als beantwortet.
- **Szenario:** BCG-CCA (15 Fragen, 20 Min., `int.order` mit Gewicht 2), Zeitablauf bei Frage 9. Jede `int.order`-Aufgabe unter den Fragen 10–15 wird gespeichert mit `answered: true` und `correct: false`.
  - Mit Wahrscheinlichkeit 1/24 bzw. 1/120 ist die gemischte Startreihenfolge zufällig richtig; dann zählt die Aufgabe sogar als `correct: true`.
  - Folgen: „In der Zeit geschafft“ ist zu hoch, die Trefferquote zu niedrig, die Statistik je Unterkategorie verfälscht, und das Fehlerheft enthält Aufgaben, die die Person nie gesehen hat.
  - Bei allowSkip-Profilen würde außerdem „Überspringen“ verschwinden (`:318`). Ein Profil mit Negativwertung (Kearney) und `int.order` gibt es derzeit nicht; der Fehler wäre dort ein Punktabzug.
- **Fix:** Den Startwert erst beim ersten Anzeigen setzen (Flag `seen` am Slot, gesetzt in `commitTime`/beim Rendern) oder in `slotAttempt` Reihenfolge-Slots mit `!seen` als leer werten. Unit- oder E2E-Test: BCG-CCA mit Zeitablauf, nicht erreichte `int.order` = `answered: false`.

#### M-N2 – Fehlerseite ist im Standalone-Modus eine Sackgasse (Rest aus M7)
- **Wo:** `src/App.tsx:23-40` (`errorElement` an der Wurzelroute; einziger Link `#/`)
- **Problem:** Die Fehlerseite ersetzt das ganze Layout ohne Navigation. Wirft die Startseite selbst (z. B. `stats.ts:122` `s.sections?.every` bei einer importierten Session mit nicht-array `sections`, oder ein künftiger Rechenfehler in `aggregate`/`streak`), führt „Zur Startseite“ wieder auf den Fehler. Als Homescreen-App (iPhone) bzw. Dock-App gibt es keine Adresszeile; „Einstellungen → Exportieren/Zurücksetzen“ ist nicht erreichbar. Die App ist dann ohne Löschen der Website-Daten unbrauchbar.
- **Fix:**
  - Auf der Fehlerseite Links zu `#/settings` anbieten, besser direkt die Buttons „Daten exportieren“ (`exportAll`) und „Alle Daten zurücksetzen“ (`resetAll`, mit Confirm).
  - Alternativ `errorElement` an die Kindrouten hängen, damit die Navigation sichtbar bleibt.

#### M-N3 – Export auf iPhone/iPad: Share-Sheet ohne Fallback, Nutzeraktivierung kann nach `await exportAll()` verfallen (unbestätigt)
- **Wo:** `src/features/settings/Settings.tsx:24-45`
- **Problem:** Erst wird asynchron die ganze DB gelesen und serialisiert, danach wird `navigator.share` aufgerufen. WebKit verlangt für `share()` eine noch gültige transiente Nutzeraktivierung; nach längeren `await`-Ketten wirft Safari `NotAllowedError`.
  - Auf Touch-Geräten gibt es keinen Download-Fallback. Die Meldung „bitte erneut versuchen“ führt bei großem Datenbestand immer wieder in denselben Fehler.
  - Export ist der einzige Weg für Backup und Abgleich Mac ↔ iPhone (D2).
  - Der Share-Pfad ist ungetestet; `e2e/data.spec.ts:24-25` schaltet ihn ab.
  - Auf einem Gerät nicht nachgewiesen.
- **Fix:**
  - Bei jedem Fehler außer `AbortError` auf den `<a download>`-Weg zurückfallen.
  - Oder die Datei vor dem Klick vorbereiten: beim Öffnen der Seite bzw. zweistufig „Export vorbereiten“ → „Teilen“, sodass `share()` synchron im Klick-Handler läuft.
  - Einmal auf einem echten iPhone mit realistischer Datenmenge prüfen.

### Gering

- **G-N4 – Drill ignoriert „Taschenrechner standardmäßig öffnen“** (`DrillRunner.tsx:34`): gleicher Effekt wie in `TrainingRunner.tsx:142-148` ergänzen (Rest aus M14).
- **G-N5 – SW-Update lädt ein zweites Fenster mitten im Lauf neu** (`main.tsx:15-25`, `register.js` `showSkipWaitingPrompt`).
  - Jeder Client, der `waiting` gesehen hat, registriert einen `controlling`-Listener mit `window.location.reload()`.
  - Aktiviert Fenster A (Startseite) das Update, lädt Fenster B (z. B. Simulation) sofort neu. Antworten sind dank M1 gespeichert, der Lauf ist aber abgebrochen und die Session verwaist.
  - Fix: `onNeedReload` übergeben, das bei `busy()` den Reload bis zum nächsten `hashchange` aufschiebt.
  - Der Mehrfenster-Fall ist unbestätigt (Ableitung aus `register.js` und workbox-window).
- **G-N6 – Golden-Test mit 3 Seeds je Stufe** (`scripts/golden.ts:11`): Änderungen an gemeinsamen Annahmefiltern (Validatoren, `options.ts`), die nur einen Teil der Seeds betreffen, rutschen mit 9 Stichproben je Generator leicht durch. Die Laufzeit liegt bei 0,3 s, 25–50 Seeds sind daher günstig.
- **G-N7 – Lücken der Import-Validierung** (`repo.ts:52-107`):
  - `answer` wird nicht geprüft. Beispiel: `{type:'order'}` ohne Array → `DragOrder` stürzt beim Öffnen in `Review` ab.
  - `session.sections` wird nicht geprüft → `stats.ts:122` `.every` auf einem Nicht-Array.
  - Einstellungen werden als `{...DEFAULT_SETTINGS, ...file.settings}` übernommen: Typen ungeprüft, und ein fremdes `id` aus der Datei überschreibt `'settings'`, sodass der Datensatz unter falschem Schlüssel landet.
  - `refKey(ref) === itemKey` wird nicht geprüft.
- **G-N8 – Abgebrochene Simulationen.**
  - Nach Reload oder Prozess-Kill bleibt die Session `running`; die gespeicherten Antworten zählen in Statistik und Fehlerheft, das Ergebnis ist aber nirgends abrufbar (`simulationResults` filtert `finished`).
  - Die mitgespeicherte `timeMs` der gerade bearbeiteten Aufgabe ist 0, weil `commitTime` erst beim Wechsel läuft.
  - Fix: Beim Start verwaiste `running`-Simulationen abschließen (`aborted`) bzw. „auswerten“ anbieten; `persist` mit der laufenden Zeit aufrufen.
- **G-N9 – Ein DB-Schreibvorgang pro Pointer-Move**: `BarDrag` ruft `onChange` bei jedem `pointermove` auf (`answers.tsx:158`). In der Simulation folgt jedes Mal `setAnswer → persist → checkAnswer + put` (`SimRunner.tsx:145-153`). Auf dem iPhone sind das dutzende IndexedDB-Transaktionen pro Sekunde. Fix: drosseln oder erst bei `pointerup` bzw. beim Wechsel speichern.
- **G-N10 – Unbehandelte Rejections.**
  - `void reg.update()` (`main.tsx:29-30`) wirft offline bei jedem `visibilitychange`.
  - `void saveAttempt(...)` im Sprint (`SprintAndGame.tsx:121`) hat kein `.catch`.
- **G-N11 – Safe-Area-Reste.**
  - `Confirm` trägt noch `safe-bottom`, das jetzt wirkungslos ist, weil `p-5` gewinnt (`kit.tsx:126`). Der Abstand reicht wegen `p-4` am Container gerade noch.
  - Die untere Navigation (`Layout.tsx:45`) hat im Querformat keine seitlichen Insets.
- **G-N12 – `arrange.ts:154`:** Der letzte `return` behandelt jeden unbekannten Hinweistyp als `gap`. Ein künftiger Clue-Typ würde still falsch gelöst. Exhaustiver `switch` mit `never`-Check, wie im Validator.
- **G-N13 – Reste aus M3/M8.**
  - `SimResult` übergibt `section` nicht an `Review` (`SimPages.tsx:131-133`); bei Kearney fehlt die Abschnittszuordnung in der Liste.
  - Die Bank-Version ist hart `@1` statt `BANK_VERSION`/`refKey` (`picker.ts:60`, `:152`).
- **G-N14 – Drill kann bei winzigen Domänen kürzer werden als gewählt** (`DrillRunner.tsx:42-44`, `if (!ref) break`; `pickFrom` versucht 20 Seeds).
  - Gemessen: `aon.digit` Stufe 1 hat nur 54 verschiedene Aufgaben (1.500 Seeds), `speed.squares` Stufe 1 hat 91.
  - Ein 40er-Drill `aon.digit`/1 endete in 1 von 20 Läufen mit 39 Aufgaben. Ohne Hinweis, sonst korrekt; die Kopfzeile zeigt die tatsächliche Zahl.
- **G-N15 – Dokumentation.**
  - Die neuen Grundsatzentscheidungen haben keinen ADR-Eintrag in `docs/decisions.md`: Prompt-Modus mit Update außerhalb von Läufen, Sofortspeicherung per deterministischer ID/`seq`, Generator-seitiger Löser, Golden-Test-Workflow.
  - `db.ts:4` verweist weiter auf das nicht existierende `src/data/db.test.ts`.

---

## Geprüft ohne Befund (Auszug)

- **Persistenz der Simulation:**
  - Upsert-Reihenfolge: Einzel-`put`s vor `ending.current = true` werden in Erstellungsreihenfolge vor dem abschließenden `bulkPut` ausgeführt; der letzte Stand gewinnt.
  - `persist` wird nach dem Abgeben nicht mehr aufgerufen.
  - Spiel- und Slot-IDs kollidieren nicht (`:g{si}:` vs. `:{si}:`).
  - `seq` ist im Gesamtzeit-Modus (Kearney) gleich der flachen Reihenfolge.
- **Adaptiv:** `adaptiveLevel` ist in Training (Start 2), Spielen (Start = Profil bzw. 1) und DB-SHL korrekt; die Historie wird je Abschnitt zurückgesetzt (`SimRunner.tsx:187`).
- **Content-Key:**
  - Schließt `ref`, `key` und `query` aus; `toPublic` entfernt Schlüssel und Erklärung.
  - Die Auswahl bleibt schnell (≤ 11 ms pro Simulationsaufbau in Node).
  - Alle Profile werden in Tests ohne `null` gefüllt.
- **Service Worker:**
  - Der Prompt-Modus ruft `skipWaiting` nur nach Nachricht auf.
  - Neu geladen wird nur über das `controlling`-Event, also erst nach Aktivierung.
  - Die Run-Regex deckt alle Fokus-Routen ab: `run/drill`, `run/game/*`, `run/:kind`, `sim/run/*`, `sprint/run`.
- **Sicherheit und Datenschutz:**
  - Kein `dangerouslySetInnerHTML`.
  - Die Fehlerseite zeigt `error.message` als Text, React escaped.
  - Prototype-Pollution im Import ist durch Spread und Testfall abgedeckt.
  - Keine externen Requests.
  - Die QA-Route `render/:key` ist nur in DEV registriert; `blind-export` nutzt den Dev-Server (5173).
- **Grid-Timer:** keine Doppelauslösung, weil Klick und Timeout über dieselbe Phase laufen und das Cleanup beim Phasenwechsel greift.
- **Rechner:** Er überdeckt die Aktionsleiste nicht mehr (`bottom: inset + 6rem`), hat keine eigene Tastaturbelegung und kollidiert daher nicht mit den Antwortkürzeln.
- **Zahleneingabe:** Die erweiterte `parseUserNumber` entfernt nur ein führendes Währungszeichen und ein nachgestelltes Prozent-, Währungs- oder Code-Kürzel; der Test deckt das ab. Die bekannte EN-Mehrdeutigkeit „1,234“ bleibt (G6 aus Runde 1).
