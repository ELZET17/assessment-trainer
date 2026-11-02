/**
 * Strategie-Akademie – content (German). Every arithmetic statement here is
 * checked in tests/academy.test.ts and reviewed in Gate 4.
 */
import type { CategoryId, Difficulty } from '../../content/types'

export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; text: string }
  | { t: 'list'; items: string[]; ordered?: boolean }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'tip'; text: string }
  | { t: 'example'; gen: string; d: Difficulty; seed: number; caption: string }

export interface Lesson {
  id: string
  title: string
  category?: CategoryId
  summary: string
  usedBy: string
  blocks: Block[]
  practice?: { cat: CategoryId; sub?: string }
}

export const LESSONS: Lesson[] = [
  {
    id: 'numerical',
    title: 'Numerical Reasoning',
    category: 'numerical',
    summary: 'Tabellen und Diagramme schnell und fehlerfrei auswerten.',
    usedBy: 'Bain (Sova/TestGorilla), BCG CCA, Kearney, Allianz, Deutsche Bank (SHL)',
    blocks: [
      { t: 'h', text: 'Was wird getestet?' },
      { t: 'p', text: 'Du bekommst ein oder zwei Exhibits (Tabelle, Balken-, Linien-, Kreis- oder kombiniertes Diagramm) und musst daraus eine Kennzahl berechnen. Rechnen ist selten das Problem – Fehler entstehen beim Ablesen, bei der Basis und bei Einheiten.' },
      { t: 'h', text: 'Systematisches Vorgehen' },
      {
        t: 'list',
        ordered: true,
        items: [
          'Frage zuerst lesen und die gesuchte Größe markieren (Prozent? Prozentpunkte? absoluter Wert? welche Einheit?).',
          'Titel, Einheit und Fußnoten des Exhibits prüfen (Tsd. vs. Mio., %, Index, Währung).',
          'Nur die benötigten Zellen heraussuchen – Zeile UND Spalte doppelt prüfen.',
          'Rechenweg aufschreiben, dann überschlagen: Liegt das Ergebnis in der richtigen Größenordnung?',
          'Optionen vergleichen: Oft reicht der Überschlag, um drei Optionen auszuschließen.',
          'Rundung erst ganz am Ende, so wie in der Frage verlangt.',
        ],
      },
      { t: 'h', text: 'Die wichtigsten Formeln' },
      {
        t: 'table',
        head: ['Größe', 'Formel', 'Beispiel'],
        rows: [
          ['Prozentuale Veränderung', '(neu − alt) ÷ alt × 100', '80 → 92: 12 ÷ 80 = 15 %'],
          ['Prozentpunkte', 'Prozentwert neu − Prozentwert alt', '10 % → 12 % = +2 Prozentpunkte (= +20 % relativ)'],
          ['Anteil', 'Teil ÷ Summe × 100', '30 von 120 = 25 %'],
          ['Gewichteter Durchschnitt', 'Σ(Gewicht × Wert) ÷ Σ Gewichte', '(10 × 4 + 30 × 8) ÷ 40 = 7'],
          ['Median', 'mittlerer Wert der SORTIERTEN Liste; bei gerader Anzahl Mittel der beiden mittleren', '3, 5, 8, 10 → (5 + 8) ÷ 2 = 6,5'],
          ['Modus', 'häufigster Wert', '4, 7, 7, 9 → 7'],
          ['Spannweite', 'Maximum − Minimum', '12 bis 47 → 35'],
          ['CAGR', '(Endwert ÷ Startwert)^(1/n) − 1, n = Anzahl Jahresabstände', '100 → 121 in 2 Jahren: √1,21 − 1 = 10 %'],
          ['Index (Basis = 100)', 'Wert = Basiswert × Index ÷ 100', 'Basis 250 €, Index 112 → 280 €'],
          ['Veränderung zwischen zwei Indexwerten', 'Index neu ÷ Index alt − 1', '105 → 115,5: +10 % (nicht +10,5 %!)'],
          ['Wechselkurs (x Einheiten je 1 EUR)', 'EUR → Fremdwährung: × Kurs; Fremdwährung → EUR: ÷ Kurs', '200 EUR bei 1,10 USD/EUR = 220 USD'],
        ],
      },
      { t: 'h', text: 'Die häufigsten Fallen' },
      {
        t: 'list',
        items: [
          'Falsche Basis: Prozentuale Veränderung immer auf den ALTEN Wert beziehen.',
          'Prozent vs. Prozentpunkte: Ein Anstieg von 10 % auf 12 % sind 2 Prozentpunkte, aber 20 % relativ.',
          'Einheiten: Tabelle in Tsd., Frage in Mio. → durch 1.000 teilen.',
          'Indexpunkte sind nur ab dem Basisjahr gleich Prozent. Von 105 auf 115,5 sind es 10,5 Punkte, aber 10 %.',
          'Absolute Werte aus Anteilen: Ohne Gesamtgröße für genau dieses Jahr → „Cannot say“.',
          'Größter absoluter Zuwachs ist nicht automatisch der größte prozentuale Zuwachs.',
        ],
      },
      { t: 'example', gen: 'num.ppoints', d: 2, seed: 7, caption: 'Prozentpunkte oder Prozent?' },
      { t: 'example', gen: 'num.pctchange', d: 2, seed: 11, caption: 'Prozentuale Veränderung mit Überschlag' },
      { t: 'tip', text: 'Zeitbudget: Auf Test-Niveau ca. 60–80 Sekunden pro Frage. Wenn du nach 90 Sekunden keinen Weg siehst: begründet raten (ohne Negativwertung) und weiter.' },
    ],
    practice: { cat: 'numerical' },
  },
  {
    id: 'speed',
    title: 'Kopfrechnen & Speed Math',
    category: 'speed',
    summary: 'Rechentricks für Tests ohne Taschenrechner (BCG Cognitive Test: laut Berichten ca. 22 Sekunden pro Frage).',
    usedBy: 'BCG Cognitive Test (ohne Rechner), Kearney Recruitment Test (Quant-Teil, ohne Rechner)',
    blocks: [
      { t: 'h', text: 'Was wird getestet?' },
      { t: 'p', text: 'Schnelles, sicheres Rechnen ohne Hilfsmittel: Grundrechenarten, Prozent, Brüche, Überschlag, Dreisatz, Zahlenreihen und kurze Textaufgaben. Beim BCG Cognitive Test (offiziell 30 Minuten; laut Berichten 80 Fragen) bleiben im Schnitt 22,5 Sekunden pro Frage.' },
      { t: 'h', text: 'Bruch-Prozent-Tabelle (auswendig lernen)' },
      {
        t: 'table',
        head: ['Bruch', 'Prozent', 'Bruch', 'Prozent'],
        rows: [
          ['1/2', '50 %', '1/8', '12,5 %'],
          ['1/3', '33,3 %', '3/8', '37,5 %'],
          ['2/3', '66,7 %', '5/8', '62,5 %'],
          ['1/4', '25 %', '7/8', '87,5 %'],
          ['3/4', '75 %', '1/9', '11,1 %'],
          ['1/5', '20 %', '1/11', '9,1 %'],
          ['1/6', '16,7 %', '1/12', '8,3 %'],
          ['5/6', '83,3 %', '1/16', '6,25 %'],
          ['1/7', '14,3 %', '1/20', '5 %'],
        ],
      },
      { t: 'h', text: 'Multiplikations-Tricks' },
      {
        t: 'table',
        head: ['Trick', 'Regel', 'Beispiel'],
        rows: [
          ['× 5', '× 10, dann ÷ 2', '48 × 5 = 480 ÷ 2 = 240'],
          ['× 25', '× 100, dann ÷ 4', '36 × 25 = 3.600 ÷ 4 = 900'],
          ['× 125', '× 1.000, dann ÷ 8', '24 × 125 = 24.000 ÷ 8 = 3.000'],
          ['× 9', '× 10 minus einmal die Zahl', '37 × 9 = 370 − 37 = 333'],
          ['× 11 (zweistellig)', 'Ziffern auseinanderziehen, Summe in die Mitte (mit Übertrag)', '43 × 11 = 473; 78 × 11 = 858'],
          ['Zerlegen', 'einen Faktor in Zehner und Einer aufteilen', '47 × 23 = 47 × 20 + 47 × 3 = 940 + 141 = 1.081'],
          ['Runden und korrigieren', 'zur glatten Zahl runden, Differenz abziehen', '49 × 18 = 50 × 18 − 18 = 882'],
          ['(a + b)(a − b) = a² − b²', 'symmetrisch um eine runde Zahl', '52 × 48 = 2.500 − 4 = 2.496'],
          ['Quadrate nahe 50', '2.500 + 100 × (n − 50) + (n − 50)²', '53² = 2.500 + 300 + 9 = 2.809'],
          ['Quadrate mit Endziffer 5', 'Zehner × (Zehner + 1), dann 25 anhängen', '65² → 6 × 7 = 42 → 4.225'],
          ['Produkte nahe 100', '100 × (100 − a − b) + a × b, mit a, b = Abstand zu 100', '97 × 94: a = 3, b = 6 → 9.100 + 18 = 9.118'],
        ],
      },
      { t: 'h', text: 'Divisions-Tricks' },
      {
        t: 'list',
        items: [
          '÷ 5 = × 2, dann ÷ 10: 340 ÷ 5 = 680 ÷ 10 = 68.',
          '÷ 25 = × 4, dann ÷ 100: 850 ÷ 25 = 3.400 ÷ 100 = 34.',
          '÷ 125 = × 8, dann ÷ 1.000: 3.000 ÷ 125 = 24.000 ÷ 1.000 = 24.',
          'Divisor zerlegen: 1.872 ÷ 24 = (1.872 ÷ 8) ÷ 3 = 234 ÷ 3 = 78.',
          'Durch eine Zahl kleiner als 1 teilen macht das Ergebnis größer: 84 ÷ 0,25 = 84 × 4 = 336.',
        ],
      },
      { t: 'h', text: 'Prozent im Kopf' },
      {
        t: 'list',
        items: [
          'Aus 10 %, 5 % und 1 % zusammensetzen: 35 % von 260 = 3 × 26 + 13 = 91.',
          'Tauschen: 8 % von 50 = 50 % von 8 = 4. 16 % von 25 = 25 % von 16 = 4.',
          'Aufeinanderfolgende Änderungen multiplizieren: +20 % und dann −20 % = 1,2 × 0,8 = 0,96 → −4 %.',
          'Rückwärts immer dividieren: Nach +25 % kostet etwas 150 → ursprünglich 150 ÷ 1,25 = 120 (nicht 150 − 25 %).',
          'Prozentuale Änderung: Differenz ÷ alter Wert. 80 → 92: 12 ÷ 80 = 15 %.',
        ],
      },
      { t: 'h', text: 'Große Zahlen und Nullen' },
      { t: 'p', text: 'Ziffern und Zehnerpotenzen getrennt rechnen: 4.500 × 2.000 → 45 × 2 = 90, Nullen: 2 + 3 = 5 → 9.000.000 = 9 Mio. Tsd. = 10³, Mio. = 10⁶, Mrd. = 10⁹. 2,4 Mrd. ÷ 300.000 = 24 × 10⁸ ÷ (3 × 10⁵) = 8 × 10³ = 8.000.' },
      { t: 'h', text: 'Überschlagen' },
      {
        t: 'list',
        items: [
          'Bei Multiplikation einen Faktor auf-, den anderen abrunden: 48 × 52 ≈ 50 × 50 = 2.500 (exakt 2.496).',
          'Bei Division Zähler und Nenner in dieselbe Richtung runden: 4.870 ÷ 52 ≈ 4.800 ÷ 50 = 96 (exakt ≈ 93,7).',
          'Wenn die Optionen um Faktoren auseinanderliegen, genügt die Größenordnung.',
          'Regel 72: Verdopplungszeit ≈ 72 ÷ Wachstumsrate in %. Bei 8 % p. a. ≈ 9 Jahre.',
        ],
      },
      { t: 'h', text: 'Zahlenreihen – Prüfreihenfolge' },
      { t: 'list', ordered: true, items: ['Differenzen bilden (konstant? wachsend?).', 'Verhältnisse prüfen (×2, ×3, ÷2).', 'Differenzen der Differenzen.', 'Abwechselnde Muster: Positionen 1, 3, 5 und 2, 4, 6 getrennt betrachten.', 'Summe der beiden Vorgänger (Fibonacci-artig).', 'Quadrat- und Kubikzahlen (±k).'] },
      { t: 'example', gen: 'speed.mul', d: 2, seed: 3, caption: 'Zerlegen und Runden' },
      { t: 'example', gen: 'speed.sequence', d: 2, seed: 5, caption: 'Zahlenreihe' },
      { t: 'tip', text: 'Im BCG-Test nicht an einer Aufgabe festbeißen: Nach ca. 30 Sekunden zur nächsten Aufgabe gehen – Überspringen gehört laut Berichten zur Strategie. Ob du später zurückspringen kannst, ist nicht belegt; prüfe die Anleitung im Test.' },
    ],
    practice: { cat: 'speed' },
  },
  {
    id: 'inductive',
    title: 'Inductive Reasoning (Figuren)',
    category: 'inductive',
    summary: 'Figurenreihen, Matrizen und Odd one out systematisch knacken.',
    usedBy: 'SHL (Deutsche Bank G+, Kearney SHL-Variante), Sova (Bain)',
    blocks: [
      { t: 'h', text: 'Was wird getestet?' },
      { t: 'p', text: 'Du erkennst Regeln in abstrakten Figuren und wendest sie an. Schwierig wird es, wenn mehrere Regeln gleichzeitig laufen und Ablenkelemente dazukommen.' },
      { t: 'h', text: 'Checkliste für Figurenreihen' },
      { t: 'list', ordered: true, items: ['Anzahl der Elemente zählen.', 'Positionen verfolgen (wandert etwas im oder gegen den Uhrzeigersinn? Wie viele Schritte?).', 'Drehung prüfen (45°, 90°, 180°).', 'Füllung/Muster (leer, schwarz, gestreift, gepunktet).', 'Abwechselnde Regeln (jedes zweite Bild).', 'Mehrere Regeln parallel – jede einzeln bestätigen.', 'Ausschlussverfahren über die Optionen: Jede Regel streicht mindestens eine Option.'] },
      { t: 'h', text: 'Typische Regeltypen' },
      {
        t: 'table',
        head: ['Regel', 'Woran erkennbar'],
        rows: [
          ['Bewegung', 'Ein Element wandert am Rand entlang, oft 1 oder 2 Felder pro Schritt.'],
          ['Drehung', 'Pfeil oder L-Form zeigt jedes Mal in eine andere Richtung.'],
          ['Spiegelung', 'Die L-Form wechselt zwischen normal und gespiegelt – keine Drehung bringt sie zurück.'],
          ['Anzahl', 'Striche/Punkte nehmen um 1 oder 2 zu.'],
          ['Zyklus', 'Füllung, Größe oder Form wechseln in fester Reihenfolge (z. B. leer → gestreift → schwarz).'],
          ['Matrix: Verteilung', 'Jede Ausprägung kommt in jeder Zeile genau einmal vor.'],
          ['Matrix: Überlagerung', 'Feld 3 = Feld 1 + Feld 2; gemeinsame Linien verschwinden (XOR) oder bleiben (OR).'],
          ['Odd one out', 'Vier Figuren teilen eine Eigenschaft – oft versteckt (Spiegelung, gerade/ungerade Anzahl, Seitensumme).'],
        ],
      },
      { t: 'example', gen: 'ind.series', d: 2, seed: 4, caption: 'Figurenreihe mit zwei Regeln' },
      { t: 'example', gen: 'ind.matrix', d: 2, seed: 9, caption: '3×3-Matrix' },
      { t: 'tip', text: 'Optionen, die eine Kopie eines Nachbarfeldes sind, sind in Matrizen fast immer falsch – Testautoren nutzen sie als Köder.' },
    ],
    practice: { cat: 'inductive' },
  },
  {
    id: 'deductive',
    title: 'Deductive & Logical Reasoning',
    category: 'deductive',
    summary: 'Syllogismen, Reihenfolgen und Wenn-dann-Regeln sauber ableiten.',
    usedBy: 'SHL (Deutsche Bank G+, Kearney SHL-Variante), BCG Cognitive Test (Logikteil), Sova (Bain)',
    blocks: [
      { t: 'h', text: 'Grundprinzip' },
      { t: 'p', text: 'Eine Schlussfolgerung ist nur dann richtig, wenn sie in JEDER Situation gilt, die mit den Aussagen vereinbar ist. „Klingt plausibel“ oder „ist in der Realität so“ reicht nicht.' },
      { t: 'h', text: 'Syllogismen mit Venn-Diagrammen' },
      {
        t: 'list',
        items: [
          '„Alle A sind B“: Kreis A liegt ganz in Kreis B. Umkehren ist verboten – „Alle B sind A“ folgt NICHT.',
          '„Einige A sind B“ = „Einige B sind A“ (darf umgedreht werden).',
          '„Keine A sind B“ = „Keine B sind A“ (darf umgedreht werden).',
          '„Einige A sind nicht B“ darf NICHT umgedreht werden.',
          'Gültige Ketten: Alle A sind B + Alle B sind C → Alle A sind C. Einige A sind B + Alle B sind C → Einige A sind C. Alle A sind B + Keine B sind C → Keine A sind C.',
          'Trick: Versuche, ein Gegenbeispiel zu zeichnen. Gelingt es, folgt die Aussage nicht.',
        ],
      },
      { t: 'example', gen: 'ded.syllogism', d: 1, seed: 2, caption: 'Syllogismus' },
      { t: 'h', text: 'Wenn-dann-Regeln' },
      {
        t: 'table',
        head: ['Schluss', 'Gültig?', 'Beispiel (Regel: Wenn es regnet, ist die Straße nass)'],
        rows: [
          ['Modus ponens: A, also B', 'ja', 'Es regnet → die Straße ist nass.'],
          ['Modus tollens: nicht B, also nicht A', 'ja', 'Die Straße ist nicht nass → es regnet nicht.'],
          ['Bejahung der Folge: B, also A', 'NEIN', 'Die Straße ist nass → es könnte auch ein Rohrbruch sein.'],
          ['Verneinung der Bedingung: nicht A, also nicht B', 'NEIN', 'Es regnet nicht → die Straße kann trotzdem nass sein.'],
        ],
      },
      {
        t: 'list',
        items: [
          '„Wenn A, dann B“ ist gleichwertig zu „Wenn nicht B, dann nicht A“ (Kontraposition).',
          '„Nur wenn A, dann B“ bedeutet: Wenn B, dann A.',
          '„A oder B (oder beides)“ + nicht A → B.',
          '„Nicht beides A und B“ + A → nicht B.',
        ],
      },
      { t: 'example', gen: 'ded.rules', d: 2, seed: 6, caption: 'Wenn-dann-Kette' },
      { t: 'h', text: 'Reihenfolge- und Sitzordnungsrätsel' },
      { t: 'list', ordered: true, items: ['Positionsleiste (1, 2, 3 …) oder Kreis skizzieren.', 'Feste Angaben zuerst eintragen.', '„Direkt vor/neben“-Paare als Block behandeln.', '„Vor/nach“-Hinweise als Pfeile notieren.', 'Bei Restunsicherheit Fälle durchspielen (meist nur 2–3).', 'Bei „muss wahr sein“: Jede Option gegen ALLE verbleibenden Anordnungen prüfen.'] },
      { t: 'example', gen: 'ded.ordering', d: 2, seed: 8, caption: 'Reihenfolge' },
    ],
    practice: { cat: 'deductive' },
  },
  {
    id: 'verbal',
    title: 'Verbal Reasoning (True / False / Cannot Say)',
    category: 'verbal',
    summary: 'Die exakte Logik hinter Wahr, Falsch und Nicht bestimmbar.',
    usedBy: 'Allianz, Kearney Recruitment Test (Verbal-Teile), Bain Sova (früher)',
    blocks: [
      { t: 'h', text: 'Die drei Antworten' },
      {
        t: 'table',
        head: ['Antwort', 'Bedeutung'],
        rows: [
          ['True / Wahr', 'Die Aussage folgt aus dem Text – wörtlich oder sinngemäß, ohne zusätzliche Annahmen.'],
          ['False / Falsch', 'Der Text sagt das Gegenteil bzw. schließt die Aussage aus.'],
          ['Cannot say / Nicht bestimmbar', 'Der Text gibt nicht genug Information, um wahr oder falsch zu entscheiden.'],
        ],
      },
      { t: 'h', text: 'Regeln' },
      {
        t: 'list',
        items: [
          'Nur der Text zählt. Vorwissen ignorieren – auch wenn die Aussage in der Realität stimmt.',
          'Signalwörter exakt vergleichen: all/some/most/only/never/always. „Einige“ ist nicht „alle“.',
          'Korrelation ist keine Kausalität: „gleichzeitig gestiegen“ heißt nicht „deshalb gestiegen“.',
          'Zeitbezug prüfen: Gilt die Aussage für denselben Zeitraum wie der Text?',
          'Vergleiche (größter, mehr als) müssen im Text belegt sein.',
          'Unterschied Falsch vs. Nicht bestimmbar: Falsch braucht einen Widerspruch im Text. Fehlt die Info nur, ist es „Nicht bestimmbar“.',
        ],
      },
      { t: 'tip', text: 'Lies zuerst die Aussage, dann gezielt die passende Stelle im Text. Bei 3–4 Aussagen pro Text spart das Zeit.' },
    ],
    practice: { cat: 'verbal' },
  },
  {
    id: 'critical',
    title: 'Critical Thinking (Watson-Glaser-Stil)',
    category: 'critical',
    summary: 'Fünf Aufgabentypen und wie man sie unterscheidet.',
    usedBy: 'Bain TestGorilla, Kearney (früher Watson-Glaser)',
    blocks: [
      {
        t: 'table',
        head: ['Teil', 'Frage', 'Kernregel'],
        rows: [
          ['Inference', 'Wie wahrscheinlich ist die Schlussfolgerung? (Wahr … Falsch, 5 Stufen)', '„Wahr“ nur bei zwingender Folge. Allgemeinwissen darf ergänzen, aber keine Fakten ersetzen.'],
          ['Recognition of Assumptions', 'Wird die Annahme stillschweigend gemacht?', 'Gemacht, wenn die Aussage ohne sie keinen Sinn ergibt.'],
          ['Deduction', 'Folgt die Schlussfolgerung zwingend aus den Prämissen?', 'Nur die Prämissen zählen, auch wenn sie unrealistisch sind.'],
          ['Interpretation', 'Folgt die Schlussfolgerung ohne vernünftigen Zweifel aus dem Text?', 'Keine Übergeneralisierung, keine neuen Ursachen.'],
          ['Evaluation of Arguments', 'Ist das Argument stark oder schwach?', 'Stark = wichtig und direkt auf die Frage bezogen.'],
        ],
      },
      { t: 'h', text: 'Typische Fehler' },
      { t: 'list', items: ['Eigene Meinung bewerten statt der Logik.', '„Wahrscheinlich wahr“ wählen, obwohl der Text gar nichts dazu sagt (→ unzureichende Daten).', 'Ein inhaltlich richtiges, aber irrelevantes Argument als stark einstufen.'] },
    ],
    practice: { cat: 'critical' },
  },
  {
    id: 'diagrammatic',
    title: 'Diagrammatic Reasoning',
    category: 'diagrammatic',
    summary: 'Operatoren in Flussdiagrammen entschlüsseln.',
    usedBy: 'bei den sechs Zielunternehmen nicht ausdrücklich berichtet – Ergänzung für allgemeine Logik-Tests',
    blocks: [
      { t: 'list', ordered: true, items: ['Beispiele mit nur einem Operator zuerst entschlüsseln.', 'Positionsoperatoren (umkehren, rotieren, tauschen) ändern nur die Reihenfolge; Buchstabenoperatoren (nächster Buchstabe) ändern die Zeichen.', 'Zwischenergebnisse nach jedem Kasten notieren.', 'Bei fehlendem Operator von beiden Seiten rechnen: vorwärts bis zum Fragezeichen, rückwärts vom Ergebnis.'] },
      { t: 'example', gen: 'diag.flow', d: 2, seed: 3, caption: 'Fehlender Operator' },
    ],
    practice: { cat: 'diagrammatic' },
  },
  {
    id: 'aon',
    title: 'Aon-Games (P&G Interactive Assessment)',
    category: 'aon',
    summary: 'Strategien für Switch, Digit und Grid Challenge.',
    usedBy: 'P&G Interactive Assessment (Aon)',
    blocks: [
      { t: 'h', text: 'Switch Challenge' },
      { t: 'list', items: ['Code lesen: Ziffer an Position i = von welcher Eingangsposition das Symbol kommt. 3142 heißt: Position 1 bekommt das 3. Symbol.', 'Nur ein Symbol verfolgen und damit Optionen streichen – meist bleiben dann 1–2 übrig.', 'Typische Falle: die umgekehrte Permutation (wohin statt woher).', 'Bei zwei Schaltern: Ist der erste bekannt, ihn zuerst anwenden und dann den fehlenden bestimmen. Fehlt der erste, vom Ausgang rückwärts durch den bekannten zweiten Schalter rechnen.'] },
      { t: 'example', gen: 'aon.switch', d: 1, seed: 4, caption: 'Switch' },
      { t: 'h', text: 'Digit Challenge' },
      { t: 'list', items: ['Mit dem restriktivsten Teil anfangen, meist dem Produkt: Steht es allein, Teiler des Ergebnisses suchen; folgt noch ein Summand (1–9), muss das Produkt knapp unter bzw. über dem Ergebnis liegen.', 'Große Ergebnisse brauchen große Faktoren; danach mit + und − feinjustieren.', 'Jede Ziffer nur einmal – bereits genutzte Ziffern sofort streichen.', 'Es gibt oft mehrere Lösungen; jede gültige zählt.'] },
      { t: 'h', text: 'Grid Challenge' },
      { t: 'list', items: ['Positionen sprachlich kodieren („oben links“, „B3“) – das stört die räumlichen Zwischenaufgaben weniger.', 'Chunking: Mehrere Punkte als Form merken (Linie, L, Diagonale).', 'Zwischenaufgaben zügig, aber sorgfältig – in der App zählen sie zur Wertung.'] },
    ],
    practice: { cat: 'aon' },
  },
  {
    id: 'interactive',
    title: 'SHL Verify Interactive',
    category: 'interactive',
    summary: 'Balken ziehen, Reihenfolgen und Tabellenzellen – die interaktiven Formate.',
    usedBy: 'Deutsche Bank (SHL Verify Interactive G+)',
    blocks: [
      { t: 'list', items: ['Erst rechnen, dann ziehen – beim Ziehen auf die angezeigte Zahl achten, nicht auf das Augenmaß.', 'Balken rasten in festen Schritten ein; in dieser App liegt die richtige Antwort immer exakt auf einem Schritt.', 'Reihenfolgen: Kennzahl für alle Elemente grob überschlagen, nur eng beieinanderliegende genau rechnen.', 'Tabellenzelle: Summenzeilen/-spalten und Anteile nutzen; Kontrolle durch Neuaddieren.'] },
      { t: 'example', gen: 'int.tablefill', d: 2, seed: 5, caption: 'Tabellenzelle befüllen' },
    ],
    practice: { cat: 'interactive' },
  },
  {
    id: 'tactics',
    title: 'Zeitmanagement & Test-Taktik',
    summary: 'Zeit pro Frage, Raten, Überspringen – je nach Test.',
    usedBy: 'alle Tests',
    blocks: [
      { t: 'h', text: 'Zeit pro Frage (laut Recherche)' },
      {
        t: 'table',
        head: ['Test', 'Format', 'Zeit pro Frage'],
        rows: [
          ['BCG Cognitive Test', '30 Min. (offiziell), 80 Fragen (berichtet)', '≈ 22,5 s'],
          ['Kearney Recruitment Test', '40 Fragen / 60 Min.', '≈ 90 s'],
          ['SHL Verify Interactive G+ (Deutsche Bank)', '24 Fragen / 36 Min.', '≈ 90 s'],
          ['Allianz Numerical', '≈ 1 Min. pro Frage', '≈ 60 s'],
          ['Bain TestGorilla', 'Blöcke à 8–15 Min. mit 6–10 Fragen', '≈ 50–150 s (typisch 60–90 s)'],
          ['P&G Aon-Games', 'Switch 6 Min., Digit 5 Min., Grid 6–9 Min.', 'so viele wie möglich'],
        ],
      },
      { t: 'h', text: 'Raten' },
      {
        t: 'list',
        items: [
          'Ohne Negativwertung: immer antworten. Eine leere Antwort bringt sicher 0 Punkte.',
          'Kearney (+5 / −1 / 0, berichtet): Blindes Raten hat bei 5 Optionen einen Erwartungswert von 1/5 × 5 − 4/5 × 1 = +0,2 Punkten, bei 4 Optionen +0,5. Kannst du eine Option ausschließen, steigt er bei 5 Optionen auf 1/4 × 5 − 3/4 × 1 = +0,5.',
          'Folgerung für Kearney: keine Frage leer lassen. Erst die lösbaren Fragen, vor Ablauf alle offenen ankreuzen; jede ausgeschlossene Option erhöht den Erwartungswert weiter. Nennt deine Einladung eine andere Wertung, neu rechnen: Bei k Optionen lohnt Raten, solange der Abzug kleiner als Punkte ÷ (k − 1) ist (hier 5 ÷ 4 = 1,25).',
        ],
      },
      { t: 'h', text: 'Überspringen und Zurückspringen' },
      {
        t: 'list',
        items: [
          'Ist Zurückspringen erlaubt (für BCG Cognitive Test und Kearney nicht belegt – die Simulation nimmt es an; prüfe die Anleitung im Test): schwere Fragen sofort überspringen, einfache zuerst sammeln.',
          'Kein Zurück (berichtet: TestGorilla, Aon-Spiele, adaptive SHL-Tests; bei Sova unklar, die Simulation nimmt es an): Jede Frage beim ersten Mal entscheiden – lieber begründet raten als Zeit verlieren.',
          'Adaptive Tests (SHL G+, Aon Switch): Jede Antwort beeinflusst die nächsten Aufgaben – gerade am Anfang sorgfältig lösen.',
        ],
      },
      { t: 'tip', text: 'Trainiere jede Kategorie zuerst ohne Zeitdruck (Training), dann im Drill, dann in der Simulation.' },
    ],
  },
]

const BY_CAT: Partial<Record<CategoryId, string>> = Object.fromEntries(LESSONS.filter((l) => l.category).map((l) => [l.category, l.id]))

export function academyFor(cat: CategoryId): string {
  return BY_CAT[cat] ?? 'tactics'
}
