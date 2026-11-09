# Gate 5 – Realismus: Profile vs. docs/research.md

Profile geprüft: 9. Befunde: 32 (kritisch: 4, mittel: 16, gering: 12)

Geprüft am 02.11.2026 (read-only): `docs/research.md` (Stand 31.10.2026), `src/content/profiles.ts`, `src/content/categories.ts`, `src/features/sim/SimPages.tsx`, `SimRunner.tsx`, `GameSection.tsx`. Wo es um Profil-Parameter geht, wurde auch `src/features/academy/lessons.ts` (Lektion „Zeitmanagement & Test-Taktik“) einbezogen, weil sie dieselben Parameter gegenüber dem Nutzer begründet.

## Ohne Befund (bestätigt)

- **Interne Konsistenz:** Statuswerte stimmen mit den Abschnitten überein (Bain Sova 12+12 Fragen, 16+12 Min.; Bain TG 10/10/8 Fragen, 10/10/12 Min.; CCA 15/20; Kearney SHL 14/16/18; Allianz 15/16/12; DB 24/36; P&G 6/5/6 Min.). Kearney: 7+7+6+7+7+6 = 40 Fragen, eine Gesamtuhr von 60 Min., 40 × 5 = 200 Punkte = `maxPoints` in `simulationResults`. BCG: 80 Fragen in 30 Min. = 22,5 s je Frage. Die Zeit je Frage liegt überall bei 45–90 s und ist plausibel.
- **BCG ohne Rechner:** `calculator: false`. Alle Simulations-Items sind MC (`freeInput` ist in `SimRunner` aus), passend zu „alle Fragen Multiple Choice“.
- **Stand und Varianz:** Die Überschrift „So sieht der echte Test aus (laut Recherche, Stand {researchDate})“ zeigt 31.10.2026, also den Stand von research.md. Jedes Profil bekommt den Hinweis „Formate variieren je Büro und Jahr – maßgeblich ist immer deine Einladung.“
- **Logos und Inhalte:** Keine Firmenlogos (`public/` hat nur ein neutrales Balken-Icon). Die Profile und Spiel-Intros enthalten keine kopierten Testinhalte.
- **Stichproben** (abgerufen am 02.11.2026):
  - BCG Schweiz (careers.bcg.com) bestätigt 30 Min., numerisch/verbal/logisch, MC und „without any tools or resources“.
  - P&G (pgcareers.com) bestätigt Interactive Assessment ca. 30 Min., mobil, über 20 Sprachen, je nach Rolle.
  - StrategyCase (BCG Cognitive Test) bestätigt 80/30, kein Rechner, 60–70 % / 30–40 %, Zoom-Aufsicht, Papier + Stift sowie die Büros (Stand Mai 2026).
  - Abweichungen siehe K1, K2, K3 und g1.

## Befunde

### Kritisch

- **[kritisch] K1 · `allianz` · `status`: `{ label: 'Online-Assessment, 14 Tage Frist', value: 'ja', status: 'offiziell' }` und `info[0]`: 'Allianz Deutschland (offiziell): Online-Assessment-Center per E-Mail-Link, 14 Tage Bearbeitungszeit.'**
  - research.md: Status „Unternehmensangabe (Allianz-FAQ auf ausbildung.de)“, also bewusst nicht „offiziell“. Laut Legende heißt offiziell „auf einer Seite des Unternehmens bzw. des Testanbieters selbst nachgelesen (direkt abgerufen)“.
  - Stichprobe: Die FAQ liegt auf dem Drittportal ausbildung.de (Ausbildung.de GmbH). Sie ist in Allianz-Stimme geschrieben, richtet sich aber nur an Bewerber für **Ausbildung / duales Studium**. Die App verallgemeinert das zu „Allianz Deutschland (offiziell)“, also auf alle Einstiege.
  - Fix:
    - Status auf `'berichtet'` setzen, Label „Online-Assessment, 14 Tage (Allianz-FAQ auf ausbildung.de, Ausbildung/duales Studium)“.
    - `info[0]` → „Laut Allianz-FAQ auf ausbildung.de (für Ausbildung/duales Studium): Zugang zum Online-Assessment-Center per E-Mail, 14 Tage Bearbeitungszeit. Ob das für Trainee-/Direkteinstieg gilt, ist nicht belegt.“
    - Zielgruppe in research.md ergänzen.

