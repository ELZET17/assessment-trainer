/**
 * Critical Thinking bank (Watson-Glaser style) – original items written for this app.
 * Answer indices refer to CRITICAL_OPTIONS in ./types:
 *  inference: 0 True, 1 Probably true, 2 Insufficient data, 3 Probably false, 4 False
 *  assumption: 0 made, 1 not made · deduction/interpretation: 0 follows, 1 does not follow
 *  evaluation: 0 strong, 1 weak
 */
import type { Difficulty } from '../types'
import type { CriticalItem, CriticalType } from './types'

const I1 =
  'A city library introduced Sunday opening hours in January. Before that, the library was always closed on Sundays. In the first three months, about 400 people visited the library each Sunday, which is more than on any other day of the week. Many of the Sunday visitors were families with young children. The library plans to continue Sunday opening at least until the end of the year.'
const I2 =
  'Over the past ten years, the number of students taking the advanced mathematics course at Hillside School has risen every year. The school recently hired two additional mathematics teachers. Classes in the advanced course are still larger than the school’s recommended maximum of 25 students.'
const I3 =
  'A survey of 2,000 commuters in the city of Darrow found that 62% would cycle to work if there were safe, separate cycle lanes on their route. Currently, 8% of commuters in Darrow cycle to work. The city has a budget for 30 kilometres of new cycle lanes over the next five years, while its main roads are about 240 kilometres long in total.'
const I4 =
  'Moreland Electronics sells headphones online and in its own shops. Last year, the company cut the price of its most popular model by 20%. Unit sales of this model in the following six months were 35% higher than in the six months before the price cut, while unit sales of the company’s other models stayed roughly the same.'
const A1 = 'Statement: “We should advertise our new savings account on the radio, because many of our potential customers listen to the radio while driving to work.”'
const A2 = 'Statement: “The council should close the old swimming pool, since the new leisure centre opening next year will have a larger pool.”'
const A3 = 'Statement: “Our online training course must be effective: 90% of participants said they enjoyed it.”'
const A4 = 'Statement: “To reduce waiting times in our call centre, we will hire ten additional agents before the holiday season.”'
const P1 = 'In a study of 500 office workers, those who took a short walk during their lunch break reported higher afternoon energy levels than those who stayed at their desks. Participants decided for themselves whether to walk.'
const P2 = 'The ferry company Westline carried 1.2 million passengers in 2024, 10% more than in 2023. Ticket prices were unchanged, and the number of crossings per day stayed the same throughout both years.'
const P3 = 'A town introduced a speed limit of 30 km/h on all residential streets in 2023. In 2024, the number of road accidents in residential streets fell by 18%, while accidents on other roads in the town stayed at the same level.'
const P4 = 'Applications to Ardley University’s engineering programme rose from 1,800 to 2,600 over three years. The number of available places remained at 300.'
const P5 = 'Over five years, a retailer’s stores that introduced self-service checkouts saw staff costs fall by an average of 12%, while stores without self-service checkouts saw staff costs rise by an average of 3%. Customer complaints increased slightly in the stores with self-service checkouts.'
const P6 = 'A software company found that 70% of its customers who used the help centre at least once in their first month were still customers a year later, compared with 45% of those who never used the help centre in their first month.'

const c = (id: string, type: CriticalType, difficulty: Difficulty, stimulus: string, proposition: string, answer: number, reason: string): CriticalItem => ({
  id,
  type,
  difficulty,
  stimulus: { en: stimulus },
  proposition: { en: proposition },
  answer,
  reason,
})

