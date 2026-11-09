# Gate 5b – Realismus: Profile vs. docs/research.md (Nachprüfung)

Profile geprüft: 10. Befunde: 14 (kritisch: 0, mittel: 3, gering: 11)

Geprüft am 02.11.2026, nur lesend. Die Prüfung begann ohne Vorwissen aus der ersten Runde.

Gelesen:
- `docs/research.md` (Stand 02.11.2026)
- `src/content/profiles.ts` und `categories.ts`
- `src/content/picker.ts`, `banks/critical.ts`, `banks/index.ts`, `banks/types.ts`, `options.ts`, `registry.ts`
- die Generatoren (Optionszahl, Exhibit-Typen, Aon-Regeln)
- `src/features/sim/SimRunner.tsx` und `SimPages.tsx`
- `src/data/stats.ts` (`simulationResults`)
- `src/features/academy/lessons.ts`

Zusätzlich lief ein Skript, das `pickRef` aus `SimRunner` nachbaut. Es hat jede Sektion 300-mal gezogen (`itemLang = 'de'`) und Kategorien, Untertypen, Optionszahl, Exhibit-Typen und Wiederholungen ausgezählt. Es lag nur im Scratchpad und hat im Projekt nichts geändert.

## Befunde

### Mittel

- **[mittel] M1 · `kearney-test` · `sections` c1/c2: `{ id: 'c1', title: 'Case: Tabellen', … mix: NUM_ALL }` und `{ id: 'c2', title: 'Case: Grafiken', … mix: NUM_ALL.map((m) => ({ ...m, d: 3 })) }`**
  - research.md (Kearney, Variante 1) nennt „StrategyCase: … 6 Tabellen, 6 Grafiken“. Die Stichprobe am 02.11.2026 bestätigt: „Case studies, reading a table: 6“ und „reading a graph: 6“.
  - Beide Teile ziehen aus demselben Pool `NUM_ALL`, und die Generatoren wählen den Exhibit-Typ zufällig. Die Auszählung zeigt:
    - **c1 „Tabellen“ (d2):** 63 % Tabelle, aber 21 % Linien- und 16 % Balkendiagramm.
    - **c2 „Grafiken“ (d3):** 58 % eine Tabelle und 11 % zwei Tabellen, nur 18 % Linie, 8 % Kombi und 4 % Balken. Der Teil „Grafiken“ besteht also zu rund 69 % aus reinen Tabellen.
  - Der Mix erzeugt damit nicht das Format, das der Titel ankündigt.
  - Fix:
    - `MixEntry` um einen Exhibit-Filter erweitern, z. B. `exhibit?: 'table' | 'chart'`. `pickRef` erzeugt neu (anderer Seed), bis `item.exhibits` passt.
    - c1 = `NUM_ALL` mit `exhibit: 'table'`. Reine Tabellen-Generatoren sind z. B. `num.ppoints`, `num.units`, `num.fx`, `num.average`.
    - c2 = `num.index`, `num.cagr`, `num.projection`, `num.share`, `num.extreme`, `num.stats` mit `exhibit: 'chart'`.
    - Einen Test ergänzen, der für c1 und c2 jeweils 100 % passende Exhibits prüft.

