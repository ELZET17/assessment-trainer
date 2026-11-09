# Entscheidungen (ADR-Light)

Jede Entscheidung: Kontext → Entscheidung → Begründung. Neueste unten.

## D1 – Plattform: Progressive Web App
**Entscheidung:** PWA (Vite + React + TypeScript), installierbar über Safari („Zum Home-Bildschirm“ auf dem iPhone, „Zum Dock hinzufügen“ auf dem Mac).
**Begründung:** eine Codebasis für Mac und iPhone, kein Apple-Developer-Account nötig, keine 7-Tage-Signatur bei Sideloading, Updates über einen einfachen Deploy, offline über Service Worker.

## D2 – Hosting: GitHub Pages (öffentliches Repo)
**Entscheidung:** GitHub Pages per GitHub Actions; Repo öffentlich (vom Nutzer am 31.10.2026 bestätigt).
**Begründung:** kostenlos, HTTPS (nötig für Service Worker und iPhone-Installation), kein Server. Fortschrittsdaten liegen nur lokal im Browser (IndexedDB), nie im Repo.

## D3 – Repo-Ort außerhalb des Nutzerordners
**Kontext:** Der Projektordner des Nutzers enthält im Pfad `26:27` (Finder zeigt `26/27`). npm hängt `<projekt>/node_modules/.bin` an `PATH` an; `:` ist das PATH-Trennzeichen → `npm run …` fände seine Werkzeuge nicht.
**Entscheidung:** Repo unter `~/Developer/assessment-trainer`, Symlink `Assessment Trainer/assessment-trainer` zeigt darauf.

## D4 – Werkzeuge ohne Admin-Rechte
**Kontext:** Auf dem Mac waren weder Node.js noch Homebrew noch die GitHub CLI installiert.
**Entscheidung:** Node.js 24 LTS (offizielles Tarball von nodejs.org, SHA-256 geprüft) nach `~/.local/node`, GitHub CLI 2.103.3 (offizielles Release, SHA-256 geprüft) nach `~/.local/bin`. Der automatische PATH-Eintrag in der Shell-Konfiguration wurde vom Sicherheitsfilter blockiert; der Nutzer kann ihn selbst setzen (siehe README).
**Begründung:** keine sudo-Rechte nötig, vollständig entfernbar (Ordner löschen).

## D5 – TypeScript 5.9 statt 7
**Kontext:** Das Vite-Template bringt TypeScript 7 (Go-Port) mit; `typescript-eslint` unterstützt nur `<6.1`.
**Entscheidung:** TypeScript `~5.9.3`, ESLint 10 + typescript-eslint (statt des Template-Linters oxlint, weil der Auftrag ESLint verlangt).

## D6 – Routing: HashRouter
**Entscheidung:** `createHashRouter` (React Router).
**Begründung:** GitHub Pages kennt keine SPA-Rewrites; Hash-URLs funktionieren bei Reload, Deep-Links und offline ohne 404-Trick.

## D7 – Schrift: Systemschrift
**Entscheidung:** System-Font-Stack (SF Pro auf Apple-Geräten), keine Webfonts.
**Begründung:** null Netzwerkanfragen zur Laufzeit, beste Lesbarkeit auf Mac/iPhone, keine Lizenzfragen. Tabellarische Ziffern über `font-variant-numeric: tabular-nums`.

## D8 – Lighthouse ohne PWA-Kategorie
**Kontext:** Lighthouse ≥ 12 hat die PWA-Kategorie entfernt.
**Entscheidung:** „Installierbar“ wird per Playwright geprüft: Manifest erreichbar und gültig (Name, Icons 192/512, maskable, `display: standalone`, `start_url`), `apple-touch-icon` vorhanden, Service Worker aktiv, App lädt offline.

