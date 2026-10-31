/** Verbal passages v21–v30. Original texts; all companies are fictional. */
import type { VerbalPassage } from './types'

export const VERBAL_3: VerbalPassage[] = [
  {
    id: 'v21',
    topic: 'Halbleiter',
    difficulty: 2,
    title: { en: 'A new chip plant for Ostervik' },
    text: {
      en: 'The chipmaker Nordisil plans to build a semiconductor plant near Ostervik at a cost of 4.8 billion euros. The national government has offered a subsidy of 1.2 billion euros, subject to approval by the European Commission. Nordisil says the plant will create 1,500 jobs once fully operational, which is expected in 2029. Local residents have raised concerns about the plant’s water consumption, as chip production requires large amounts of ultrapure water. Nordisil has stated that it will recycle at least 70% of the water it uses. Construction can only begin after an environmental assessment has been completed. Ostervik is a town of about 25,000 inhabitants with a long industrial tradition. The plant would produce chips for cars and industrial machines. Several suppliers have said that they might open offices nearby if the plant is built.',
    },
    statements: [
      { id: 'v21-1', text: { en: 'The government subsidy would cover a quarter of the plant’s cost.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1–2: 1,2 Mrd. von 4,8 Mrd. Euro = 25 %, also ein Viertel.' },
      { id: 'v21-2', text: { en: 'The European Commission has approved the subsidy.' }, answer: 'C', trap: 'temporal', reason: 'Satz 2: Die Subvention steht unter dem Vorbehalt der Genehmigung („subject to approval“). Ob sie erteilt wurde, sagt der Text nicht.' },
      { id: 'v21-3', text: { en: 'Nordisil has promised to recycle all of the water the plant uses.' }, answer: 'F', trap: 'some-all', reason: 'Satz 5: „at least 70%“ – nicht das gesamte Wasser.' },
      { id: 'v21-4', text: { en: 'Construction may start before the environmental assessment is finished.' }, answer: 'F', trap: 'negation', reason: 'Satz 6: Der Bau darf erst NACH Abschluss der Umweltprüfung beginnen („can only begin after“).' },
    ],
  },
  {
    id: 'v22',
    topic: 'Weinexport',
    difficulty: 2,
    title: { en: 'Wine exports from the Meriva region' },
    text: {
      en: 'Wine producers in the Meriva region exported 42 million bottles in 2024, 6% more than in 2023. Exports to Asian markets rose by 19%, while exports to North America fell by 4%. The region’s largest single export market remains Germany, which took 11 million bottles. The producers’ association attributes the growth in Asia to a promotional campaign launched in 2023 together with the regional tourism board. However, the average export price per bottle fell slightly, as more of the growth came from lower-priced wines. The association expects export volumes to grow more slowly in 2025. The Meriva region has about 1,200 wine producers, most of them small family businesses. Red wine accounts for around two thirds of production. The region’s wines are protected by a designation of origin.',
    },
    statements: [
      { id: 'v22-1', text: { en: 'Meriva exported fewer than 40 million bottles in 2023.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1: 42 Mio. waren 6 % mehr als 2023 → 2023 ≈ 42 ÷ 1,06 ≈ 39,6 Mio. – weniger als 40 Mio.' },
      { id: 'v22-2', text: { en: 'More than a quarter of the region’s exported bottles went to Germany in 2024.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1 und 3: 11 von 42 Mio. Flaschen = 26,2 % – mehr als ein Viertel (25 %).' },
      { id: 'v22-3', text: { en: 'According to the producers’ association, the promotional campaign contributed to the growth in Asian exports.' }, answer: 'T', trap: 'causation', reason: 'Satz 4: Der Verband führt das Wachstum in Asien auf die Kampagne zurück. Die Aussage gibt ausdrücklich die Sicht des Verbands wieder.' },
      { id: 'v22-4', text: { en: 'Total export revenue fell in 2024.' }, answer: 'C', trap: 'quantity', reason: 'Die Menge stieg um 6 %, der Durchschnittspreis sank „slightly“. Ohne genaue Zahlen ist offen, ob der Umsatz insgesamt stieg oder fiel.' },
    ],
  },
  {
    id: 'v23',
    topic: 'Beratung',
    difficulty: 2,
    title: { en: 'Fixed fees at Marlowe & Partners' },
    text: {
      en: 'The consultancy Marlowe & Partners has traditionally charged clients by the hour. In 2024, it began offering fixed fees for certain standard projects, such as market-entry studies and supplier audits. Clients pay an agreed price regardless of how many hours the consultants actually work. Fixed-fee projects accounted for 18% of the firm’s revenue in 2024. The firm’s managing partner said that fixed fees make costs more predictable for clients, but that they also shift the risk of underestimating the work to the consultancy. Complex restructuring projects will continue to be billed by the hour. The firm employs around 180 consultants in four offices. Clients in the public sector often ask for fixed prices in their tenders. Marlowe introduced a new time-recording system in the same year.',
    },
    statements: [
      { id: 'v23-1', text: { en: 'Marlowe & Partners bills all of its projects at fixed fees since 2024.' }, answer: 'F', trap: 'some-all', reason: 'Satz 2 und 6: Feste Preise gibt es nur für bestimmte Standardprojekte; Restrukturierungen werden weiter nach Stunden abgerechnet.' },
      { id: 'v23-2', text: { en: 'Under a fixed-fee agreement, the client pays more if the consultants work more hours than planned.' }, answer: 'F', trap: 'negation', reason: 'Satz 3: Der Preis gilt „regardless of how many hours“ – also unabhängig von den tatsächlichen Stunden.' },
      { id: 'v23-3', text: { en: 'Fixed-fee projects are more profitable for Marlowe than hourly projects.' }, answer: 'C', trap: 'comparison', reason: 'Über die Profitabilität sagt der Text nichts; er nennt nur ein Risiko für die Beratung (Satz 5).' },
      { id: 'v23-4', text: { en: 'In 2024, most of Marlowe’s revenue did not come from fixed-fee projects.' }, answer: 'T', trap: 'quantity', reason: 'Satz 4: Festpreisprojekte machten 18 % aus – also kamen 82 %, die Mehrheit, aus anderen Projekten.' },
    ],
  },
  {
    id: 'v24',
    topic: 'Freiwilligenarbeit',
    difficulty: 2,
    title: { en: 'Corporate volunteering at Tellmark' },
    text: {
      en: 'Tellmark, a mail-order retailer with 3,200 employees, gives each employee two paid days per year for volunteering with charities. In 2024, 1,150 employees took at least one volunteering day, compared with 870 in 2023. Most volunteering took place in food banks and schools. An internal survey found that employees who volunteered rated their job satisfaction higher than those who did not. Tellmark’s human resources director said she would like more employees from the warehouse to take part, as participation there is lower than in the office departments. Employees can choose a charity from a list approved by the company or suggest a new one. Volunteering days must be agreed with the employee’s manager at least two weeks in advance. The scheme was introduced in 2021.',
    },
    statements: [
      { id: 'v24-1', text: { en: 'More Tellmark employees took a volunteering day in 2024 than in 2023.' }, answer: 'T', trap: 'comparison', reason: 'Satz 2: 1.150 im Jahr 2024 gegenüber 870 im Jahr 2023.' },
      { id: 'v24-2', text: { en: 'Volunteering increases employees’ job satisfaction.' }, answer: 'C', trap: 'causation', reason: 'Satz 4 zeigt nur, dass Freiwillige ihre Zufriedenheit höher bewerten. Ob das Engagement die Ursache ist, bleibt offen (zufriedenere Mitarbeitende könnten eher teilnehmen).' },
      { id: 'v24-3', text: { en: 'In 2024, more than half of Tellmark’s employees took at least one volunteering day.' }, answer: 'F', trap: 'quantity', reason: 'Satz 1–2: 1.150 von 3.200 ≈ 36 % – weniger als die Hälfte.' },
      { id: 'v24-4', text: { en: 'Participation in volunteering is lower in the warehouse than in the office departments.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 5: „participation there is lower than in the office departments“.' },
    ],
  },
  {
    id: 'v25',
    topic: 'Batterierecycling',
    difficulty: 2,
    title: { en: 'Recovering lithium at Voltcycle' },
    text: {
      en: 'Voltcycle operates a plant that recycles batteries from electric vehicles. The plant can process 20,000 tonnes of batteries per year but processed only 9,000 tonnes in 2024, because relatively few electric vehicles have yet reached the end of their life. The company recovers lithium, nickel and cobalt, which it sells to battery manufacturers. Recovery rates are above 90% for nickel and cobalt and around 70% for lithium. Voltcycle expects the volume of used batteries to rise sharply after 2028. Until then, it is also accepting production waste from battery factories to make better use of its capacity. The plant was opened in 2022 and employs 140 people. Recovered materials are tested in the company’s own laboratory before they are sold. Voltcycle is partly owned by a car manufacturer.',
    },
    statements: [
      { id: 'v25-1', text: { en: 'In 2024, Voltcycle’s plant used less than half of its annual capacity.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: 9.000 von 20.000 Tonnen = 45 % – weniger als die Hälfte.' },
      { id: 'v25-2', text: { en: 'Voltcycle recovers a higher proportion of lithium than of cobalt.' }, answer: 'F', trap: 'comparison', reason: 'Satz 4: Kobalt über 90 %, Lithium rund 70 % – beim Lithium ist der Anteil niedriger.' },
      { id: 'v25-3', text: { en: 'Voltcycle only processes batteries from vehicles that are no longer in use.' }, answer: 'F', trap: 'some-all', reason: 'Satz 6: Das Unternehmen nimmt auch Produktionsabfälle aus Batteriefabriken an.' },
      { id: 'v25-4', text: { en: 'Voltcycle will be operating at full capacity by 2030.' }, answer: 'C', trap: 'temporal', reason: 'Satz 5 nennt nur die Erwartung eines starken Anstiegs nach 2028, aber nichts über Vollauslastung bis 2030.' },
    ],
  },
  {
    id: 'v26',
    topic: 'Nahverkehr',
    difficulty: 2,
    title: { en: 'A flat-rate travel pass in Brakmor' },
    text: {
      en: 'In January 2024, the regional transport authority of Brakmor introduced a monthly pass costing 39 euros that is valid on all buses and trains in the region. Previously, monthly passes were priced by distance and cost between 45 and 120 euros. In the first year, the number of pass holders rose from 210,000 to 290,000. Ticket revenue fell by 12%, and the regional government agreed to cover the shortfall until the end of 2026. A survey found that 15% of new pass holders had previously travelled mainly by car. Critics argue that the money would be better spent on more frequent services in rural areas. The region has around 1.5 million inhabitants. The new pass can be bought online or at ticket machines and is not transferable. Children under six travel free, as they did before.',
    },
    statements: [
      { id: 'v26-1', text: { en: 'Before 2024, every monthly pass in Brakmor cost more than the new pass.' }, answer: 'T', trap: 'comparison', reason: 'Satz 2: Die alten Monatskarten kosteten zwischen 45 und 120 Euro – alle mehr als 39 Euro.' },
      { id: 'v26-2', text: { en: 'The number of pass holders increased by 80,000 in the first year.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3: von 210.000 auf 290.000 = +80.000.' },
      { id: 'v26-3', text: { en: 'The regional government has committed to covering the revenue shortfall permanently.' }, answer: 'F', trap: 'temporal', reason: 'Satz 4: nur „until the end of 2026“, nicht dauerhaft.' },
      { id: 'v26-4', text: { en: 'Car traffic in the Brakmor region decreased in 2024.' }, answer: 'C', trap: 'causation', reason: 'Satz 5 sagt nur, dass 15 % der neuen Karteninhaber vorher vor allem Auto fuhren. Über die Entwicklung des Autoverkehrs insgesamt gibt es keine Daten.' },
    ],
  },
  {
    id: 'v27',
    topic: 'Lagersicherheit',
    difficulty: 2,
    title: { en: 'Safety in Gantry Logistics warehouses' },
    text: {
      en: 'Gantry Logistics recorded 64 workplace accidents in its warehouses in 2024, down from 81 in 2023. The company introduced two measures at the start of 2024: separate walkways for pedestrians and forklifts, and mandatory safety briefings at the beginning of every shift. Accidents involving forklifts fell from 22 to 9. The number of hours worked in the warehouses increased by 5% over the same period. Gantry’s safety manager noted that most remaining accidents were caused by lifting heavy goods by hand. The company is testing lifting aids in one warehouse. Gantry operates seven warehouses with a total of about 1,900 employees. Every accident that leads to at least one day of absence is recorded. The company’s insurer has offered lower premiums if the accident rate continues to fall.',
    },
    statements: [
      { id: 'v27-1', text: { en: 'Forklift accidents accounted for more than a quarter of all warehouse accidents in 2023.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1 und 3: 22 von 81 ≈ 27 % – mehr als ein Viertel.' },
      { id: 'v27-2', text: { en: 'The separate walkways were responsible for the fall in forklift accidents.' }, answer: 'C', trap: 'causation', reason: 'Beide Maßnahmen wurden gleichzeitig eingeführt; der Text ordnet den Rückgang keiner Maßnahme zu.' },
      { id: 'v27-3', text: { en: 'Accidents fell even though more hours were worked in the warehouses.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 1 und 4: Unfälle sanken von 81 auf 64, während die Arbeitsstunden um 5 % stiegen.' },
      { id: 'v27-4', text: { en: 'Lifting aids are being tested in all of Gantry’s warehouses.' }, answer: 'F', trap: 'some-all', reason: 'Satz 6: nur „in one warehouse“.' },
    ],
  },
  {
    id: 'v28',
    topic: 'CO₂-Kompensation',
    difficulty: 2,
    title: { en: 'Carbon offsets at Aurel Airlines' },
    text: {
      en: 'Aurel Airlines allows passengers to pay an optional surcharge when booking a flight to offset the carbon emissions of their journey. The money is used to finance reforestation projects certified by an independent standard. In 2024, 7% of passengers chose to pay the surcharge, compared with 4% in 2022. A consumer organisation has criticised such schemes, arguing that it can take decades for newly planted trees to absorb the emissions of a single flight. Aurel says that it is also investing in more fuel-efficient aircraft, which will make up half of its fleet by 2028. Aurel flies to around 70 destinations in Europe and North Africa. The surcharge is calculated based on the distance of the flight. Passengers can see the amount before they decide whether to pay it.',
    },
    statements: [
      { id: 'v28-1', text: { en: 'Paying the carbon surcharge is compulsory for Aurel passengers.' }, answer: 'F', trap: 'none', reason: 'Satz 1: Der Aufschlag ist optional.' },
      { id: 'v28-2', text: { en: 'The share of passengers paying the surcharge rose by 3 percentage points between 2022 and 2024.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3: von 4 % auf 7 % = +3 Prozentpunkte.' },
      { id: 'v28-3', text: { en: 'Fuel-efficient aircraft currently make up half of Aurel’s fleet.' }, answer: 'F', trap: 'temporal', reason: 'Satz 5: Die Hälfte soll erst „by 2028“ erreicht werden – also nicht schon jetzt.' },
      { id: 'v28-4', text: { en: 'Aurel’s reforestation projects fully offset the emissions of its flights within one year.' }, answer: 'C', trap: 'prior-knowledge', reason: 'Der Text nennt nur die Kritik, dass Bäume Jahrzehnte brauchen können. Konkrete Angaben zu Aurels Projekten gibt es nicht.' },
    ],
  },
  {
    id: 'v29',
    topic: 'Flughafen',
    difficulty: 2,
    title: { en: 'Security queues at Felden Airport' },
    text: {
      en: 'Felden Airport installed new security scanners in 2024 that allow passengers to leave laptops and liquids in their bags. The scanners were installed at six of the airport’s ten security lanes. On lanes with the new scanners, the average waiting time during morning peak hours fell from 24 to 11 minutes. The remaining four lanes will be upgraded in 2025. Until then, passengers cannot choose which lane they are directed to. The airport has warned that waiting times may still exceed 30 minutes on days with unusually high passenger numbers. Felden handles around 9 million passengers per year. The new scanners produce three-dimensional images of the contents of a bag. Security staff received two days of training on the new equipment.',
    },
    statements: [
      { id: 'v29-1', text: { en: 'In 2024, most of Felden’s security lanes had the new scanners.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: sechs von zehn Spuren – die Mehrheit.' },
      { id: 'v29-2', text: { en: 'On all lanes, passengers can now leave laptops in their bags.' }, answer: 'F', trap: 'some-all', reason: 'Satz 2 und 4: Nur sechs Spuren haben die neuen Scanner; vier werden erst 2025 umgerüstet.' },
      { id: 'v29-3', text: { en: 'Average peak-time waiting times on the upgraded lanes more than halved.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3: von 24 auf 11 Minuten – weniger als die Hälfte von 24 (12).' },
      { id: 'v29-4', text: { en: 'Waiting times at Felden will never exceed 30 minutes once all lanes are upgraded.' }, answer: 'C', trap: 'temporal', reason: 'Satz 6 warnt vor über 30 Minuten an Spitzentagen, sagt aber nichts über die Zeit nach der vollständigen Umrüstung.' },
    ],
  },
  {
    id: 'v30',
    topic: 'Arbeitszeit',
    difficulty: 2,
    title: { en: 'A four-day week trial at Kinloch Software' },
    text: {
      en: 'Kinloch Software ran a six-month trial in 2024 in which employees worked four days a week for the same salary. Weekly working hours were reduced from 40 to 34. During the trial, the number of support tickets resolved per week was the same as in the six months before, and sick days fell by 20%. Customer satisfaction scores did not change. Of the employees who took part, 92% wanted to continue the arrangement. The company has decided to keep the four-day week for its development and support teams, but not for its sales team, which needs to be available to customers five days a week. Kinloch Software develops accounting software and employs 240 people. During the trial, employees could choose whether to take Friday or Monday off. The trial was evaluated by an external researcher.',
    },
    statements: [
      { id: 'v30-1', text: { en: 'During the trial, employees worked 6 fewer hours per week.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: von 40 auf 34 Stunden = −6 Stunden.' },
      { id: 'v30-2', text: { en: 'Employees’ salaries were reduced during the trial.' }, answer: 'F', trap: 'none', reason: 'Satz 1: „for the same salary“ – gleiches Gehalt.' },
      { id: 'v30-3', text: { en: 'All Kinloch teams will keep the four-day week.' }, answer: 'F', trap: 'some-all', reason: 'Satz 6: nicht das Vertriebsteam.' },
      { id: 'v30-4', text: { en: 'The shorter week caused the reduction in sick days.' }, answer: 'C', trap: 'causation', reason: 'Satz 3 nennt nur den Rückgang während der Testphase; eine Ursache wird nicht belegt.' },
    ],
  },
]