- **[kritisch] K2 · `kearney-test` · `sections[*].calculator: true` und `status`: `{ label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' }`**
  - research.md: „Recruitment Test: keine eindeutige Angabe → App: erlaubt (Annahme, umschaltbar)“.
  - Stichprobe: Die dort zitierte Quelle StrategyCase schreibt „Assume no calculator“ (Papier-und-Stift-Rechnen, nach Kandidatenberichten). MConsultingPrep (ebenfalls zitiert) schreibt, Rechenaufgaben erlauben oft keinen Rechner. Die Annahme widerspricht also den eigenen Quellen. research.md gibt die Quellen falsch wieder.
  - „Umschaltbar“ gibt es in der App nicht, nur im Code.
  - Fix:
    - `calculator: false` für q1/c1/q2/c2 (Verbal ist egal).
    - Status `{ label: 'Taschenrechner', value: 'nicht erlaubt (Papier + Stift)', status: 'berichtet' }`.
    - Info-Zeile „Laut Kandidatenberichten ohne Taschenrechner – nicht offiziell bestätigt.“
    - research.md-Zeile korrigieren. Optional einen Schalter „mit Rechner üben“ auf dem Intro-Screen anbieten.

- **[kritisch] K3 · Akademie `lessons.ts` (Lektion `tactics`) · 'Empfehlung Kearney: Raten, sobald du mindestens eine Option sicher ausschließen kannst.' (und Quelle research.md, Kearney-Zeile „Wertung“: „Empfehlung: nur raten, wenn Optionen sinnvoll eliminiert sind.“)**
  - Die Empfehlung widerspricht der Rechnung eine Zeile davor und im Profil:
    - Bei +5/−1/0 bringt blindes Raten im Mittel 0,2·5 − 0,8·1 = **+0,2** (5 Optionen) bzw. **+0,5** (4 Optionen), leer lassen bringt sicher 0.
    - Raten lohnt sich, solange der Abzug kleiner als 5/(k−1) ist, bei k = 5 also bei jedem Abzug unter 1,25.
    - Daraus folgt: **nie eine Frage leer lassen**, auch ohne Ausschluss. Die Empfehlung kostet den Nutzer erwartete Punkte.
  - Stichprobe: StrategyCase (in research.md zitiert) empfiehlt genau das Gegenteil: jede Frage beantworten, am Ende alle Lücken füllen. research.md gibt die Quelle falsch wieder.
  - Fix:
    - lessons.ts → „Empfehlung Kearney: Keine Frage leer lassen. Erst die lösbaren Fragen, dann vor Ablauf alle offenen ankreuzen. Jede ausgeschlossene Option erhöht den Erwartungswert (5 Optionen, 1 ausgeschlossen: +0,5). Nennt deine Einladung einen höheren Abzug, neu rechnen: Raten lohnt sich, solange Abzug < 5/(Optionen − 1).“
    - research.md-Empfehlung korrigieren.

- **[kritisch] K4 · Akademie `lessons.ts` (Lektion `tactics`) · 'Ist Zurückspringen erlaubt (laut Berichten BCG Cognitive Test, Kearney): …'**
  - research.md: BCG „Zurückspringen | Keine Angaben. | Annahme: erlaubt (Überspringen + Zurück)“. Kearney „Keine Angabe → App: erlaubt innerhalb des Tests (Annahme).“
  - Eine App-Annahme wird hier als „laut Berichten“ ausgegeben. Das ist ein falsches Label.
  - Fix: „Ist Zurückspringen erlaubt (für BCG und Kearney nicht belegt – die Simulation nimmt es an; prüfe die Anleitung im Test): …“. Belegt (berichtet) ist bei BCG nur, dass Überspringen Teil der Strategie ist.