export const CRITICAL: CriticalItem[] = [
  // ------------------------------------------------------------- inference
  c('c01', 'inference', 1, I1, 'Before January, it was not possible to visit the library on a Sunday.', 0, 'Wahr: Der Text sagt, die Bibliothek war vor Januar sonntags immer geschlossen.'),
  c('c02', 'inference', 1, I1, 'Most of the Sunday visitors live within walking distance of the library.', 2, 'Unzureichende Daten: Über den Wohnort der Besucher sagt der Text nichts – weder direkt noch indirekt.'),
  c('c03', 'inference', 1, I1, 'Fewer than 100 people visited the library on a typical Sunday in the first three months.', 4, 'Falsch: Es kamen etwa 400 Personen pro Sonntag – das widerspricht der Aussage direkt.'),
  c('c04', 'inference', 1, I2, 'Ten years ago, fewer students took the advanced mathematics course than today.', 0, 'Wahr: Die Zahl ist zehn Jahre lang jedes Jahr gestiegen, also war sie vor zehn Jahren niedriger.'),
  c('c05', 'inference', 2, I2, 'The school wants to bring class sizes in the advanced course closer to its recommended maximum.', 1, 'Wahrscheinlich wahr: Die Klassen sind größer als empfohlen und die Schule hat zusätzliche Lehrkräfte eingestellt – das spricht dafür, ist aber nicht ausdrücklich gesagt.'),
  c('c06', 'inference', 2, I2, 'All advanced mathematics classes at Hillside currently have fewer than 25 students.', 4, 'Falsch: Der Text sagt, die Klassen sind „still larger than“ das empfohlene Maximum von 25.'),
  c('c07', 'inference', 2, I3, 'Once the planned cycle lanes are built, 62% of Darrow’s commuters will cycle to work.', 3, 'Wahrscheinlich falsch: Die geplanten 30 km decken nur einen kleinen Teil der rund 240 km Hauptstraßen ab, viele Routen bleiben ohne Radweg. Zudem überschätzen Umfragen tatsächliches Verhalten oft. Völlig ausgeschlossen ist es aber nicht.'),
  c('c08', 'inference', 2, I3, 'Fewer than one in ten commuters in Darrow currently cycle to work.', 0, 'Wahr: 8 % sind weniger als 10 % (eins von zehn).'),
  c('c09', 'inference', 3, I3, 'Most of Darrow’s main roads already have safe, separate cycle lanes.', 3, 'Wahrscheinlich falsch: Wenn 62 % mit sicheren Radwegen radeln würden, aber nur 8 % es tun, fehlen solche Wege offenbar auf vielen Routen. Sicher ist das aber nicht.'),
  c('c10', 'inference', 3, I4, 'Revenue from the most popular model was higher in the six months after the price cut than in the six months before it.', 0, 'Wahr: Preis × 0,8 und Stückzahl × 1,35 ergeben Umsatz × 1,08 – also rund 8 % mehr Umsatz als vorher.'),
  c('c11', 'inference', 3, I4, 'Most of the additional buyers of the popular model switched from Moreland’s other models.', 3, 'Wahrscheinlich falsch: Der Absatz der anderen Modelle blieb ungefähr gleich – ein großer Wechsel von dort hätte ihn sinken lassen. Ganz ausschließen lässt es sich wegen „roughly the same“ nicht.'),
  c('c12', 'inference', 2, I4, 'Moreland’s competitors also reduced their prices last year.', 2, 'Unzureichende Daten: Über Wettbewerber sagt der Text nichts.'),

  // ------------------------------------------------------------ assumption
  c('c13', 'assumption', 1, A1, 'Radio advertising can reach people while they are driving.', 0, 'Annahme wird gemacht: Die Begründung ergibt nur Sinn, wenn Radiowerbung Menschen beim Autofahren erreicht.'),
  c('c14', 'assumption', 1, A1, 'Radio is the only way to reach potential customers.', 1, 'Annahme wird nicht gemacht: Die Aussage behauptet nur, dass Radio ein geeigneter Weg ist – nicht der einzige.'),
  c('c15', 'assumption', 1, A1, 'Some people who hear the advertisement could become customers of the savings account.', 0, 'Annahme wird gemacht: Werbung zu empfehlen ergibt nur Sinn, wenn sie zu neuen Kunden führen kann – das wird stillschweigend vorausgesetzt.'),
  c('c16', 'assumption', 2, A2, 'The new leisure centre will open as planned.', 0, 'Annahme wird gemacht: Die Schließung wird mit dem neuen Bad begründet – das setzt voraus, dass es tatsächlich eröffnet.'),
  c('c17', 'assumption', 2, A2, 'Nobody will want to use the old pool once the new one has opened.', 1, 'Annahme wird nicht gemacht: Die Empfehlung braucht nicht, dass NIEMAND das alte Bad nutzen möchte – nur, dass das neue es ersetzen kann.'),
  c('c18', 'assumption', 2, A2, 'The new pool will be able to serve the people who currently use the old pool.', 0, 'Annahme wird gemacht: Nur wenn das neue Bad die bisherigen Nutzer aufnehmen kann, ist es ein Grund für die Schließung des alten.'),
  c('c19', 'assumption', 2, A3, 'Participants who enjoy a course are likely to learn from it.', 0, 'Annahme wird gemacht: Der Schluss von „gefällt“ auf „wirksam“ setzt einen Zusammenhang zwischen Gefallen und Lernerfolg voraus.'),
  c('c20', 'assumption', 2, A3, 'All participants completed the course.', 1, 'Annahme wird nicht gemacht: Die Aussage stützt sich auf eine Befragung; ob alle den Kurs abgeschlossen haben, ist für die Argumentation nicht nötig.'),
  c('c21', 'assumption', 3, A4, 'The number of agents affects waiting times in the call centre.', 0, 'Annahme wird gemacht: Mehr Personal soll Wartezeiten senken – das setzt voraus, dass die Personalstärke die Wartezeit beeinflusst.'),
  c('c22', 'assumption', 3, A4, 'Waiting times are longer during the holiday season than at any other time of the year.', 1, 'Annahme wird nicht gemacht: Der Zeitpunkt der Einstellung setzt nicht voraus, dass die Wartezeiten dann am längsten sind.'),
  c('c23', 'assumption', 3, A4, 'It is possible to hire ten suitable agents before the holiday season.', 0, 'Annahme wird gemacht: Ein Plan, zehn Personen bis zu einem Termin einzustellen, setzt voraus, dass das machbar ist.'),
  c('c24', 'assumption', 3, 'Statement: “Since our new manager arrived, the team has missed fewer deadlines. Her weekly planning meetings are clearly working.”', 'No other change since the manager’s arrival explains the reduction in missed deadlines.', 0, 'Annahme wird gemacht: Wer die Verbesserung eindeutig den Meetings zuschreibt („clearly working“), setzt voraus, dass keine andere Ursache dahintersteckt.'),

  // ------------------------------------------------------------- deduction
  c('c25', 'deduction', 1, 'All trainees at Fennick attend the induction week. Mira is a trainee at Fennick.', 'Mira attends the induction week.', 0, 'Folgt: Wenn alle Trainees teilnehmen und Mira Trainee ist, nimmt Mira teil.'),
  c('c26', 'deduction', 1, 'All trainees at Fennick attend the induction week. Mira is a trainee at Fennick.', 'Everyone who attends the induction week is a trainee.', 1, 'Folgt nicht: Umkehrfehler – aus „alle Trainees nehmen teil“ folgt nicht, dass nur Trainees teilnehmen.'),
  c('c27', 'deduction', 1, 'No project at Lyle & Co. starts without a signed contract. The Orion project at Lyle & Co. has started.', 'The Orion project has a signed contract.', 0, 'Folgt: Ohne Vertrag startet kein Projekt; Orion ist gestartet, also gibt es einen Vertrag.'),
  c('c28', 'deduction', 1, 'No project at Lyle & Co. starts without a signed contract. The Orion project at Lyle & Co. has started.', 'Every project with a signed contract has started.', 1, 'Folgt nicht: Ein Vertrag ist Voraussetzung, aber keine Garantie für den Start.'),
  c('c29', 'deduction', 2, 'Some members of the finance team speak Japanese. All members of the finance team have passed the accounting exam.', 'Some people who have passed the accounting exam speak Japanese.', 0, 'Folgt: Die Japanisch sprechenden Teammitglieder haben (wie alle im Team) die Prüfung bestanden.'),
  c('c30', 'deduction', 2, 'Some members of the finance team speak Japanese. All members of the finance team have passed the accounting exam.', 'Everyone who speaks Japanese is a member of the finance team.', 1, 'Folgt nicht: Die Prämissen sagen nichts über Japanischsprechende außerhalb des Teams.'),
  c('c31', 'deduction', 2, 'If the shipment arrives on Monday, the stand will be ready for the trade fair. The stand was not ready for the trade fair.', 'The shipment did not arrive on Monday.', 0, 'Folgt (Modus tollens): Wäre die Lieferung am Montag gekommen, wäre der Stand fertig gewesen.'),
  c('c32', 'deduction', 2, 'If the shipment arrives on Monday, the stand will be ready for the trade fair. The stand was not ready for the trade fair.', 'The shipment arrived after Monday.', 1, 'Folgt nicht: Sicher ist nur, dass sie NICHT am Montag kam – sie könnte auch gar nicht oder früher gekommen sein.'),
  c('c33', 'deduction', 3, 'Only employees with at least two years of service can apply for the sabbatical programme. Jonas has applied for the sabbatical programme.', 'Jonas has at least two years of service.', 0, 'Folgt: „Nur wer … kann sich bewerben“ und Jonas hat sich beworben → Jonas erfüllt die Bedingung.'),
  c('c34', 'deduction', 3, 'Only employees with at least two years of service can apply for the sabbatical programme. Jonas has applied for the sabbatical programme.', 'Every employee with at least two years of service has applied.', 1, 'Folgt nicht: „Nur wenn“ ist eine notwendige, keine hinreichende Bedingung.'),
  c('c35', 'deduction', 3, 'Either the budget is cut or the event is moved online, but not both. The event has not been moved online.', 'The budget is cut.', 0, 'Folgt: Genau eins von beiden trifft zu; online ist es nicht → das Budget wird gekürzt.'),
  c('c36', 'deduction', 3, 'Either the budget is cut or the event is moved online, but not both. The event has not been moved online.', 'If the budget is cut, the event will not take place.', 1, 'Folgt nicht: Ob das Event bei einer Kürzung ausfällt, sagen die Prämissen nicht.'),

  // -------------------------------------------------------- interpretation
  c('c37', 'interpretation', 1, P1, 'In this study, workers who walked at lunch reported higher afternoon energy levels than those who stayed at their desks.', 0, 'Folgt: Das ist eine direkte Wiedergabe des Ergebnisses.'),
  c('c38', 'interpretation', 1, P1, 'Walking at lunch causes higher energy levels in the afternoon.', 1, 'Folgt nicht: Die Teilnehmenden wählten selbst – vielleicht gehen ohnehin energiegeladenere Menschen spazieren. Kausalität ist nicht belegt.'),
  c('c39', 'interpretation', 2, P2, 'On average, Westline carried more passengers per crossing in 2024 than in 2023.', 0, 'Folgt: 10 % mehr Passagiere bei (praktisch) gleicher Zahl an Überfahrten bedeutet mehr Passagiere pro Überfahrt.'),
  c('c40', 'interpretation', 2, P2, 'Westline’s profits rose in 2024.', 1, 'Folgt nicht: Über Kosten sagt der Text nichts; mehr Umsatz bedeutet nicht zwingend mehr Gewinn.'),
  c('c41', 'interpretation', 2, P3, 'There were fewer accidents in the town’s residential streets in 2024 than in 2023.', 0, 'Folgt: Ein Rückgang um 18 % bedeutet weniger Unfälle.'),
  c('c42', 'interpretation', 2, P3, 'The speed limit was the only reason for the fall in accidents.', 1, 'Folgt nicht: Der Vergleich mit anderen Straßen stützt einen Effekt, schließt aber andere Ursachen nicht aus („only“ geht zu weit).'),
  c('c43', 'interpretation', 2, P4, 'The number of applicants per available place increased over the three years.', 0, 'Folgt: von 6 auf rund 8,7 Bewerbungen pro Platz.'),
  c('c44', 'interpretation', 2, P4, 'The quality of applicants improved over the three years.', 1, 'Folgt nicht: Über die Qualität der Bewerbungen sagt der Text nichts.'),
  c('c45', 'interpretation', 3, P5, 'On average, staff costs developed differently in stores with and without self-service checkouts.', 0, 'Folgt: −12 % gegenüber +3 % im Durchschnitt.'),
  c('c46', 'interpretation', 3, P5, 'Customers prefer stores without self-service checkouts.', 1, 'Folgt nicht: Etwas mehr Beschwerden belegen keine allgemeine Präferenz – Umsatz- oder Besuchsdaten fehlen.'),
  c('c47', 'interpretation', 3, P6, 'Customers who used the help centre in their first month were more likely to remain customers after a year than those who did not.', 0, 'Folgt: 70 % gegenüber 45 % – das ist genau die Aussage.'),
  c('c48', 'interpretation', 3, P6, 'Encouraging all new customers to use the help centre would raise the one-year retention rate to 70%.', 1, 'Folgt nicht: Der Zusammenhang muss nicht kausal sein (engagierte Kunden nutzen eher die Hilfe), und eine Quote von 70 % lässt sich nicht ableiten.'),

  // ------------------------------------------------------------ evaluation
  c('c49', 'evaluation', 1, 'Question: Should companies allow employees to bring their dogs to the office?', 'No – some employees are allergic to dogs or afraid of them, which could affect their health and their ability to work.', 0, 'Stark: Wichtig (Gesundheit, Arbeitsfähigkeit) und direkt auf die Frage bezogen.'),
  c('c50', 'evaluation', 1, 'Question: Should companies allow employees to bring their dogs to the office?', 'Yes – dogs are popular pets in many countries.', 1, 'Schwach: Dass Hunde beliebt sind, sagt nichts darüber, ob sie ins Büro gehören.'),
  c('c51', 'evaluation', 1, 'Question: Should the city build a new tram line to the airport?', 'Yes – an estimated 9,000 passengers a day would use it, which would reduce congestion on the airport motorway.', 0, 'Stark: Konkreter, wichtiger Nutzen, direkt auf die Entscheidung bezogen.'),
  c('c52', 'evaluation', 1, 'Question: Should the city build a new tram line to the airport?', 'No – trams were already used in the 19th century.', 1, 'Schwach: Das Alter des Verkehrsmittels ist für die heutige Entscheidung irrelevant.'),
  c('c53', 'evaluation', 2, 'Question: Should all new employees complete a two-day data protection course?', 'Yes – many data breaches are caused by human error, which training can reduce.', 0, 'Stark: Benennt ein wichtiges Risiko und wie die Maßnahme es verringert.'),
  c('c54', 'evaluation', 2, 'Question: Should all new employees complete a two-day data protection course?', 'No – some employees find the course boring.', 1, 'Schwach: Langeweile einzelner ist im Vergleich zum Zweck (Datenschutz) nebensächlich.'),
  c('c55', 'evaluation', 2, 'Question: Should the company switch its delivery fleet to electric vans?', 'Yes – electric vans have lower running costs per kilometre, and most of the company’s routes are short enough for their range.', 0, 'Stark: Wirtschaftlich relevant und mit Bezug auf die konkreten Einsatzbedingungen.'),
  c('c56', 'evaluation', 2, 'Question: Should the company switch its delivery fleet to electric vans?', 'No – the company’s main competitor has not switched yet.', 1, 'Schwach: Was ein Konkurrent tut, ist kein sachlicher Grund für oder gegen die eigene Entscheidung.'),
  c('c57', 'evaluation', 3, 'Question: Should supermarkets be required by law to donate unsold edible food?', 'Yes – it would reduce food waste and help people in need, at only limited additional cost for collection.', 0, 'Stark: Wichtige, direkt betroffene Wirkungen und eine Abwägung der Kosten.'),
  c('c58', 'evaluation', 3, 'Question: Should supermarkets be required by law to donate unsold edible food?', 'No – some supermarkets already donate food voluntarily.', 1, 'Schwach: Dass einige freiwillig spenden, beantwortet nicht, ob eine Pflicht für alle sinnvoll ist.'),
  c('c59', 'evaluation', 3, 'Question: Should universities replace written exams with oral exams?', 'No – oral exams are harder to standardise, which makes grades less comparable between students.', 0, 'Stark: Fairness und Vergleichbarkeit sind zentrale Kriterien für Prüfungen.'),
  c('c60', 'evaluation', 3, 'Question: Should universities replace written exams with oral exams?', 'Yes – oral exams are more common in some other countries.', 1, 'Schwach: Verbreitung anderswo ist kein Argument für die Qualität der Prüfungsform.'),
]