- **[mittel] M2 · `kearney-test` · `sections` v1/v2: `{ bank: 'critical', sub: 'critical.inference', weight: 2 }` bzw. `weight: 1`, dazu `SimRunner.tsx` `pickRef`: `pickFrom(m.bank, m.sub ?? null, diff, { used, rng })`**
  - research.md: „Multiple Choice mit 4–5 Optionen“. Der Filter existiert, und `critical.inference` hat 5 Optionen. Pro Lauf braucht die Simulation im Schnitt ≈ 4,7 Inference-Items, die Bank hat 12. Für einen Durchgang reicht das, es gab 0 Fehlgriffe.
  - Das Problem liegt im Picker:
    - `pickFrom` bevorzugt Items auf der Profilstufe d = 2. Davon gibt es nur 5: c05, c06, c07, c08 und c12.
    - `SimRunner` übergibt kein `seen`, deshalb greift „ungesehene bevorzugen“ in Simulationen nicht.
  - Gemessen über 500 Läufe: **c12 87 %, c07 86 %, c05 84 %, c08 84 %, c06 82 %** aller Kearney-Durchgänge enthalten dasselbe Item. Alle anderen Inference-Items kommen nur in ≈ 10 % vor.
  - Wer die Simulation wiederholt (das ist der Zweck), sieht also fast immer dieselben 5 Aussagen zu denselben 3 Texten. Weil der Kearney-Score von +5/−1 lebt, steigen die Punkte durch Wiedererkennen.
  - Fix:
    - In `SimRunner` die bereits beantworteten Bank-IDs (aus `db.attempts`) als `seen` an `pickFrom` geben.
    - Bei kleinen Sub-Pools (< 3 × Bedarf) die Schwierigkeitspräferenz in Simulationen ignorieren.
    - Mittelfristig die Inference-Bank auf ≥ 30 Items (≥ 6 Texte) erweitern.
    - Abgeschwächt gilt dasselbe für `bain-tg` Critical Thinking: dort werden nur 24 verschiedene Critical-IDs gezogen, jede in ≈ 25 % der Läufe.

- **[mittel] M3 · Akademie `lessons.ts` · Lektion `speed`, Block `p`: 'Beim BCG Cognitive Test (offiziell 30 Minuten; laut Berichten 80 Fragen) …' und Lektion `tactics`, Tabellenzeile: `['BCG Cognitive Test', '30 Min. (offiziell), 80 Fragen (berichtet)', '≈ 22,5 s']`**
  - research.md: offiziell ist nur „Cognitive Test – Schweiz | „In a 30-minute cognitive test …“ | **offiziell** (careers.bcg.com …)“. Für deutsche Büros, Österreich und die Nordics gilt: „Büros (Cognitive Test) … | berichtet (Stand Mai 2026 lt. StrategyCase)“.
  - Im Profil ist das bereits korrekt eingeschränkt („… (Angabe BCG Schweiz)“). Die Akademie sagt dagegen pauschal „offiziell“. Ein Bewerber für ein deutsches Büro liest daraus eine offizielle Angabe für seinen Test. Damit ist das Label falsch.
  - Fix:
    - Lektion `speed`: „(30 Minuten – offiziell für BCG Schweiz, für deutsche Büros berichtet; laut Berichten 80 Fragen)“.
    - Lektion `tactics`: „30 Min. (offiziell: BCG Schweiz), 80 Fragen (berichtet)“.

### Gering

- **[gering] G1 · `bain-sova` · `caveats[1]`: '… laut Berichten muss er nicht in einer Sitzung bearbeitet werden. …'**
  - research.md (Sova – Zeit) sagt dazu nichts: „Uneinheitlich: teils kein sichtbarer Timer pro Abschnitt, aber Bearbeitungszeit fließt in die Wertung ein.“ Auch die zitierte StrategyCase-Seite zum Bain-SOVA-Test nennt das nicht (Stichprobe 02.11.2026).
  - Laut Websuche steht es auf der Bain-Seite „Digital assessment“ (bain.com, automatisch nicht abrufbar) und im PrepLounge-Thread „bain-sova-test-not-in-one-sitting“. Ein anderer Prep-Anbieter (Intervyo) widerspricht.
  - Fix:
    - In research.md eine Zeile „Sova – Sitzungen“ mit diesen Quellen und dem Status „berichtet (widersprüchlich)“ ergänzen.
    - Caveat: „… laut Berichten (widersprüchlich) muss er nicht in einer Sitzung bearbeitet werden – prüfe deine Einladung.“
    - Alternativ den Halbsatz streichen.