### Mittel

- **[mittel] M1 · `kearney-test` · `info[2]`: 'Raten: Bei +5/−1 hat schon blindes Raten einen leicht positiven Erwartungswert (+0,2 Punkte bei 5 Optionen); nach Ausschluss einer Option lohnt es sich deutlich.'**
  - Die Rechnung stimmt (0,2·5 − 0,8 = +0,2; nach einem Ausschluss 0,25·5 − 0,75 = +0,5). Die Folgerung fehlt aber: leer lassen ist nie besser als raten.
  - research.md nennt 4–5 Optionen, der 4-Optionen-Fall (+0,5) fehlt.
  - Dass die research.md-Empfehlung dem widerspricht, wird nicht aufgelöst.
  - Fix: „Raten: Bei +5/−1/0 hat schon blindes Raten einen positiven Erwartungswert (+0,2 Punkte bei 5 Optionen, +0,5 bei 4); leer lassen bringt sicher 0. Also keine Frage leer lassen: lösbare zuerst, vor Ablauf alle offenen Fragen ankreuzen. Jede ausgeschlossene Option macht Raten noch lohnender.“

- **[mittel] M2 · `kearney-test` · `sections` v1/v2 `mix`: `{ bank: 'verbal', … }, { bank: 'critical', … }`**
  - research.md: „Multiple Choice mit 4–5 Optionen“.
  - Die Verbal-Bank hat 3 Optionen (Wahr/Falsch/Nicht bestimmbar). Die Critical-Bank hat meist 2 Optionen (assumption/deduction/interpretation/evaluation), nur inference hat 5. Damit haben 14 von 40 Fragen 2–3 Optionen.
  - Blindes Raten bringt dort +1,0 bzw. +2,0 statt +0,2. Die +5/−1-Wertung und die Rate-Strategie bilden den echten Test also nicht ab, und Punktzahlen werden geschönt.
  - Fix: In den Kearney-Verbal-Teilen nur 4–5-Options-Items verwenden (z. B. critical `inference` oder Leseverständnis-MC mit 4–5 Optionen). Falls nicht möglich, Caveat ergänzen: „Die Verbal-Teile der Simulation haben 2–3 Antwortoptionen, der echte Test laut Berichten 4–5 – Raten ist hier lohnender als im Original.“

- **[mittel] M3 · `bcg-cognitive` · `status`: `{ label: 'Dauer 30 Min., ohne Hilfsmittel', value: 'ja', status: 'offiziell' }`**
  - research.md: offiziell nur „Cognitive Test – Schweiz“ (careers.bcg.com). Für deutsche Büros, Österreich und die Nordics ist das Format nur berichtet.
  - Das Label lässt die Schweiz weg. Ein Nutzer, der sich in Deutschland bewirbt, liest „offiziell“.
  - Fix: Label „Dauer 30 Min., Multiple Choice, ohne Hilfsmittel (offizielle Angabe BCG Schweiz)“.

- **[mittel] M4 · `bcg-cognitive` · `info[2]`: 'Kein Taschenrechner; Papier und Stift erlaubt; Live-Aufsicht per Video.' und `info[3]`: 'Eingesetzt u. a. in allen deutschen Büros, Österreich, Teilen der Schweiz und den Nordics.'**
  - research.md: „Live-Aufsicht per Zoom, Papier + Stift erlaubt“ ist berichtet. Die Büros sind „berichtet (Stand Mai 2026 lt. StrategyCase)“.
  - Beide Zeilen stehen ohne „Berichtet“ da. `info[0]` und `info[1]` unterscheiden dagegen sauber.
  - Fix: `info[2]` → „Berichtet: Papier und Stift erlaubt, Live-Aufsicht per Zoom (kein Taschenrechner – deckt sich mit „ohne Hilfsmittel“).“ `info[3]` → „Berichtet (StrategyCase, Kandidatenberichte bis Mai 2026): eingesetzt u. a. …“

