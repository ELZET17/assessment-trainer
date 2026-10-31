/** Verbal passages v01–v10 (EN + DE). Original texts; all companies are fictional. */
import type { VerbalPassage } from './types'

export const VERBAL_1: VerbalPassage[] = [
  {
    id: 'v01',
    topic: 'Hybrides Arbeiten',
    difficulty: 1,
    title: { en: 'Hybrid working at Hallworth Insurance', de: 'Hybrides Arbeiten bei Hallworth Insurance' },
    text: {
      en: 'Hallworth Insurance introduced a hybrid working policy in March 2024. Under the policy, employees in the claims and underwriting departments must work from the office on at least two days per week, while employees in the IT department may work fully remotely. Employees can choose their office days, but team meetings are always held on Tuesdays. In a survey conducted six months after the launch, 68% of employees said they were satisfied with the new arrangement. Over the same six months, the company also reported that its office energy costs fell by 15%. Management has stated that the policy will be reviewed in March 2025. The policy was developed after consultations with the works council. Hallworth employs about 2,400 people at three locations, and the policy applies to all of them. Similar rules have been introduced by several other insurers in the region in recent years.',
      de: 'Hallworth Insurance hat im März 2024 eine Richtlinie für hybrides Arbeiten eingeführt. Danach müssen Beschäftigte der Abteilungen Schadenbearbeitung und Underwriting an mindestens zwei Tagen pro Woche im Büro arbeiten, während Beschäftigte der IT-Abteilung vollständig remote arbeiten dürfen. Die Beschäftigten können ihre Bürotage selbst wählen, Teambesprechungen finden jedoch immer dienstags statt. In einer Umfrage sechs Monate nach der Einführung gaben 68 % der Beschäftigten an, mit der neuen Regelung zufrieden zu sein. Im selben Zeitraum von sechs Monaten sanken laut Unternehmen die Energiekosten der Büros um 15 %. Die Geschäftsleitung hat angekündigt, die Richtlinie im März 2025 zu überprüfen. Die Richtlinie wurde nach Beratungen mit dem Betriebsrat entwickelt. Hallworth beschäftigt rund 2.400 Personen an drei Standorten, und die Richtlinie gilt für alle. Ähnliche Regeln haben in den letzten Jahren auch mehrere andere Versicherer in der Region eingeführt.',
    },
    statements: [
      { id: 'v01-1', text: { en: 'Employees in the underwriting department may work fully remotely.', de: 'Beschäftigte der Underwriting-Abteilung dürfen vollständig remote arbeiten.' }, answer: 'F', trap: 'negation', reason: 'Satz 2: Underwriting muss an mindestens zwei Tagen pro Woche im Büro arbeiten – vollständig remote ist damit ausgeschlossen. Nur die IT darf vollständig remote arbeiten.' },
      { id: 'v01-2', text: { en: 'Team meetings at Hallworth take place on Tuesdays.', de: 'Teambesprechungen finden bei Hallworth dienstags statt.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 3: „team meetings are always held on Tuesdays“ – die Aussage gibt das sinngemäß wieder.' },
      { id: 'v01-3', text: { en: 'The fall in office energy costs was caused by the hybrid working policy.', de: 'Der Rückgang der Energiekosten wurde durch die Hybrid-Richtlinie verursacht.' }, answer: 'C', trap: 'causation', reason: 'Satz 5 nennt nur, dass die Kosten im selben Zeitraum gesunken sind. Eine Ursache wird nicht genannt – gleichzeitiges Auftreten beweist keine Kausalität.' },
      { id: 'v01-4', text: { en: 'The IT department is the only department whose employees may work fully remotely.', de: 'Die IT ist die einzige Abteilung, deren Beschäftigte vollständig remote arbeiten dürfen.' }, answer: 'C', trap: 'some-all', reason: 'Der Text nennt nur Schadenbearbeitung, Underwriting und IT. Über weitere Abteilungen sagt er nichts – ob die IT die EINZIGE ist, lässt sich nicht bestimmen.' },
    ],
  },
  {
    id: 'v02',
    topic: 'Lieferkette',
    difficulty: 1,
    title: { en: 'Supplier diversification at Norrfield Foods', de: 'Lieferantenstreuung bei Norrfield Foods' },
    text: {
      en: 'Until 2023, Norrfield Foods bought all of its cocoa from a single supplier in West Africa. After a poor harvest that year delayed several deliveries, the company decided to spread its purchases across three suppliers. Since January 2024, no single supplier has provided more than 50% of Norrfield’s cocoa. The change increased average purchasing costs by around 4%, according to the company’s annual report. However, Norrfield did not have to stop any production line in 2024 because of missing cocoa, compared with two stoppages in 2023. The company plans to add a fourth supplier by the end of 2025. Cocoa is the most expensive raw material in Norrfield’s chocolate products. The company produces around 60,000 tonnes of chocolate per year in two factories. Its purchasing team now visits each supplier at least once a year to check quality standards.',
      de: 'Bis 2023 kaufte Norrfield Foods seinen gesamten Kakao bei einem einzigen Lieferanten in Westafrika. Nachdem eine schlechte Ernte in jenem Jahr mehrere Lieferungen verzögert hatte, beschloss das Unternehmen, seine Einkäufe auf drei Lieferanten zu verteilen. Seit Januar 2024 hat kein einzelner Lieferant mehr als 50 % des Kakaos von Norrfield geliefert. Laut Geschäftsbericht stiegen die durchschnittlichen Einkaufskosten durch die Umstellung um rund 4 %. Allerdings musste Norrfield 2024 keine Produktionslinie wegen fehlenden Kakaos stoppen, während es 2023 zwei solche Stillstände gab. Das Unternehmen plant, bis Ende 2025 einen vierten Lieferanten hinzuzunehmen. Kakao ist der teuerste Rohstoff in den Schokoladenprodukten von Norrfield. Das Unternehmen produziert in zwei Fabriken rund 60.000 Tonnen Schokolade pro Jahr. Das Einkaufsteam besucht nun jeden Lieferanten mindestens einmal pro Jahr, um die Qualitätsstandards zu prüfen.',
    },
    statements: [
      { id: 'v02-1', text: { en: 'In 2024, Norrfield bought cocoa from more than one supplier.', de: 'Im Jahr 2024 kaufte Norrfield Kakao bei mehr als einem Lieferanten.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 3: Seit Januar 2024 hat kein Lieferant mehr als 50 % geliefert – also muss es mehrere Lieferanten gegeben haben (Satz 2: drei Lieferanten).' },
      { id: 'v02-2', text: { en: 'Norrfield’s purchasing costs fell after the change of suppliers.', de: 'Die Einkaufskosten von Norrfield sanken nach der Umstellung.' }, answer: 'F', trap: 'none', reason: 'Satz 4: Die durchschnittlichen Einkaufskosten STIEGEN um rund 4 %.' },
      { id: 'v02-3', text: { en: 'Norrfield had two production stoppages caused by missing cocoa in 2023.', de: 'Norrfield hatte 2023 zwei Produktionsstillstände wegen fehlenden Kakaos.' }, answer: 'T', trap: 'temporal', reason: 'Satz 5: „compared with two stoppages in 2023“ – gemeint sind Stillstände wegen fehlenden Kakaos.' },
      { id: 'v02-4', text: { en: 'The fourth supplier will be located outside West Africa.', de: 'Der vierte Lieferant wird außerhalb Westafrikas ansässig sein.' }, answer: 'C', trap: 'none', reason: 'Satz 6 nennt nur den Plan eines vierten Lieferanten, aber keinen Standort.' },
    ],
  },
  {
    id: 'v03',
    topic: 'Kundenbindung',
    difficulty: 1,
    title: { en: 'A loyalty programme for Pellmart', de: 'Ein Treueprogramm für Pellmart' },
    text: {
      en: 'The supermarket chain Pellmart launched a free loyalty programme in 120 of its 300 stores in 2024. Members collect one point for every euro spent and can exchange 500 points for a voucher worth five euros. By December, 1.2 million customers had joined the programme. In the participating stores, average spending per visit was 9% higher among members than among non-members. Pellmart has not yet decided whether to extend the programme to its remaining stores. A spokesperson said the decision would depend on the cost of the vouchers. Members can use either a smartphone app or a plastic card at the checkout. Pellmart says it does not sell members’ personal data to third parties. Its main competitor has run a similar programme in all of its stores since 2019, and several smaller chains are planning to follow.',
      de: 'Die Supermarktkette Pellmart hat 2024 in 120 ihrer 300 Filialen ein kostenloses Treueprogramm eingeführt. Mitglieder sammeln pro ausgegebenem Euro einen Punkt und können 500 Punkte gegen einen Gutschein im Wert von fünf Euro eintauschen. Bis Dezember waren 1,2 Millionen Kundinnen und Kunden beigetreten. In den teilnehmenden Filialen gaben Mitglieder pro Einkauf durchschnittlich 9 % mehr aus als Nichtmitglieder. Pellmart hat noch nicht entschieden, ob das Programm auf die übrigen Filialen ausgeweitet wird. Eine Sprecherin sagte, die Entscheidung hänge von den Kosten der Gutscheine ab. Mitglieder können an der Kasse entweder eine Smartphone-App oder eine Plastikkarte verwenden. Pellmart gibt an, keine persönlichen Daten der Mitglieder an Dritte zu verkaufen. Der wichtigste Konkurrent betreibt seit 2019 in allen seinen Filialen ein ähnliches Programm, und mehrere kleinere Ketten planen, nachzuziehen.',
    },
    statements: [
      { id: 'v03-1', text: { en: 'The loyalty programme was available in fewer than half of Pellmart’s stores in 2024.', de: 'Das Treueprogramm war 2024 in weniger als der Hälfte der Pellmart-Filialen verfügbar.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1: 120 von 300 Filialen = 40 % – also weniger als die Hälfte.' },
      { id: 'v03-2', text: { en: 'Customers must pay a fee to join the programme.', de: 'Für die Teilnahme am Programm muss eine Gebühr bezahlt werden.' }, answer: 'F', trap: 'none', reason: 'Satz 1: Es handelt sich um ein „free loyalty programme“, also kostenlos.' },
      { id: 'v03-3', text: { en: 'Joining the programme made customers spend more per visit.', de: 'Die Mitgliedschaft hat dazu geführt, dass Kunden pro Einkauf mehr ausgeben.' }, answer: 'C', trap: 'causation', reason: 'Satz 4 vergleicht nur Mitglieder und Nichtmitglieder. Ob die Mitgliedschaft die Ursache ist (oder ob ohnehin ausgabefreudige Kunden beitreten), sagt der Text nicht.' },
      { id: 'v03-4', text: { en: 'A member who has spent 500 euros can exchange their points for a five-euro voucher.', de: 'Ein Mitglied, das 500 Euro ausgegeben hat, kann seine Punkte gegen einen Fünf-Euro-Gutschein eintauschen.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: 1 Punkt pro Euro → 500 Euro ergeben 500 Punkte, und 500 Punkte lassen sich gegen einen 5-Euro-Gutschein tauschen.' },
    ],
  },
  {
    id: 'v04',
    topic: 'Energie',
    difficulty: 1,
    title: { en: 'Solar panels on warehouse roofs', de: 'Solaranlagen auf Lagerhallendächern' },
    text: {
      en: 'Kestrel Logistics installed solar panels on the roofs of four of its warehouses in 2023. The panels generated 2.1 gigawatt hours of electricity in their first full year of operation, which covered about 30% of the electricity used by those four warehouses. Electricity that is not used immediately is fed into the public grid. The installation cost 3.4 million euros, of which a regional programme paid 20%. Kestrel expects the panels to pay for themselves within nine years. The company’s other warehouses are rented, and their landlords have so far not agreed to similar installations. Kestrel operates a total of eleven warehouses across the country. The four warehouses with solar panels are among the company’s largest sites. The company has also replaced the lighting in these buildings with LED lamps.',
      de: 'Kestrel Logistics hat 2023 auf den Dächern von vier seiner Lagerhallen Solaranlagen installiert. Die Anlagen erzeugten im ersten vollen Betriebsjahr 2,1 Gigawattstunden Strom und deckten damit rund 30 % des Stromverbrauchs dieser vier Lagerhallen. Strom, der nicht sofort genutzt wird, wird ins öffentliche Netz eingespeist. Die Installation kostete 3,4 Millionen Euro, wovon ein regionales Förderprogramm 20 % übernahm. Kestrel erwartet, dass sich die Anlagen innerhalb von neun Jahren amortisieren. Die übrigen Lagerhallen des Unternehmens sind gemietet, und deren Vermieter haben ähnlichen Anlagen bisher nicht zugestimmt. Kestrel betreibt landesweit insgesamt elf Lagerhallen. Die vier Lagerhallen mit Solaranlagen gehören zu den größten Standorten des Unternehmens. Außerdem hat das Unternehmen die Beleuchtung in diesen Gebäuden auf LED-Lampen umgestellt.',
    },
    statements: [
      { id: 'v04-1', text: { en: 'The regional programme paid 680,000 euros towards the installation.', de: 'Das regionale Programm zahlte 680.000 Euro an die Installation.' }, answer: 'T', trap: 'quantity', reason: 'Satz 4: 20 % von 3,4 Mio. Euro = 0,68 Mio. Euro = 680.000 Euro.' },
      { id: 'v04-2', text: { en: 'The solar panels supply all the electricity needed by the four warehouses.', de: 'Die Solaranlagen liefern den gesamten Strombedarf der vier Lagerhallen.' }, answer: 'F', trap: 'some-all', reason: 'Satz 2: Die Anlagen decken nur rund 30 % des Verbrauchs.' },
      { id: 'v04-3', text: { en: 'Kestrel owns all of the warehouses it uses.', de: 'Kestrel besitzt alle Lagerhallen, die es nutzt.' }, answer: 'F', trap: 'some-all', reason: 'Satz 6: Die übrigen Lagerhallen sind gemietet – Kestrel besitzt also nicht alle.' },
      { id: 'v04-4', text: { en: 'Electricity prices will rise over the next nine years.', de: 'Die Strompreise werden in den nächsten neun Jahren steigen.' }, answer: 'C', trap: 'prior-knowledge', reason: 'Der Text macht keine Aussage über künftige Strompreise. Die Amortisationserwartung (Satz 5) erlaubt keinen Schluss darauf.' },
    ],
  },
  {
    id: 'v05',
    topic: 'Mobilität',
    difficulty: 1,
    title: { en: 'E-scooter sharing in Lindberg', de: 'E-Scooter-Sharing in Lindberg' },
    text: {
      en: 'The city of Lindberg allowed three companies to operate shared e-scooters from April 2024. Each company may place a maximum of 500 scooters in the city. Scooters may not be parked on pavements narrower than two metres, and riders who break this rule are fined by the operator. In the first six months, 410,000 rides were recorded, with an average length of 2.3 kilometres. The city council received 160 complaints about badly parked scooters during this period, most of them from the old town. The council will decide in spring 2025 whether to renew the licences. Each scooter must be equipped with a sound signal and lights. Riders must be at least 16 years old. Lindberg has about 180,000 inhabitants and a compact old town with narrow streets.',
      de: 'Die Stadt Lindberg hat ab April 2024 drei Unternehmen den Betrieb von Leih-E-Scootern erlaubt. Jedes Unternehmen darf höchstens 500 Scooter in der Stadt aufstellen. Scooter dürfen nicht auf Gehwegen abgestellt werden, die schmaler als zwei Meter sind; wer gegen diese Regel verstößt, erhält vom Betreiber eine Strafe. In den ersten sechs Monaten wurden 410.000 Fahrten registriert, mit einer durchschnittlichen Länge von 2,3 Kilometern. Der Stadtrat erhielt in diesem Zeitraum 160 Beschwerden über falsch abgestellte Scooter, die meisten aus der Altstadt. Der Rat entscheidet im Frühjahr 2025, ob die Lizenzen verlängert werden. Jeder Scooter muss mit einem akustischen Signal und Licht ausgestattet sein. Fahrerinnen und Fahrer müssen mindestens 16 Jahre alt sein. Lindberg hat rund 180.000 Einwohner und eine kompakte Altstadt mit engen Straßen.',
    },
    statements: [
      { id: 'v05-1', text: { en: 'No more than 1,500 shared e-scooters may operate in Lindberg.', de: 'In Lindberg dürfen höchstens 1.500 Leih-E-Scooter betrieben werden.' }, answer: 'T', trap: 'quantity', reason: 'Satz 1–2: drei Unternehmen × höchstens 500 Scooter = höchstens 1.500.' },
      { id: 'v05-2', text: { en: 'Fines for incorrect parking are issued by the city council.', de: 'Strafen für falsches Parken werden vom Stadtrat verhängt.' }, answer: 'F', trap: 'paraphrase', reason: 'Satz 3: Die Strafen kommen „by the operator“, also vom Betreiber, nicht vom Stadtrat.' },
      { id: 'v05-3', text: { en: 'All of the complaints about parking came from the old town.', de: 'Alle Beschwerden über das Parken kamen aus der Altstadt.' }, answer: 'F', trap: 'some-all', reason: 'Satz 5: „most of them from the old town“ – die meisten, nicht alle. Damit ist „alle“ ausgeschlossen.' },
      { id: 'v05-4', text: { en: 'Each of the three operators recorded more than 100,000 rides in the first six months.', de: 'Jeder der drei Betreiber verzeichnete in den ersten sechs Monaten mehr als 100.000 Fahrten.' }, answer: 'C', trap: 'quantity', reason: 'Satz 4 nennt nur die Gesamtzahl (410.000). Wie sie sich auf die Betreiber verteilt, ist unbekannt.' },
    ],
  },
  {
    id: 'v06',
    topic: 'Cybersicherheit',
    difficulty: 1,
    title: { en: 'Phishing training at Brightwell Bank', de: 'Phishing-Training bei der Brightwell Bank' },
    text: {
      en: 'Brightwell Bank requires all employees to complete an online security course once a year. In 2024, the bank also began sending simulated phishing e-mails to staff every quarter. In the first simulation, 14% of employees clicked on the link in the fake e-mail; by the fourth simulation, this share had fallen to 5%. Employees who click on a simulated link are automatically enrolled in a 20-minute refresher module. The bank’s IT security team says that no customer data was lost through phishing in 2024. It has not published figures for earlier years. The simulated e-mails imitate typical attacks, such as fake invoices or messages that appear to come from the IT department. Employees are encouraged to report suspicious e-mails using a button in their e-mail program. The results of the simulations are not used in performance reviews.',
      de: 'Die Brightwell Bank verpflichtet alle Beschäftigten, einmal pro Jahr einen Online-Sicherheitskurs zu absolvieren. 2024 begann die Bank zusätzlich, jedes Quartal simulierte Phishing-E-Mails an die Belegschaft zu senden. Bei der ersten Simulation klickten 14 % der Beschäftigten auf den Link in der gefälschten E-Mail; bis zur vierten Simulation sank dieser Anteil auf 5 %. Wer auf einen simulierten Link klickt, wird automatisch für ein 20-minütiges Auffrischungsmodul angemeldet. Das IT-Sicherheitsteam der Bank gibt an, dass 2024 keine Kundendaten durch Phishing verloren gingen. Zahlen für frühere Jahre hat es nicht veröffentlicht. Die simulierten E-Mails ahmen typische Angriffe nach, etwa gefälschte Rechnungen oder Nachrichten, die scheinbar von der IT-Abteilung stammen. Die Beschäftigten werden ermutigt, verdächtige E-Mails über eine Schaltfläche in ihrem E-Mail-Programm zu melden. Die Ergebnisse der Simulationen fließen nicht in Leistungsbeurteilungen ein.',
    },
    statements: [
      { id: 'v06-1', text: { en: 'Brightwell sends simulated phishing e-mails to its staff every three months.', de: 'Brightwell verschickt alle drei Monate simulierte Phishing-E-Mails an die Belegschaft.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 2: „every quarter“ – jedes Quartal, also alle drei Monate.' },
      { id: 'v06-2', text: { en: 'Phishing caused fewer data losses in 2024 than in 2023.', de: 'Phishing verursachte 2024 weniger Datenverluste als 2023.' }, answer: 'C', trap: 'temporal', reason: 'Satz 6: Für frühere Jahre gibt es keine Zahlen. Ein Vergleich mit 2023 ist nicht möglich.' },
      { id: 'v06-3', text: { en: 'The security course is optional for some employees.', de: 'Der Sicherheitskurs ist für manche Beschäftigte freiwillig.' }, answer: 'F', trap: 'some-all', reason: 'Satz 1: ALLE Beschäftigten müssen den Kurs jährlich absolvieren.' },
      { id: 'v06-4', text: { en: 'The share of employees who clicked the link fell by 9 percentage points between the first and the fourth simulation.', de: 'Der Anteil der Beschäftigten, die auf den Link klickten, sank zwischen der ersten und der vierten Simulation um 9 Prozentpunkte.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3: von 14 % auf 5 % = −9 Prozentpunkte.' },
    ],
  },
  {
    id: 'v07',
    topic: 'Lebensmittel',
    difficulty: 1,
    title: { en: 'Plant-based products at Velden Dairy', de: 'Pflanzliche Produkte bei Velden Dairy' },
    text: {
      en: 'Velden Dairy started selling oat-based drinks in 2022. In 2024, plant-based products accounted for 11% of the company’s revenue, up from 6% in 2023. The oat drinks are produced in a separate factory to avoid contact with milk. Velden’s chief executive said that the company will continue to invest in its traditional dairy business, which remains its largest source of profit. Some retailers have asked Velden to develop a plant-based yoghurt, but the company has not announced any plans to do so. Velden was founded as a farmers’ cooperative in 1954 and still buys most of its milk from local farms. Its oat drinks are sold under a separate brand name. Competition in the market for plant-based drinks has increased in recent years.',
      de: 'Velden Dairy verkauft seit 2022 Haferdrinks. 2024 machten pflanzliche Produkte 11 % des Unternehmensumsatzes aus, nach 6 % im Jahr 2023. Die Haferdrinks werden in einer separaten Fabrik hergestellt, um Kontakt mit Milch zu vermeiden. Der Geschäftsführer von Velden sagte, das Unternehmen werde weiter in sein traditionelles Molkereigeschäft investieren, das nach wie vor die größte Gewinnquelle ist. Einige Händler haben Velden gebeten, einen pflanzlichen Joghurt zu entwickeln, das Unternehmen hat dazu aber keine Pläne angekündigt. Velden wurde 1954 als Genossenschaft von Landwirten gegründet und bezieht seine Milch bis heute größtenteils von Höfen aus der Region. Die Haferdrinks werden unter einem eigenen Markennamen verkauft. Der Wettbewerb im Markt für pflanzliche Drinks hat in den letzten Jahren zugenommen.',
    },
    statements: [
      { id: 'v07-1', text: { en: 'The share of revenue from plant-based products rose by 5 percentage points from 2023 to 2024.', de: 'Der Umsatzanteil pflanzlicher Produkte stieg von 2023 auf 2024 um 5 Prozentpunkte.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: von 6 % auf 11 % = +5 Prozentpunkte.' },
      { id: 'v07-2', text: { en: 'Velden’s total revenue increased in 2024.', de: 'Der Gesamtumsatz von Velden stieg 2024.' }, answer: 'C', trap: 'quantity', reason: 'Der Text nennt nur Anteile am Umsatz, keine absoluten Umsatzzahlen. Ob der Gesamtumsatz stieg, ist offen.' },
      { id: 'v07-3', text: { en: 'Plant-based products are Velden’s largest source of profit.', de: 'Pflanzliche Produkte sind die größte Gewinnquelle von Velden.' }, answer: 'F', trap: 'comparison', reason: 'Satz 4: Das traditionelle Molkereigeschäft ist die größte Gewinnquelle.' },
      { id: 'v07-4', text: { en: 'Velden has announced plans to launch a plant-based yoghurt.', de: 'Velden hat Pläne für einen pflanzlichen Joghurt angekündigt.' }, answer: 'F', trap: 'negation', reason: 'Satz 5: „the company has not announced any plans to do so“ – es wurden ausdrücklich keine Pläne angekündigt.' },
    ],
  },
  {
    id: 'v08',
    topic: 'Ausbildung',
    difficulty: 1,
    title: { en: 'Apprenticeships at Torvald Engineering', de: 'Ausbildung bei Torvald Engineering' },
    text: {
      en: 'Torvald Engineering offers three-year apprenticeships in mechanics and electronics. Each year, the company takes on about 40 apprentices, who spend three days a week in the workshop and two days at a vocational school. Apprentices receive a monthly salary that increases in each year of the programme. Over the past five years, 85% of apprentices who completed the programme were offered a permanent job at Torvald. The company says it would like to recruit more apprentices but finds it difficult to fill all places in electronics. Torvald employs around 1,100 people and produces components for the automotive and rail industries. Apprentices are supported by experienced employees who act as mentors. At the end of the programme, apprentices take a final examination set by the regional chamber of commerce.',
      de: 'Torvald Engineering bietet dreijährige Ausbildungen in Mechanik und Elektronik an. Jedes Jahr stellt das Unternehmen rund 40 Auszubildende ein, die drei Tage pro Woche in der Werkstatt und zwei Tage an einer Berufsschule verbringen. Die Auszubildenden erhalten ein monatliches Gehalt, das in jedem Ausbildungsjahr steigt. In den letzten fünf Jahren erhielten 85 % der Auszubildenden, die das Programm abgeschlossen haben, ein Angebot für eine feste Stelle bei Torvald. Das Unternehmen würde nach eigenen Angaben gern mehr Auszubildende einstellen, hat aber Schwierigkeiten, alle Plätze in der Elektronik zu besetzen. Torvald beschäftigt rund 1.100 Personen und fertigt Komponenten für die Automobil- und Bahnindustrie. Die Auszubildenden werden von erfahrenen Beschäftigten als Mentorinnen und Mentoren begleitet. Am Ende des Programms legen sie eine Abschlussprüfung der regionalen Industrie- und Handelskammer ab.',
    },
    statements: [
      { id: 'v08-1', text: { en: 'Torvald apprentices spend most of their working week in the workshop.', de: 'Auszubildende bei Torvald verbringen den größten Teil ihrer Arbeitswoche in der Werkstatt.' }, answer: 'T', trap: 'comparison', reason: 'Satz 2: drei Tage Werkstatt, zwei Tage Berufsschule – also der größere Teil in der Werkstatt.' },
      { id: 'v08-2', text: { en: 'An apprentice’s salary in the second year is lower than in the first year.', de: 'Das Gehalt im zweiten Ausbildungsjahr ist niedriger als im ersten.' }, answer: 'F', trap: 'none', reason: 'Satz 3: Das Gehalt steigt in jedem Ausbildungsjahr.' },
      { id: 'v08-3', text: { en: '85% of all apprentices who started the programme received a job offer.', de: '85 % aller Auszubildenden, die das Programm begonnen haben, erhielten ein Jobangebot.' }, answer: 'C', trap: 'quantity', reason: 'Satz 4: 85 % bezieht sich auf die Auszubildenden, die das Programm ABGESCHLOSSEN haben. Wie viele abgebrochen haben, ist unbekannt.' },
      { id: 'v08-4', text: { en: 'Torvald has difficulty filling apprenticeship places in mechanics.', de: 'Torvald hat Schwierigkeiten, Ausbildungsplätze in der Mechanik zu besetzen.' }, answer: 'C', trap: 'none', reason: 'Satz 5 nennt Schwierigkeiten nur für die Elektronik. Über die Mechanik sagt der Text nichts.' },
    ],
  },
  {
    id: 'v09',
    topic: 'Streaming',
    difficulty: 1,
    title: { en: 'Price changes at StreamNest', de: 'Preisänderungen bei StreamNest' },
    text: {
      en: 'The video streaming service StreamNest introduced a cheaper subscription with advertising in February 2024. The new plan costs 5.99 euros per month, while the existing plan without advertising rose from 9.99 to 11.99 euros. By the end of 2024, 35% of new subscribers had chosen the plan with advertising. The total number of subscribers grew by 8% over the year. StreamNest said that advertising revenue was higher than expected but did not publish any figures. Subscribers can switch between the two plans at the end of each month. StreamNest offers films and series in nine European countries. The plan with advertising shows up to four minutes of advertising per hour of content. Both plans include the same films and series.',
      de: 'Der Video-Streamingdienst StreamNest führte im Februar 2024 ein günstigeres Abo mit Werbung ein. Das neue Abo kostet 5,99 Euro pro Monat, während das bestehende Abo ohne Werbung von 9,99 auf 11,99 Euro stieg. Bis Ende 2024 hatten 35 % der neuen Abonnentinnen und Abonnenten das Abo mit Werbung gewählt. Die Gesamtzahl der Abonnements wuchs im Jahresverlauf um 8 %. StreamNest erklärte, die Werbeeinnahmen seien höher als erwartet gewesen, veröffentlichte aber keine Zahlen. Abonnenten können am Ende jedes Monats zwischen den beiden Abos wechseln. StreamNest bietet Filme und Serien in neun europäischen Ländern an. Im Abo mit Werbung werden pro Stunde Inhalt bis zu vier Minuten Werbung gezeigt. Beide Abos enthalten dieselben Filme und Serien.',
    },
    statements: [
      { id: 'v09-1', text: { en: 'The plan without advertising became 2 euros more expensive per month.', de: 'Das Abo ohne Werbung wurde um 2 Euro pro Monat teurer.' }, answer: 'T', trap: 'quantity', reason: 'Satz 2: von 9,99 auf 11,99 Euro = +2 Euro.' },
      { id: 'v09-2', text: { en: 'Most new subscribers in 2024 chose the plan without advertising.', de: 'Die meisten neuen Abonnenten wählten 2024 das Abo ohne Werbung.' }, answer: 'T', trap: 'quantity', reason: 'Satz 3: 35 % wählten das Abo mit Werbung, also 65 % das ohne Werbung (es gibt laut Text genau zwei Abos) – die Mehrheit.' },
      { id: 'v09-3', text: { en: 'The cheaper plan caused the 8% growth in subscribers.', de: 'Das günstigere Abo war der Grund für das Wachstum von 8 %.' }, answer: 'C', trap: 'causation', reason: 'Satz 4 nennt nur das Wachstum. Ob das neue Abo die Ursache war, sagt der Text nicht.' },
      { id: 'v09-4', text: { en: 'Subscribers who choose a plan must keep it for at least one year.', de: 'Wer ein Abo wählt, muss es mindestens ein Jahr behalten.' }, answer: 'F', trap: 'none', reason: 'Satz 6: Ein Wechsel ist am Ende jedes Monats möglich.' },
    ],
  },
  {
    id: 'v10',
    topic: 'Recycling',
    difficulty: 1,
    title: { en: 'Textile recycling pilot in Aldmoor', de: 'Pilotprojekt Textilrecycling in Aldmoor' },
    text: {
      en: 'In 2024, the region of Aldmoor placed 200 collection containers for used clothes in supermarket car parks. The containers are emptied twice a week by a local social enterprise. Clothes in good condition are sold in second-hand shops; the rest is sent to a sorting plant, where it is turned into insulation material or cleaning cloths. In the first year, 1,850 tonnes of textiles were collected. The social enterprise employs 46 people, 30 of whom were previously long-term unemployed. The region intends to double the number of containers if funding can be secured. Before the pilot, used clothes in the region were mostly thrown away with household waste. The containers are made from recycled steel. Residents can find the nearest container on the region’s website.',
      de: 'Die Region Aldmoor hat 2024 auf Supermarktparkplätzen 200 Sammelcontainer für Altkleider aufgestellt. Die Container werden zweimal pro Woche von einem lokalen Sozialunternehmen geleert. Gut erhaltene Kleidung wird in Secondhand-Läden verkauft; der Rest geht an eine Sortieranlage, wo er zu Dämmmaterial oder Putztüchern verarbeitet wird. Im ersten Jahr wurden 1.850 Tonnen Textilien gesammelt. Das Sozialunternehmen beschäftigt 46 Personen, 30 davon waren zuvor langzeitarbeitslos. Die Region will die Zahl der Container verdoppeln, falls die Finanzierung gesichert werden kann. Vor dem Pilotprojekt landeten gebrauchte Kleider in der Region meist im Hausmüll. Die Container bestehen aus recyceltem Stahl. Auf der Website der Region finden Einwohnerinnen und Einwohner den nächstgelegenen Container.',
    },
    statements: [
      { id: 'v10-1', text: { en: 'All collected clothes are sold in second-hand shops.', de: 'Alle gesammelten Kleidungsstücke werden in Secondhand-Läden verkauft.' }, answer: 'F', trap: 'some-all', reason: 'Satz 3: Nur gut erhaltene Kleidung wird verkauft; der Rest geht an eine Sortieranlage.' },
      { id: 'v10-2', text: { en: 'More than half of the social enterprise’s employees were previously long-term unemployed.', de: 'Mehr als die Hälfte der Beschäftigten des Sozialunternehmens war zuvor langzeitarbeitslos.' }, answer: 'T', trap: 'quantity', reason: 'Satz 5: 30 von 46 ≈ 65 % – mehr als die Hälfte.' },
      { id: 'v10-3', text: { en: 'The region will have 400 containers next year.', de: 'Die Region wird im nächsten Jahr 400 Container haben.' }, answer: 'C', trap: 'temporal', reason: 'Satz 6: Die Verdopplung ist nur geplant, „if funding can be secured“. Ob und wann sie kommt, ist offen.' },
      { id: 'v10-4', text: { en: 'Some of the collected textiles are used to make insulation material.', de: 'Ein Teil der gesammelten Textilien wird zu Dämmmaterial verarbeitet.' }, answer: 'T', trap: 'paraphrase', reason: 'Satz 3: Der Rest wird in der Sortieranlage zu Dämmmaterial oder Putztüchern verarbeitet.' },
    ],
  },
]
