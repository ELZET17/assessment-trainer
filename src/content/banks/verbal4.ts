/** Verbal passages v31–v40 (harder). Original texts; all companies are fictional. */
import type { VerbalPassage } from './types'

export const VERBAL_4: VerbalPassage[] = [
  {
    id: 'v31',
    topic: 'Rechenzentren',
    difficulty: 3,
    title: { en: 'Cooling data centres with lake water' },
    text: {
      en: 'The cloud provider Northdata cools its data centre in Silvbro with water from a nearby lake instead of using conventional air-conditioning units. Water is pumped from a depth of 40 metres, where it stays below 8°C all year, and returned to the lake after use at a slightly higher temperature. The company states that the system uses 60% less electricity than air-conditioning would. Environmental groups accept that the system saves energy but have asked for long-term monitoring of the lake’s temperature. Northdata has agreed to publish monitoring data annually, starting in 2025. A second data centre that the company is planning in an area without a large lake will use air-conditioning. The data centre in Silvbro opened in 2021 and serves customers across Scandinavia. Waste heat from the servers is also supplied to the town’s district heating network. The lake has a surface area of about 40 square kilometres.',
    },
    statements: [
      { id: 'v31-1', text: { en: 'The water returned to the lake is warmer than when it was pumped out.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 2: Das Wasser wird „at a slightly higher temperature“ zurückgeleitet.' },
      { id: 'v31-2', text: { en: 'Environmental groups dispute that the lake-water system saves energy.' }, answer: 'F', trap: 'negation', reason: 'Satz 4: Die Umweltgruppen „accept that the system saves energy“ – sie bestreiten es nicht.' },
      { id: 'v31-3', text: { en: 'Monitoring has shown that the lake’s temperature has not changed.' }, answer: 'C', trap: 'temporal', reason: 'Satz 5: Daten werden erst ab 2025 veröffentlicht; über Ergebnisse sagt der Text nichts.' },
      { id: 'v31-4', text: { en: 'All of Northdata’s data centres will be cooled with lake water.' }, answer: 'F', trap: 'some-all', reason: 'Satz 6: Das zweite geplante Rechenzentrum wird mit Klimaanlagen gekühlt.' },
    ],
  },
  {
    id: 'v32',
    topic: 'Versicherung',
    difficulty: 3,
    title: { en: 'Automated claims at Ostmark Insurance' },
    text: {
      en: 'Ostmark Insurance now settles simple household claims below 1,500 euros automatically. Customers upload photos and receipts through an app, and an algorithm decides within minutes whether to pay. Claims above this amount, as well as any claim the algorithm flags as unusual, are reviewed by a claims handler. In 2024, 48% of all household claims were settled automatically. Ostmark reports that its rate of detected fraud did not change after the introduction of the system. A spokesperson added that customers whose claims are rejected by the algorithm can request a review by a human handler. Ostmark has around 900,000 household insurance customers. The algorithm was trained on several years of past claims. Customers who prefer not to use the app can still submit claims by phone.',
    },
    statements: [
      { id: 'v32-1', text: { en: 'A household claim of 2,000 euros can be settled automatically if the algorithm does not flag it as unusual.' }, answer: 'F', trap: 'quantity', reason: 'Satz 1 und 3: Automatisch werden nur Fälle unter 1.500 Euro reguliert; höhere Schäden prüft immer ein Sachbearbeiter.' },
      { id: 'v32-2', text: { en: 'A household claim below 1,500 euros can still end up being reviewed by a claims handler.' }, answer: 'T', trap: 'some-all', reason: 'Satz 3: Jeder vom Algorithmus als ungewöhnlich markierte Fall wird von einem Sachbearbeiter geprüft – auch unter 1.500 Euro. Zudem können abgelehnte Kunden eine menschliche Prüfung verlangen (Satz 6).' },
      { id: 'v32-3', text: { en: 'Fraud became less common after the system was introduced.' }, answer: 'C', trap: 'causation', reason: 'Satz 5 nennt nur die Rate ENTDECKTER Betrugsfälle (unverändert). Ob Betrug tatsächlich seltener wurde, ist unbekannt.' },
      { id: 'v32-4', text: { en: 'Customers have no way of challenging a decision made by the algorithm.' }, answer: 'F', trap: 'negation', reason: 'Satz 6: Abgelehnte Kunden können eine Prüfung durch einen Menschen verlangen.' },
    ],
  },
  {
    id: 'v33',
    topic: 'Mikrofinanz',
    difficulty: 3,
    title: { en: 'Small business loans from Kivora Bank' },
    text: {
      en: 'Kivora Bank launched a microloan programme for small businesses in 2022, offering loans of up to 25,000 euros without requiring collateral. Applicants must present a business plan and have been trading for at least one year. By the end of 2024, the bank had granted 1,900 loans. The share of loans more than 90 days overdue was 6%, compared with 3% for the bank’s conventional small-business loans. The bank considers the programme viable because the higher interest rate on microloans compensates for the higher default risk. It does not plan to raise the maximum loan amount. Kivora Bank is a regional bank with 46 branches. Decisions on microloan applications are made within five working days. Borrowers can also receive free advice on financial planning.',
    },
    statements: [
      { id: 'v33-1', text: { en: 'A business founded six months ago can obtain a microloan from Kivora.' }, answer: 'F', trap: 'temporal', reason: 'Satz 2: Antragsteller müssen seit mindestens einem Jahr tätig sein.' },
      { id: 'v33-2', text: { en: 'Microloans at Kivora were twice as likely as conventional small-business loans to be more than 90 days overdue.' }, answer: 'T', trap: 'quantity', reason: 'Satz 4: 6 % gegenüber 3 % – doppelt so hoch.' },
      { id: 'v33-3', text: { en: 'Microloans carry a higher interest rate than Kivora’s conventional small-business loans.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 4 vergleicht Mikrokredite mit Kivoras konventionellen Krediten; auf diesen Vergleich bezieht sich Satz 5: Die „higher interest rate on microloans“ gleicht das höhere Ausfallrisiko aus. Mikrokredite haben also einen höheren Zins als die konventionellen Kredite.' },
      { id: 'v33-4', text: { en: 'Most microloans granted by Kivora were for the maximum amount of 25,000 euros.' }, answer: 'C', trap: 'quantity', reason: 'Der Text nennt nur den Höchstbetrag, nicht die Verteilung der Kreditsummen.' },
    ],
  },
  {
    id: 'v34',
    topic: 'Urban Farming',
    difficulty: 3,
    title: { en: 'Vertical farming in Port Ellis' },
    text: {
      en: 'GreenStack grows lettuce and herbs in a vertical farm in an industrial building in Port Ellis. Plants grow on shelves under LED lights, without soil and without pesticides. The company says it uses 95% less water per kilogram of lettuce than conventional field farming. However, electricity for lighting and climate control accounts for almost half of its operating costs. GreenStack sells its products to supermarkets within 50 kilometres, which allows it to deliver on the day of harvest. The company made a loss in 2024 and has said that it can only become profitable if electricity prices fall or its yields increase. The building previously housed a printing company. GreenStack employs 35 people and harvests around 400 kilograms of lettuce per day. Its packaging is made from recycled cardboard.',
    },
    statements: [
      { id: 'v34-1', text: { en: 'GreenStack uses pesticides only in small quantities.' }, answer: 'F', trap: 'negation', reason: 'Satz 2: Die Pflanzen wachsen „without pesticides“ – also gar keine Pestizide.' },
      { id: 'v34-2', text: { en: 'Electricity accounts for more than half of GreenStack’s operating costs.' }, answer: 'F', trap: 'quantity', reason: 'Satz 4: Strom macht „almost half“ der Betriebskosten aus – also knapp weniger als die Hälfte, nicht mehr.' },
      { id: 'v34-3', text: { en: 'GreenStack was profitable in 2024.' }, answer: 'F', trap: 'none', reason: 'Satz 6: Das Unternehmen machte 2024 einen Verlust.' },
      { id: 'v34-4', text: { en: 'Vertical farming uses less water per kilogram of lettuce than any other growing method.' }, answer: 'C', trap: 'comparison', reason: 'Satz 3 vergleicht nur mit konventionellem Feldanbau, nicht mit allen Methoden.' },
    ],
  },
  {
    id: 'v35',
    topic: 'ESG-Berichte',
    difficulty: 3,
    title: { en: 'Sustainability reporting at Dravo Group' },
    text: {
      en: 'From the 2025 financial year, Dravo Group must publish a sustainability report under new reporting rules that apply only to companies with more than 250 employees. The report must cover the company’s own emissions as well as emissions in its supply chain. Dravo has collected data on its own emissions since 2019, but it has information on supply-chain emissions from only about a third of its suppliers. The company has asked its 600 largest suppliers to provide emissions data by mid-2025. Suppliers that do not respond will be estimated using industry averages. Dravo’s auditor will review the report, although this review is less extensive than a financial audit. Dravo produces industrial pumps and valves and has customers in more than 50 countries. A team of six people is responsible for preparing the sustainability report. The company plans to set targets for reducing supply-chain emissions once the data is available.',
    },
    statements: [
      { id: 'v35-1', text: { en: 'Dravo Group has more than 250 employees.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 1: Dravo muss nach Regeln berichten, die NUR für Unternehmen mit mehr als 250 Beschäftigten gelten – also hat Dravo mehr als 250 Beschäftigte.' },
      { id: 'v35-2', text: { en: 'Dravo has supply-chain emissions data from most of its suppliers.' }, answer: 'F', trap: 'quantity', reason: 'Satz 3: nur von etwa einem Drittel der Lieferanten – nicht von den meisten.' },
      { id: 'v35-3', text: { en: 'Most of Dravo’s 600 largest suppliers have already sent their emissions data.' }, answer: 'C', trap: 'temporal', reason: 'Satz 4: Die Daten sind bis Mitte 2025 angefragt. Wie viele der 600 größten Lieferanten schon geantwortet haben, sagt der Text nicht (das „Drittel“ in Satz 3 bezieht sich auf alle Lieferanten und auf bereits vorhandene Daten).' },
      { id: 'v35-4', text: { en: 'The auditor’s review of the sustainability report will be as extensive as a financial audit.' }, answer: 'F', trap: 'comparison', reason: 'Satz 6: Die Prüfung ist „less extensive than a financial audit“.' },
    ],
  },
  {
    id: 'v36',
    topic: 'Kaffeeketten',
    difficulty: 3,
    title: { en: 'Expansion of Brewline Coffee' },
    text: {
      en: 'Brewline Coffee opened 45 new cafés and closed eight in 2024, bringing its total to 310. Most new cafés were opened at railway stations and motorway service areas rather than in city centres. Revenue per café rose by 3%, but like-for-like sales, which compare only cafés that were open for the whole of both years, fell by 1%. The company explained that the newer locations generate higher revenue than the older city-centre cafés. Brewline intends to close up to 20 unprofitable city-centre cafés in 2025. It has not specified which ones. Brewline was founded in 2009 and is headquartered in Hamburg. All cafés are operated by the company itself rather than by franchise partners. The menu is the same in all locations, and prices differ only slightly between regions.',
    },
    statements: [
      { id: 'v36-1', text: { en: 'Brewline had 265 cafés at the start of 2024.' }, answer: 'F', trap: 'quantity', reason: 'Satz 1: 2024 kamen 45 Cafés hinzu und 8 wurden geschlossen, Endstand 310 → Anfang 2024: 310 − 45 + 8 = 273, nicht 265.' },
      { id: 'v36-2', text: { en: 'Sales in cafés open throughout both years fell slightly.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 3: Like-for-like-Umsatz (nur Cafés, die beide Jahre ganz geöffnet waren) sank um 1 %.' },
      { id: 'v36-3', text: { en: 'More than half of the cafés opened in 2024 are located at railway stations.' }, answer: 'C', trap: 'some-all', reason: 'Satz 2 nennt Bahnhöfe und Autobahnraststätten nur zusammen („most … at railway stations and motorway service areas“). Wie viele der neuen Cafés allein an Bahnhöfen liegen, ist unbekannt.' },
      { id: 'v36-4', text: { en: 'Brewline plans to close more than 20 unprofitable city-centre cafés in 2025.' }, answer: 'F', trap: 'quantity', reason: 'Satz 5: Geplant ist, „up to 20“ unrentable Innenstadt-Cafés zu schließen – also höchstens 20, nicht mehr als 20.' },
    ],
  },
  {
    id: 'v37',
    topic: 'Pharma',
    difficulty: 3,
    title: { en: 'A clinical trial at Medrion' },
    text: {
      en: 'Medrion is testing a new treatment for migraine in a trial with 600 patients. Half of the patients receive the new drug and half receive a placebo; neither the patients nor the doctors know who receives which. After twelve weeks, patients receiving the drug reported on average 3.1 fewer migraine days per month, compared with 1.4 fewer days in the placebo group. Side effects, mostly mild nausea, were reported by 9% of patients taking the drug and 5% of those taking the placebo. Medrion will apply for regulatory approval only if a second, larger trial confirms the results. Migraine is a common condition that can significantly reduce people’s ability to work. Patients in the trial were aged between 18 and 65. The trial was conducted at 24 clinics in five countries.',
    },
    statements: [
      { id: 'v37-1', text: { en: '300 patients in the trial received a placebo.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1–2: 600 Patienten, die Hälfte erhält ein Placebo = 300.' },
      { id: 'v37-2', text: { en: 'Some patients receiving the placebo reported side effects.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 4: 5 % der Placebo-Gruppe berichteten Nebenwirkungen – also einige.' },
      { id: 'v37-3', text: { en: 'Medrion has applied for regulatory approval of the drug.' }, answer: 'F', trap: 'temporal', reason: 'Satz 5: Ein Antrag erfolgt erst, wenn eine zweite Studie die Ergebnisse bestätigt – der Antrag ist also noch nicht gestellt.' },
      { id: 'v37-4', text: { en: 'The new drug will be approved by the regulator.' }, answer: 'C', trap: 'prior-knowledge', reason: 'Über eine künftige Zulassung kann der Text nichts sagen.' },
    ],
  },
  {
    id: 'v38',
    topic: 'Zentralbank',
    difficulty: 3,
    title: { en: 'Interest rates in the Republic of Vestria' },
    text: {
      en: 'The central bank of the Republic of Vestria raised its key interest rate from 2.5% to 3.0% in March 2024, citing inflation of 4.2%, which was above its target of 2%. Since then, inflation has fallen to 3.1%, while economic growth has slowed. Several business associations have called for a rate cut to support investment. The central bank’s governor said that rates would remain unchanged until inflation is “clearly on track” to reach the target. Commercial banks in Vestria raised their average mortgage rates by 0.4 percentage points after the March decision. Vestria’s currency is the vestrian crown. The central bank’s board meets eight times a year to decide on interest rates. Unemployment has remained broadly stable at around 5%.',
    },
    statements: [
      { id: 'v38-1', text: { en: 'In March 2024, inflation in Vestria was more than twice the central bank’s target.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1: 4,2 % gegenüber dem Ziel von 2 % – mehr als das Doppelte (4 %).' },
      { id: 'v38-2', text: { en: 'The interest rate rise caused inflation to fall to 3.1%.' }, answer: 'C', trap: 'causation', reason: 'Satz 2 nennt nur den zeitlichen Ablauf. Ob die Zinserhöhung die Ursache war, sagt der Text nicht – auch wenn das ökonomisch plausibel klingt (Vorwissen).' },
      { id: 'v38-3', text: { en: 'Commercial banks raised their average mortgage rates by more than the central bank raised its key rate.' }, answer: 'F', trap: 'comparison', reason: 'Satz 1 und 5: Leitzins +0,5 Prozentpunkte, Hypothekenzinsen +0,4 Prozentpunkte – also weniger, nicht mehr.' },
      { id: 'v38-4', text: { en: 'The central bank has announced a rate cut in response to the business associations.' }, answer: 'F', trap: 'none', reason: 'Satz 4: Die Zinsen bleiben unverändert, bis die Inflation klar auf Zielkurs ist – eine Senkung wurde nicht angekündigt.' },
    ],
  },
  {
    id: 'v39',
    topic: 'Logistik-Automatisierung',
    difficulty: 3,
    title: { en: 'Robots in the Linwood distribution centre' },
    text: {
      en: 'In 2024, the retailer Linwood replaced manual picking in one of its three distribution centres with an automated system in which robots bring storage bins to stationary workers. Productivity in that centre, measured as items picked per working hour, increased by 65%. The number of employees in the centre fell from 420 to 310, mainly because temporary contracts were not renewed; no permanent employees were dismissed. Linwood says that order errors in the automated centre fell by half. The company will decide in 2025 whether to automate its other two centres, depending on the cost of financing. Linwood sells household goods and clothing online and in 85 stores. The automated system was supplied by a specialist company and took nine months to install. Workers in the automated centre received training on the new system.',
    },
    statements: [
      { id: 'v39-1', text: { en: 'Some employees on temporary contracts left the centre after their contracts were not renewed.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 3: Der Rückgang kam vor allem daher, dass befristete Verträge nicht verlängert wurden.' },
      { id: 'v39-2', text: { en: 'Linwood dismissed permanent employees in the automated centre.' }, answer: 'F', trap: 'negation', reason: 'Satz 3: „no permanent employees were dismissed“.' },
      { id: 'v39-3', text: { en: 'All of Linwood’s distribution centres used automated picking at the end of 2024.' }, answer: 'F', trap: 'some-all', reason: 'Satz 1 und 5: Nur eines von drei Zentren wurde automatisiert; über die anderen wird erst 2025 entschieden.' },
      { id: 'v39-4', text: { en: 'The automated centre picked more items in total in 2024 than in 2023.' }, answer: 'C', trap: 'quantity', reason: 'Die Produktivität pro Arbeitsstunde stieg um 65 %, aber die Zahl der Beschäftigten (und damit vermutlich der Arbeitsstunden) sank. Ohne Stundenzahlen ist die Gesamtmenge nicht bestimmbar.' },
    ],
  },
  {
    id: 'v40',
    topic: 'Due Diligence',
    difficulty: 3,
    title: { en: 'Due diligence for the Hartfield acquisition' },
    text: {
      en: 'Before acquiring the packaging company Hartfield, the investment firm Calder Capital commissioned a due diligence review. The review confirmed Hartfield’s reported revenue but found that two of its five largest customers had contracts expiring within twelve months. It also identified an unresolved dispute with a former supplier, which Hartfield’s lawyers estimate could cost up to 2 million euros. Calder reduced its offer by 8% and asked the sellers to cover any costs from the dispute above 500,000 euros. The sellers accepted these terms, and the acquisition was completed in November 2024. Hartfield produces cardboard packaging for food and cosmetics and employs around 600 people. Calder Capital invests in medium-sized industrial companies and usually holds them for five to seven years. The purchase price was not disclosed.',
    },
    statements: [
      { id: 'v40-1', text: { en: 'The due diligence review found errors in Hartfield’s reported revenue.' }, answer: 'F', trap: 'none', reason: 'Satz 2: Die Prüfung „confirmed Hartfield’s reported revenue“.' },
      { id: 'v40-2', text: { en: 'The sellers will pay all costs arising from the supplier dispute.' }, answer: 'F', trap: 'some-all', reason: 'Satz 4–5: Die Verkäufer übernehmen nur Kosten ÜBER 500.000 Euro – nicht alle Kosten.' },
      { id: 'v40-3', text: { en: 'The two customers whose contracts expire soon will not renew them.' }, answer: 'C', trap: 'temporal', reason: 'Der Text sagt nur, dass die Verträge innerhalb von zwölf Monaten auslaufen – nicht, ob sie verlängert werden.' },
      { id: 'v40-4', text: { en: 'The sellers rejected Calder’s revised terms.' }, answer: 'F', trap: 'negation', reason: 'Satz 5: Die Verkäufer akzeptierten die Bedingungen; die Übernahme wurde abgeschlossen.' },
    ],
  },
]