- **[gering] G2 · `bain-sova` · `info[3]`: 'Gesamtdauer laut Bain ca. 30–40 Minuten (…)'**
  - research.md: „Bain-Karriereseite (zitiert von Hacking the Case Interview): ca. 30–40 Min. … | berichtet (Bain-Angabe nicht direkt verifiziert)“.
  - „laut Bain“ klingt nach geprüfter Unternehmensangabe.
  - Fix: „Gesamtdauer laut Bain-Karriereseite (von Prep-Quellen zitiert, nicht direkt geprüft) ca. 30–40 Minuten …“.

- **[gering] G3 · `bcg-cognitive` · `info[3]`: 'Berichtet (Kandidatenberichte bis Mai 2026): eingesetzt u. a. in allen deutschen Büros …' und `provider: 'BCG (live beaufsichtigt)'`**
  - research.md: „Büros (Cognitive Test) | … | berichtet (Stand Mai 2026 lt. StrategyCase)“, also eine Prep-Quelle, keine Sammlung von Kandidatenberichten. „Live-Aufsicht per Zoom“ ist ebenfalls nur berichtet.
  - Fix:
    - `info[3]`: „Berichtet (Prep-Anbieter StrategyCase, Stand Mai 2026): …“.
    - `provider`: „BCG (laut Berichten live beaufsichtigt)“ oder nur „BCG“.

- **[gering] G4 · `bcg-cca` · `info[0]`: 'Consulting Career Assessment: von SHL entwickelt und durchgeführt, misst kognitive Fähigkeiten und Verhaltensmerkmale.'**
  - research.md: „Von SHL entwickelt und administriert; misst … (BCG-FAQ laut Prep-Quellen) … | berichtet“.
  - Die Info-Zeile steht ohne Zuordnung, die anderen Zeilen beginnen mit „Berichtet:“.
  - Fix: „Laut Prep-Quellen (die eine BCG-FAQ zitieren): von SHL entwickelt …“.

- **[gering] G5 · `kearney-test` · `sections` q2: `title: 'Quantitativ: Aussagen'`**
  - research.md: „StrategyCase: … 6 Data Sufficiency …“. Bei StrategyCase heißt der Teil „Quantitative, statements (data sufficiency)“.
  - Der Titel „Aussagen“ deutet das Data-Sufficiency-Format an. Der Mix enthält aber nur Textaufgaben (`speed.word` 36 %, `speed.equation` 27 %, `speed.rule3` 25 %, `speed.percent` 12 %), und `caveats[1]` sagt das auch.
  - Fix: Titel „Quantitativ: Textaufgaben (statt Data Sufficiency)“.

- **[gering] G6 · `kearney-test` · `caveats[0]`: 'Keine offizielle Kearney-Quelle gefunden; …' und `info[4]`: 'Kearney bietet laut Prep-Quellen einen kostenlosen Übungstest auf der eigenen Website an.'**
  - research.md: „Kearney bietet laut Prep-Quellen einen kostenlosen Mock-Test auf der Website an.“ Eine URL fehlt.
  - Die Stichprobe am 02.11.2026 zeigt: StrategyCase verlinkt ein offizielles PDF unter `kearney.com/documents/1655764/3128352/Mock_Recruitment_Test_v6_Kearney.pdf/…` und die Seite `kearney.com/careers/interviewing/recruiting-process`. Beide liefern beim automatischen Abruf 403.
  - Es gibt also eine offizielle Quelle. Sie wurde nur nicht geprüft, und der Mock-Test könnte 40/60 und +5/−1 bestätigen.
  - Fix:
    - URL in research.md aufnehmen, mit „automatisch nicht abrufbar, manuell prüfen“.
    - Nach manueller Prüfung passende Status auf „offiziell (Kearney-Mock-Test)“ heben.
    - Caveat: „Kearneys offizieller Übungstest (PDF) wurde nicht ausgewertet; …“.