- **[mittel] M5 · `bcg-cognitive` · `sections[0].mix` (nur `speed.*`, `ded.*`, `ind.series`) und `caveats[1]`: 'Der Anteil verbaler Aufgaben ist unklar (Quellen widersprüchlich).'**
  - research.md: offiziell (CH) werden „numerical, verbal, and logical skills“ geprüft. Laut Prep-Quellen ist Verbal „klein bis gar nicht“.
  - Die Simulation enthält **keine** Verbal-Aufgaben, und das erfährt der Nutzer nicht.
  - Fix: Caveat „Diese Simulation enthält keine Verbal-Aufgaben; BCG Schweiz nennt offiziell auch verbale Fähigkeiten – Verbal Reasoning separat üben.“ Alternativ einen kleinen Verbal-Anteil (≤ 10 %) beimischen.

- **[mittel] M6 · `bcg-cca` · `sections[0]`: `calculator: true` und `mix` mit `int.bar`, `int.order`, `int.tablefill`**
  - research.md: „Berichtet: numerischer Block (SHL-Stil) … Genauer Aufbau nicht offiziell.“ Weder Taschenrechner noch interaktive Formate werden genannt.
  - Beides sind ungelabelte Annahmen. Im Intro steht nur „Rechner“.
  - Fix: Status-Zeilen `{ label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' }` und `{ label: 'Interaktive SHL-Formate', value: 'enthalten', status: 'Annahme' }` ergänzen.

- **[mittel] M7 · `kearney-shl` · `info[1]`: 'Positive Wertung, keine Abzüge.'**
  - research.md nennt für Kearney SHL keine Wertung. „Positive Wertung (keine Abzüge) laut Prep-Quelle“ steht nur bei Deutsche Bank.
  - Unter „So sieht der echte Test aus (laut Recherche …)“ steht damit eine unbelegte Aussage als Tatsache.
  - Fix: `info[1]` → „Annahme: keine Abzüge (bei SHL-Tests üblich, für Kearney nicht belegt).“ Dazu Status `{ label: 'Negativwertung', value: 'keine', status: 'Annahme' }`.

- **[mittel] M8 · `kearney-shl` · `adaptive: false`, `allowBack: false` (keine Status-Zeile)**
  - research.md: Für Variante 2 gibt es keine Angaben. Bei SHL G+ heißt es aber „Adaptiv (SHL-Factsheet)“ und „Bei adaptiven Tests nicht möglich“ (Zurück).
  - Beide Parameter sind ungelabelt. „Nicht adaptiv“ weicht vom einzigen SHL-Beleg ab.
  - Fix: Status `{ label: 'Adaptiv', value: 'nein', status: 'Annahme' }` mit Caveat „SHL-Verify-Tests sind laut SHL teils adaptiv“. Dazu `{ label: 'Zurückspringen', value: 'nein', status: 'Annahme' }`.

- **[mittel] M9 · `pg-interactive` · `info[1]`: '… so viele Aufgaben wie möglich, Schwierigkeit steigt bei richtigen Antworten.' und `adaptive: true` (ohne Status-Zeile)**
  - research.md: Nur für Switch heißt es „unbegrenzt viele Aufgaben, adaptiv“ (berichtet). Für Digit (~5 Min.) und Grid („3–5 Punkte je Durchgang“, ~6–9 Min.) fehlen Angaben zu Adaptivität und Aufgabenzahl.
  - Fix: `info[1]` → „… Switch: so viele Aufgaben wie möglich, adaptiv (berichtet). Digit und Grid sind in der App genauso umgesetzt (Annahme).“ Dazu Status `{ label: 'Adaptiv (Digit/Grid)', value: 'ja', status: 'Annahme' }`.

- **[mittel] M10 · `pg-interactive` · `sections` digit: `calculator: false`**
  - research.md (Digit Challenge): „Taschenrechner laut einer Quelle erlaubt.“
  - Die Abweichung ist ungelabelt.
  - Fix: Status `{ label: 'Digit: ohne Rechner', value: 'ja', status: 'Annahme' }` mit Hinweis „eine Quelle nennt Rechner erlaubt; bei einstelligen Ziffern kaum relevant“. Alternativ den Rechner zulassen.

