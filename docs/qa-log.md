# QA-Log (laufend, wird in docs/qa-report.md übernommen)

| Datum | Gate | Fund | Ursache | Behebung |
|---|---|---|---|---|
| 31.10.2026 | G2 | `speed.units` d3: Optionen wie „1,080,000,003.08“ | `roundTo` addierte einen relativen Epsilon von 1e-9 → bei Werten ~1e9 um +1 verschoben | Epsilon auf 1e-12 relativ reduziert |
| 31.10.2026 | G2 | `speed.mul` d3: mehrere Optionen „passen“ (63.00 vs. 63.10) | Validator nutzte benötigte statt angezeigte Nachkommastellen | Validator nutzt angezeigte Präzision der Optionen |
| 31.10.2026 | G2 | Numerical: Ergebnisse genau auf Rundungsgrenze (z. B. 18,75 → 1 NKS) | Generator prüfte Rundungsgrenzen nicht | `numMcq`/`numericMcq` verwerfen Kandidaten auf Rundungsgrenzen |
| 31.10.2026 | G2 | `aon.grid`: 87 von 3.000 Durchgängen mit falschem Symmetrie-Schlüssel | Asymmetrie-Erzeugung konnte dieselbe Zelle zweimal kippen → wieder symmetrisch | Zwei *verschiedene* Zellen kippen (`rng.sample`) |
| 31.10.2026 | Review | Numerical-Distraktor „0,00“ bei Einheitenaufgaben | Theme mit zu kleinen Werten (Tsd. Stück) | Einheiten-Generator nur noch mit Kosten-Theme, Ergebnis ≥ 1 |
| 31.10.2026 | Review | Extremwert-Frage „kleinste absolute Veränderung“ mehrdeutig (Betrag vs. negativster Wert) | Formulierung | Nur noch „größter Zuwachs“; „kleinster“ nur für Niveauwerte |