- **[gering] G7 · Status-Listen unvollständig, mehrere Profile**
  - Parameter, die das Intro als Badge oder Abschnittszeile zeigt, haben keine Statuszeile:
    - `bain-sova`: Negativwertung (research.md: „Keine Hinweise. | Annahme: keine“)
    - `bain-tg`: Taschenrechner (research.md: „Erlaubt (Sova und TestGorilla) … | berichtet“) und Negativwertung (Annahme)
    - `bcg-cca`: Negativwertung (Annahme)
    - `kearney-shl`: Taschenrechner im Numerical-Teil (research.md: „SHL-Variante: erlaubt (Annahme)“)
    - `pg-interactive`: Zurückspringen (research.md: „**Nein** … | berichtet“)
    - `db-shl`: Zurückspringen (research.md: „Bei adaptiven Tests nicht möglich. | berichtet“) und Wertung (research.md: „Positive Wertung (keine Abzüge) laut Prep-Quelle. | berichtet“)
    - `kearney-test`: die Abschnittsgrößen 8/6/6/8/6/6 (berichtet, StrategyCase)
  - Fix: die fehlenden Zeilen mit dem Status aus research.md ergänzen. Ein Unit-Test könnte prüfen, dass jedes Profil Statuszeilen für Taschenrechner, Zurückspringen, Negativwertung und Fragenzahl/Zeit hat.

- **[gering] G8 · Inhaltsmix und Schwierigkeitsstufe nicht als Annahme gekennzeichnet**
  - Betroffen:
    - `bain-tg` Critical Thinking: `mix: [{ bank: 'critical', weight: 3 }, { gen: 'ded.syllogism' … }, { gen: 'ded.rules' … }]` (Watson-Glaser-Stil; 48 % der Items haben nur 2 Optionen). research.md: nur „Critical Thinking (folgt eine Schlussfolgerung aus den Fakten?)“.
    - `bain-tg` Data Interpretation und `kearney-test` c2 mit `d: 3`, in der App „Schwerer als Test“.
    - `allianz` Logical Reasoning: Figurenreihen/Matrizen + Zahlenreihen. research.md: nur „teils Logical Reasoning“.
    - `db-shl`: Anteile laut Auszählung 31 % interaktiv (nur numerisch), 31 % induktiv, 20 % deduktiv, 18 % numerisches MC. research.md: „Aufgaben gemischt“, interaktive Formate in allen Teilen.
  - Fix:
    - Je Profil eine Statuszeile „Aufgabenmix: … | Annahme“.
    - Für `d: 3` den Hinweis „Data Interpretation hier bewusst auf Stufe 3 (Annahme)“ ergänzen oder auf d 2 zurücksetzen.

- **[gering] G9 · `categories.ts` `usedBy` (und gleichlautend `lessons.ts` `usedBy`) passt nicht zu den Profilen**
  - `speed` „BCG Cognitive Test …, Kearney Recruitment Test …“: Zahlenreihen (`speed.sequence`) stecken auch in `bain-sova`, `bain-tg` und `allianz`. research.md Bain: „Logical Reasoning (Zahlen-/Figurenreihen …)“, „Numerical Reasoning (… Zahlenreihen)“.
  - `deductive`: Kearney Recruitment Test (logische Texte) und Bain TestGorilla (Critical Thinking) fehlen.
  - `critical` „Bain TestGorilla, Kearney (früher Watson-Glaser)“: dass der aktuelle Kearney Recruitment Test (v1/v2) Inference-Items nutzt, fehlt.
  - `inductive`: Allianz fehlt (dort als Annahme).
  - `interactive`: BCG CCA fehlt (dort als Annahme).
  - `verbal`: BCG Cognitive Test fehlt. research.md: „… numerical, verbal, and logical skills“ (offiziell BCG Schweiz).
  - Fix: `usedBy` ergänzen, mit „(Annahme)“ oder „(laut BCG Schweiz)“, wo nötig.