- **[mittel] M11 · `pg-interactive` · `status`: `{ label: 'Zeiten 6/5/6 Min.', value: 'ja', status: 'berichtet' }` und Gesamtdauer der Simulation 17 Min. (Liste zeigt „ca. 17 Min.“)**
  - research.md: Grid „~6–9 Min.“ (berichtet). Interactive Assessment „ca. 30 Min.“ (offiziell).
  - Grid = 6 ist ein Wert am unteren Rand, also eine Wahl der App. Die Lücke zwischen 17 Min. Simulation und offiziellen 30 Min. wird nicht erklärt.
  - Fix: Label „Zeiten 6/5/6 Min. (Grid berichtet 6–9, App: 6)“. Caveat „Offiziell ca. 30 Min. insgesamt (vermutlich inkl. Anleitungen/Übungsrunden); reine Spielzeit laut Berichten ca. 17–20 Min.“

- **[mittel] M12 · `bain-tg` · `sections` (10+10+12 = 32 Min., 28 Fragen) und `caveats[0]`: 'Gesamtdauer berichtet zwischen ca. 45 und 52 Minuten; die genaue Blockzusammensetzung variiert.'**
  - research.md: „~45–52 Min. Multiple Choice in Blöcken à 8–15 Min. (je ~6–10 Fragen)“.
  - Die Simulation dauert gut ein Drittel kürzer, ohne Begründung.
  - Fix: Einen 4. Block ergänzen (z. B. zweiter Numerical-Block mit 8 Fragen / 12 Min., dann ≈ 44 Min.). Alternativ Caveat „Die Simulation bildet drei Blöcke (≈ 32 Min.) ab; der echte Test hat laut Berichten mehr bzw. längere Blöcke.“

- **[mittel] M13 · `allianz` · `status` (nur `Zurückspringen` als Annahme) bei Numerical `calculator: true` und `scoring` 1/0/0**
  - research.md: „Taschenrechner / Zurück / Negativwertung | Keine Angaben → App: Rechner an, kein Zurück, keine Negativwertung. | Annahme“.
  - Rechner und Negativwertung erscheinen als Badges („Rechner“, „Keine Negativwertung“) ohne Annahme-Label. `{ label: 'Fragenzahl/Zeit', value: '15/16/12 Fragen' }` nennt keine Zeiten.
  - Fix: Status ergänzen: `{ label: 'Taschenrechner', value: 'erlaubt', status: 'Annahme' }`, `{ label: 'Negativwertung', value: 'keine', status: 'Annahme' }`, Wert → „15/16/12 Fragen, 15/12/12 Min.“ Caveat „Logical Reasoning kommt laut Berichten nur teils vor.“

- **[mittel] M14 · `bain-sova` · `info[0]`: 'Anbieter Sova, vor allem in Europa und im Nahen Osten.' und Abschnitts-Timer 16/12 Min.**
  - research.md: „Der Anbieter steht in der Einladung.“ „Keine DACH-spezifischen Angaben gefunden; Europa-Büros überwiegend Sova.“ Sova – Zeit: „teils kein sichtbarer Timer pro Abschnitt, aber Bearbeitungszeit fließt in die Wertung ein“.
  - Stichprobe bain.com: Sova muss nicht in einer Sitzung bearbeitet werden.
  - Für die Wahl zwischen Sova- und TG-Profil fehlt der Hinweis auf die Einladung und auf fehlende DACH-Daten. Die festen Timer sind nicht als Abweichung kenntlich.
  - Fix: Info „Ob Sova oder TestGorilla kommt, steht in deiner Einladung; für DACH gibt es keine eigenen Berichte (Europa überwiegend Sova).“ Caveat „Im echten Sova-Test teils kein sichtbarer Timer, laut Bain nicht in einer Sitzung nötig – die festen Zeitlimits hier sind eine Annahme.“

