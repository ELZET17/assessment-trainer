/** Verbal passages v11–v20 (v11–v15 with German). Original texts; all companies are fictional. */
import type { VerbalPassage } from './types'

export const VERBAL_2: VerbalPassage[] = [
  {
    id: 'v11',
    topic: 'Fusionen',
    difficulty: 2,
    title: { en: 'The Arden–Coral merger', de: 'Die Fusion von Arden und Coral' },
    text: {
      en: 'In June 2024, the software firms Arden Systems and Coral Data agreed to merge. Arden shareholders will own 60% of the combined company and Coral shareholders the remaining 40%. The merger still requires approval from competition authorities in two countries, which is expected by the end of 2025. Both companies sell accounting software to small businesses, and together they would serve around 900,000 customers. Analysts have warned that some customers use both products and might cancel one of their subscriptions after the merger. The companies have promised that neither product will be discontinued for at least three years after completion. Arden is based in Lyon and Coral in Rotterdam. The combined company would have around 3,500 employees. Its headquarters would be in Lyon, but both offices would remain open.',
      de: 'Im Juni 2024 haben die Softwarefirmen Arden Systems und Coral Data eine Fusion vereinbart. Die Aktionäre von Arden werden 60 % des fusionierten Unternehmens besitzen, die von Coral die übrigen 40 %. Die Fusion muss noch von Wettbewerbsbehörden in zwei Ländern genehmigt werden; die Genehmigung wird bis Ende 2025 erwartet. Beide Unternehmen verkaufen Buchhaltungssoftware an kleine Unternehmen und würden zusammen rund 900.000 Kunden betreuen. Analysten warnen, dass manche Kunden beide Produkte nutzen und nach der Fusion eines ihrer Abonnements kündigen könnten. Die Unternehmen haben zugesichert, dass keines der beiden Produkte in den ersten drei Jahren nach dem Abschluss eingestellt wird. Arden hat seinen Sitz in Lyon, Coral in Rotterdam. Das fusionierte Unternehmen hätte rund 3.500 Beschäftigte. Der Hauptsitz wäre in Lyon, beide Standorte blieben jedoch bestehen.',
    },
    statements: [
      { id: 'v11-1', text: { en: 'The merger has already received all the approvals it needs.', de: 'Die Fusion hat bereits alle nötigen Genehmigungen erhalten.' }, answer: 'F', trap: 'temporal', reason: 'Satz 3: Die Fusion „still requires approval“ von Behörden in zwei Ländern – die Genehmigungen fehlen also noch.' },
      { id: 'v11-2', text: { en: 'Coral shareholders will own a minority of the combined company.', de: 'Die Aktionäre von Coral werden eine Minderheit am fusionierten Unternehmen halten.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 2: 40 % – das ist weniger als die Hälfte, also eine Minderheit.' },
      { id: 'v11-3', text: { en: 'Arden currently has more customers than Coral.', de: 'Arden hat derzeit mehr Kunden als Coral.' }, answer: 'C', trap: 'comparison', reason: 'Der Text nennt nur die gemeinsame Kundenzahl (rund 900.000). Die Eigentumsanteile von 60/40 sagen nichts über die Kundenverteilung.' },
      { id: 'v11-4', text: { en: 'The combined company will serve exactly 900,000 different customers.', de: 'Das fusionierte Unternehmen wird genau 900.000 verschiedene Kunden betreuen.' }, answer: 'C', trap: 'quantity', reason: 'Satz 4: „around 900,000“ – eine ungefähre Zahl. Zudem nutzen manche Kunden beide Produkte (Satz 5), die genaue Zahl verschiedener Kunden ist offen.' },
    ],
  },
  {
    id: 'v12',
    topic: 'Gesundheitswesen',
    difficulty: 2,
    title: { en: 'Night shifts at St. Brennan Hospital', de: 'Nachtdienste im St.-Brennan-Krankenhaus' },
    text: {
      en: 'St. Brennan Hospital has struggled to staff its night shifts since 2022. To address the problem, the hospital introduced a scheme in 2024 under which nurses who work at least six night shifts per month receive an additional allowance of 400 euros. Nurses on the scheme can also choose their night shifts up to eight weeks in advance. Since the scheme began, the hospital has used agency nurses for 30% fewer night shifts than in the previous year. However, the hospital’s finance department estimates that total staff costs for night shifts have not changed significantly, because the allowances cost almost as much as the agency nurses that were saved. The hospital has around 650 beds and employs about 1,400 nurses. Night shifts last ten hours. The scheme was developed together with the nurses’ union and will be evaluated at the end of 2025.',
      de: 'Das St.-Brennan-Krankenhaus hat seit 2022 Schwierigkeiten, seine Nachtdienste zu besetzen. Um das Problem anzugehen, führte das Krankenhaus 2024 ein Programm ein, bei dem Pflegekräfte, die mindestens sechs Nachtdienste pro Monat übernehmen, eine zusätzliche Zulage von 400 Euro erhalten. Pflegekräfte im Programm können ihre Nachtdienste außerdem bis zu acht Wochen im Voraus wählen. Seit Beginn des Programms setzte das Krankenhaus in 30 % weniger Nachtdiensten Leihpflegekräfte ein als im Vorjahr. Die Finanzabteilung schätzt jedoch, dass sich die gesamten Personalkosten für Nachtdienste kaum verändert haben, da die Zulagen fast so viel kosten wie die eingesparten Leihpflegekräfte. Das Krankenhaus hat rund 650 Betten und beschäftigt etwa 1.400 Pflegekräfte. Nachtdienste dauern zehn Stunden. Das Programm wurde gemeinsam mit der Pflegegewerkschaft entwickelt und wird Ende 2025 ausgewertet.',
    },
    statements: [
      { id: 'v12-1', text: { en: 'A nurse who works five night shifts in a month receives the 400-euro allowance.', de: 'Eine Pflegekraft, die in einem Monat fünf Nachtdienste übernimmt, erhält die Zulage von 400 Euro.' }, answer: 'F', trap: 'quantity', reason: 'Satz 2: Die Zulage gibt es erst ab mindestens sechs Nachtdiensten pro Monat.' },
      { id: 'v12-2', text: { en: 'The scheme has substantially reduced the hospital’s total night-shift staff costs.', de: 'Das Programm hat die gesamten Personalkosten für Nachtdienste deutlich gesenkt.' }, answer: 'F', trap: 'causation', reason: 'Satz 5: Die Gesamtkosten haben sich laut Schätzung „not changed significantly“ – eine deutliche Senkung widerspricht dem Text.' },
      { id: 'v12-3', text: { en: 'Nurses who are not on the scheme cannot choose their night shifts in advance.', de: 'Pflegekräfte außerhalb des Programms können ihre Nachtdienste nicht im Voraus wählen.' }, answer: 'C', trap: 'negation', reason: 'Satz 3 beschreibt nur, was Pflegekräfte IM Programm dürfen. Über alle anderen sagt der Text nichts.' },
      { id: 'v12-4', text: { en: 'The hospital had difficulty staffing night shifts before the scheme was introduced.', de: 'Das Krankenhaus hatte schon vor Einführung des Programms Schwierigkeiten, Nachtdienste zu besetzen.' }, answer: 'T', trap: 'temporal', reason: 'Satz 1: Die Probleme bestehen seit 2022, das Programm kam 2024.' },
    ],
  },
  {
    id: 'v13',
    topic: 'Häfen',
    difficulty: 2,
    title: { en: 'Congestion at the port of Halvik', de: 'Stau im Hafen von Halvik' },
    text: {
      en: 'Container ships arriving at the port of Halvik waited an average of 3.5 days for a berth in 2024, compared with 1.2 days in 2022. The port authority attributes most of the increase to a 25% rise in container volumes, as some shipping lines diverted vessels from other ports. Two new cranes, ordered in 2023, are due to be installed in 2025. The authority estimates that they will raise handling capacity by 15%. Shipping companies have criticised the port for not introducing a booking system for berths, which several competing ports already use. The port authority has said that such a system is under consideration. Halvik is the country’s second-largest container port. Around 60% of the containers handled there are transferred to rail for onward transport. The port authority is owned by the city and the regional government.',
      de: 'Containerschiffe, die den Hafen von Halvik anliefen, warteten 2024 im Schnitt 3,5 Tage auf einen Liegeplatz, verglichen mit 1,2 Tagen im Jahr 2022. Die Hafenbehörde führt den größten Teil des Anstiegs auf ein um 25 % höheres Containeraufkommen zurück, da einige Reedereien Schiffe von anderen Häfen umgeleitet haben. Zwei neue Kräne, die 2023 bestellt wurden, sollen 2025 installiert werden. Die Behörde schätzt, dass sie die Umschlagkapazität um 15 % erhöhen. Reedereien kritisieren, dass der Hafen kein Buchungssystem für Liegeplätze eingeführt hat, wie es mehrere konkurrierende Häfen bereits nutzen. Die Hafenbehörde erklärte, ein solches System werde geprüft. Halvik ist der zweitgrößte Containerhafen des Landes. Rund 60 % der dort umgeschlagenen Container werden für den Weitertransport auf die Bahn verladen. Die Hafenbehörde gehört der Stadt und der Regionalregierung.',
    },
    statements: [
      { id: 'v13-1', text: { en: 'Average waiting times at Halvik nearly tripled between 2022 and 2024.', de: 'Die durchschnittliche Wartezeit in Halvik hat sich von 2022 bis 2024 fast verdreifacht.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1: von 1,2 auf 3,5 Tage – das ist das 2,9-Fache, also fast das Dreifache.' },
      { id: 'v13-2', text: { en: 'The new cranes will be enough to bring waiting times back to the 2022 level.', de: 'Die neuen Kräne werden ausreichen, um die Wartezeiten wieder auf das Niveau von 2022 zu senken.' }, answer: 'C', trap: 'causation', reason: 'Der Text nennt nur eine Kapazitätssteigerung um 15 % (Satz 4). Ob das die Wartezeiten auf 1,2 Tage senkt, sagt er nicht.' },
      { id: 'v13-3', text: { en: 'Halvik already uses a booking system for berths.', de: 'Halvik nutzt bereits ein Buchungssystem für Liegeplätze.' }, answer: 'F', trap: 'none', reason: 'Satz 5–6: Der Hafen wird kritisiert, weil er KEIN Buchungssystem eingeführt hat; ein solches wird erst geprüft.' },
      { id: 'v13-4', text: { en: 'According to the port authority, the rise in container volumes is the only cause of longer waiting times.', de: 'Laut Hafenbehörde ist das höhere Containeraufkommen die einzige Ursache der längeren Wartezeiten.' }, answer: 'F', trap: 'some-all', reason: 'Satz 2: Die Behörde führt „most of the increase“, also den größten Teil, auf das Aufkommen zurück – nicht den gesamten Anstieg.' },
    ],
  },
  {
    id: 'v14',
    topic: 'Fintech',
    difficulty: 2,
    title: { en: 'Faster onboarding at PayRidge', de: 'Schnellere Kontoeröffnung bei PayRidge' },
    text: {
      en: 'The payments app PayRidge used to verify new customers by checking photos of their identity documents manually, which took up to two working days. In September 2024, it introduced automated verification, which approves most applications within ten minutes. Applications that the system cannot verify with sufficient confidence are still checked manually. In the fourth quarter of 2024, 82% of new customers were verified automatically. The share of applicants who abandoned the process before completing it fell from 24% to 11% over the same period. PayRidge has not said how many manual reviewers it still employs. PayRidge has around 1.8 million customers in four countries. The automated system compares the photo on the identity document with a short video recorded by the applicant. Customers’ data is stored on servers within the European Union.',
      de: 'Die Bezahl-App PayRidge prüfte neue Kundinnen und Kunden früher, indem Fotos ihrer Ausweisdokumente manuell kontrolliert wurden, was bis zu zwei Arbeitstage dauerte. Im September 2024 führte das Unternehmen eine automatische Prüfung ein, die die meisten Anträge innerhalb von zehn Minuten freigibt. Anträge, die das System nicht mit ausreichender Sicherheit prüfen kann, werden weiterhin manuell kontrolliert. Im vierten Quartal 2024 wurden 82 % der Neukunden automatisch geprüft. Der Anteil der Antragstellenden, die den Prozess vor dem Abschluss abbrachen, sank im selben Zeitraum von 24 % auf 11 %. Wie viele manuelle Prüferinnen und Prüfer noch beschäftigt sind, hat PayRidge nicht mitgeteilt. PayRidge hat rund 1,8 Millionen Kundinnen und Kunden in vier Ländern. Das automatische System vergleicht das Foto auf dem Ausweis mit einem kurzen Video, das die antragstellende Person aufnimmt. Die Kundendaten werden auf Servern innerhalb der Europäischen Union gespeichert.',
    },
    statements: [
      { id: 'v14-1', text: { en: 'Since September 2024, all applications at PayRidge have been verified automatically.', de: 'Seit September 2024 werden alle Anträge bei PayRidge automatisch geprüft.' }, answer: 'F', trap: 'some-all', reason: 'Satz 3: Anträge, die das System nicht sicher prüfen kann, werden weiterhin manuell kontrolliert; Satz 4: 82 %, nicht 100 %.' },
      { id: 'v14-2', text: { en: 'In the fourth quarter of 2024, 18% of new customers were not verified automatically.', de: 'Im vierten Quartal 2024 wurden 18 % der Neukunden nicht automatisch geprüft.' }, answer: 'T', trap: 'quantity', reason: 'Satz 4: 82 % automatisch → 100 % − 82 % = 18 % nicht automatisch.' },
      { id: 'v14-3', text: { en: 'PayRidge has reduced the number of its manual reviewers.', de: 'PayRidge hat die Zahl der manuellen Prüfer reduziert.' }, answer: 'C', trap: 'prior-knowledge', reason: 'Satz 6: Darüber gibt es keine Angaben. Dass Automatisierung oft Stellen spart, ist Vorwissen und zählt nicht.' },
      { id: 'v14-4', text: { en: 'Before September 2024, verification could take more than ten minutes.', de: 'Vor September 2024 konnte die Prüfung länger als zehn Minuten dauern.' }, answer: 'T', trap: 'temporal', reason: 'Satz 1: Die manuelle Prüfung dauerte bis zu zwei Arbeitstage – also konnte sie deutlich länger als zehn Minuten dauern.' },
    ],
  },
  {
    id: 'v15',
    topic: 'Büroflächen',
    difficulty: 2,
    title: { en: 'Office demand in Westerholm', de: 'Büronachfrage in Westerholm' },
    text: {
      en: 'According to a report by a property consultancy, 14% of office space in the city of Westerholm was vacant at the end of 2024, the highest level in ten years. Vacancy was highest in older buildings without modern ventilation and energy-efficient heating, where it reached 22%. In contrast, only 5% of space in buildings completed after 2018 was vacant. The consultancy expects that some older buildings will be converted into flats, although such conversions require planning permission from the city. Rents for the newest offices rose by 3% in 2024, while rents in older buildings fell. Westerholm has a total of around 4 million square metres of office space. Many large companies in the city have reduced the size of their offices since more employees began working from home for part of the week. The report was published in February 2025.',
      de: 'Laut dem Bericht einer Immobilienberatung standen Ende 2024 in der Stadt Westerholm 14 % der Büroflächen leer – der höchste Stand seit zehn Jahren. Am höchsten war der Leerstand in älteren Gebäuden ohne moderne Lüftung und energieeffiziente Heizung, wo er 22 % erreichte. Dagegen standen in Gebäuden, die nach 2018 fertiggestellt wurden, nur 5 % der Flächen leer. Die Beratung erwartet, dass einige ältere Gebäude in Wohnungen umgewandelt werden, wobei solche Umwandlungen eine Baugenehmigung der Stadt erfordern. Die Mieten für die neuesten Büros stiegen 2024 um 3 %, während die Mieten in älteren Gebäuden sanken. Westerholm verfügt insgesamt über rund 4 Millionen Quadratmeter Bürofläche. Viele große Unternehmen in der Stadt haben ihre Büros verkleinert, seit mehr Beschäftigte einen Teil der Woche von zu Hause arbeiten. Der Bericht wurde im Februar 2025 veröffentlicht.',
    },
    statements: [
      { id: 'v15-1', text: { en: 'Office vacancy in Westerholm was higher at the end of 2024 than at any point in the previous ten years.', de: 'Der Büroleerstand in Westerholm war Ende 2024 höher als zu jedem Zeitpunkt der zehn Jahre davor.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 1: „the highest level in ten years“ – sinngemäß dieselbe Aussage.' },
      { id: 'v15-2', text: { en: 'The city has already approved the conversion of several older office buildings into flats.', de: 'Die Stadt hat bereits die Umwandlung mehrerer älterer Bürogebäude in Wohnungen genehmigt.' }, answer: 'C', trap: 'temporal', reason: 'Satz 4 nennt nur eine Erwartung und die Genehmigungspflicht – ob schon Genehmigungen erteilt wurden, steht nicht im Text.' },
      { id: 'v15-3', text: { en: 'Rents for all office buildings in Westerholm fell in 2024.', de: 'Die Mieten aller Bürogebäude in Westerholm sanken 2024.' }, answer: 'F', trap: 'some-all', reason: 'Satz 5: Die Mieten der neuesten Büros STIEGEN um 3 %.' },
      { id: 'v15-4', text: { en: 'Buildings without modern ventilation were vacant because tenants prefer energy-efficient offices.', de: 'Gebäude ohne moderne Lüftung standen leer, weil Mieter energieeffiziente Büros bevorzugen.' }, answer: 'C', trap: 'causation', reason: 'Der Text zeigt nur einen Zusammenhang zwischen Gebäudeart und Leerstand, nennt aber keine Ursache.' },
    ],
  },
  {
    id: 'v16',
    topic: 'Agrartechnik',
    difficulty: 2,
    title: { en: 'Drones in vineyards', de: 'Drohnen im Weinbau' },
    text: {
      en: 'A cooperative of 85 wine growers in the Felsbach valley began using drones to spray its steepest vineyards in 2023. Before then, these slopes were sprayed by helicopter or by workers carrying tanks on their backs. The drones fly closer to the vines than helicopters, which the cooperative says reduces the amount of spray that drifts onto neighbouring land. In 2024, drones treated 310 hectares, about two thirds of the cooperative’s steep-slope area. Drone flights are only permitted when wind speeds are below 15 kilometres per hour. Because of this rule, some treatments had to be postponed during a windy period in May. The valley’s vineyards have been cultivated for more than 800 years. Each drone can carry up to 40 litres of spray. Pilots must hold a licence issued by the national aviation authority.',
    },
    statements: [
      { id: 'v16-1', text: { en: 'Before 2023, the cooperative’s steepest vineyards were never sprayed from the air.' }, answer: 'F', trap: 'none', reason: 'Satz 2: Vorher wurden die Hänge unter anderem per Hubschrauber besprüht – also durchaus aus der Luft.' },
      { id: 'v16-2', text: { en: 'The cooperative’s steep-slope area is larger than 400 hectares.' }, answer: 'T', trap: 'quantity', reason: 'Satz 4: 310 Hektar sind etwa zwei Drittel → Gesamtfläche ≈ 310 × 3/2 ≈ 465 Hektar, also mehr als 400.' },
      { id: 'v16-3', text: { en: 'All 85 wine growers in the cooperative use drones on their own vineyards.' }, answer: 'C', trap: 'some-all', reason: 'Der Text spricht nur von der Genossenschaft insgesamt; wie viele einzelne Winzer Drohnen nutzen, ist unbekannt.' },
      { id: 'v16-4', text: { en: 'In May, the wind was at times too strong for drone flights.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 5–6: Flüge nur unter 15 km/h; wegen dieser Regel mussten im Mai bei Wind Behandlungen verschoben werden.' },
    ],
  },
  {
    id: 'v17',
    topic: 'Hotellerie',
    difficulty: 2,
    title: { en: 'Dynamic pricing at Lakeview Hotels', de: 'Dynamische Preise bei Lakeview Hotels' },
    text: {
      en: 'Lakeview Hotels, which operates 14 hotels, replaced its fixed seasonal room rates with dynamic pricing in 2024. Prices are now adjusted daily based on bookings, local events and competitors’ rates, but each hotel sets a minimum and a maximum price. Over the year, average room revenue per available room rose by 7%. Occupancy, however, fell slightly from 78% to 76%. Guest reviews mentioning the word “price” were more often negative than in 2023. Lakeview’s management considers the change a success but plans to communicate price changes more clearly to regular guests. The hotels are located in mountain and lake resorts and are particularly busy in summer. Prices are calculated by software supplied by an external company. Guests who book directly on Lakeview’s website receive free breakfast.',
    },
    statements: [
      { id: 'v17-1', text: { en: 'Under the new system, Lakeview’s room prices can rise without any upper limit.' }, answer: 'F', trap: 'negation', reason: 'Satz 2: Jedes Hotel legt einen Höchstpreis fest.' },
      { id: 'v17-2', text: { en: 'A smaller share of rooms was occupied in 2024 than in 2023.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 4: Die Auslastung fiel von 78 % auf 76 %.' },
      { id: 'v17-3', text: { en: 'Dynamic pricing increased Lakeview’s profits in 2024.' }, answer: 'C', trap: 'quantity', reason: 'Der Text nennt nur den Zimmerumsatz pro verfügbarem Zimmer, nicht den Gewinn – und auch keine Ursache.' },
      { id: 'v17-4', text: { en: 'Lakeview’s management regards the switch to dynamic pricing as a failure.' }, answer: 'F', trap: 'none', reason: 'Satz 6: Das Management „considers the change a success“ – das Gegenteil der Aussage.' },
    ],
  },
  {
    id: 'v18',
    topic: 'Wasserversorgung',
    difficulty: 2,
    title: { en: 'Leak detection in Ravensby', de: 'Lecksuche in Ravensby' },
    text: {
      en: 'The water utility in Ravensby loses an estimated 18% of the water it treats through leaks in its pipe network. In 2024, it installed acoustic sensors on 400 kilometres of its 2,600-kilometre network. The sensors detect the sound of escaping water and alert engineers, who can then repair leaks before they cause visible damage. In the sections with sensors, the number of burst pipes fell by 40% compared with the previous year. The utility plans to equip a further 600 kilometres by 2027, focusing on pipes that are more than 50 years old. The project is financed partly by a 2% increase in water charges. The utility supplies around 320,000 households. Some of its pipes were laid more than 80 years ago. Without sensors, leaks that do not reach the surface can go undetected for months.',
    },
    statements: [
      { id: 'v18-1', text: { en: 'In 2024, sensors were installed on less than a fifth of Ravensby’s pipe network.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: 400 von 2.600 km ≈ 15 % – weniger als ein Fünftel (20 %).' },
      { id: 'v18-2', text: { en: 'By 2027, the whole network will be equipped with sensors.' }, answer: 'F', trap: 'quantity', reason: 'Satz 5: 400 + 600 = 1.000 km von 2.600 km – nicht das ganze Netz.' },
      { id: 'v18-3', text: { en: 'The sensors reduced the share of treated water lost through leaks to below 18%.' }, answer: 'C', trap: 'causation', reason: 'Der Text nennt nur weniger Rohrbrüche in den Abschnitten mit Sensoren; ob die Verlustquote insgesamt gesunken ist, steht nicht da.' },
      { id: 'v18-4', text: { en: 'Customers in Ravensby contribute to the cost of the project through higher water charges.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 6: Das Projekt wird teilweise durch eine Erhöhung der Wassergebühren um 2 % finanziert.' },
    ],
  },
  {
    id: 'v19',
    topic: 'Sponsoring',
    difficulty: 2,
    title: { en: 'Sports sponsorship at Corvan Telecom', de: 'Sportsponsoring bei Corvan Telecom' },
    text: {
      en: 'Corvan Telecom has sponsored the national cycling tour for eight years. Its current contract, worth 6 million euros per year, ends in 2025. A market research study commissioned by Corvan found that 41% of people who watched the tour on television could name Corvan as the main sponsor without being prompted. Among people who did not watch the tour, the figure was 12%. The company’s board is divided on whether to renew the contract: some members argue that the money would be better spent on digital advertising. A decision is expected before the end of the current contract. The tour takes place every July and lasts three weeks. Corvan’s logo appears on the leader’s jersey and on banners along the route. The company is the country’s second-largest mobile network operator.',
    },
    statements: [
      { id: 'v19-1', text: { en: 'Corvan first sponsored the cycling tour more than five years ago.' }, answer: 'T', trap: 'temporal', reason: 'Satz 1: seit acht Jahren – also mehr als fünf.' },
      { id: 'v19-2', text: { en: 'All members of Corvan’s board want to renew the sponsorship contract.' }, answer: 'F', trap: 'some-all', reason: 'Satz 5: Der Vorstand ist gespalten; einige wollen das Geld lieber für digitale Werbung ausgeben.' },
      { id: 'v19-3', text: { en: 'Watching the tour on television causes people to remember Corvan as the sponsor.' }, answer: 'C', trap: 'causation', reason: 'Die Studie zeigt nur einen Unterschied zwischen Zuschauern (41 %) und Nichtzuschauern (12 %). Eine Ursache lässt sich daraus nicht sicher ableiten (z. B. könnten Radsportfans Corvan schon aus anderen Gründen kennen).' },
      { id: 'v19-4', text: { en: 'The market research study was carried out by an independent body without Corvan’s involvement.' }, answer: 'F', trap: 'none', reason: 'Satz 3: Die Studie wurde „commissioned by Corvan“, also von Corvan in Auftrag gegeben.' },
    ],
  },
  {
    id: 'v20',
    topic: 'Sprach-Apps',
    difficulty: 2,
    title: { en: 'Corporate language learning', de: 'Sprachenlernen im Unternehmen' },
    text: {
      en: 'Since 2023, the engineering group Halden AG has offered all employees free access to a language-learning app during working hours. Employees can choose from 12 languages, and managers are asked to allow up to one hour per week for practice. In 2024, 2,300 of the group’s 9,000 employees used the app at least once. Of these, 40% used it regularly, defined as at least once a week for three months. The most popular languages were English, Spanish and Polish. Halden plans to link the app to its internal career system in 2025, so that completed language levels appear in employees’ profiles. The app adapts exercises to each learner’s level and includes short conversation exercises recorded by native speakers. Halden has production sites in eleven countries. Several employees have asked for courses in additional languages.',
    },
    statements: [
      { id: 'v20-1', text: { en: 'Fewer than 1,000 Halden employees used the app regularly in 2024.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3–4: 40 % von 2.300 = 920 regelmäßige Nutzer – weniger als 1.000.' },
      { id: 'v20-2', text: { en: 'Halden employees must pay for the app themselves.' }, answer: 'F', trap: 'none', reason: 'Satz 1: Der Zugang ist kostenlos („free access“).' },
      { id: 'v20-3', text: { en: 'English was used by more employees than any other language.' }, answer: 'C', trap: 'comparison', reason: 'Satz 5 nennt die drei beliebtesten Sprachen, aber keine Rangfolge. Ob Englisch auf Platz 1 liegt, ist offen.' },
      { id: 'v20-4', text: { en: 'Halden has already linked the app to its internal career system.' }, answer: 'F', trap: 'temporal', reason: 'Satz 6: Die Verknüpfung ist erst für 2025 geplant („plans to link“) – sie besteht also noch nicht.' },
    ],
  },
]