- **[gering] G10 · Akademie `lessons.ts` · Lektion `tactics`, Tabelle „Zeit pro Frage (laut Recherche)“ und Liste „Kein Zurück (berichtet: TestGorilla, Aon-Spiele, adaptive SHL-Tests; bei Sova unklar, die Simulation nimmt es an) …“**
  - Es fehlen Zeilen für Tests, die research.md dokumentiert und für die es Profile gibt:
    - **Bain Sova:** „teils kein sichtbarer Timer …, aber Bearbeitungszeit fließt in die Wertung ein“. Taktisch wichtig: auch ohne Uhr zügig antworten.
    - **Kearney SHL:** „je ca. 20 Min.“
    - **Deutsche Bank Numerical:** „18–25 Fragen in 12–25 Min.“, also ≈ 30–85 s.
    - **BCG CCA**
  - „typisch 60–90 s“ bei TestGorilla steht nicht in research.md.
  - In der Kein-Zurück-Liste fehlen die übrigen Annahme-Profile: Allianz, CCA, Kearney SHL, DB Numerical.
  - Fix:
    - Zeilen ergänzen, z. B. „Bain Sova | kein sichtbarer Timer, Zeit zählt (berichtet) | zügig, ≈ 60 s“.
    - „typisch 60–90 s“ ersetzen durch „(Simulation: 60–90 s)“.
    - Liste ergänzen: „… bei Sova, Allianz, CCA und den SHL-Einzeltests nicht belegt – die Simulation nimmt kein Zurück an“.

- **[gering] G11 · `allianz` `verb` und `kearney-test` v2 · `mix: [{ bank: 'verbal', … }]`**
  - research.md enthält keine Angabe zur Testsprache. Die Allianz-Quelle ist eine deutschsprachige FAQ für Ausbildungsbewerber.
  - Bei `itemLang = 'de'` sind 75 % der Allianz-Verbal-Items und 83 % der Items in Kearney v2 englisch, weil nur 60 von 160 Verbal-Aussagen eine deutsche Fassung haben.
  - Fix:
    - Testsprache in research.md als „Annahme“ dokumentieren.
    - Für `allianz` nur Aussagen mit deutscher Fassung ziehen. 60 reichen für 16 je Lauf: einen Filter `lang: 'de'` im `MixEntry` ergänzen oder `verbalHasGerman` im Picker nutzen.
    - Alternativ einen Hinweis im Intro geben.

## Ohne Befund (bestätigt)

- **Labels:** „offiziell“ steht in den Profilen nur noch bei BCG Schweiz (30 Min., MC, ohne Hilfsmittel) und P&G (ca. 30 Min., kognitive Aufgaben). Beides ist in research.md offiziell und wurde am 02.11.2026 direkt bestätigt. Allianz ist „berichtet“, Kearney-Taschenrechner „berichtet“. Alle Zahlen und Zeiten, die nur gesetzt sind, tragen „Annahme“.
- **Interne Summen:**

  | Profil | Fragen | Zeit |
  |---|---|---|
  | Bain Sova | 12 + 12 | 16 + 12 = 28 Min. |
  | Bain TG | 10/10/8 | 10/10/12 = 32 Min. (Caveat „≈ 32 Min.“) |
  | BCG | 80 | 30 Min. = 22,5 s je Frage |
  | CCA | 15 | 20 Min. |
  | Kearney | 8 + 6 + 6 + 8 + 6 + 6 = 40 | 60 Min. Gesamtuhr, keine Teil-Limits wie berichtet; max. 40 × 5 = 200 = `maxPoints` |
  | Kearney SHL | 14/16/18 | 3 × 20 Min. |
  | P&G | – | 6 + 5 + 6 = 17 Min. (Caveat „17 Min.“) |
  | Allianz | 15/16/12 | 15/12/12 Min. (Numerical 1 Min./Frage wie berichtet) |
  | DB G+ | 24 | 36 Min. |
  | DB Numerical | 20 | 20 Min. |

  Statuswerte und Abschnitte stimmen überein.