- **[mittel] M15 · Akademie `lessons.ts` (Lektion `tactics`) · 'Kein Zurück (SHL, Sova, TestGorilla, Aon): …'**
  - research.md: Sova „keine belastbare Angabe → App: nein (Annahme)“. Belegt (berichtet) sind TestGorilla, Aon (P&G) und adaptives SHL.
  - Fix: „Kein Zurück (berichtet: TestGorilla, Aon, adaptive SHL-Tests; Sova unklar – die App nimmt es an): …“

- **[mittel] M16 · Lücke · Deutsche Bank: separater Numerical-Test und MC-Version von G+ ohne Profil oder Hinweis**
  - research.md: „Numerical (separat) | Kandidaten nennen 18–25 Fragen in 12–25 Min.“ und „MC-Version 30 Fragen/36 Min.“
  - `db-shl` deckt nur G+ interaktiv ab. Wer den separaten Numerical-Test oder die MC-Version bekommt, findet keine passende Simulation und keinen Hinweis.
  - Fix: Profil `db-numerical` anlegen (z. B. 20 Fragen / 20 Min., Annahme innerhalb der berichteten Spanne, Rechner berichtet, nicht adaptiv/kein Zurück als Annahme). Mindestens einen Caveat in `db-shl` ergänzen: „Teils separater Numerical-Test (18–25 Fragen, 12–25 Min.) oder MC-Version (30 Fragen/36 Min.)“.

### Gering

- **[gering] g1 · `bain-sova`/`bain-tg` + research.md · `info[3]` 'Gesamtdauer laut Bain ca. 30–40 Minuten …', `status` `{ label: 'Taschenrechner', value: 'erlaubt', status: 'berichtet' }`**
  - research.md: „berichtet (Bain-Angabe nicht direkt verifiziert)“.
  - Stichprobe bain.com/careers/hiring-process/digital-assessment: 30–40 Min. bestätigt. Rechner bei Sova und TestGorilla erlaubt. TestGorilla in einer Sitzung, Sova nicht nötig. Die Profil-Aussage stimmt, research.md labelt zu vorsichtig.
  - Fix: research.md auf offiziell (bain.com, abgerufen 02.11.2026) hochstufen. Rechner-Status beider Bain-Profile → `'offiziell'`, Info „laut Bain-Karriereseite“.

- **[gering] g2 · `db-shl` · `caveats[0]`: '… einzelne Quellen nennen zusätzlich Verbal Reasoning.'**
  - In research.md nicht belegt (dort nur Numerical, Inductive, Deductive).
  - Fix: Quelle in research.md ergänzen oder den Halbsatz streichen.

- **[gering] g3 · `db-shl` · `info[1]`: 'Interaktive Antwortformate (Balken ziehen, Elemente anordnen, Werte eintragen) …'**
  - research.md: „Balken auf Wert ziehen, Linien ziehen, Diagramme anpassen, Elemente anordnen, Felder antippen“.
  - „Werte eintragen“ ist nicht belegt. `info[1]` und `info[2]` stehen ohne „Berichtet“.
  - Fix: „Berichtet: interaktive Formate (Balken ziehen, Elemente anordnen, Felder antippen) …; die App übt Balken, Reihenfolge und Tabellenzelle.“

- **[gering] g4 · `bcg-cognitive` · `mix` vs. `info[1]` 'ca. 60–70 % numerisch, 30–40 % logisch'**
  - Gewichte: `speed.*` 38 von 51 (74,5 %), Logik 13 von 51.
  - Nur wenn `speed.sequence` (Zahlenreihen, 4) als „logisch“ zählt, ergeben sich 66,7 / 33,3 %.
  - Fix: Im Code-Kommentar festhalten, dass Zahlenreihen als logisch zählen. Alternativ das Gewicht von `speed.*` leicht senken.