## D9 – Digit Challenge: Regeln
**Entscheidung:** Ziffern 1–9, jede höchstens einmal pro Gleichung; Operatoren +, −, ×; **Punkt vor Strich**, im Spiel sichtbar angegeben. Jede gültige Belegung zählt als richtig (Solver prüft).
**Quelle:** Aon-Übungsblatt digitChallenge (siehe `docs/research.md`). Ob Aon Punkt-vor-Strich oder Links-nach-rechts rechnet, ist nicht belegt; die App macht die Regel explizit.

## D10 – Switch Challenge: Code-Semantik
**Entscheidung:** Code `c1 c2 c3 c4` bedeutet: An Ausgangsposition *i* steht das Symbol, das in der Eingangsreihe an Position *ci* stand. Wird im Spiel-Intro mit Beispiel erklärt.

## D11 – Generator + Mehrdeutigkeitsfilter
**Kontext:** Regel 4 verlangt, mehrdeutige Muster-Items zu verwerfen und neu zu generieren.
**Entscheidung:** Generatoren erzeugen Kandidaten deterministisch aus `(seed, versuch)`. Ein Kandidat wird nur angenommen, wenn der **unabhängige Validator** ihn eindeutig löst. Der Lösungsschlüssel stammt immer aus der Konstruktion des Generators, nie aus dem Validator. Gate 2 vergleicht danach beide unabhängig (Schlüssel vs. Validator-Lösung, Anzahl richtiger Optionen, Mehrdeutigkeit).
**Folge:** Gleicher Seed → gleiche Aufgabe (auch die Zahl der verworfenen Versuche ist deterministisch).

## D12 – Statistik nur aus Rohdaten
**Entscheidung:** Es gibt keine Zähler. Dashboard, Fehlerheft, Streak und Schwächen-Ranking werden ausschließlich aus der Tabelle `attempts` berechnet (reine Funktionen in `src/data/stats.ts`, `src/data/mistakes.ts`).

## D13 – Item-Sprache
**Entscheidung:** UI, Erklärungen und Akademie auf Deutsch. Aufgabentexte standardmäßig Englisch; Schalter auf Deutsch, wo eine deutsche Fassung existiert (Generator-Templates haben EN + DE; Verbal-Bank: ≥ 15 Texte mit DE). Fehlt die DE-Fassung, wird EN angezeigt.

## D14 – Kearney: „keine Frage leer lassen“ statt „nur nach Eliminierung raten“
Der Master-Prompt nennt als Taktik „mit Negativwertung bei Kearney: nur bei sinnvollen Eliminierungen raten“. Bei der berichteten Wertung +5/−1/0 hat aber schon blindes Raten einen positiven Erwartungswert (5 Optionen: 0,2 × 5 − 0,8 × 1 = +0,2; 4 Optionen: +0,5), leer lassen bringt sicher 0. Auch die zitierte Quelle (StrategyCase, abgerufen 02.11.2026) empfiehlt, jede Frage zu beantworten. Weil die Akademie „inhaltlich korrekt“ sein muss (Abschnitt 5.4, Gate 4), lehrt die App: keine Frage leer lassen, Eliminierung erhöht den Erwartungswert weiter; bei anderer Wertung neu rechnen (Raten lohnt, solange Abzug < Punkte ÷ (Optionen − 1)).

## D15 – BCG CCA: numerischer statt „Logik“-Teil
Der Master-Prompt nennt den „CCA-Logikteil“. Laut Recherche besteht der kognitive Teil des CCA aus einem numerischen Block im SHL-Stil (berichtet; genauer Aufbau nicht öffentlich). Das Profil „BCG – CCA kognitiver Teil (SHL-Stil)“ trainiert deshalb Numerical inkl. interaktiver SHL-Formate; Logik-Aufgaben übt man im BCG-Cognitive-Test-Profil und in Kategorie D.

## D16 – Kearney-Abschnitte und Rechner
Abschnittsgrößen 8/6/6/8/6/6 und „ohne Taschenrechner“ folgen den Kandidatenberichten bei StrategyCase (berichtet, nicht offiziell). Das dort beschriebene Format „Data Sufficiency“ gibt es in der App noch nicht; der zweite Quant-Teil nutzt Textaufgaben (Caveat im Profil).