- **Kearney-Rechnung:** blind 1/5 · 5 − 4/5 · 1 = +0,2 (5 Optionen) und 1/4 · 5 − 3/4 = +0,5 (4 Optionen). Nach einem Ausschluss bei 5 Optionen sind es +0,5. Die Schwelle ist Abzug < 5/(k − 1) = 1,25. Profil-Info, Akademie und research.md stimmen überein und empfehlen „keine Frage leer lassen“.
  - Die Optionszahlen laut Auszählung: q1/q2/v1/c1/c2 haben 100 % 5 Optionen. v2 hat 67 % 3 Optionen (Verbal-Bank), das deckt `caveats[2]` ab. Bei 3 Optionen ist der Erwartungswert +1,0, also „Raten bringt hier mehr“.
- **Mixe:** Alle 38 Generator-IDs in den Profilen existieren in `registry.ts`, und der Filter `critical.inference` existiert. In keiner Sektion gab es Fehlgriffe oder zu kurze Sektionen (je 300 Läufe).
  - BCG: 67 % Rechnen und 33 % Logik (Zahlenreihen 8 % + deduktiv 21 % + induktiv 4 %), passend zu „60–70 % numerisch, 30–40 % logisch“.
  - Bain TG Numerical enthält 18 % Zahlenreihen wie berichtet.
  - Aon: Digit nutzt Ziffern 1–9 je höchstens einmal mit +, −, ×. Grid hat 3/4/5 Punkte. Switch hat 4 Symbole und 4-stellige Codes. Alle drei Spiele laufen adaptiv.
- **Stand und Varianz:** Das Intro zeigt „Stand 02.11.2026“ (= research.md), die Übersicht ebenfalls. Jedes Profil hat den Zusatz „Formate variieren je Büro und Jahr – maßgeblich ist immer deine Einladung.“
- **Lücken:**
  - Alle Varianten aus research.md haben ein Profil oder einen Hinweis: Bain Sova/TG; BCG Cognitive/CCA, wobei Casey und Pymetrics laut Auftrag außerhalb des Scopes liegen; Kearney Recruitment Test und SHL.
  - Watson-Glaser, Excel-Test, P&G mit 1–3 Spielen und PEAK, Allianz, sowie DB G+ interaktiv, die MC-Version (Hinweis) und Numerical sind abgedeckt.
- **Logos und Inhalte:** `public/` enthält nur ein neutrales Balken-Icon (favicon/PWA). Firmennamen erscheinen nur als Text. Die Critical-Bank ist als eigene Items gekennzeichnet, und in Stichproben fanden sich keine übernommenen Testaufgaben.
- **Stichproben** (02.11.2026):
  - **careers.bcg.com (Schweiz):** „In a 30-minute cognitive test …“, MC, „without any tools or resources“, ca. einen Monat vor dem Interview. Keine Fragenzahl.
  - **pgcareers.com:** Interactive Assessment „approximately 30 minutes“, „brief series of cognitive ability assessments“, mobil, über 20 Sprachen.
  - **StrategyCase (Kearney):** 40/60, 8/6/6/8/6/6, +5/−1/0 (max. 200), Taschenrechner „Assume not“ (Kandidatenberichte), 4–5 Optionen, keine Teil-Limits, Excel-Variante.
  - **StrategyCase (Bain SOVA):** Zeit fließt in die Wertung ein; „about 30 to 40 minutes“; Verbal „possible but no longer guaranteed“.
  - **Allianz-FAQ (ausbildung.de):** Zugang per E-Mail, 14 Tage. Die Antwort bezieht sich ausdrücklich auf eine „Ausbildungsstelle“, das duale Studium wird dort nicht genannt. In research.md eventuell auf „Ausbildung (ggf. duales Studium)“ präzisieren.
  - Nicht abrufbar (403): hackingthecaseinterview.com, kearney.com (siehe G6) und bain.com (bekannt).