- **[gering] g5 · `kearney-test` · `sections` q1/v1/c1/q2/v2/c2 = 7/7/6/7/7/6, q2 mit `ded.rules`/`ded.syllogism`**
  - StrategyCase (Stichprobe) beschreibt 8+6 quantitativ (Logical Counting, Data Sufficiency), 6+8 verbal und 6+6 Case-Daten. Die Summen 14/14/12 stimmen.
  - Data Sufficiency fehlt. Formale Logik im Quant-Teil ist eine Annahme.
  - Fix: Im Caveat kurz nennen. Optional Data-Sufficiency-Items ergänzen.

- **[gering] g6 · `kearney-shl` · `status` `{ label: '3 × ca. 20 Min.', value: 'ja', status: 'berichtet' }`**
  - research.md: „berichtet (Einzelquelle)“.
  - Fix: Label „3 × ca. 20 Min. (Einzelquelle)“. Der Caveat sagt es bereits, im Status fehlt es.

- **[gering] g7 · `categories.ts` · `usedBy`**
  - interactive „Deutsche Bank (SHL Verify Interactive G+), BCG CCA“ und inductive „… BCG CCA“: research.md nennt für den CCA nur einen numerischen Block.
  - critical „Kearney (Watson-Glaser)“: research.md sagt „Früher Watson-Glaser“.
  - verbal „Sova“: research.md sagt „Verbal in neueren Durchgängen oft nicht mehr dabei“.
  - Fix: „BCG CCA“ streichen oder als (Annahme) kennzeichnen. „Kearney (früher Watson-Glaser)“, „Sova (früher)“.

- **[gering] g8 · `lessons.ts` · Tabellenzeile `['Bain TestGorilla', 'Blöcke à 8–15 Min. mit 6–10 Fragen', '≈ 60–90 s']` und 'Adaptive Tests (SHL G+, Aon)'**
  - Aus 8–15 Min. und 6–10 Fragen ergeben sich 48–150 s, nicht 60–90 s.
  - Aon ist laut research.md nur bei Switch adaptiv.
  - Fix: „≈ 50–150 s (typisch 60–90 s)“ und „Aon (Switch)“.

- **[gering] g9 · `SimPages.tsx` · `subtitle="… (Stand 31.10.2026) …"`**
  - Das Datum ist hart codiert statt aus `researchDate`/`RD` gelesen. Nach einem Recherche-Update könnten Liste und Intro auseinanderlaufen.
  - Fix: `RD` exportieren und hier verwenden.

- **[gering] g10 · Lücke · Kearney Variante 3 und Mock-Test**
  - research.md: „Früher Watson-Glaser + Advanced Numerical Reasoning; manche Büros Excel-Test“ und „Kearney bietet laut Prep-Quellen einen kostenlosen Mock-Test auf der Website an“.
  - Der Caveat von `kearney-test` nennt nur „SHL-Tests oder einen Excel-Test“. Watson-Glaser und der Mock-Test-Hinweis fehlen.
  - Fix: Caveat um „früher Watson-Glaser (→ Kategorie F üben)“ ergänzen. Info „Kearney bietet laut Prep-Quellen einen kostenlosen Übungstest auf der eigenen Website an.“

- **[gering] g11 · Lücke · `pg-interactive` läuft immer mit allen drei Spielen**
  - research.md: „Je nach Rolle eines, zwei oder alle drei“.
  - Fix: Auf dem Intro die Spiele auswählbar machen oder auf den Spiele-Modus verweisen („einzelne Spiele unter Üben → Spiele“).

- **[gering] g12 · Lücke · `bcg-cognitive` ohne Zeitpunkt-Hinweis**
  - research.md (offiziell CH): „Ca. einen Monat vor dem ersten Interview.“
  - Fix: Als Zusatz in `info[0]` aufnehmen. Das hilft bei der Planung.

## Empfohlene Reihenfolge

1. K2, K3 und M1 (Kearney: Rechner, Rate-Empfehlung, Folgerung im Profiltext) zusammen mit den research.md-Korrekturen.
2. K1 (Allianz-Label und Zielgruppe) und K4 (Zurück-Label in der Akademie).
3. Die Label-Ergänzungen M3–M15. Danach Gate 5 erneut prüfen und Gate 1 (Traceability) nachziehen.