## D17 – Generator-Versionen bleiben bei v1 bis zum ersten Release
Generatoren wurden während der Prüf-Gates mehrfach geändert (gleicher Seed → andere Aufgabe als vor der Änderung). Vor dem ersten Deploy gibt es keine gespeicherten Nutzerdaten, deshalb bleibt die Version 1. Ab dem ersten Release gilt: Jede Änderung, die Aufgaben zu einem Seed verändert, erhöht die Generator-Version. `resolveItem` erzeugt eine Aufgabe nur, wenn die gespeicherte Version zur aktuellen passt – ein alter Fehlerheft-Eintrag wird also nie stillschweigend durch eine andere Aufgabe ersetzt, sondern ausgelassen (die Statistik bleibt erhalten, weil sie nur aus den gespeicherten Versuchen rechnet).

## D18 – Antworten werden sofort gespeichert
Jede Antwort in Simulationen und Aon-Spielen wird direkt beim Antworten in IndexedDB geschrieben (Upsert mit deterministischer ID aus Session und Position, Reihenfolgefeld `seq`). Ein Reload, ein vorzeitiges Ende oder ein Absturz verlieren damit keine Antworten. Beim Abgeben werden dieselben Einträge vervollständigt (unbeantwortete als leer). Ein „Fortsetzen“ abgebrochener Läufe gibt es bewusst nicht: Ein echter Test lässt sich auch nicht unterbrechen.

## D19 – App-Updates nur außerhalb laufender Übungen
Der Service Worker läuft im Prompt-Modus. Eine neue Version (z. B. eine korrigierte Erklärung) wird sofort aktiviert, wenn gerade keine Übung, kein Drill und keine Simulation läuft, sonst beim nächsten Seitenwechsel. Installierte Apps suchen stündlich und beim Wechsel in den Vordergrund nach Updates.

## D20 – Golden-Test für Generatoren
`tests/content/golden.json` hält einen Hash der Aufgaben jedes Generators für 25 feste Seeds je Stufe (EN und DE). Ändert eine Code-Änderung Aufgaben, schlägt der Test fehl: Dann wird die Generator-Version erhöht (D17) und `npm run golden` ausgeführt.

## D21 – Reihenfolge-Aufgaben gelten erst nach dem Anzeigen als beantwortet
Wie in SHL-Tests zählt die angezeigte Startreihenfolge als Antwort – aber erst, wenn die Aufgabe tatsächlich angezeigt wurde. Nicht erreichte Aufgaben bleiben leer.

## D22 – Weitere Figurenfamilien mit eigenen Lösern (11/2026)
Neu: `ind.multi` (mehrere Elemente mit eigener Regel), `ind.count` (Anzahl gleicher Elemente), `ind.analogy` (A : B = C : ?), `ind.matrix2` (Matrizen mit Überlagerung ODER/XOR/UND/Minus bzw. Anzahl). Mehrere gleiche Elemente werden nach einer festen Anordnung (`PACK`, wie Würfelaugen) gezeichnet; Generator und Löser nutzen diese Zeichenkonvention, nicht den Schlüssel. Die Löser laufen parallel (`solveSeriesAll`, `solveMatrixAll`): Eine Aufgabe gilt nur, wenn alle anwendbaren Löser dasselbe Feld vorhersagen. Der Analogie-Löser liest jede Veränderung von A nach B auf alle naheliegenden Arten (relativ „90° drehen“, absolut „zeigt nach rechts“, „wird schwarz“, „tauschen“); genau eine Option darf zu irgendeiner dieser Lesarten passen. Der Matrix-Löser prüft zusätzlich Subtraktion – dadurch fielen einige mehrdeutige Linien-Matrizen weg, `ind.matrix` steigt auf Version 2 (alte v1-Versuche bleiben in der Statistik, sind aber nicht mehr wiederholbar, D17).
